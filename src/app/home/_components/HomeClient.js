"use client";
import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function HomeClient({ products }) {
  const [activeTab] = useState("bestsellers");
  const [slideIndex, setSlideIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState({});
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, addToWishlist, isLoggedIn,getIsLoggedIn } = useWishlist();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      const pending = localStorage.getItem("pendingWishlistProduct");
      if (pending) {
        try {
          const product = JSON.parse(pending);
          addToWishlist(product);
        } catch (err) {
          console.error("Pending wishlist parse error:", err);
        } finally {
          localStorage.removeItem("pendingWishlistProduct");
        }
      }
    }
  }, [isLoggedIn, addToWishlist]);

  const categorizedProducts = useMemo(() => {
    const bestsellers = products.slice(0, 8);
    const featured = products.slice(8, 16);
    const discounted = products.slice(16, 24);

    return {
      bestsellers: bestsellers.map(product => ({
        ...product,
        originalPrice: product.price * 1.2,
        badge: "En Çok Satan"
      })),
      featured: featured.map(product => ({
        ...product,
        originalPrice: product.price * 1.15,
        badge: "Öne Çıkan"
      })),
      discounted: discounted.map(product => ({
        ...product,
        originalPrice: product.price * 1.3,
        discount: 30,
        badge: "%30 İndirim"
      }))
    };
  }, [products]);

  const currentProducts = categorizedProducts[activeTab] || [];
  const itemsPerSlide = 4;
  const slides = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < currentProducts.length; i += itemsPerSlide) {
      chunks.push(currentProducts.slice(i, i + itemsPerSlide));
    }
    return chunks;
  }, [currentProducts]);

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    
    try {
      addToCart(product);
    } catch (error) {
      console.log('Sepete ekleme hatası:', error);
    } finally {
      setTimeout(() => {
        setAddingToCart(prev => ({ ...prev, [product.id]: false }));
      }, 1000);
    }
  };

 const handleToggleWishlist = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const loggedIn = await getIsLoggedIn();

    if (!loggedIn) {
      localStorage.setItem("pendingWishlistProduct", JSON.stringify(product));
      router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    toggleWishlist(product, router);
  };

  return (
    <>
      <section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              Yeni Sezon Fırsatları
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              {`En sevilen markalarda %50'ye varan indirimler`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products" className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Alışverişe Başla
              </Link>
              <Link href="/products?type=discounted" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-indigo-600 transition-colors">
                Kampanyaları Gör
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/products?type=discounted" className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-red-800">Flash Ürünler</h3>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">%70 İndirim</span>
              </div>
              <p className="text-red-700 mb-4">Saatlerce süren süper indirimler</p>
              <div className="flex items-center text-red-600 font-semibold">
                <span className="text-sm">Son 2 saat!</span>
                <span className="ml-2">→</span>
              </div>
            </Link>

            <Link href="/products" className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-green-800">Ücretsiz Kargo</h3>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">500₺+</span>
              </div>
              <p className="text-green-700 mb-4">500₺ ve üzeri alışverişlerde</p>
              <div className="flex items-center text-green-600 font-semibold">
                <span className="text-sm">Hemen faydalan!</span>
                <span className="ml-2">→</span>
              </div>
            </Link>

            <Link href="/products?type=featured" className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-blue-800">Yeni Ürünler</h3>
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">2025</span>
              </div>
              <p className="text-blue-700 mb-4">En yeni teknoloji ürünleri</p>
              <div className="flex items-center text-blue-600 font-semibold">
                <span className="text-sm">Keşfet!</span>
                <span className="ml-2">→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/products?type=bestsellers" className="group rounded-2xl border border-gray-200 bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-lg transition-shadow p-6 sm:p-8 flex flex-col">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">En Çok Satılanlar</h2>
              <p className="mt-2 text-gray-600">Kullanıcıların en çok tercih ettikleri</p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-amber-700 font-semibold">Hemen incele</span>
              <span className="text-amber-700 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link href="/products?type=featured" className="group rounded-2xl border border-gray-200 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-lg transition-shadow p-6 sm:p-8 flex flex-col">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Öne Çıkanlar</h2>
              <p className="mt-2 text-gray-600">Editörün seçtikleri, trend ürünler</p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-indigo-700 font-semibold">Hemen incele</span>
              <span className="text-indigo-700 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>

          <Link href="/products?type=discounted" className="group rounded-2xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-lg transition-shadow p-6 sm:p-8 flex flex-col">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">İndirimli Ürünler</h2>
              <p className="mt-2 text-gray-600">Fırsatları kaçırma, sınırlı süre</p>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-emerald-700 font-semibold">Hemen incele</span>
              <span className="text-emerald-700 group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </Link>
        </div>

        <section className="mt-10">
          <div className="relative bg-white rounded-2xl border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Popüler Ürünler</h2>
              <Link 
                href="/products" 
                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
              >
                Tüm Ürünleri Gör
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500"
                style={{ width: `${slides.length * 100}%`, transform: `translateX(-${slideIndex * (100 / slides.length)}%)` }}
              >
                {slides.map((group, idx) => (
                  <div key={idx} className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full" style={{ width: `${100 / slides.length}%` }}>
                    {group.map((product) => (
                      <div key={product.id} className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                        <Link href={`/products/${product.id}`} className="block">
                          <div className="relative h-48 w-full overflow-hidden bg-gray-50">
                            <Image
                              src={product.image}
                              alt={product.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </Link>
                        
                        <button 
                          onClick={(e) => handleToggleWishlist(e, product)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors z-10"
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={isInWishlist(product.id) ? "text-red-500 fill-current" : "text-black"}
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                          </svg>
                        </button>
                        
                        <div className="p-4">
                          <Link href={`/products/${product.id}`}>
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[40px] mb-2 hover:text-indigo-600 transition-colors">
                              {product.title}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center gap-1 mb-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-3 h-3 ${i < Math.floor(product.rating.rate) ? 'text-yellow-400' : 'text-gray-300'}`}
                                  fill="none"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">({product.rating.count})</span>
                          </div>

                          <div className="flex items-center gap-2 mb-3">
                            <p className="text-indigo-600 font-bold text-lg">${product.price}</p>
                            {product.originalPrice && (
                              <p className="text-gray-400 text-sm line-through">${product.originalPrice}</p>
                            )}
                          </div>

                          <button 
                            onClick={(e) => handleAddToCart(e, product)}
                            disabled={addingToCart[product.id]}
                            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {addingToCart[product.id] ? (
                              <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="none" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Ekleniyor...
                              </>
                            ) : (
                              'Sepete Ekle'
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => setSlideIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${
                    slideIndex === i ? "bg-indigo-600 w-6" : "bg-gray-300 w-2.5 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Müşterilerimiz Ne Diyor?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                  A
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Ahmet Y.</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">{`"Çok hızlı kargo ve kaliteli ürünler. Kesinlikle tavsiye ederim!"`}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center font-bold text-pink-600">
                  E
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Elif K.</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">{`"Fiyatlar çok uygun ve müşteri hizmetleri harika. Teşekkürler!"`}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">
                  M
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold text-gray-900">Mehmet S.</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4" fill="none" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">{`"Güvenilir bir site. Alışveriş yapmaya devam edeceğim."`}</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}