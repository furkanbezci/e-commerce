"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useClickOutside } from '@/hooks/useClickOutside';
import axios from 'axios';
import { useRouter } from "next/navigation";


export function Header() {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { getTotalItems, clearCart, refreshCart } = useCart();
  const { getTotalItems: getWishlistItems, clearWishList } = useWishlist();
  const router = useRouter();
  const userMenuRef = useClickOutside(() => setShowUserMenu(false));

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.user) {
        setUser(response.data.user);
        refreshCart();
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout/api');
      router.push('/');
      clearCart();
      clearWishList();
      setUser(null);
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


  const categories = [
    {
      name: "Elektronik",
      slug: "electronics",
      subcategories: [
        "Telefon & Aksesuar",
        "Bilgisayar & Tablet",
        "TV & Ses Sistemleri",
        "Kamera & Fotoğraf",
        "Gaming",
        "Küçük Ev Aletleri"
      ]
    },
    {
      name: "Erkek Giyim",
      slug: "men's clothing",
      subcategories: [
        "T-Shirt & Gömlek",
        "Pantolon & Jean",
        "Ceket & Mont",
        "Ayakkabı",
        "Aksesuar",
        "İç Giyim"
      ]
    },
    {
      name: "Kadın Giyim",
      slug: "women's clothing",
      subcategories: [
        "Elbise & Tunik",
        "Pantolon & Jean",
        "Üst Giyim",
        "Ayakkabı & Çanta",
        "Aksesuar",
        "İç Giyim"
      ]
    },
    {
      name: "Mücevher",
      slug: "jewelery",
      subcategories: [
        "Yüzük",
        "Kolye",
        "Küpe",
        "Bilezik",
        "Saat",
        "Setler"
      ]
    }
  ];

  return (
    <>
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Link href="/home" className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Fırsatix
            </Link>

            <div className="flex-1 hidden md:flex">
              <div className="w-full relative">
                <input
                  type="text"
                  placeholder="Ürün, kategori veya marka ara"
                  className="w-full rounded-full border border-gray-300 px-5 py-2.5 pr-12 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700">
                  Ara
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {isLoading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-sm sm:text-base text-gray-700 hover:text-indigo-600 font-medium"
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-indigo-600">
                        {getInitial(user?.name)}
                      </span>
                    </div>
                    <span className="hidden sm:block">{getDisplayName(user)}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profilim
                      </Link>
                      <Link
                        href="/orders"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        Siparişlerim
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        Favorilerim
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Çıkış Yap
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="flex items-center gap-2 text-sm sm:text-base text-gray-700 hover:text-indigo-600 font-medium">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Giriş Yap
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Link href="/wishlist" className="flex items-center gap-2 text-sm sm:text-base text-gray-700 hover:text-indigo-600 font-medium relative">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="hidden sm:block">Favorilerim</span>
                {getWishlistItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getWishlistItems()}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="flex items-center gap-2 text-sm sm:text-base text-gray-700 hover:text-indigo-600 font-medium relative">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span className="hidden sm:block">Sepetim</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </Link>
            </div>
          </div>

          <div className="md:hidden pb-4">
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Ürün, kategori veya marka ara"
                className="w-full rounded-full border border-gray-300 px-5 py-2.5 pr-12 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1.5 rounded-full hover:bg-indigo-700">
                Ara
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-gray-200 bg-white/70 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 overflow-x-auto py-3">
            <Link 
              href="/products" 
              className="shrink-0 rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:border-indigo-400 hover:text-indigo-600 flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
              Tüm Kategoriler
            </Link>
            
            {categories.map((category) => (
              <div
                key={category.slug}
                className="relative"
                onMouseEnter={() => setHoveredCategory(category.slug)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  href={`/products?category=${category.slug}`}
                  className="shrink-0 rounded-full border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:border-indigo-400 hover:text-indigo-600 block"
                >
                  {category.name}
                </Link>

              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}