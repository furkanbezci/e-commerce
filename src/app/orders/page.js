"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { nextApi } from '@/lib/api';
import Image from 'next/image';
import Layout from "@/components/Layout";
import Toast from "@/components/ui/Toast";
import SimplePopover from "@/components/ui/SimplePopover";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [simplePopover, setSimplePopover] = useState({ isOpen: false, orderId: null });
  const router = useRouter();

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ isVisible: false, message: '', type: 'success' });
  };

  const fetchOrders = async () => {
    try {
      const response = await nextApi.get('/api/orders');
      setOrders(response.data.orders || []);
    } catch (err) {
      console.log('Orders axios error:', err);
      if (err.response?.status === 401) {
        router.push('/auth/login?redirect=/orders');
        return;
      }
      setError('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [router]);

  const handleCancelOrder = (orderId) => {
    setSimplePopover({ isOpen: true, orderId });
  };

  const confirmCancelOrder = async () => {
    setSimplePopover({ isOpen: false, orderId: null });
    try {
      await nextApi.delete(`/api/orders/${simplePopover.orderId}`);
      
      await fetchOrders();
      
      showToast('Sipariş başarıyla iptal edildi!', 'success');
    } catch (error) {
      console.log('Cancel order error:', error);
      showToast('Sipariş iptal edilirken bir hata oluştu!', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'Hazırlanıyor': return 'bg-yellow-100 text-yellow-800';
      case 'Kargoda': return 'bg-blue-100 text-blue-800';
      case 'Teslim Edildi': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'processing': return 'Hazırlanıyor';
      case 'shipped': return 'Kargoya Verildi';
      case 'delivered': return 'Teslim Edildi';
      case 'cancelled': return 'İptal Edildi';
      case 'Hazırlanıyor': return 'Hazırlanıyor';
      case 'Kargoda': return 'Kargoda';
      case 'Teslim Edildi': return 'Teslim Edildi';
      default: return status || 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Siparişler yükleniyor...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Hata</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast 
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
      
      <SimplePopover
        isOpen={simplePopover.isOpen}
        onClose={() => setSimplePopover({ isOpen: false, orderId: null })}
        onConfirm={confirmCancelOrder}
        title="Siparişi İptal Et"
        message="Bu siparişi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Evet, İptal Et"
        cancelText="Hayır"
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Siparişlerim</h1>
            <p className="text-gray-600 mt-2">Tüm siparişlerinizi buradan takip edebilirsiniz.</p>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz siparişiniz yok</h3>
              <p className="text-gray-600 mb-6">İlk siparişinizi vermek için alışverişe başlayın.</p>
              <a 
                href="/products"
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
              >
                Alışverişe Başla
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Sipariş #{order.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          ₺{order.total?.toLocaleString('tr-TR') || '0'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Sipariş Edilen Ürünler</h4>
                    <div className="space-y-3">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 bg-white rounded-md flex-shrink-0 relative overflow-hidden">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.title || 'Ürün'}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-gray-900 truncate">
                                {item.title || 'Ürün'}
                              </h5>
                              <p className="text-xs text-gray-500">Adet: {item.quantity || 1}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">
                                ₺{((item.price || 0) * (item.quantity || 1)).toLocaleString('tr-TR')}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Ürün detayları bulunamadı</p>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Toplam Ürün:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Teslimat:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {order.shippingAddress?.city || 'Belirtilmemiş'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Ödeme:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {order.paymentMethod === 'credit' && 'Kredi Kartı'}
                          {order.paymentMethod === 'debit' && 'Banka Kartı'}
                          {order.paymentMethod === 'cash' && 'Kapıda Ödeme'}
                          {!order.paymentMethod && 'Belirtilmemiş'}
                        </span>
                      </div>
                    </div>
                  </div>
                        
                  <div className="px-6 py-4 bg-white border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a
                        href={`/orders/${order.id}`}
                        className="flex-1 bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Detayları Görüntüle
                      </a>
                      {(order.status === 'Hazırlanıyor' || order.status === 'pending') && (
                        <button 
                          onClick={() => handleCancelOrder(order.id)}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                        >
                          Siparişi İptal Et
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
