import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx'; 

const OrderSuccess = () => {
  const { setCartItems } = useCart() || {};
  const navigate = useNavigate();

  // 🛡️ SECURITY & CLEANUP LOGIC
  useEffect(() => {
    // 1. Cart khali karna
    if (setCartItems) {
      setCartItems([]);
    }

    // 2. BACK BUTTON REDIRECTION: 
    // Agar user browser ka back button dabaye toh wo checkout par na jaye
    window.history.pushState(null, null, window.location.pathname);
    const handlePopState = () => {
      // User ko dashboard par bhej do agar wo back jane ki koshish kare
      navigate('/dashboard', { replace: true });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setCartItems, navigate]);

  // Ek random futuristic order ID generate karne ke liye
  const orderId = `S3D-${Math.floor(1000 + Math.random() * 9000)}-XT`;

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center pt-32 pb-20 px-6">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-panel max-w-2xl w-full rounded-[3rem] p-10 md:p-16 border-white/5 text-center relative overflow-hidden bg-black/40 backdrop-blur-xl"
      >
        {/* Background Glowing Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        {/* Success Icon / Radar Ping */}
        <div className="relative mb-10 flex justify-center">
          <div className="w-24 h-24 rounded-full border border-emerald-500/30 flex items-center justify-center bg-emerald-500/10 relative">
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
              className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]"
            >
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <div className="absolute inset-0 rounded-full border border-emerald-500/50 animate-ping opacity-20" />
          </div>
        </div>

        {/* Main Text */}
        <span className="text-emerald-500 text-[10px] font-black tracking-[0.5em] uppercase mb-4 block">
          Transaction Verified
        </span>
        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic text-white mb-6 leading-none">
          Synthesis <span className="text-emerald-400">Initiated</span>
        </h2>
        
        <p className="text-slate-400 text-[11px] font-bold tracking-widest leading-relaxed max-w-md mx-auto mb-10 uppercase italic">
          Your neural design parameters have been successfully transmitted to our production laboratory for fulfillment.
        </p>

        {/* Order Details Terminal Box */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-10 inline-block text-left w-full max-w-sm mx-auto backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">Order Protocol</span>
            <span className="text-white text-[10px] font-bold tracking-widest">{orderId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">Status</span>
            <span className="text-emerald-400 text-[9px] font-bold tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(52,211,153,0.8)]" /> 
              Queued for Production
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          {/* 👉 Ye button ab live Dashboard (Vault) par jayega jahan order history hai */}
          <Link to="/dashboard" className="w-full md:w-auto px-10 py-5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] text-center">
            Track in Vault
          </Link>
          <Link to="/products" className="w-full md:w-auto px-10 py-5 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all bg-white/[0.03] text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white text-center">
            Explore Archive
          </Link>
        </div>

      </motion.div>
    </div>
  );
};

export default OrderSuccess;