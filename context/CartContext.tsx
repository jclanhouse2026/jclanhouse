
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { CartItem } from '../types';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'totalPrice'>) => void;
  updateQuantity: (itemId: string, newQuantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
        const localData = localStorage.getItem('cartItems');
        return localData ? JSON.parse(localData) : [];
    } catch (error) {
        console.error("Could not parse cart items from localStorage", error);
        return [];
    }
  });

  useEffect(() => {
    try {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
        console.error("Could not save cart items to localStorage", error);
    }
  }, [cartItems]);

  const addToCart = (item: Omit<CartItem, 'id' | 'totalPrice'>) => {
    setCartItems(prevItems => {
      const newItem: CartItem = {
        ...item,
        id: Date.now().toString(), // Unique ID for each cart entry
        totalPrice: item.quantity * item.unitPrice
      };
      return [...prevItems, newItem];
    });
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    setCartItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        const updatedQuantity = Math.max(1, newQuantity);
        return {
          ...item,
          quantity: updatedQuantity,
          totalPrice: updatedQuantity * item.unitPrice
        };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
