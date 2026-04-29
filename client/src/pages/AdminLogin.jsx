import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// Background image ka path check kar lein
import bgImage from '../assets/Gemini_Generated_Image_wv0mfbwv0mfbwv0m.png'; 

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg("");
    
    // Admin dummy credentials
    setTimeout(() => {
      if (formData.email === 'admin@studio3d.ai' && formData.password === 'admin123') {
        setMsg("ADMIN ACCESS AUTHORIZED. LOADING SYSTEM...");
        localStorage.setItem('isAdmin', 'true');
        setTimeout(() => navigate('/admin/dashboard'), 1500);
      } else {
        setMsg("ERROR: UNAUTHORIZED CREDENTIALS DETECTED.");
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden font-['Plus_Jakarta_Sans']">
      
      {/* Background Section */}
      <motion.div 
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url(${bgImage})`,
          filter: 'brightness(0.18) contrast(1.1)' 
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]"></div>
      </motion.div>
      
      {/* Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-1" />

      {/* Terminal Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl glass-panel rounded-[3.5rem] border-white/10 flex flex-col md:flex-row overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)]"
      >
        {/* Left Side Info */}
        <div className="md:w-5/12 p-12 bg-white/[0.02] border-r border-white/5 flex flex-col justify-between">
          <div>
            <div className="text-2xl font-black italic mb-2 tracking-tighter text-white uppercase">STUDIO<span className="text-indigo-400">3D</span> // ADMIN</div>
            <div className="h-px w-12 bg-indigo-500 mb-8" />
            <h2 className="text-4xl font-bold tracking-tighter leading-none mb-6 text-white uppercase">
              AUTHORIZE <br /> <span className="text-indigo-400 italic">COMMAND.</span>
            </h2>
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] leading-relaxed font-bold">
              Restricted access to the central synthesis control unit.
            </p>
          </div>
          <div className="space-y-4 pt-10 border-t border-white/5">
            <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500 tracking-widest uppercase">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" /> Admin Mode: Restricted
            </div>
          </div>
        </div>

        {/* Right Side Form */}
        <div className="md:w-7/12 p-12 md:p-16 flex flex-col justify-center bg-black/20">
          <form className="space-y-8" onSubmit={handleAdminLogin}>
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Admin Email</label>
              <input 
                type="email" 
                required
                placeholder="ADMIN@STUDIO3D.AI" 
                className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all placeholder:text-slate-700" 
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Master Key</label>
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl outline-none focus:ring-1 focus:ring-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all placeholder:text-slate-700" 
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <button 
              disabled={isLoading}
              className={`w-full py-6 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl transition-all
                ${isLoading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white text-black hover:bg-indigo-500 hover:text-white shadow-indigo-500/20'}
              `}
            >
              {isLoading ? 'VERIFYING...' : 'AUTHORIZE ENTRY'}
            </button>
          </form>

          {/* Response Message */}
          <AnimatePresence>
            {msg && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`mt-10 text-center text-[10px] tracking-widest uppercase font-bold ${msg.includes('AUTHORIZED') ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {msg}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="fixed bottom-8 w-full px-12 flex justify-between items-end pointer-events-none z-20 opacity-30">
        <div className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.5em]">
          Protocol: Neural-Link<br />Build: S3D.26.A.I.00
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;