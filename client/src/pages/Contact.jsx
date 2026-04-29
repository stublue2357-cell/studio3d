import React from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  return (
    <div className="relative min-h-screen pt-32 pb-20 px-6 max-w-[1200px] mx-auto w-full">
      
      {/* --- HEADER --- */}
      <div className="text-center mb-16">
        <span className="text-cyan-400 text-[10px] font-black tracking-[0.6em] uppercase mb-4 block animate-pulse">
          Communication Terminal // Live
        </span>
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic text-white">
          Establish <span className="text-indigo-400">Connection</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* --- LEFT: SYSTEM INFO (Contact Details) --- */}
        <div className="lg:col-span-5 space-y-8 order-2 lg:order-1">
          <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02]">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-8 flex items-center gap-3">
              <span className="w-2 h-2 bg-indigo-500 rounded-full" /> System Nodes
            </h3>
            
            <div className="space-y-10">
              {/* Email Node */}
              <div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] block mb-2">Primary Signal (Email)</span>
                <p className="text-[13px] font-bold text-white tracking-widest uppercase hover:text-indigo-400 transition-colors cursor-pointer">
                  support@studio3d.ai
                </p>
              </div>

              {/* Phone Node */}
              <div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] block mb-2">Direct Line (Phone)</span>
                <p className="text-[13px] font-bold text-white tracking-widest uppercase hover:text-indigo-400 transition-colors cursor-pointer">
                  +92 3XX XXXXXXX
                </p>
              </div>

              {/* Address Node */}
              <div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] block mb-2">Physical Hub (Location)</span>
                <p className="text-[13px] font-bold text-white tracking-widest uppercase">
                  IT Center, Gujranwala, PK
                </p>
              </div>
            </div>
          </div>

          {/* Social Protocols */}
          <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-white/[0.02]">
            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-6">Social Protocols</h3>
            <div className="flex gap-4">
              {['Instagram', 'Twitter', 'LinkedIn', 'Github'].map((social) => (
                <div key={social} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                  {social}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT: TRANSMISSION FORM --- */}
        <div className="lg:col-span-7 order-1 lg:order-2">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel p-8 md:p-12 rounded-[3rem] border-white/5 bg-black/40 shadow-2xl relative overflow-hidden"
          >
            {/* Form Glow */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />

            <form className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 ml-1">Identity Name</label>
                  <input required type="text" placeholder="ENTER NAME" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold text-white tracking-widest transition-all placeholder:text-slate-800" />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 ml-1">Signal Address</label>
                  <input required type="email" placeholder="EMAIL@NETWORK.COM" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold text-white tracking-widest transition-all placeholder:text-slate-800" />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 ml-1">Encrypted Message</label>
                <textarea required rows="6" placeholder="TYPE YOUR SIGNAL HERE..." className="w-full bg-white/[0.03] border border-white/10 p-6 rounded-2xl outline-none focus:border-indigo-400 text-[11px] font-bold text-white tracking-widest transition-all resize-none placeholder:text-slate-800"></textarea>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-[10px] font-black uppercase tracking-[0.5em] rounded-xl shadow-[0_10px_30px_rgba(99,102,241,0.2)] transition-all"
              >
                Transmit Signal
              </motion.button>
            </form>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Contact;