import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext.jsx'; 

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Logout Function
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const navLinks = [
    { name: 'Index', path: '/' },
    { name: 'Vault', path: '/products' },
    { name: 'Protocol', path: '/about' },
    { name: 'Signal', path: '/contact' },
    { name: 'AI Designer', path: '/studio', isAI: true },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed w-full z-[100] transition-all duration-500 ${
          isScrolled || isMobileMenuOpen ? 'py-4 bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'py-8 bg-transparent'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 flex justify-between items-center">
          
          {/* --- LOGO --- */}
          <Link to="/" className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] z-[110]">
            STUDIO<span className="text-indigo-400">3D</span>
          </Link>

          {/* --- DESKTOP LINKS --- */}
          <div className="hidden lg:flex gap-10 lg:gap-12 text-[10px] font-black uppercase tracking-[0.3em]">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`${location.pathname === link.path ? 'text-indigo-400' : 'text-slate-400 hover:text-white'} transition-all flex items-center gap-2`}
              >
                {link.isAI && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />}
                {link.name}
              </Link>
            ))}
          </div>

          {/* --- RIGHT ACTIONS --- */}
          <div className="flex items-center gap-4 md:gap-8">
            
            <div className="hidden sm:flex items-center gap-6">
              {isLoggedIn ? (
                <>
                  <Link 
                    to={
                      role === 'developer' ? "/developer/dashboard" :
                      role === 'owner' ? "/owner/dashboard" :
                      role === 'sub-owner' ? "/sub-owner/dashboard" :
                      role === 'admin' ? "/admin/dashboard" : "/dashboard"
                    } 
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-all flex items-center gap-2"
                  >
                    <span className="hidden xl:inline">
                      {role === 'user' ? 'My Node' : `${role.replace('-', ' ').toUpperCase()} Panel`}
                    </span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </Link>

                  <button 
                    onClick={handleLogout}
                    className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[8px] font-black uppercase tracking-widest rounded-full hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Terminate
                  </button>
                </>
              ) : (
                <Link to="/login" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all text-white">
                  Initialize Access
                </Link>
              )}
            </div>

            {/* Vault Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:text-indigo-400 transition-colors text-white"
            >
              Vault <span className="text-indigo-400">({cartItems?.length || 0})</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 z-[110]"
            >
              <motion.span 
                animate={{ rotate: isMobileMenuOpen ? 45 : 0, y: isMobileMenuOpen ? 7 : 0 }}
                className="w-6 h-0.5 bg-white block rounded-full" 
              />
              <motion.span 
                animate={{ opacity: isMobileMenuOpen ? 0 : 1 }}
                className="w-6 h-0.5 bg-white block rounded-full" 
              />
              <motion.span 
                animate={{ rotate: isMobileMenuOpen ? -45 : 0, y: isMobileMenuOpen ? -7 : 0 }}
                className="w-6 h-0.5 bg-white block rounded-full" 
              />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* --- MOBILE OVERLAY MENU --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[95] bg-[#010413] pt-32 px-10 flex flex-col"
          >
            <div className="flex flex-col gap-8">
              <span className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.5em] mb-4">Neural Navigation</span>
              {navLinks.map((link, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={link.path}
                >
                  <Link 
                    to={link.path}
                    className={`text-4xl md:text-5xl font-black italic tracking-tighter uppercase ${
                      location.pathname === link.path ? 'text-white' : 'text-white/20'
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto pb-20 flex flex-col gap-6">
              <div className="h-px bg-white/5 w-full" />
              {!isLoggedIn ? (
                <Link to="/login" className="text-xl font-bold uppercase tracking-widest text-indigo-400">Initialize Access</Link>
              ) : (
                <div className="flex flex-col gap-6">
                  <Link 
                    to={role === 'user' ? "/dashboard" : `/${role.replace('-', '')}/dashboard`}
                    className="text-xl font-bold uppercase tracking-widest text-indigo-400"
                  >
                    Control Panel
                  </Link>
                  <button onClick={handleLogout} className="text-left text-xl font-bold uppercase tracking-widest text-rose-500">Terminate Protocol</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- YEH LINE SAB SE ZAROORI HAI ---
export default Navbar;