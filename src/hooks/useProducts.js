import { useState, useEffect } from 'react';
import { nextApi } from '@/lib/api';

export const useProducts = () => {
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

  return { products, loading, error };
};
