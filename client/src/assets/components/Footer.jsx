import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const isStudio = location.pathname === '/studio';

  return (
    <footer className={`w-full border-t border-white/5 bg-black/60 backdrop-blur-2xl pt-16 pb-10 pr-6 md:pr-10 overflow-hidden relative transition-all ${
      isStudio ? 'pl-[104px] md:pl-[120px]' : 'pl-6 md:pl-10'
    }`}>
      
      {/* Decorative Ghost Text */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-[0.015] text-[10vw] font-black italic pointer-events-none whitespace-nowrap overflow-hidden">
        NEURAL SYNTHESIS 2026
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start gap-16">
        
        {/* Brand Section */}
        <div className="space-y-6 md:w-1/3">
          <Link to="/" className="text-3xl font-black italic tracking-tighter text-white uppercase drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            Studio<span className="text-indigo-400">3D</span>
          </Link>
          <p className="max-w-sm text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
            The world's first AI-driven apparel laboratory. We merge generative neural networks with high-performance fabrics.
          </p>
          
          {/* Newsletter */}
          <div className="pt-4">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3 block">Join the Network</span>
            <div className="flex max-w-sm">
              <input 
                type="email" 
                placeholder="USER@ACCESS.AI" 
                className="flex-1 bg-white/[0.03] border border-white/10 px-5 py-3 rounded-l-xl outline-none focus:border-indigo-400 text-[10px] font-bold tracking-widest text-white transition-all placeholder:text-slate-600"
              />
              <button className="bg-white text-black px-6 py-3 rounded-r-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all">
                Link
              </button>
            </div>
          </div>
        </div>

        {/* Links & Status Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:w-2/3">
          
          <div className="space-y-5">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Navigation</h5>
            <div className="flex flex-col gap-4 text-[9px] font-bold uppercase text-slate-500 tracking-widest">
              {/* Footer Links linked to our App Routes */}
              <Link to="/" className="hover:text-indigo-400 transition-colors">Index</Link>
              <Link to="/products" className="hover:text-indigo-400 transition-colors">Archive</Link>
              <Link to="/about" className="hover:text-indigo-400 transition-colors">Protocol</Link>
              <Link to="/contact" className="hover:text-indigo-400 transition-colors">Signal</Link>
              <Link to="/studio" className="hover:text-indigo-400 transition-colors flex items-center gap-2">
                <span className="w-1 h-1 bg-indigo-500 rounded-full animate-pulse"></span> AI Studio
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">System Status</h5>
            <div className="flex flex-col gap-4 text-[9px] font-bold uppercase tracking-widest">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Neural Load</span>
                <span className="text-indigo-400">14.2%</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-500">Uptime</span>
                <span className="text-emerald-500">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Node</span>
                <span className="text-slate-400">S3D-01</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="max-w-[1400px] mx-auto pt-8 mt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">
          © 2026 Studio3D Intelligence Lab // All Rights Reserved
        </p>
        <div className="flex gap-8">
          <Link to="/about" className="text-[8px] font-bold text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Privacy Protocol</Link>
          <Link to="/contact" className="text-[8px] font-bold text-slate-600 uppercase tracking-widest hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>

    </footer>
  );
};

export default Footer;