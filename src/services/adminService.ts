/**
 * Admin & Database API Service
 */

import { ProductDTO } from '../types/product';

export interface AdminUser {
  id: number;
  username: string;
  fullName: string;
  role: 'admin' | 'editor';
  createdAt?: string;
}

export interface AdminProductPayload {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  type?: string | null;
  size?: string | null;
  unit?: string;
  manufacturer?: string | null;
  price_tripoli?: number | string | null;
  price_misrata?: number | string | null;
  price_benghazi?: number | string | null;
  available?: boolean;
  active?: boolean;
  imageUrl?: string | null;
  sortOrder?: number;
}

export const adminService = {
  // --- Auth ---
  async checkSession(): Promise<AdminUser | null> {
    try {
      const res = await fetch('/api/auth.php?action=me', {
        credentials: 'include',
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
  },

  async login(username: string, password: string): Promise<AdminUser> {
    const res = await fetch('/api/auth.php?action=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok || data.status !== 'success') {
      throw new Error(data.error || 'فشل تسجيل الدخول.');
    }
    return data.user;
  },

  async logout(): Promise<void> {
    await fetch('/api/auth.php?action=logout', {
      method: 'POST',
      credentials: 'include',
    });
  },

  // --- Products ---
  async fetchAdminProducts(): Promise<ProductDTO[]> {
    const res = await fetch('/api/products.php?all=1', {
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('تعذر جلب المنتجات من قاعدة البيانات.');
    }
    const data = await res.json();
    return data.products || [];
  },

  async createProduct(payload: AdminProductPayload): Promise<void> {
    const res = await fetch('/api/products.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') {
      throw new Error(data.error || 'فشل إنشاء المنتج.');
    }
  },

  async updateProduct(payload: AdminProductPayload): Promise<void> {
    const res = await fetch('/api/products.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') {
      throw new Error(data.error || 'فشل تحديث المنتج.');
    }
  },

  async deleteProduct(id: string): Promise<void> {
    const res = await fetch(`/api/products.php?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') {
      throw new Error(data.error || 'فشل حذف المنتج.');
    }
  },

  async bulkImport(items: AdminProductPayload[]): Promise<string> {
    const res = await fetch('/api/products.php?action=bulk_import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ items }),
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') {
      throw new Error(data.error || 'فشل استيراد الأصناف.');
    }
    return data.message || 'تم الاستيراد بنجاح.';
  },

  // --- Users ---
  async fetchUsers(): Promise<AdminUser[]> {
    const res = await fetch('/api/users.php', {
      credentials: 'include',
    });
    if (!res.ok) {
      throw new Error('تعذر جلب المستخدمين.');
    }
    const data = await res.json();
    return (data.users || []).map((u: Record<string, unknown>) => ({
      id: Number(u.id),
      username: String(u.username),
      fullName: String(u.full_name),
      role: u.role as 'admin' | 'editor',
      createdAt: u.created_at ? String(u.created_at) : undefined,
    }));
  },

  async createUser(user: { username: string; password: string; fullName: string; role: 'admin' | 'editor' }): Promise<void> {
    const res = await fetch('/api/users.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') {
      throw new Error(data.error || 'فشل إنشاء المستخدم.');
    }
  },

  async updateUser(user: { id: number; fullName?: string; role?: 'admin' | 'editor'; password?: string }): Promise<void> {
    const res = await fetch('/api/users.php', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(user),
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') {
      throw new Error(data.error || 'فشل تحديث المستخدم.');
    }
  },

  async deleteUser(id: number): Promise<void> {
    const res = await fetch(`/api/users.php?id=${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok || data.status !== 'success') {
      throw new Error(data.error || 'فشل حذف المستخدم.');
    }
  },
};
