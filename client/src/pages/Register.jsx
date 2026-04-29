import { useState } from 'react';
import { registerUser } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Background image import (consistent with Login)
import bgImage from '../assets/Gemini_Generated_Image_wv0mfbwv0mfbwv0m.png';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await registerUser(formData);
      setMsg("IDENTITY INITIALIZED SUCCESSFULLY. REDIRECTING...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || "SYSTEM INITIALIZATION FAILED");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden font-['Inter'] selection:bg-indigo-500/30">
      
      {/* Background with Ambient Zoom */}
      <motion.div 
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-3xl px-6"
      >
        {/* Wide Cinematic Glass Card */}
        <div className="backdrop-blur-3xl bg-black/50 border border-white/20 rounded-[2.5rem] p-12 md:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
          
          <div className="text-center mb-10">
            <motion.h1 
              className="font-['Space_Grotesk'] text-5xl font-bold tracking-tighter text-white mb-4 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)] uppercase"
            >
              Initialize <span className="text-indigo-400">Identity</span>
            </motion.h1>
            <p className="text-indigo-200/70 font-medium tracking-[0.4em] uppercase text-[10px]">
              Provision your creative workspace in Studio 3D
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Full Name Field (Top Wide) */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold ml-1">
                Full Identity (Name)
              </label>
              <input 
                type="text" 
                className="w-full bg-white/[0.05] border border-white/10 px-6 py-5 rounded-2xl focus:ring-1 focus:ring-indigo-400 outline-none transition-all text-white placeholder:text-slate-600 backdrop-blur-md text-sm"
                placeholder="Alexander Pierce"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold ml-1">
                  Network Channel (Email)
                </label>
                <input 
                  type="email" 
                  className="w-full bg-white/[0.05] border border-white/10 px-6 py-5 rounded-2xl focus:ring-1 focus:ring-indigo-400 outline-none transition-all text-white placeholder:text-slate-600 backdrop-blur-md text-sm"
                  placeholder="architect@studio.ai"
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest text-indigo-300 font-bold ml-1">
                  Security Key (Password)
                </label>
                <input 
                  type="password" 
                  className="w-full bg-white/[0.05] border border-white/10 px-6 py-5 rounded-2xl focus:ring-1 focus:ring-indigo-400 outline-none transition-all text-white placeholder:text-slate-600 backdrop-blur-md text-sm"
                  placeholder="••••••••"
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <motion.button 
              whileHover={{ y: -2, boxShadow: "0px 0px 25px rgba(99, 102, 241, 0.5)" }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-['Space_Grotesk'] font-bold tracking-widest uppercase text-xs transition-all duration-300 shadow-xl relative
                ${isLoading ? "bg-slate-800 text-slate-500 cursor-not-allowed" : "bg-white text-black hover:bg-indigo-500 hover:text-white cursor-pointer"}`}
            >
              {isLoading ? "PROVISIONING..." : "INITIALIZE SYSTEM"}
            </motion.button>
          </form>

          <AnimatePresence>
            {msg && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-8 text-center text-[10px] tracking-widest uppercase font-bold ${msg.includes('SUCCESSFULLY') ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {msg}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-slate-500 text-[10px] tracking-[0.2em] uppercase font-medium">
              Already a Resident? {" "}
              <Link to="/login" className="text-white hover:text-indigo-400 transition-all font-bold border-b border-indigo-500/50 pb-1">
                ACCESS ACCOUNT
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;