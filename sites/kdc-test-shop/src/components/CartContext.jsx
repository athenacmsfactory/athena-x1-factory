import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db, doc, getDoc, setDoc } from '../lib/firebase';

const CartContext = createContext();

export const CartProvider = ({ children, siteId = 'athena' }) => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { user } = useAuth();
  const storageKey = `athena_cart_${siteId}`;

  // 1. Load cart from localStorage on initial boot
  useEffect(() => {
    const savedCart = localStorage.getItem(storageKey);
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, [storageKey]);

  // 2. Handle User Login / Cart Syncing
  useEffect(() => {
    if (!user) return;

    const syncCartOnLogin = async () => {
      try {
        const cartRef = doc(db, "carts", user.uid);
        const cartSnap = await getDoc(cartRef);
        
        let mergedCart = [...cart];
        
        if (cartSnap.exists()) {
          const remoteCart = cartSnap.data().items || [];
          
          // Merge logic: items in remote that aren't in local, or update quantities
          remoteCart.forEach(remoteItem => {
            const localIndex = mergedCart.findIndex(item => item.id === remoteItem.id);
            if (localIndex > -1) {
              // Item exists in both: pick the one with more quantity or remote?
              // Let's just combine for now
              mergedCart[localIndex].quantity = Math.max(mergedCart[localIndex].quantity, remoteItem.quantity);
            } else {
              mergedCart.push(remoteItem);
            }
          });
        }
        
        setCart(mergedCart);
        // Immediately save merged cart to Firestore
        await setDoc(cartRef, { items: mergedCart, updatedAt: new Date() });
      } catch (error) {
        console.error("Error syncing cart with Firestore:", error);
      }
    };

    syncCartOnLogin();
  }, [user]); // Run when user logs in

  // 3. Clear cart on logout to prevent data leakage on shared computers
  useEffect(() => {
    // If we were logged in (user exists) and now we are not (no user), clear the state
    // Note: We use a ref or check if it's a transition to avoid clearing on initial guest load
    if (!user && localStorage.getItem(`athena_was_logged_in_${siteId}`)) {
      setCart([]);
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`athena_was_logged_in_${siteId}`);
      console.log("🔒 Cart cleared after logout for security");
    }
    
    if (user) {
      localStorage.setItem(`athena_was_logged_in_${siteId}`, 'true');
    }
  }, [user, siteId, storageKey]);

  // 4. Save cart to localStorage AND Firestore on change (DEBOUNCED)
  useEffect(() => {
    // Always save to localStorage immediately for UI responsiveness
    localStorage.setItem(storageKey, JSON.stringify(cart));

    if (!user) return;

    // Debounce Firestore writes to optimize "tokens" (Firebase operations)
    const timeoutId = setTimeout(async () => {
      try {
        const cartRef = doc(db, "carts", user.uid);
        await setDoc(cartRef, { items: cart, updatedAt: new Date() });
        console.log("🛒 Cart synced to Firestore (Debounced)");
      } catch (error) {
        console.error("Error saving cart to Firestore:", error);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [cart, user, storageKey]);

  const addToCart = useCallback((product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true); 
  }, []);

  const updateQuantity = useCallback((productId, delta) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const value = useMemo(() => ({
    cart,
    addToCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
    isCartOpen,
    setIsCartOpen
  }), [cart, addToCart, updateQuantity, clearCart, cartTotal, cartCount, isCartOpen]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};