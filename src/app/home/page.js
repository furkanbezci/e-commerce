"use client";
import { useState, useEffect } from 'react';
import { nextApi } from '@/lib/api';
import Layout from '@/components/Layout';
import HomeClient from './_components/HomeClient';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <HomeClient products={products} />
    </Layout>
  );
}
