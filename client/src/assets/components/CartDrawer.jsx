import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx'; // Path zaroor check karein

const CartDrawer = () => {
  // 1. SAFE DESTRUCTURING: Agar context khali ho, toh default values set ho jayengi
  const cartContext = useCart() || {};
  const cartItems = cartContext.cartItems || [];
  const isCartOpen = cartContext.isCartOpen || false;
  const setIsCartOpen = cartContext.setIsCartOpen || function() {};
  const removeFromCart = cartContext.removeFromCart || function() {};

  // 2. SAFE REDUCE: Optional chaining (?.) use ki hai taake crash na ho
  const total = cartItems?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay (Piche ka black shade) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[#010413] border-l border-white/10 z-[101] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h2 className="text-xl font-black italic uppercase tracking-widest text-white">
                Vault <span className="text-indigo-400">Items</span>
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Cart Items Loop */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {cartItems.length === 0 ? (
                <div className="text-center flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                  <svg className="w-12 h-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002 2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Your vault is empty</span>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div key={index} className="flex gap-4 items-center bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                    <div className="w-16 h-16 rounded-xl bg-black border border-white/10 overflow-hidden flex items-center justify-center">
                      <img 
                        src={item.customDesign?.data?.overlayImage || item.customDesign?.data?.aiImage || item.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&auto=format&fit=crop'} 
                        alt={item.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-1">{item.name}</h3>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className="text-[11px] font-black text-indigo-400 tracking-widest">${item.price * item.quantity}.00</span>
                      <button onClick={() => removeFromCart(item.id)} className="text-[8px] uppercase tracking-widest text-rose-500 hover:text-rose-400 font-bold transition-colors">
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer / Checkout Button */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total Synthesis</span>
                  <span className="text-xl font-black text-white tracking-widest">${total}.00</span>
                </div>
                <Link 
                  to="/checkout" 
                  onClick={() => setIsCartOpen(false)} 
                  className="block w-full text-center py-5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all text-white"
                >
                  Initialize Checkout
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;