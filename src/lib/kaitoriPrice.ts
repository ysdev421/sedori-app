const toProxyUrl = (url: string) => `https://r.jina.ai/${url}`;

export interface KaitoriPriceResult {
  highestPrice: number;
  searchUrl: string;
}

export async function fetchKaitoriPrice(janCode: string): Promise<KaitoriPriceResult | null> {
  const searchUrl = `https://kaitori.wiki/search?type=&keyword=${encodeURIComponent(janCode)}`;
  const res = await fetch(toProxyUrl(searchUrl));
  if (!res.ok) throw new Error('取得に失敗しました');
  const text = await res.text();

  // 「買取価格」直後の数値を優先して抽出
  const directMatch = text.match(/買取価格[^\d]{0,10}([\d,]+)円/);
  if (directMatch) {
    const price = parseInt(directMatch[1].replace(/,/g, ''), 10);
    if (!isNaN(price) && price > 0) {
      return { highestPrice: price, searchUrl };
    }
  }

  // フォールバック：最初に出てくる妥当な価格
  const matches = [...text.matchAll(/([\d,]+)円/g)];
  const prices = matches
    .map((m) => parseInt(m[1].replace(/,/g, ''), 10))
    .filter((n) => !isNaN(n) && n >= 100 && n < 1_000_000);

  if (prices.length === 0) return null;

  return { highestPrice: prices[0], searchUrl };
}
