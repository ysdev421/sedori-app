const fs = require('node:fs');
const Papa = require('papaparse');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { addDoc, collection, getDocs, getFirestore, query, where, Timestamp } = require('firebase/firestore');

function parseEnvFile(path) {
  if (!fs.existsSync(path)) return {};
  const obj = {};
  for (const line of fs.readFileSync(path, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    obj[key] = val;
  }
  return obj;
}

function yenToNumber(value) {
  if (value === undefined || value === null) return 0;
  const s = String(value).trim();
  if (!s) return 0;
  const negative = s.includes('-');
  const num = Number(s.replace(/[^0-9.]/g, ''));
  if (!Number.isFinite(num)) return 0;
  return negative ? -num : num;
}

function parsePurchaseDate(raw, baseYear) {
  const s = String(raw || '').trim();
  const m = s.match(/^(\d{1,2})月(\d{1,2})日$/);
  if (!m) return `${baseYear}-01-01`;
  const mm = m[1].padStart(2, '0');
  const dd = m[2].padStart(2, '0');
  return `${baseYear}-${mm}-${dd}`;
}

function parseSaleDate(raw) {
  const s = String(raw || '').trim();
  if (!s) return undefined;
  const m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!m) return undefined;
  return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
}

function mapStatus(raw) {
  const s = String(raw || '').trim();
  if (s === '在庫') return 'inventory';
  if (s === '売却済') return 'sold';
  if (s === 'キャンセル') return 'canceled';
  return 'pending';
}

function norm(str) {
  return String(str || '').trim();
}

async function main() {
  const args = process.argv.slice(2);
  const csvPath = args.find((a) => !a.startsWith('--')) || 'data/ebay.csv';
  const dryRun = args.includes('--dry-run');
  const includeCanceled = args.includes('--include-canceled');
  const baseYearArg = args.find((a) => a.startsWith('--base-year='));
  const channelArg = args.find((a) => a.startsWith('--channel='));
  const baseYear = Number(baseYearArg?.split('=')[1] || '2025');
  const channel = channelArg?.split('=')[1] || 'other';

  const env = {
    ...parseEnvFile('.env.local'),
    ...process.env,
  };

  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };

  const required = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k);
  if (required.length) {
    throw new Error(`Missing firebase env vars: ${required.join(', ')}`);
  }

  const email = env.IMPORT_EMAIL;
  const password = env.IMPORT_PASSWORD;
  if (!email || !password) {
    throw new Error('Missing IMPORT_EMAIL or IMPORT_PASSWORD in environment');
  }

  console.log('step: read csv');
  const csv = fs.readFileSync(csvPath, 'utf8');
  const parsed = Papa.parse(csv, { skipEmptyLines: false }).data;
  const rows = parsed.filter((r) => /^\d+$/.test(norm(r[0])));
  console.log(`step: parsed rows=${rows.length}`);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  console.log('step: sign in');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const userId = cred.user.uid;
  console.log(`step: signed in user=${userId}`);

  console.log('step: fetch existing');
  const existingQ = query(collection(db, 'products'), where('userId', '==', userId));
  const existingSnap = await getDocs(existingQ);
  console.log(`step: existing=${existingSnap.size}`);
  const existingKeys = new Set(
    existingSnap.docs.map((d) => {
      const p = d.data();
      return [
        norm(p.purchaseDate),
        norm(p.productName),
        Number(p.purchasePrice || 0),
        norm(p.purchaseLocation),
        norm(p.channel || 'other'),
      ].join('||');
    })
  );

  const toCreate = [];
  for (const r of rows) {
    const productName = norm(r[5]);
    if (!productName) continue;

    const purchaseDate = parsePurchaseDate(r[1], baseYear);
    const purchaseLocation = norm(r[3]) || '不明';
    const purchasePrice = Math.max(0, yenToNumber(r[9]));
    const point = Math.max(0, yenToNumber(r[10]) + yenToNumber(r[12]));
    const status = mapStatus(r[8]);
    if (status === 'canceled' && !includeCanceled) continue;
    const saleLocation = norm(r[14]) || undefined;
    const salePriceRaw = yenToNumber(r[15]);
    const salePrice = salePriceRaw > 0 ? salePriceRaw : undefined;
    const saleDate = parseSaleDate(r[18]);

    const key = [purchaseDate, productName, purchasePrice, purchaseLocation, channel].join('||');
    if (existingKeys.has(key)) continue;

    toCreate.push({
      userId,
      channel,
      quantityTotal: 1,
      quantityAvailable: 1,
      productName,
      purchasePrice,
      point,
      purchaseDate,
      purchaseLocation,
      status,
      salePrice,
      saleLocation,
      saleDate,
    });
  }

  console.log(JSON.stringify({
    csvRows: rows.length,
    existing: existingSnap.size,
    toImport: toCreate.length,
    dryRun,
    statusBreakdown: toCreate.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {}),
    channel,
    includeCanceled,
  }, null, 2));

  if (dryRun) {
    process.exit(0);
  }

  let created = 0;
  for (const p of toCreate) {
    const payload = {
      userId: p.userId,
      productName: p.productName,
      purchasePrice: p.purchasePrice,
      point: p.point,
      channel: p.channel,
      quantityTotal: p.quantityTotal ?? 1,
      quantityAvailable: p.quantityAvailable ?? 1,
      purchaseDate: p.purchaseDate,
      purchaseLocation: p.purchaseLocation,
      status: p.status,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    if (p.salePrice !== undefined) payload.salePrice = p.salePrice;
    if (p.saleLocation !== undefined) payload.saleLocation = p.saleLocation;
    if (p.saleDate !== undefined) payload.saleDate = p.saleDate;

    await addDoc(collection(db, 'products'), payload);
    created += 1;
    if (created % 20 === 0) console.log(`created: ${created}/${toCreate.length}`);
  }

  console.log(`done: imported ${created} products`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
