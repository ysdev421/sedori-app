const toProxyUrl = (url: string) =>
  `https://r.jina.ai/${url}`;

export interface KaitoriPriceResult {
  highestPrice: number;
  searchUrl: string;
}

export async function fetchKaitoriPrice(janCode: string): Promise<KaitoriPriceResult | null> {
  const searchUrl = `https://kaitori.wiki/search?type=&keyword=${encodeURIComponent(janCode)}`;
  const res = await fetch(toProxyUrl(searchUrl));
  if (!res.ok) throw new Error('取得に失敗しました');
  const text = await res.text();

  // "1,370円" や "1370円" 形式の数値をすべて抽出
  const matches = [...text.matchAll(/([\d,]+)円/g)];
  const prices = matches
    .map((m) => parseInt(m[1].replace(/,/g, ''), 10))
    .filter((n) => !isNaN(n) && n > 0 && n < 10_000_000);

  if (prices.length === 0) return null;

  return {
    highestPrice: Math.max(...prices),
    searchUrl,
  };
}
