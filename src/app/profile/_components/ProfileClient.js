"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { nextApi } from "@/lib/api";
import { useState } from "react";
import Layout from "@/components/Layout";
import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import Toast from "@/components/ui/Toast";
import SimplePopover from "@/components/ui/SimplePopover";

export default function ProfileClient({ user = {}, orders = [] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders");
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [confirmModal, setSimplePopover] = useState({ isOpen: false, orderId: null });
  const { wishlistItems, removeFromWishlist, clearWishList } = useWishlist();
  const { addToCart, clearCart } = useCart();

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ isVisible: false, message: '', type: 'success' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Teslim Edildi": return "bg-green-100 text-green-800";
      case "Kargoda": return "bg-blue-100 text-blue-800";
      case "Hazırlanıyor": return "bg-yellow-100 text-yellow-800";
      case "İptal Edildi": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    showToast('Ürün sepete eklendi!', 'success');
  };

  const handleCancelOrder = (orderId) => {
    setSimplePopover({ isOpen: true, orderId });
  };

  const confirmCancelOrder = async () => {
    setSimplePopover({ isOpen: false, orderId: null });
    try {
      await nextApi.delete(`/api/orders/${confirmModal.orderId}`);
      showToast('Sipariş başarıyla iptal edildi!', 'success');
      window.location.reload();
    } catch (error) {
      console.log("Cancel order error:", error);
      showToast('Sipariş iptal edilirken bir hata oluştu!', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout/api');
      router.push('/');
      clearCart();
      clearWishList()
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  const getInitial = (name) => {
    if (typeof name === 'string' && name.length > 0) {
      return name[0].toUpperCase();
    }
    if (name && typeof name === 'object') {
      const first = name.firstname || name.firstName || '';
      return first ? first[0].toUpperCase() : 'U';
    }
    return 'U';
  };

  const getDisplayName = (user) => {
    const name = user?.name;
    if (typeof name === 'string') return name;
    if (name && typeof name === 'object') {
      const first = name.firstname || name.firstName || '';
      const last = name.lastname || name.lastName || '';
      const full = [first, last].filter(Boolean).join(' ').trim();
      if (full) return full;
    }
    return user?.email || 'Kullanıcı';
  };

  const toStringSafely = (value) => {
    if (value == null) return '';
    const type = typeof value;
    if (type === 'string' || type === 'number' || type === 'boolean') return String(value);
    if (type === 'object') return '';
    return '';
  };

  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = orders.length;

  return (
    <Layout>
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      <SimplePopover
        isOpen={confirmModal.isOpen}
        onClose={() => setSimplePopover({ isOpen: false, orderId: null })}
        onConfirm={confirmCancelOrder}
        title="Siparişi İptal Et"
        message="Bu siparişi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Evet, İptal Et"
        cancelText="Hayır"
        type="danger"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-indigo-600">
                  {getInitial(user?.name)}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{getDisplayName(user)}</h1>
                <p className="text-gray-600 mb-4">{toStringSafely(user?.email)}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {toStringSafely(user?.phone) && <span>📱 {toStringSafely(user?.phone)}</span>}
                  {toStringSafely(user?.address) && <span>📍 {toStringSafely(user?.address)}</span>}
                  <span>📅 Üye olma: {new Date().toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
              <div className="flex gap-4">
                
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Toplam Harcama</p>
                  <p className="text-2xl font-bold text-gray-900">₺{totalSpent.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Favoriler</p>
                  <p className="text-2xl font-bold text-gray-900">{wishlistItems.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "orders"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  Siparişlerim ({totalOrders})
                </button>
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "wishlist"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  Favorilerim ({wishlistItems.length})
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "settings"
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  Ayarlar
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Sipariş Geçmişi</h3>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz sipariş yok</h3>
                      <p className="mt-1 text-sm text-gray-500">İlk siparişinizi vermek için alışverişe başlayın.</p>
                      <div className="mt-6">
                        <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                          Alışverişe Başla
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">Sipariş #{order.id}</h4>
                              <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString('tr-TR')}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                              <span className="text-lg font-bold text-gray-900">₺{order.total?.toLocaleString('tr-TR') || '0'}</span>
                            </div>
                          </div>
                          {order.items && order.items.length > 0 && (
                            <div className="space-y-3">
                              {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                  {item.image && (
                                    <Image
                                      src={item.image}
                                      alt={item.title || 'Ürün'}
                                      width={60}
                                      height={60}
                                      className="rounded-lg object-cover"
                                    />
                                  )}
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">{item.title || 'Ürün'}</h5>
                                    <p className="text-sm text-gray-500">Adet: {item.quantity || 1}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold text-gray-900">₺{item.price?.toLocaleString('tr-TR') || '0'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="mt-4 flex justify-end gap-2">
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                              Siparişi Tekrarla
                            </button>
                            {(order.status === "Hazırlanıyor" || order.status === "pending") && (
                              <button
                                onClick={() => handleCancelOrder(order.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Siparişi İptal Et
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === "wishlist" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Favori Ürünlerim</h3>
                    {wishlistItems.length > 0 && (
                      <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        Tümünü Temizle
                      </button>
                    )}
                  </div>
                  {wishlistItems.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz favori ürün yok</h3>
                      <p className="mt-1 text-sm text-gray-500">Beğendiğiniz ürünleri favorilere ekleyin.</p>
                      <div className="mt-6">
                        <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                          Ürünleri Keşfet
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlistItems.map((product) => (
                        <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                          <div className="relative h-48 bg-gray-100">
                            <Image
                              src={product.image}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                            <button
                              onClick={() => removeFromWishlist(product.id)}
                              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.title}</h4>
                            <p className="text-lg font-bold text-indigo-600 mb-3">₺{product.price?.toLocaleString('tr-TR') || '0'}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={(e) => handleAddToCart(e, product)}
                                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                              >
                                Sepete Ekle
                              </button>
                              <Link
                                href={`/products/${product.id}`}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                Detay
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Hesap Ayarları</h3>
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Kişisel Bilgiler</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                          <input
                            type="text"
                            defaultValue={getDisplayName(user)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                          <input
                            type="email"
                            defaultValue={toStringSafely(user?.email)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                          <input
                            type="tel"
                            defaultValue={toStringSafely(user?.phone)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                          <input
                            type="text"
                            defaultValue={toStringSafely(user?.address)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                          Bilgileri Güncelle
                        </button>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Güvenlik</h4>
                      <div className="space-y-4">
                        <button className="w-full md:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          Şifre Değiştir
                        </button>
                        <button className="w-full md:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                          İki Faktörlü Kimlik Doğrulama
                        </button>
                      </div>
                    </div>

                    <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                      <h4 className="text-md font-semibold text-red-900 mb-2">Tehlikeli Bölge</h4>
                      <p className="text-sm text-red-700 mb-4">Bu işlemler geri alınamaz.</p>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Hesabı Sil
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
