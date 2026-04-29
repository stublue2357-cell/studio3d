import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="relative min-h-screen pt-32 pb-20 px-6 max-w-[1400px] mx-auto w-full">
      
      {/* --- HERO SECTION --- */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-24"
      >
        <span className="text-indigo-400 text-[10px] font-black tracking-[0.8em] uppercase mb-6 block animate-pulse">
          Project Identity // Phase 07
        </span>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic text-white mb-8">
          AI 3D <span className="text-indigo-400">Fashion Studio</span>
        </h1>
        <p className="max-w-3xl mx-auto text-slate-400 text-xs md:text-sm font-bold leading-relaxed uppercase tracking-[0.2em]">
          Building the future of personalized apparel through the MERN stack and Generative AI. 
          Studio3D is more than a store; it's a synthesis of neural design and physical reality.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- LEFT: OUR MISSION --- */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="glass-panel p-10 rounded-[3rem] border-white/5 bg-white/[0.02] flex flex-col justify-between"
        >
          <div>
            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-6">01 // The Mission</h3>
            <p className="text-[11px] text-slate-300 font-bold uppercase tracking-widest leading-loose">
              To empower individuals to create, not just consume. Our AI-driven platform allows users to 
              synthesize custom 3D designs into premium streetwear with zero technical friction.
            </p>
          </div>
          <div className="mt-10 pt-6 border-t border-white/5">
            <span className="text-[10px] font-black text-white italic uppercase tracking-tighter">Powered by Neural Synthesis</span>
          </div>
        </motion.div>

        {/* --- CENTER: CORE TECH --- */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="glass-panel p-10 rounded-[3rem] border-white/5 bg-indigo-600/5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <svg className="w-32 h-32 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
          <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-8">02 // Technology Stack</h3>
          <ul className="space-y-4 text-[10px] font-black uppercase tracking-[0.3em] text-white">
            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-indigo-500 rounded-full" /> MongoDB (Database)</li>
            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-indigo-500 rounded-full" /> Express.js (Backend)</li>
            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-indigo-500 rounded-full" /> React.js (Frontend)</li>
            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-indigo-500 rounded-full" /> Node.js (Server)</li>
            <li className="flex items-center gap-3"><span className="w-2 h-2 bg-cyan-500 rounded-full" /> Generative AI (Design)</li>
          </ul>
        </motion.div>

        {/* --- RIGHT: CONTACT DETAILS (System Info) --- */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="glass-panel p-10 rounded-[3rem] border-white/5 bg-white/[0.02]"
        >
          <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white mb-10">03 // System Contact</h3>
          
          <div className="space-y-8">
            <div className="group cursor-pointer">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2 group-hover:text-indigo-400 transition-colors">Direct Signal (Email)</span>
              <p className="text-[12px] font-bold text-white tracking-[0.1em]">support@studio3d.ai</p>
            </div>

            <div className="group cursor-pointer">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2 group-hover:text-indigo-400 transition-colors">Neural Hub (Phone)</span>
              <p className="text-[12px] font-bold text-white tracking-[0.1em]">+92 3XX XXXXXXX</p>
            </div>

            <div className="group cursor-pointer">
              <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest block mb-2 group-hover:text-indigo-400 transition-colors">Physical Node (Location)</span>
              <p className="text-[12px] font-bold text-white tracking-[0.1em]">IT HUB, GUJRANWALA, PK</p>
            </div>

            <div className="pt-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500 transition-all cursor-pointer">
                  <span className="text-[10px] font-bold">IG</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500 transition-all cursor-pointer">
                  <span className="text-[10px] font-bold">TW</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* --- BOTTOM SECTION: THE DEVELOPER --- */}
      <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-black italic text-black">IT</div>
          <div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Lead Architect</h4>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">7th Semester IT Student</p>
          </div>
        </div>
        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">
          Version 1.0.42 // Stable Release
        </div>
      </div>

    </div>
  );
};

export default About;