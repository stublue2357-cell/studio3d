import React, { createContext, useState, useContext } from 'react';

/**
 * CART CONTEXT (STATE MANAGEMENT LAYER)
 * -----------------------------------------
 * This file uses the React Context API to manage the Shopping Cart globally.
 * 
 * Why Context API?
 * In a large app, passing data through every component (Prop Drilling) is inefficient.
 * Context API allows any component (like AIStudio or Navbar) to access the cart
 * directly without intermediate components needing to know about it.
 */
const CartContext = createContext();

/**
 * useCart: CUSTOM HOOK
 * This is a helper hook to make using the context cleaner in other files.
 * Example of use: const { cartItems, addToCart } = useCart();
 */
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    // Error handling: Ensures the component is wrapped in <CartProvider>
    console.warn("useCart is used outside of CartProvider! Returning safe defaults.");
    return {
      cartItems: [],
      setCartItems: () => {},
      addToCart: () => {},
      removeFromCart: () => {},
      isCartOpen: false,
      setIsCartOpen: () => {}
    };
  }
  return context;
};

/**
 * CART PROVIDER
 * This component "provides" the state to its children.
 * It's used in App.jsx to wrap the entire application.
 */
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  /**
   * ADD TO CART (WITH DYNAMIC PRICING ENGINE)
   * -----------------------------------------
   * This is a core business logic function for the FYP.
   * It handles both standard products and custom AI/Manual designs.
   */
  const addToCart = (product, customDesign = null) => {
    
    // 👉 💡 DYNAMIC PRICING LOGIC:
    // This is often a great point for Viva discussion.
    // We adjust the final price based on the type of customization.
    let finalPrice = product.price;
    if (customDesign) {
      if (customDesign.type === 'AI') finalPrice += 5;     // AI synthesis fee
      if (customDesign.type === 'MANUAL') finalPrice += 3; // Manual design fee
    }

    setCartItems((prevItems) => {
      // 👉 IDENTIFICATION LOGIC:
      // We generate a unique 'itemKey' using the product ID and current Timestamp.
      // This allows a user to add the same base shirt with different designs.
      const itemKey = customDesign ? `${product._id}-${customDesign.type}-${Date.now()}` : product._id;
      
      return [...prevItems, { 
        ...product, 
        id: itemKey, 
        originalId: product._id, // Reference to the original product in DB
        price: finalPrice, 
        quantity: 1, 
        customDesign // Stores the Base64 image and type (AI/MANUAL)
      }];
    });
    
    // Automatically open the cart drawer when an item is added (UX optimization)
    setIsCartOpen(true);
  };

  /**
   * REMOVE FROM CART
   * Filters the state array to remove the specific item.
   */
  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter(item => item.id !== itemId));
  };

  return (
    // The .Provider makes these values available to all children components.
    <CartContext.Provider value={{ 
      cartItems, 
      setCartItems, 
      addToCart, 
      removeFromCart,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};