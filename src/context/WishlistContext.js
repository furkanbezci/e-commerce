"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { nextApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthAndLoadWishlist();
  }, [isLoggedIn]);

  const checkAuthAndLoadWishlist = async () => {
    try {
      const authResponse = await axios.get('/api/auth/me');
      if (authResponse.data.user) {
        setIsLoggedIn(true);
        try {
          const response = await nextApi.get('/api/wishlist');
          setWishlistItems(response.data.wishlist || []);
        } catch (wishlistError) {
          setWishlistItems([]);
        }
      } else {
        setIsLoggedIn(false);
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          setWishlistItems(JSON.parse(savedWishlist));
        }
      }
    } catch (error) {
      setIsLoggedIn(false);
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlistItems(JSON.parse(savedWishlist));
      }
    }
  };

  const addToWishlist = async (product) => {
    if (!isLoggedIn) {
      setWishlistItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        if (existingItem) {
          return prevItems;
        }
        const newItems = [...prevItems, product];
        localStorage.setItem('wishlist', JSON.stringify(newItems));
        return newItems;
      });
      return;
    }

    try {
      const response = await nextApi.post('/api/wishlist', { product });
      setWishlistItems(response.data.wishlist || []);
    } catch (error) {
      console.log('Wishlist API error:', error);
      setWishlistItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        if (existingItem) {
          return prevItems;
        }
        const newItems = [...prevItems, product];
        localStorage.setItem('wishlist', JSON.stringify(newItems));
        return newItems;
      });
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!isLoggedIn) {
      setWishlistItems(prevItems => {
        const newItems = prevItems.filter(item => item.id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(newItems));
        return newItems;
      });
      return;
    }

    try {
      const response = await nextApi.delete(`/api/wishlist?productId=${productId}`);
      setWishlistItems(response.data.wishlist || []);
    } catch (error) {
      console.log('Wishlist API error:', error);
      setWishlistItems(prevItems => {
        const newItems = prevItems.filter(item => item.id !== productId);
        localStorage.setItem('wishlist', JSON.stringify(newItems));
        return newItems;
      });
    }
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem('wishlist');
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  const toggleWishlist = async (product, router) => {
    checkAuthAndLoadWishlist()
    if (!isLoggedIn) {
      if (router) {
        router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
      } else {
        window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
      return;
    }

    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const toggleWishlistItem = async (product) => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product);
    }
  };

  const getTotalItems = () => {
    return wishlistItems.length;
  };

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    toggleWishlist,
    toggleWishlistItem,
    getTotalItems,
    isLoggedIn
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
