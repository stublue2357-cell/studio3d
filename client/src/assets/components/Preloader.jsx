import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#010413] flex items-center justify-center overflow-hidden"
        >
          <div className="relative">
            {/* Pulsing Core */}
            <motion.div
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-indigo-500 blur-[60px] rounded-full"
            />
            
            {/* Logo Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 text-4xl font-black italic tracking-tighter uppercase text-white"
            >
              STUDIO<span className="text-indigo-400">3D</span>
            </motion.div>
            
            {/* Progress Bar */}
            <div className="absolute -bottom-8 left-0 w-full h-[1px] bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "linear" }}
                className="h-full bg-indigo-500"
              />
            </div>
            
            <div className="absolute -bottom-16 left-0 w-full text-center">
              <span className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-500 animate-pulse">
                Initializing Neural Node
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
