import { api } from './client';
import type { Category, ContactPayload, Portfolio, PortfolioImage } from './types';

export const publicApi = {
  listPortfolio: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    const suffix = query.size > 0 ? `?${query.toString()}` : '';
    return api.get<{ items: Portfolio[] }>(`/api/public/portfolio${suffix}`);
  },
  featured: () => api.get<{ items: Portfolio[] }>('/api/public/portfolio/featured'),
  portfolioBySlug: (slug: string) =>
    api.get<{ item: Portfolio; images: PortfolioImage[]; related: Portfolio[] }>(
      `/api/public/portfolio/${encodeURIComponent(slug)}`,
    ),
  categories: () => api.get<{ items: Category[] }>('/api/public/categories'),
  submitContact: (payload: ContactPayload) =>
    api.post<{ ok: boolean; message: string }>('/api/public/contact', payload),
};
