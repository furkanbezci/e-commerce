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
    const loggedIn = !!authResponse.data.user;
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      const response = await nextApi.get('/api/wishlist');
      const apiWishlist = response.data.wishlist || [];

      const pending = localStorage.getItem("pendingWishlistProduct");
      if (pending) {
        try {
          const pendingProduct = JSON.parse(pending);
          const isPendingProductAlreadyInApi = apiWishlist.some(item => item.id === pendingProduct.id);
          
          if (!isPendingProductAlreadyInApi) {
            await nextApi.post('/api/wishlist', { product: pendingProduct });
          }
          localStorage.removeItem("pendingWishlistProduct");
        } catch (err) {
          console.error("Bekleyen ürün parse hatası:", err);
          localStorage.removeItem("pendingWishlistProduct");
        }
      }
      
      const updatedResponse = await nextApi.get('/api/wishlist');
      setWishlistItems(updatedResponse.data.wishlist || []);

    } else {
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist));
      else setWishlistItems([]);
    }
    return loggedIn;
  } catch (error) {
    console.error("Auth veya favori listesi yükleme hatası:", error);
    setIsLoggedIn(false);
    localStorage.removeItem("pendingWishlistProduct");
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) setWishlistItems(JSON.parse(savedWishlist));
    else setWishlistItems([]);
    return false;
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

  const clearWishList = () => {
    setWishlistItems([]);
    localStorage.removeItem('wishlist');
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

const toggleWishlist = async (product, router) => {
  const loggedIn = await checkAuthAndLoadWishlist(); 

  if (!loggedIn) {
    localStorage.setItem("pendingWishlistProduct", JSON.stringify(product));
    router.push('/auth/login?redirect=' + encodeURIComponent(window.location.pathname));
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
const getIsLoggedIn = async () => {
    try {
        const authResponse = await axios.get('/api/auth/me');
        return !!authResponse.data.user;
    } catch {
        return false;
    }
};
  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    clearWishList,
    isInWishlist,
    toggleWishlist,
    toggleWishlistItem,
    getTotalItems,
    isLoggedIn,
    getIsLoggedIn
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
