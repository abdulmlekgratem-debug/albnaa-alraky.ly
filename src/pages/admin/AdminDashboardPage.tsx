import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { adminService, AdminUser, AdminProductPayload } from '../../services/adminService';
import { ProductDTO } from '../../types/product';
import { LOCAL_PRODUCTS_SNAPSHOT } from '../../data/localSnapshot';
import {
  Package,
  Users,
  Search,
  Plus,
  Trash2,
  Edit,
  Save,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Loader2,
  X,
  Building2,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'products' | 'users'>('products');
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  // Inline edited prices state: { [productId]: { price_tripoli, price_misrata, price_benghazi, available } }
  const [editedPrices, setEditedPrices] = useState<Record<string, {
    price_tripoli?: number | string | null;
    price_misrata?: number | string | null;
    price_benghazi?: number | string | null;
    available?: boolean;
  }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [deleteProductConfirm, setDeleteProductConfirm] = useState<ProductDTO | null>(null);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<AdminUser | null>(null);

  // Status message
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isAdmin = user?.role === 'admin';

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 4000);
  };

  // Load Products
  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      const data = await adminService.fetchAdminProducts();
      setProducts(data);
    } catch {
      showNotification('error', 'تعذر الاتصال بقاعدة البيانات. تأكد من إعداد api/config.php وتشغيل install.php.');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  // Load Users
  const loadUsers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      setLoadingUsers(true);
      const data = await adminService.fetchUsers();
      setUsers(data);
    } catch {
      showNotification('error', 'تعذر جلب قائمة المستخدمين.');
    } finally {
      setLoadingUsers(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (user) {
      loadProducts();
      if (isAdmin) loadUsers();
    }
  }, [user, isAdmin, loadProducts, loadUsers]);

  // If not logged in, redirect to login
  if (!authLoading && !user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Categories list
  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ['الكل', ...list];
  }, [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'الكل' || p.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.manufacturer && p.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.size && p.size.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Handle Inline Price Change
  const handlePriceChange = (
    productId: string,
    field: 'price_tripoli' | 'price_misrata' | 'price_benghazi',
    val: string
  ) => {
    setEditedPrices((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: val,
      },
    }));
  };

  const handleAvailabilityToggle = (productId: string, currentVal: boolean) => {
    setEditedPrices((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        available: prev[productId]?.available !== undefined ? !prev[productId].available : !currentVal,
      },
    }));
  };

  // Save Single Row Inline
  const handleSaveRow = async (p: ProductDTO) => {
    const changes = editedPrices[p.id];
    if (!changes) return;

    try {
      setSavingId(p.id);
      const payload: AdminProductPayload = {
        id: p.id,
        name: p.name,
        category: p.category,
        subcategory: p.subcategory,
        type: p.type,
        size: p.size,
        unit: p.unit,
        manufacturer: p.manufacturer,
        price_tripoli: changes.price_tripoli !== undefined ? changes.price_tripoli : p.cityPrices?.['طرابلس'],
        price_misrata: changes.price_misrata !== undefined ? changes.price_misrata : p.cityPrices?.['مصراتة'],
        price_benghazi: changes.price_benghazi !== undefined ? changes.price_benghazi : p.cityPrices?.['بنغازي'],
        available: changes.available !== undefined ? changes.available : p.available,
      };

      await adminService.updateProduct(payload);
      showNotification('success', `تم حفظ سعر وتوفر صنف [${p.id}] بنجاح.`);

      // Clear from edited
      setEditedPrices((prev) => {
        const next = { ...prev };
        delete next[p.id];
        return next;
      });

      await loadProducts();
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'فشل حفظ التعديل.');
    } finally {
      setSavingId(null);
    }
  };

  // Delete Product
  const handleDeleteProduct = async () => {
    if (!deleteProductConfirm) return;
    try {
      await adminService.deleteProduct(deleteProductConfirm.id);
      showNotification('success', `تم حذف المنتج [${deleteProductConfirm.id}] بنجاح.`);
      setDeleteProductConfirm(null);
      await loadProducts();
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'فشل حذف المنتج.');
    }
  };

  // Import / Seed from local snapshot
  const handleSeedFromExcel = async () => {
    if (!window.confirm('هل أنت متأكد من استيراد ونقل الـ 134 صنفاً الأولية إلى قاعدة البيانات؟')) {
      return;
    }

    try {
      setLoadingProducts(true);
      const items: AdminProductPayload[] = LOCAL_PRODUCTS_SNAPSHOT.map((p, idx) => ({
        id: p.id,
        sortOrder: idx + 1,
        category: p.category,
        subcategory: p.subcategory,
        name: p.name,
        type: p.type,
        size: p.size,
        unit: p.unit,
        manufacturer: p.manufacturer,
        price_tripoli: p.cityPrices?.['طرابلس'] ?? p.price,
        price_misrata: p.cityPrices?.['مصراتة'] ?? null,
        price_benghazi: p.cityPrices?.['بنغازي'] ?? null,
        available: p.available,
        active: true,
        imageUrl: p.imageUrl,
      }));

      const msg = await adminService.bulkImport(items);
      showNotification('success', msg);
      await loadProducts();
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'فشل الاستيراد.');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!deleteUserConfirm) return;
    try {
      await adminService.deleteUser(deleteUserConfirm.id);
      showNotification('success', 'تم حذف المستخدم بنجاح.');
      setDeleteUserConfirm(null);
      await loadUsers();
    } catch (err: unknown) {
      showNotification('error', err instanceof Error ? err.message : 'فشل حذف المستخدم.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100" dir="rtl">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/95 px-4 py-3.5 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-white sm:text-lg">
                لوحة تحكم البناء الراقي
              </h1>
              <p className="text-[11px] text-slate-400">
                إدارة قاعدة البيانات والأسعار
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden text-left text-xs sm:block">
              <div className="font-bold text-white">{user?.fullName}</div>
              <div className="text-[10px] text-amber-400">
                {user?.role === 'admin' ? 'مدير عام (كامل الصلاحيات)' : 'مسؤول أسعار'}
              </div>
            </div>

            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              الموقع
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-400 transition hover:bg-red-500/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              خروج
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {statusMsg && (
        <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-semibold shadow-2xl backdrop-blur-md">
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-black transition ${
              activeTab === 'products'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="h-4 w-4" />
            المنتجات والأسعار ({products.length})
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-black transition ${
                activeTab === 'users'
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="h-4 w-4" />
              المستخدمين والصلاحيات ({users.length})
            </button>
          )}
        </div>

        {/* TAB 1: PRODUCTS & PRICES */}
        {activeTab === 'products' && (
          <div className="mt-6 space-y-6">
            {/* Actions & Filters Header */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-850 p-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Search & Category */}
              <div className="flex flex-1 flex-wrap items-center gap-3">
                <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم أو الرمز..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pr-9 pl-3 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  />
                  <Search className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 focus:border-amber-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={handleSeedFromExcel}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-700 hover:text-white"
                    title="استيراد الأصناف من ملف الإكسل الأولي"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-amber-400" />
                    مزامنة مع الإكسل
                  </button>
                )}

                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setProductModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  إضافة صنف جديد
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
              {loadingProducts ? (
                <div className="flex h-64 items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                  جاري تحميل المنتجات من قاعدة البيانات...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex h-48 flex-col items-center justify-center text-slate-400">
                  <Package className="h-8 w-8 text-slate-600 mb-2" />
                  <p className="text-sm font-bold">لا توجد أصناف مطابقة للبحث</p>
                  {products.length === 0 && (
                    <button
                      onClick={handleSeedFromExcel}
                      className="mt-3 rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-bold text-slate-950"
                    >
                      استيراد الأصناف الأولية (134 صنفًا)
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="border-b border-slate-800 bg-slate-850/80 font-bold text-slate-400">
                      <tr>
                        <th className="px-3 py-3 w-16">الرمز</th>
                        <th className="px-3 py-3">المادة / الصنف</th>
                        <th className="px-3 py-3">التصنيف</th>
                        <th className="px-3 py-3">المقاس/المصنع</th>
                        <th className="px-3 py-3">الوحدة</th>
                        <th className="px-3 py-3 w-32">سعر طرابلس</th>
                        <th className="px-3 py-3 w-32">سعر مصراتة</th>
                        <th className="px-3 py-3 w-24 text-center">التوفر</th>
                        <th className="px-3 py-3 w-28 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredProducts.map((p) => {
                        const changes = editedPrices[p.id] || {};
                        const hasChanges = Boolean(editedPrices[p.id]);
                        const isRowSaving = savingId === p.id;
                        const isAvailable =
                          changes.available !== undefined ? changes.available : p.available;

                        const tripoliVal =
                          changes.price_tripoli !== undefined
                            ? changes.price_tripoli
                            : (p.cityPrices?.['طرابلس'] ?? '');

                        const misrataVal =
                          changes.price_misrata !== undefined
                            ? changes.price_misrata
                            : (p.cityPrices?.['مصراتة'] ?? '');

                        return (
                          <tr
                            key={p.id}
                            className={`transition hover:bg-slate-850/50 ${
                              hasChanges ? 'bg-amber-500/5' : ''
                            }`}
                          >
                            <td className="px-3 py-2.5 font-mono font-bold text-amber-400">
                              {p.id}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="font-bold text-white">{p.name}</div>
                              {p.type && (
                                <div className="text-[10px] text-slate-400">{p.type}</div>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-slate-300">{p.category}</td>
                            <td className="px-3 py-2.5 text-slate-400">
                              {[p.size, p.manufacturer].filter(Boolean).join(' • ') || '—'}
                            </td>
                            <td className="px-3 py-2.5 font-semibold text-slate-300">
                              {p.unit}
                            </td>

                            {/* Inline Price: Tripoli */}
                            <td className="px-3 py-2.5">
                              <input
                                type="number"
                                step="any"
                                placeholder="0.0"
                                value={tripoliVal === null ? '' : tripoliVal}
                                onChange={(e) =>
                                  handlePriceChange(p.id, 'price_tripoli', e.target.value)
                                }
                                className="w-24 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white focus:border-amber-500 focus:outline-none"
                              />
                            </td>

                            {/* Inline Price: Misrata */}
                            <td className="px-3 py-2.5">
                              <input
                                type="number"
                                step="any"
                                placeholder="0.0"
                                value={misrataVal === null ? '' : misrataVal}
                                onChange={(e) =>
                                  handlePriceChange(p.id, 'price_misrata', e.target.value)
                                }
                                className="w-24 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white focus:border-amber-500 focus:outline-none"
                              />
                            </td>

                            {/* Availability Toggle */}
                            <td className="px-3 py-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleAvailabilityToggle(p.id, p.available)}
                                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black transition ${
                                  isAvailable
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                }`}
                              >
                                {isAvailable ? 'متوفر' : 'غير متوفر'}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="px-3 py-2.5 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {hasChanges && (
                                  <button
                                    onClick={() => handleSaveRow(p)}
                                    disabled={isRowSaving}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 transition hover:bg-emerald-400"
                                    title="حفظ التعديل"
                                  >
                                    {isRowSaving ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Save className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                )}

                                <button
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setProductModalOpen(true);
                                  }}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                                  title="تعديل تفاصيل الصنف"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>

                                {isAdmin && (
                                  <button
                                    onClick={() => setDeleteProductConfirm(p)}
                                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
                                    title="حذف المنتج"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: USERS & ROLES */}
        {activeTab === 'users' && isAdmin && (
          <div className="mt-6 space-y-6">
            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-850 p-4">
              <div>
                <h2 className="text-sm font-bold text-white">إدارة المستخدمين والصلاحيات</h2>
                <p className="text-xs text-slate-400">
                  يمكنك إضافة مسؤولين وتحديد صلاحية كل مستخدم (مدير عام أو مسؤول أسعار)
                </p>
              </div>

              <button
                onClick={() => {
                  setEditingUser(null);
                  setUserModalOpen(true);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-2 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 transition hover:bg-amber-400"
              >
                <Plus className="h-3.5 w-3.5" />
                إضافة مستخدم جديد
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
              {loadingUsers ? (
                <div className="flex h-48 items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
                  جاري تحميل المستخدمين...
                </div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead className="border-b border-slate-800 bg-slate-850/80 font-bold text-slate-400">
                    <tr>
                      <th className="px-4 py-3">اسم المستخدم</th>
                      <th className="px-4 py-3">الاسم الكامل</th>
                      <th className="px-4 py-3">الصلاحية</th>
                      <th className="px-4 py-3">تاريخ الإنشاء</th>
                      <th className="px-4 py-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.map((u) => (
                      <tr key={u.id} className="transition hover:bg-slate-850/50">
                        <td className="px-4 py-3 font-mono font-bold text-amber-400">
                          {u.username}
                        </td>
                        <td className="px-4 py-3 font-bold text-white">{u.fullName}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                              u.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}
                          >
                            {u.role === 'admin' ? 'مدير عام' : 'مسؤول أسعار'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{u.createdAt || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setUserModalOpen(true);
                              }}
                              className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 transition hover:bg-slate-700 hover:text-white"
                              title="تعديل المستخدم"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>

                            {u.id !== user?.id && (
                              <button
                                onClick={() => setDeleteUserConfirm(u)}
                                className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-red-400 transition hover:bg-red-500/20"
                                title="حذف المستخدم"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* 1. Add / Edit Product Modal */}
      {productModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => setProductModalOpen(false)}
          onSuccess={() => {
            setProductModalOpen(false);
            showNotification('success', editingProduct ? 'تم تعديل المنتج بنجاح.' : 'تمت إضافة المنتج بنجاح.');
            loadProducts();
          }}
        />
      )}

      {/* 2. Delete Product Modal */}
      {deleteProductConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">تأكيد حذف المنتج</h3>
            <p className="mt-2 text-xs text-slate-400">
              هل أنت متأكد من حذف المنتج{' '}
              <strong className="text-white">[{deleteProductConfirm.name}]</strong> نهائياً؟
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeleteProductConfirm(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteProduct}
                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-black text-white hover:bg-red-600"
              >
                نعم، احذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add / Edit User Modal */}
      {userModalOpen && (
        <UserModal
          user={editingUser}
          onClose={() => setUserModalOpen(false)}
          onSuccess={() => {
            setUserModalOpen(false);
            showNotification('success', editingUser ? 'تم تعديل المستخدم بنجاح.' : 'تم إنشاء المستخدم بنجاح.');
            loadUsers();
          }}
        />
      )}

      {/* 4. Delete User Modal */}
      {deleteUserConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
              <Trash2 className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">تأكيد حذف المستخدم</h3>
            <p className="mt-2 text-xs text-slate-400">
              هل أنت متأكد من حذف الحساب{' '}
              <strong className="text-white">[{deleteUserConfirm.username}]</strong>؟
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => setDeleteUserConfirm(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteUser}
                className="rounded-xl bg-red-500 px-4 py-2 text-xs font-black text-white hover:bg-red-600"
              >
                نعم، احذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENT: Product Modal ---
interface ProductModalProps {
  product: ProductDTO | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSuccess }) => {
  const isEdit = Boolean(product);
  const [formData, setFormData] = useState<AdminProductPayload>({
    id: product?.id || '',
    name: product?.name || '',
    category: product?.category || 'الحديد',
    subcategory: product?.subcategory || '',
    type: product?.type || '',
    size: product?.size || '',
    unit: product?.unit || 'طن',
    manufacturer: product?.manufacturer || '',
    price_tripoli: product?.cityPrices?.['طرابلس'] ?? (product?.price ?? ''),
    price_misrata: product?.cityPrices?.['مصراتة'] ?? '',
    price_benghazi: product?.cityPrices?.['بنغازي'] ?? '',
    available: product ? product.available : true,
    active: true,
    imageUrl: product?.imageUrl || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.name.trim()) {
      setError('يرجى ملء رمز المنتج واسم المادة.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      if (isEdit) {
        await adminService.updateProduct(formData);
      } else {
        await adminService.createProduct(formData);
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل حفظ البيانات.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" dir="rtl">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">
            {isEdit ? `تعديل صنف [${product?.id}]` : 'إضافة صنف جديد'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-300">رمز المنتج (ID)*</label>
              <input
                type="text"
                required
                disabled={isEdit}
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.trim() })}
                placeholder="مثال: P020"
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300">التصنيف الرئيسي*</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="الحديد، الأسمنت..."
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300">اسم المادة / العرض*</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: حديد تسليح 12 ملي مصراتة"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-300">النوع</label>
              <input
                type="text"
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="مشرشر، عادي..."
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300">المقاس</label>
              <input
                type="text"
                value={formData.size || ''}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="12 مم..."
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300">الوحدة*</label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="قنطار، طن، كيس..."
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300">المصنع أو المصدر</label>
            <input
              type="text"
              value={formData.manufacturer || ''}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              placeholder="مصراتة، الرواد..."
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            />
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-850 p-3">
            <span className="block font-bold text-amber-400 mb-2">أسعار المدن (د.ل)</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400">طرابلس</label>
                <input
                  type="number"
                  step="any"
                  value={formData.price_tripoli === null ? '' : formData.price_tripoli}
                  onChange={(e) => setFormData({ ...formData, price_tripoli: e.target.value })}
                  placeholder="0.0"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400">مصراتة</label>
                <input
                  type="number"
                  step="any"
                  value={formData.price_misrata === null ? '' : formData.price_misrata}
                  onChange={(e) => setFormData({ ...formData, price_misrata: e.target.value })}
                  placeholder="0.0"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400">بنغازي</label>
                <input
                  type="number"
                  step="any"
                  value={formData.price_benghazi === null ? '' : formData.price_benghazi}
                  onChange={(e) => setFormData({ ...formData, price_benghazi: e.target.value })}
                  placeholder="0.0"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300">رابط الصورة (URL)</label>
            <input
              type="url"
              value={formData.imageUrl || ''}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="availCheckbox"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-500"
            />
            <label htmlFor="availCheckbox" className="font-bold text-slate-300">
              المنتج متوفر بالمخزن
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 font-bold text-slate-300 hover:bg-slate-700"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 font-black text-slate-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEdit ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: User Modal ---
interface UserModalProps {
  user: AdminUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSuccess }) => {
  const isEdit = Boolean(user);
  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor'>(user?.role || 'editor');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      if (isEdit && user) {
        await adminService.updateUser({
          id: user.id,
          fullName,
          role,
          password: password.trim() || undefined,
        });
      } else {
        await adminService.createUser({
          username: username.trim(),
          fullName: fullName.trim(),
          password: password.trim(),
          role,
        });
      }
      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'فشل حفظ المستخدم.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-base font-bold text-white">
            {isEdit ? `تعديل المستخدم [${user?.username}]` : 'إضافة مستخدم جديد'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300">اسم المستخدم الدخول*</label>
            <input
              type="text"
              required
              disabled={isEdit}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="مثال: ahmed"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300">الاسم الكامل*</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: أحمد الطاهر"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300">
              {isEdit ? 'كلمة المرور الجديدة (اتركها فارغة إذا لم ترغب في التغيير)' : 'كلمة المرور*'}
            </label>
            <input
              type="password"
              required={!isEdit}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300">الصلاحية*</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'editor')}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-white font-bold"
            >
              <option value="editor">مسؤول أسعار (تعديل الأسعار والمخزون فقط)</option>
              <option value="admin">مدير عام (كامل الصلاحيات وحذف المنتجات والمستخدمين)</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 font-bold text-slate-300 hover:bg-slate-700"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 font-black text-slate-950 hover:bg-amber-400 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isEdit ? 'حفظ التعديلات' : 'إنشاء المستخدم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
