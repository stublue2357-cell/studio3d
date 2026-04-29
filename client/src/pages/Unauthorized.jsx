import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Unauthorized = () => {
  // Check kraine ke user login hai ya nahi
  const isLoggedIn = localStorage.getItem('token');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010413] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent pointer-events-none" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-2xl relative z-10"
      >
        <div className="inline-block p-4 rounded-full bg-rose-500/10 border border-rose-500/20 mb-8">
          <span className="text-rose-500 text-6xl font-black drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]">!</span>
        </div>
        
        <h2 className="text-6xl font-black uppercase italic text-white tracking-tighter mb-4">
          Access <span className="text-rose-500">Restricted</span>
        </h2>
        
        <p className="text-slate-500 text-sm uppercase tracking-[0.4em] font-bold mb-12 leading-relaxed">
          Protocol Error: Your current identity cipher does not have the clearance levels required for this node.
        </p>

        <div className="flex flex-col md:flex-row gap-6 justify-center">
          {/* Smart Button Logic */}
          <Link 
            to={isLoggedIn ? "/dashboard" : "/login"} 
            className="px-10 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.5em] hover:bg-rose-500 hover:text-white transition-all shadow-2xl"
          >
            {isLoggedIn ? "Return to Node" : "Authorize Identity"}
          </Link>

          {isLoggedIn && (
            <Link to="/login" className="px-10 py-5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.5em] hover:bg-white/5 transition-all">
              Switch Identity
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Unauthorized;