'use strict';

/**
 * 買取価格一括取得バッチ（Firebase Admin SDK版）
 *
 * 使い方:
 *   node scripts/kaitori-price-batch.cjs [--dry-run] [--interval=7000]
 *
 * 環境変数（.env または GitHub Secrets）:
 *   FIREBASE_SERVICE_ACCOUNT_JSON  ... サービスアカウントキーのJSON文字列
 *   FIREBASE_PROJECT_ID            ... Firebase プロジェクトID（サービスアカウントJSONに含まれる場合は省略可）
 */

const fs = require('node:fs');
const path = require('node:path');
const admin = require('firebase-admin');

// ── フェッチャー登録 ──────────────────────────────────────
// 将来のサイト追加はここに require を1行追加するだけ
const FETCHERS = [
  require('./fetchers/kaitori-wiki.cjs'),
  // require('./fetchers/kaitori-shoten.cjs'),
  // require('./fetchers/kaitori-rudeya.cjs'),
  // require('./fetchers/kaitori-icchome.cjs'),
];
// ─────────────────────────────────────────────────────────

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const obj = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    obj[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return obj;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const intervalArg = args.find((a) => a.startsWith('--interval='));
  const intervalMs = intervalArg ? parseInt(intervalArg.split('=')[1], 10) : 7000;

  const env = {
    ...parseEnvFile(path.resolve(__dirname, '../.env')),
    ...process.env,
  };

  console.log(`[batch] 開始 dry-run=${dryRun} interval=${intervalMs}ms fetchers=${FETCHERS.map((f) => f.name).join(', ')}`);

  // Firebase Admin 初期化
  const serviceAccountJson = env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    console.error('[batch] FIREBASE_SERVICE_ACCOUNT_JSON が設定されていません');
    process.exit(1);
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch {
    console.error('[batch] FIREBASE_SERVICE_ACCOUNT_JSON のパースに失敗しました');
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  const db = admin.firestore();
  console.log('[batch] Firebase Admin 初期化OK');

  // JAN コードがある未売却商品を全取得
  const snap = await db.collection('products').get();
  const products = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => p.janCode && p.status !== 'sold');

  console.log(`[batch] 対象商品: ${products.length}件`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    console.log(`[batch] 処理中: ${product.productName} (JAN:${product.janCode})`);

    let bestPrice = product.kaitoriPrice ?? 0;

    for (const fetcher of FETCHERS) {
      try {
        const result = await fetcher.fetchPrice(product.janCode);
        if (!result) {
          console.log(`  [${fetcher.name}] 価格なし`);
          skipped++;
          continue;
        }

        console.log(`  [${fetcher.name}] ${result.price.toLocaleString()}円`);

        if (!dryRun) {
          const now = admin.firestore.Timestamp.now();
          // 履歴を保存
          await db.collection('kaitoriPriceHistory').add({
            userId: product.userId,
            janCode: product.janCode,
            productId: product.id,
            price: result.price,
            source: fetcher.name,
            recordedAt: now,
          });
          // 最高値を記録
          if (result.price >= bestPrice) {
            bestPrice = result.price;
          }
        }
        updated++;
      } catch (err) {
        console.error(`  [${fetcher.name}] エラー:`, err.message);
        failed++;
      }

      // サイト間にも間隔を空ける
      if (FETCHERS.indexOf(fetcher) < FETCHERS.length - 1) {
        await sleep(intervalMs);
      }
    }

    // 商品の最新価格を更新
    if (!dryRun && bestPrice > 0) {
      await db.collection('products').doc(product.id).update({
        kaitoriPrice: bestPrice,
        kaitoriPriceAt: new Date().toISOString(),
        updatedAt: admin.firestore.Timestamp.now(),
      });
    }

    console.log(`  次の商品まで ${intervalMs}ms 待機...`);
    await sleep(intervalMs);
  }

  console.log(`[batch] 完了 updated=${updated} skipped=${skipped} failed=${failed}`);
}

main().catch((err) => {
  console.error('[batch] 致命的エラー:', err);
  process.exit(1);
});
