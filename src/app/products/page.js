"use client";
import { useState, useEffect } from 'react';
import { nextApi } from '@/lib/api';
import Layout from '@/components/Layout';
import ProductListLayout from './_components/ProductListLayout';
import ProductFilterPanel from './_components/ProductFilterPanel';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: ''
  });

  useEffect(() => {
    const axiosProducts = async () => {
      try {
        setLoading(true);
        const response = await nextApi.get('/api/products');
        setProducts(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    axiosProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.minPrice && product.price < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && product.price > parseFloat(filters.maxPrice)) return false;
    if (filters.search && !product.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const categories = [...new Set(products.map(product => product.category))];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ürünler yükleniyor...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600">Hata: {error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ürünler</h1>
          <p className="mt-2 text-gray-600">
            {filteredProducts.length} ürün bulundu
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <ProductFilterPanel
              categories={categories}
              filters={filters}
              onFilterChange={(key, value) => setFilters(prev => ({ ...prev, [key]: value }))}
              onClearFilters={() => setFilters({ category: "", minPrice: "", maxPrice: "", search: "" })}
            />
          </div>
          
          <div className="lg:col-span-3">
            <ProductListLayout products={filteredProducts} />
          </div>
        </div>
      </div>
    </Layout>
  );
}
