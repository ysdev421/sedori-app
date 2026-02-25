import type { Product, ProfitSummary } from '@/types';

// 利益計算
export function calculateProfit(product: Product): number {
  if (!product.salePrice) return 0;
  const cost = product.purchasePrice - product.point;
  return product.salePrice - cost;
}

// ポイント利益計算
export function calculatePointProfit(product: Product): number {
  if (!product.salePrice) return 0;
  return product.salePrice - product.purchasePrice;
}

// 利益サマリー計算
export function calculateProfitSummary(products: Product[]): ProfitSummary {
  const sold = products.filter((p) => p.status === 'sold');
  const inventory = products.filter((p) => p.status === 'inventory');
  const waiting = products.filter((p) => p.status === 'pending');

  const totalCost = products.reduce((sum, p) => sum + (p.purchasePrice - p.point), 0);
  const totalRevenue = sold.reduce((sum, p) => sum + (p.salePrice || 0), 0);
  const totalProfit = sold.reduce((sum, p) => sum + calculateProfit(p), 0);
  const totalPointProfit = sold.reduce((sum, p) => sum + calculatePointProfit(p), 0);
  const inventoryValue = inventory.reduce((sum, p) => sum + p.purchasePrice, 0);

  return {
    totalProducts: products.length,
    totalRevenue,
    totalCost,
    totalProfit,
    totalPointProfit,
    soldCount: sold.length,
    inventoryValue,
    waitingCount: waiting.length,
  };
}

// CSV出力
export function exportToCSV(products: Product[], filename: string = 'sedori-data.csv') {
  const headers = [
    'No',
    '購入日',
    '商品名',
    '購入場所',
    '購入価格',
    'ポイント',
    '実質価格',
    '売却先',
    '売却価格',
    '利益',
    'P利益',
    '売却日',
    'ステータス',
  ];

  const rows = products.map((p, index) => [
    index + 1,
    p.purchaseDate,
    p.productName,
    p.purchaseLocation,
    p.purchasePrice,
    p.point,
    p.purchasePrice - p.point,
    p.saleLocation || '',
    p.salePrice || '',
    p.salePrice ? calculateProfit(p) : '',
    p.salePrice ? calculatePointProfit(p) : '',
    p.saleDate || '',
    p.status,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 日付フォーマット
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// 金額フォーマット
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(amount);
}
