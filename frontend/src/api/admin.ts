import { api } from './client';
import type {
  AdminPreferences,
  AdminStats,
  AdminUser,
  Category,
  ContactMessage,
  NotificationItem,
  Permission,
  Portfolio,
  PortfolioImage,
  PortfolioPayload,
  Role,
} from './types';

export const adminApi = {
  // auth
  login: (email: string, password: string) =>
    api.post<{ admin: AdminUser }>('/api/admin/auth/login', { email, password }),
  logout: () => api.post<{ ok: boolean }>('/api/admin/auth/logout'),
  me: () => api.get<{ admin: AdminUser }>('/api/admin/auth/me'),

  // self-service
  updateProfile: (payload: { fullName: string; email: string }) =>
    api.patch<{ admin: AdminUser }>('/api/admin/auth/profile', payload),
  updatePassword: (payload: { currentPassword: string; newPassword: string }) =>
    api.patch<{ ok: boolean }>('/api/admin/auth/password', payload),
  updatePreferences: (payload: Partial<AdminPreferences>) =>
    api.patch<{ admin: AdminUser }>('/api/admin/auth/preferences', payload),

  // users
  listUsers: () => api.get<{ items: AdminUser[] }>('/api/admin/users'),
  createUser: (payload: { fullName: string; email: string; password: string; roleId: string }) =>
    api.post<{ item: AdminUser }>('/api/admin/users', payload),
  updateUser: (
    id: string,
    payload: { fullName?: string; email?: string; roleId?: string; isActive?: boolean },
  ) => api.patch<{ item: AdminUser }>(`/api/admin/users/${id}`, payload),
  setUserPassword: (id: string, password: string) =>
    api.patch<{ ok: boolean }>(`/api/admin/users/${id}/password`, { password }),
  deleteUser: (id: string) => api.delete<{ ok: boolean }>(`/api/admin/users/${id}`),

  // roles
  listRoles: () =>
    api.get<{ items: Role[]; catalog: Record<Permission, string> }>('/api/admin/roles'),
  createRole: (payload: { name: string; description?: string; permissions: Permission[] }) =>
    api.post<{ item: Role }>('/api/admin/roles', payload),
  updateRole: (
    id: string,
    payload: { name?: string; description?: string; permissions?: Permission[] },
  ) => api.patch<{ item: Role }>(`/api/admin/roles/${id}`, payload),
  deleteRole: (id: string) => api.delete<{ ok: boolean }>(`/api/admin/roles/${id}`),

  // stats
  stats: () => api.get<{ stats: AdminStats; recentMessages: ContactMessage[] }>('/api/admin/stats'),

  // notifications (unread messages feed for the bell)
  notifications: () =>
    api.get<{ count: number; items: NotificationItem[] }>('/api/admin/notifications'),

  // portfolio
  listPortfolio: () => api.get<{ items: Portfolio[] }>('/api/admin/portfolio'),
  getPortfolio: (id: string) =>
    api.get<{ item: Portfolio; images: PortfolioImage[] }>(`/api/admin/portfolio/${id}`),
  createPortfolio: (payload: PortfolioPayload) =>
    api.post<{ item: Portfolio }>('/api/admin/portfolio', payload),
  updatePortfolio: (id: string, payload: Partial<PortfolioPayload>) =>
    api.patch<{ item: Portfolio }>(`/api/admin/portfolio/${id}`, payload),
  deletePortfolio: (id: string) => api.delete<{ ok: boolean }>(`/api/admin/portfolio/${id}`),
  setPublished: (id: string, value: boolean) =>
    api.patch<{ item: Portfolio }>(`/api/admin/portfolio/${id}/publish`, { value }),
  setFeatured: (id: string, value: boolean) =>
    api.patch<{ item: Portfolio }>(`/api/admin/portfolio/${id}/feature`, { value }),

  // gallery images
  uploadGalleryImages: (portfolioId: string, files: File[]) => {
    const form = new FormData();
    files.forEach((file) => form.append('images', file));
    return api.postForm<{ images: PortfolioImage[] }>(
      `/api/admin/portfolio/${portfolioId}/images`,
      form,
    );
  },
  reorderImages: (portfolioId: string, imageIds: string[]) =>
    api.patch<{ images: PortfolioImage[] }>(`/api/admin/portfolio/${portfolioId}/images/reorder`, {
      imageIds,
    }),
  updateImage: (imageId: string, payload: { caption?: string; altText?: string }) =>
    api.patch<{ image: PortfolioImage }>(`/api/admin/portfolio/images/${imageId}`, payload),
  deleteImage: (imageId: string) =>
    api.delete<{ ok: boolean }>(`/api/admin/portfolio/images/${imageId}`),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return api.postForm<{ url: string; publicId: string }>('/api/admin/uploads/image', form);
  },

  // categories
  listCategories: () => api.get<{ items: Category[] }>('/api/admin/categories'),
  createCategory: (payload: { name: string; slug?: string; description?: string; sortOrder?: number }) =>
    api.post<{ item: Category }>('/api/admin/categories', payload),
  updateCategory: (
    id: string,
    payload: { name?: string; slug?: string; description?: string; sortOrder?: number },
  ) => api.patch<{ item: Category }>(`/api/admin/categories/${id}`, payload),
  deleteCategory: (id: string) => api.delete<{ ok: boolean }>(`/api/admin/categories/${id}`),

  // messages
  listMessages: (params?: { search?: string; status?: 'read' | 'unread' }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    const suffix = query.size > 0 ? `?${query.toString()}` : '';
    return api.get<{ items: ContactMessage[] }>(`/api/admin/contact-messages${suffix}`);
  },
  getMessage: (id: string) => api.get<{ item: ContactMessage }>(`/api/admin/contact-messages/${id}`),
  setMessageStatus: (id: string, status: 'read' | 'unread') =>
    api.patch<{ item: ContactMessage }>(`/api/admin/contact-messages/${id}/status`, { status }),
  deleteMessage: (id: string) => api.delete<{ ok: boolean }>(`/api/admin/contact-messages/${id}`),
};
