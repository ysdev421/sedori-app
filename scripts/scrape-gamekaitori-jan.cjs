const fs = require('node:fs');
const path = require('node:path');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { doc, getFirestore, setDoc, Timestamp } = require('firebase/firestore');

const BASE_URL = 'https://gamekaitori.jp/';
const USER_AGENT = 'sedori-app-jan-scraper/1.0 (+local script)';

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const obj = {};
  const text = fs.readFileSync(filePath, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    obj[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return obj;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeJan(raw) {
  const v = String(raw || '').replace(/\D/g, '').trim();
  return v.length === 8 || v.length === 13 ? v : '';
}

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(text) {
  return decodeHtmlEntities(String(text || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function resolveUrl(base, href) {
  try {
    if (!href) return null;
    const u = new URL(href, base);
    if (!/^https?:$/.test(u.protocol)) return null;
    if (u.hostname !== new URL(BASE_URL).hostname) return null;
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

function extractLinks(html, currentUrl) {
  const links = new Set();
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
  for (const m of html.matchAll(re)) {
    const u = resolveUrl(currentUrl, m[1]);
    if (!u) continue;
    if (/\.(jpg|jpeg|png|gif|webp|svg|pdf|zip)$/i.test(u)) continue;
    links.add(u);
  }
  return [...links];
}

function extractJsonLdProducts(html) {
  const out = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(re)) {
    const raw = m[1].trim();
    if (!raw) continue;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      const candidates = [item.gtin13, item.gtin12, item.gtin8, item.gtin, item.productID, item.sku];
      const jan = candidates.map(normalizeJan).find(Boolean);
      const name = stripTags(item.name || item.headline || '');
      if (jan && name) out.push({ janCode: jan, productName: name, source: 'jsonld' });
    }
  }
  return out;
}

function extractPageTitle(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1 && stripTags(h1[1])) return stripTags(h1[1]);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return title ? stripTags(title[1]) : '';
}

function extractJanFromTextBlocks(html) {
  const out = [];
  const pageTitle = extractPageTitle(html);
  const pickNameFromContext = (context) => {
    const candidates = [];
    const aRe = /<a[^>]*>([\s\S]*?)<\/a>/gi;
    for (const m of context.matchAll(aRe)) {
      const t = stripTags(m[1]);
      if (!t) continue;
      if (/JAN|買取|価格|ログイン|会員登録|TOP|トップ/i.test(t)) continue;
      candidates.push(t);
    }
    if (candidates.length === 0) return '';
    candidates.sort((a, b) => b.length - a.length);
    return candidates[0];
  };

  const janLabelRe = /(JAN|ＪＡＮ)\s*[：:]\s*([0-9０-９\-\s]{8,20})/gi;
  for (const m of html.matchAll(janLabelRe)) {
    const jan = normalizeJan(String(m[2]).replace(/[０-９]/g, (d) => String(d.charCodeAt(0) - 65248)));
    if (!jan) continue;
    const idx = m.index || 0;
    const context = html.slice(Math.max(0, idx - 1200), Math.min(html.length, idx + 200));
    const contextName = pickNameFromContext(context);
    const name = contextName || pageTitle;
    if (!name) continue;
    out.push({ janCode: jan, productName: name, source: 'label' });
  }

  return out;
}

function mergeRecords(records) {
  const map = new Map();
  for (const r of records) {
    const jan = normalizeJan(r.janCode);
    const name = stripTags(r.productName);
    if (!jan || !name) continue;
    if (!map.has(jan)) {
      map.set(jan, {
        janCode: jan,
        productName: name,
        sources: [r.source],
      });
      continue;
    }
    const current = map.get(jan);
    current.sources = [...new Set([...current.sources, r.source])];
    if (name.length > current.productName.length) current.productName = name;
  }
  return [...map.values()];
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return new TextDecoder('utf-8').decode(buf);
}

async function scrape({ maxPages, delayMs }) {
  const queue = [BASE_URL];
  const visited = new Set();
  const all = [];

  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);

    try {
      const html = await fetchHtml(url);
      const records = [
        ...extractJsonLdProducts(html),
        ...extractJanFromTextBlocks(html),
      ].map((r) => ({ ...r, url }));
      all.push(...records);

      const links = extractLinks(html, url);
      for (const link of links) {
        if (visited.has(link)) continue;
        if (queue.length + visited.size >= maxPages * 4) break;
        queue.push(link);
      }
      console.log(`scraped ${visited.size}/${maxPages}: ${url} (records=${records.length})`);
    } catch (e) {
      console.warn(`skip ${url}: ${e.message || e}`);
    }

    if (delayMs > 0) await sleep(delayMs);
  }

  return {
    crawled: visited.size,
    records: mergeRecords(all),
  };
}

async function upsertToFirestore(records, env) {
  const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  };
  const required = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k);
  if (required.length) throw new Error(`Missing firebase env vars: ${required.join(', ')}`);

  if (!env.IMPORT_EMAIL || !env.IMPORT_PASSWORD) {
    throw new Error('Missing IMPORT_EMAIL or IMPORT_PASSWORD in environment');
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  await signInWithEmailAndPassword(auth, env.IMPORT_EMAIL, env.IMPORT_PASSWORD);

  let count = 0;
  for (const r of records) {
    await setDoc(
      doc(db, 'jan_master', r.janCode),
      {
        janCode: r.janCode,
        productName: r.productName,
        sourceSite: 'gamekaitori.jp',
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );
    count += 1;
    if (count % 100 === 0) console.log(`upserted ${count}/${records.length}`);
  }
  return count;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const writeFirestore = args.includes('--write-firestore');
  const maxPagesArg = args.find((a) => a.startsWith('--max-pages='));
  const delayArg = args.find((a) => a.startsWith('--delay-ms='));
  const outArg = args.find((a) => a.startsWith('--out='));
  const maxPages = Math.max(1, Number(maxPagesArg?.split('=')[1] || 120));
  const delayMs = Math.max(0, Number(delayArg?.split('=')[1] || 300));
  const outPath = outArg?.split('=')[1] || 'data/gamekaitori-jan.json';

  const env = { ...parseEnvFile('.env.local'), ...process.env };

  console.log(`start scrape: maxPages=${maxPages} delayMs=${delayMs}`);
  const result = await scrape({ maxPages, delayMs });
  console.log(`done scrape: crawled=${result.crawled}, uniqueJAN=${result.records.length}`);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(result.records, null, 2), 'utf8');
  console.log(`saved: ${outPath}`);

  if (dryRun || !writeFirestore) {
    console.log('dry mode: skip firestore upsert');
    return;
  }

  const upserted = await upsertToFirestore(result.records, env);
  console.log(`done firestore upsert: ${upserted}`);
}

main().catch((e) => {
  console.error(e.stack || e.message || e);
  process.exit(1);
});
