"use client";
import { useState, useEffect,use } from 'react';
import { nextApi } from '@/lib/api';
import Layout from '@/components/Layout';
import ProductDetailClient from './_components/ProductDetailClient';

export default function ProductDetailPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = use(params);

  useEffect(() => {
    const axiosProduct = async () => {
      try {
        setLoading(true);
        const response = await nextApi.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      axiosProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Ürün yükleniyor...</p>
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

  if (!product) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">Ürün bulunamadı</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProductDetailClient product={product} />
    </Layout>
  );
}
