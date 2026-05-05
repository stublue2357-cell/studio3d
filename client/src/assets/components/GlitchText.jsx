import React from 'react';
import { motion } from 'framer-motion';

const GlitchText = ({ text, className }) => {
  return (
    <div className={`relative inline-block ${className}`}>
      <motion.span
        initial={{ opacity: 1 }}
        className="relative z-10"
      >
        {text}
      </motion.span>
      
      {/* Glitch Layers */}
      <motion.span
        animate={{ 
          x: [0, -2, 2, 0],
          opacity: [0, 0.5, 0]
        }}
        transition={{ 
          duration: 0.2, 
          repeat: Infinity, 
          repeatDelay: Math.random() * 5 + 2 
        }}
        className="absolute inset-0 z-0 text-cyan-400 opacity-50"
      >
        {text}
      </motion.span>
      
      <motion.span
        animate={{ 
          x: [0, 2, -2, 0],
          opacity: [0, 0.5, 0]
        }}
        transition={{ 
          duration: 0.2, 
          repeat: Infinity, 
          repeatDelay: Math.random() * 5 + 2.1 
        }}
        className="absolute inset-0 z-0 text-indigo-500 opacity-50"
      >
        {text}
      </motion.span>
    </div>
  );
};

export default GlitchText;
