"use client";
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { nextApi } from '@/lib/api';
import Image from 'next/image';
import Layout from "@/components/Layout";
import Toast from "@/components/ui/Toast";
import SimplePopover from "@/components/ui/SimplePopover";
import Link from 'next/link';

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [confirmModal, setSimplePopover] = useState({ isOpen: false });
  const isSuccess = searchParams.get('success') === 'true';

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast({ isVisible: false, message: '', type: 'success' });
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await nextApi.get(`/api/orders/${params.id}`);
        setOrder(response.data.order);
      } catch (err) {
        console.log('Order axios error:', err);
        if (err.response?.status === 401) {
          setError('Bu siparişe erişim yetkiniz yok');
        } else {
          setError('Sipariş bulunamadı');
        }
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const handleCancelOrder = () => {
    setSimplePopover({ isOpen: true });
  };

  const confirmCancelOrder = async () => {
    setSimplePopover({ isOpen: false });
    try {
      await nextApi.delete(`/api/orders/${params.id}`);
      showToast('Sipariş başarıyla iptal edildi!', 'success');
      setTimeout(() => {
        router.push('/orders');
      }, 1500);
    } catch (error) {
      console.log('Cancel order error:', error);
      showToast('Sipariş iptal edilirken bir hata oluştu!', 'error');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Sipariş yükleniyor...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !order) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Sipariş Bulunamadı</h1>
            <p className="text-gray-600 mb-6">{error || 'Aradığınız sipariş bulunamadı.'}</p>
            <Link 
              href="/orders"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
            >
              Siparişlerime Git
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

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

  const totalItems = order.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;

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
        onClose={() => setSimplePopover({ isOpen: false })}
        onConfirm={confirmCancelOrder}
        title="Siparişi İptal Et"
        message="Bu siparişi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        confirmText="Evet, İptal Et"
        cancelText="Hayır"
        type="danger"
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {isSuccess && (
            <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-green-800">Siparişiniz Başarıyla Oluşturuldu!</h3>
                  <p className="mt-1 text-sm text-green-700">
                    Sipariş numaranız: <span className="font-semibold">#{order.id}</span> • 
                    Toplam: <span className="font-semibold">₺{order.total?.toLocaleString('tr-TR') || '0'}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sipariş #{order.id}</h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Sipariş Tarihi: {new Date(order.date).toLocaleDateString('tr-TR', {
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
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">{totalItems}</p>
                    <p className="text-sm text-gray-500">Toplam Ürün</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">₺{order.total?.toLocaleString('tr-TR') || '0'}</p>
                    <p className="text-sm text-gray-500">Toplam Tutar</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">₺{order.total > 500 ? '0' : '25'}</p>
                    <p className="text-sm text-gray-500">Kargo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{order.items?.length || 0}</p>
                    <p className="text-sm text-gray-500">Farklı Ürün</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Sipariş Edilen Ürünler</h2>
                </div>
                <div className="p-6">
                  {order.items && order.items.length > 0 ? (
                    <div className="space-y-6">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-20 h-20 bg-white rounded-lg flex-shrink-0 relative overflow-hidden shadow-sm">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.title || 'Ürün'}
                                fill
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-medium text-gray-900 mb-1">
                              {item.title || 'Ürün'}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">Adet: {item.quantity || 1}</p>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-600">
                                Birim Fiyat: ₺{(item.price || 0).toLocaleString('tr-TR')}
                              </span>
                              <span className="text-sm text-gray-600">•</span>
                              <span className="text-sm text-gray-600">
                                Toplam: ₺{((item.price || 0) * (item.quantity || 1)).toLocaleString('tr-TR')}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              ₺{((item.price || 0) * (item.quantity || 1)).toLocaleString('tr-TR')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">Sipariş detayları bulunamadı</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Teslimat Adresi
                </h3>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{order.shippingAddress?.address}</p>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress?.city} {order.shippingAddress?.zipCode}
                  </p>
                  <p className="text-sm text-gray-600">{order.shippingAddress?.phone}</p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Ödeme Bilgileri
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ödeme Yöntemi:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.paymentMethod === 'credit' && 'Kredi Kartı'}
                      {order.paymentMethod === 'debit' && 'Banka Kartı'}
                      {order.paymentMethod === 'cash' && 'Kapıda Ödeme'}
                      {!order.paymentMethod && 'Belirtilmemiş'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Ara Toplam:</span>
                    <span className="text-sm font-medium text-gray-900">₺{order.total?.toLocaleString('tr-TR') || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Kargo:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {order.total > 500 ? 'Ücretsiz' : '₺25'}
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-base font-semibold text-gray-900">Toplam:</span>
                    <span className="text-base font-semibold text-gray-900">
                      ₺{(order.total + (order.total > 500 ? 0 : 25)).toLocaleString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
                    
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">İşlemler</h3>
                <div className="space-y-3">
                  <Link
                    href="/orders"
                    className="w-full bg-indigo-600 text-white text-center py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors block"
                  >
                    Tüm Siparişlerim
                  </Link>
                  <Link
                    href="/products"
                    className="w-full bg-white text-indigo-600 text-center py-2 px-4 rounded-md border border-indigo-600 hover:bg-indigo-50 transition-colors block"
                  >
                    Alışverişe Devam Et
                  </Link>
                  {(order.status === 'Hazırlanıyor' || order.status === 'pending') && (
                    <button 
                      onClick={handleCancelOrder}
                      className="w-full bg-red-600 text-white text-center py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                    >
                      Siparişi İptal Et
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
