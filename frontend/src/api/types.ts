export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  portfolioCount?: number;
}

export interface Portfolio {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription?: string;
  categoryId?: Category | string | null;
  coverImageUrl: string;
  coverImagePublicId?: string;
  shootDate?: string | null;
  location?: string;
  clientName?: string;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  imageCount?: number;
  createdAt?: string;
}

export interface PortfolioImage {
  _id: string;
  portfolioId: string;
  imageUrl: string;
  imagePublicId?: string;
  caption?: string;
  altText?: string;
  sortOrder: number;
}

export interface ContactMessage {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  shootType?: string;
  preferredDate?: string | null;
  location?: string;
  budgetRange?: string;
  message: string;
  status: 'unread' | 'read';
  createdAt: string;
}

export type Permission =
  | 'portfolio.view'
  | 'portfolio.manage'
  | 'portfolio.publish'
  | 'categories.view'
  | 'categories.manage'
  | 'messages.view'
  | 'messages.manage'
  | 'users.view'
  | 'users.manage'
  | 'roles.view'
  | 'roles.manage';

export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  userCount?: number;
}

export interface AdminPreferences {
  notifyOnContact: boolean;
  defaultLandingPage: string;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: { id: string; name: string; isSystem: boolean } | null;
  permissions: Permission[];
  preferences: AdminPreferences;
  lastLoginAt?: string | null;
  isActive?: boolean;
  createdAt?: string;
  mustResetPassword?: boolean;
}

export interface ContactPayload {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  shootType?: string;
  preferredDate?: string;
  location?: string;
  budgetRange?: string;
  message: string;
  website?: string; // honeypot — must stay empty
}

export interface PortfolioPayload {
  title: string;
  slug?: string;
  shortDescription: string;
  fullDescription?: string;
  categoryId?: string | null;
  coverImageUrl: string;
  coverImagePublicId?: string;
  shootDate?: string | null;
  location?: string;
  clientName?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface NotificationItem {
  id: string;
  fullName: string;
  shootType?: string;
  message: string;
  createdAt: string;
}

export interface AdminStats {
  portfolios: number;
  published: number;
  featured: number;
  categories: number;
  messages: number;
  unread: number;
}
