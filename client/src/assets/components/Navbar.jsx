import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx'; 

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Auth state check
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const isLoggedIn = !!token;

  const { cartItems, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-[100] transition-all duration-500 ${
        isScrolled ? 'py-4 bg-black/60 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'py-8 bg-transparent'
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-8 flex justify-between items-center">
        
        {/* --- LOGO --- */}
        <Link to="/" className="text-2xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
          STUDIO<span className="text-indigo-400">3D</span>
        </Link>

        {/* --- MAIN LINKS --- */}
        <div className="hidden md:flex gap-10 lg:gap-12 text-[10px] font-black uppercase tracking-[0.3em]">
          <Link to="/" className={`${location.pathname === '/' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'} transition-all`}>Index</Link>
          <Link to="/products" className={`${location.pathname === '/products' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'} transition-all`}>Archive</Link>
          <Link to="/about" className={`${location.pathname === '/about' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'} transition-all`}>Protocol</Link>
          <Link to="/contact" className={`${location.pathname === '/contact' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'} transition-all`}>Signal</Link>
          <Link to="/studio" className={`${location.pathname === '/studio' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'} transition-all flex items-center gap-2`}>
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" /> AI Designer
          </Link>
        </div>

        {/* --- RIGHT ACTIONS --- */}
        <div className="flex items-center gap-6 md:gap-8">
          
          {isLoggedIn ? (
            <div className="flex items-center gap-6">
              {/* Dashboard Link based on Role */}
              <Link 
                to={
                  role === 'developer' ? "/developer/dashboard" :
                  role === 'owner' ? "/owner/dashboard" :
                  role === 'sub-owner' ? "/sub-owner/dashboard" :
                  role === 'admin' ? "/admin/dashboard" : "/dashboard"
                } 
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-all flex items-center gap-2"
              >
                <span className="hidden md:inline">
                  {role === 'user' ? 'My Node' : `${role.replace('-', ' ').toUpperCase()} Panel`}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </Link>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="px-5 py-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[8px] font-black uppercase tracking-widest rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/5"
              >
                Terminate
              </button>
            </div>
          ) : (
            <Link to="/login" className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all text-white">
              Initialize Access
            </Link>
          )}

          {/* Vault Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:text-indigo-400 transition-colors text-white"
          >
            Vault <span className="text-indigo-400">({cartItems?.length || 0})</span>
          </button>
        </div>

      </div>
    </motion.nav>
  );
};

// --- YEH LINE SAB SE ZAROORI HAI ---
export default Navbar;