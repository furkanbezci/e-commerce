"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { nextApi } from '@/lib/api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart hook CartProvider içinde kullanılmalıdır');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loadCart = async () => {
    try {
      const response = await nextApi.get('/api/cart');
      
      setCartItems(response.data.cart || []);
      setIsLoggedIn(true);
    } catch (error) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      }
      setIsLoggedIn(false);
    }
  };
  const refreshCart = () => {
    loadCart();
  };

  useEffect(() => {
    loadCart();
  }, []);

  const addToCart = async (product) => {
    try {
      const response = await nextApi.post('/api/cart', {
        product: {
          id: product.id,
          title: product.title,
          price: product.price,
          image: product.image
        },
        quantity: 1
      });


      setCartItems(response.data.cart || []);
      setIsLoggedIn(true);
    } catch (error) {
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        
        if (existingItem) {
          const newItems = prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          localStorage.setItem('cart', JSON.stringify(newItems));
          return newItems;
        } else {
          const newItems = [...prevItems, { ...product, quantity: 1 }];
          localStorage.setItem('cart', JSON.stringify(newItems));
          return newItems;
        }
      });
      setIsLoggedIn(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await nextApi.delete(`/api/cart?productId=${productId}`);


      setCartItems(response.data.cart || []);
      setIsLoggedIn(true);
    } catch (error) {
      setCartItems(prevItems => {
        const newItems = prevItems.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(newItems));
        return newItems;
      });
      setIsLoggedIn(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    
    try {
      const response = await nextApi.put('/api/cart', { productId, quantity });
      setCartItems(response.data.cart || []);
      setIsLoggedIn(true);
    } catch (error) {
      setCartItems(prevItems => {
        const newItems = prevItems.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        );
        localStorage.setItem('cart', JSON.stringify(newItems));
        return newItems;
      });
      setIsLoggedIn(false);
    }
  };

  const clearCart = async () => {
    try {
      if (isLoggedIn) {
        await nextApi.delete('/api/cart');
      }
    } catch (error) {
      console.log('🛒 CartContext: DB temizleme hatası:', error);
    }
    
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isInCart,
    isLoggedIn,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
