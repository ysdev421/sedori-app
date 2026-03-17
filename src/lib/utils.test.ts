import { describe, expect, it } from 'vitest';
import { getActualPayment, getEffectiveCost } from '@/lib/utils';
import type { Product } from '@/types';

const baseProduct: Product = {
  id: 'p1',
  userId: 'u1',
  productName: 'test',
  purchasePrice: 71219,
  point: 9314,
  purchaseDate: '2026-03-11',
  purchaseLocation: 'メルカリ',
  status: 'pending',
  createdAt: '2026-03-11T00:00:00.000Z',
  updatedAt: '2026-03-11T00:00:00.000Z',
};

describe('cost formula', () => {
  it('actual payment equals purchase price', () => {
    expect(getActualPayment(baseProduct)).toBe(71219);
  });

  it('effective cost = purchase price - earned point', () => {
    expect(getEffectiveCost(baseProduct)).toBe(71219 - 9314);
  });
});
