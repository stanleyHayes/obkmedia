import type { Portfolio } from '../../api/types';

export function categoryName(item: Portfolio): string | null {
  if (item.categoryId && typeof item.categoryId === 'object') return item.categoryId.name;
  return null;
}
