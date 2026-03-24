const toProxyUrl = (url: string) => `https://r.jina.ai/${url}`;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24時間
const CACHE_KEY_PREFIX = 'kaitoriPrice_';

export interface KaitoriPriceResult {
  highestPrice: number;
  searchUrl: string;
  cachedAt?: number;
}

function loadCache(janCode: string): KaitoriPriceResult | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + janCode);
    if (!raw) return null;
    const data = JSON.parse(raw) as KaitoriPriceResult;
    if (Date.now() - (data.cachedAt ?? 0) > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY_PREFIX + janCode);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function saveCache(janCode: string, result: KaitoriPriceResult) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + janCode, JSON.stringify({ ...result, cachedAt: Date.now() }));
  } catch {
    // noop
  }
}

export async function fetchKaitoriPrice(janCode: string): Promise<KaitoriPriceResult | null> {
  const cached = loadCache(janCode);
  if (cached) return cached;

  const searchUrl = `https://kaitori.wiki/search?type=&keyword=${encodeURIComponent(janCode)}`;
  const res = await fetch(toProxyUrl(searchUrl));
  if (!res.ok) throw new Error('取得に失敗しました');
  const text = await res.text();

  // 「買取価格」直後の数値を優先して抽出
  const directMatch = text.match(/買取価格[^\d]{0,10}([\d,]+)円/);
  if (directMatch) {
    const price = parseInt(directMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(price) && price > 0) {
      const result: KaitoriPriceResult = { highestPrice: price, searchUrl };
      saveCache(janCode, result);
      return result;
    }
  }

  // フォールバック：最初に出てくる妥当な価格
  const matches = [...text.matchAll(/([\d,]+)円/g)];
  const prices = matches
    .map((m) => parseInt(m[1].replace(/,/g, ''), 10))
    .filter((n) => !isNaN(n) && n >= 100 && n < 1_000_000);

  if (prices.length === 0) return null;

  const result: KaitoriPriceResult = { highestPrice: prices[0], searchUrl };
  saveCache(janCode, result);
  return result;
}
