"use client";
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductListLayout from './ProductListLayout';
import ProductFilterPanel from './ProductFilterPanel';
import { useProducts } from '@/hooks/useProducts';

export default function ProductsClient({ initialProducts }) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    rating: ''
  });

  const { products, loading, error, reaxios } = useProducts(initialProducts);

  useEffect(() => {
    const category = searchParams.get('category') || '';
    const search = searchParams.get('search') || '';
    
    setFilters(prev => ({
      ...prev,
      category,
      search
    }));
  }, [searchParams]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (filters.category && !product.category.toLowerCase().includes(filters.category.toLowerCase())) {
        return false;
      }

      if (filters.minPrice && product.price < parseFloat(filters.minPrice)) {
        return false;
      }
      if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) {
        return false;
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        if (!product.title.toLowerCase().includes(searchTerm) && 
            !product.description.toLowerCase().includes(searchTerm)) {
          return false;
        }
      }

      if (filters.rating && product.rating.rate < parseFloat(filters.rating)) {
        return false;
      }

      return true;
    });
  }, [products, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      minPrice: '',
      maxPrice: '',
      search: '',
      rating: ''
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ürünler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={reaxios}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Ürünlerimiz
            {filters.category && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                - {filters.category}
              </span>
            )}
          </h1>
          <p className="text-gray-600">
            {filteredProducts.length} ürün bulundu
          </p>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64">
            <ProductFilterPanel 
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </aside>

          <main className="flex-1">
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="lg:hidden mb-6">
              <div className="flex gap-2 flex-wrap">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Tüm Kategoriler</option>
                  <option value="electronics">Elektronik</option>
                  <option value="men's clothing">Erkek Giyim</option>
                  <option value="women's clothing">Kadın Giyim</option>
                  <option value="jewelery">Mücevher</option>
                </select>
                
                <input
                  type="number"
                  placeholder="Min Fiyat"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-24"
                />
                
                <input
                  type="number"
                  placeholder="Max Fiyat"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-24"
                />
                
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                >
                  Temizle
                </button>
              </div>
            </div>
            
            {filteredProducts.length > 0 ? (
              <ProductListLayout products={filteredProducts} />
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ürün bulunamadı
                </h3>
                <p className="text-gray-600 mb-4">
                  Arama kriterlerinize uygun ürün bulunamadı.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
