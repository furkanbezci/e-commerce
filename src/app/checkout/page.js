"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import axios from 'axios';

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    phone: '',
    paymentMethod: 'credit'
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.user) {
        setUser(response.data.user);
        setFormData(prev => ({
          ...prev,
          firstName: response.data.user.name?.firstName || response.data.user.name?.firstname || '',
          lastName: response.data.user.name?.lastName || response.data.user.name?.lastname || '',
          email: response.data.user.email || '',
          phone: response.data.user.phone || ''
        }));
      } else {
        router.push('/auth/login?redirect=' + encodeURIComponent('/checkout'));
        return;
      }
    } catch (error) {
      console.log('Auth check error:', error);
      router.push('/auth/login?redirect=' + encodeURIComponent('/checkout'));
      return;
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    if (!isCheckingAuth && cartItems.length === 0) {
      router.push('/cart');
    }
  }, [cartItems, router, isCheckingAuth]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        userId: user.id,
        items: cartItems,
        total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          phone: formData.phone
        },
        paymentMethod: formData.paymentMethod,
        status: 'Hazırlanıyor',
        date: new Date().toISOString()
      };

      const response = await axios.post('/api/orders', orderData);
      
      if (response.status === 200) {
        clearCart();
        router.push(`/orders/${response.data.orderId}?success=true`);
      } else {
        console.log('Order creation failed');
      }
    } catch (error) {
      console.log('Checkout error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sepetiniz boş</h2>
          <p className="text-gray-600 mb-6">Ödeme yapmak için önce sepetinize ürün ekleyin.</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
          >
            Alışverişe Başla
          </button>
        </div>
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = total > 500 ? 0 : 25;
  const finalTotal = total + shipping;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Ödeme</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Kişisel Bilgiler</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                          Ad
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                          Soyad
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        E-posta
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Teslimat Adresi</h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Adres
                        </label>
                        <textarea
                          id="address"
                          name="address"
                          rows={3}
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                            Şehir
                          </label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                          />
                        </div>
                        <div>
                          <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                            Posta Kodu
                          </label>
                          <input
                            type="text"
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-3 py-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Ödeme Yöntemi</h2>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          id="credit"
                          name="paymentMethod"
                          type="radio"
                          value="credit"
                          checked={formData.paymentMethod === 'credit'}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <label htmlFor="credit" className="ml-3 block text-sm font-medium text-gray-700">
                          Kredi Kartı
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="debit"
                          name="paymentMethod"
                          type="radio"
                          value="debit"
                          checked={formData.paymentMethod === 'debit'}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <label htmlFor="debit" className="ml-3 block text-sm font-medium text-gray-700">
                          Banka Kartı
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="cash"
                          name="paymentMethod"
                          type="radio"
                          value="cash"
                          checked={formData.paymentMethod === 'cash'}
                          onChange={handleInputChange}
                          className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                        />
                        <label htmlFor="cash" className="ml-3 block text-sm font-medium text-gray-700">
                          Kapıda Ödeme
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sipariş Veriliyor...' : 'Siparişi Tamamla'}
                  </button>
                </form>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Sipariş Özeti</h2>
                
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-500">Adet: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ₺{(item.price * item.quantity).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span className="text-gray-900">₺{total.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kargo</span>
                    <span className="text-gray-900">
                      {shipping === 0 ? 'Ücretsiz' : `₺${shipping}`}
                    </span>
                  </div>
                  {shipping > 0 && (
                    <div className="text-xs text-green-600">
                      ₺500 ve üzeri alışverişlerde kargo ücretsiz!
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-gray-900">Toplam</span>
                    <span className="text-gray-900">₺{finalTotal.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
