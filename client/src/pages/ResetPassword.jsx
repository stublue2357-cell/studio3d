import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import bgImage from '../assets/Gemini_Generated_Image_wv0mfbwv0mfbwv0m.png';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setMsg("CIPHERS_DO_NOT_MATCH.");
        return;
    }
    setIsLoading(true);
    try {
      const { data } = await resetPassword(token, password);
      setMsg("SUCCESS // CIPHER_UPDATED. REDIRECTING...");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "PROTOCOL_ERROR: RESET_FAILED.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden font-['Plus_Jakarta_Sans']">
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})`, filter: 'brightness(0.15) contrast(1.2)' }}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md glass-panel p-12 rounded-[3rem] border-white/10 bg-black/40">
        <h2 className="text-3xl font-bold tracking-tighter text-white uppercase italic mb-8">
            RESET <span className="text-indigo-400">CIPHER.</span>
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="password" 
            required 
            placeholder="NEW SECURITY CIPHER" 
            className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-[11px] text-white outline-none focus:border-indigo-500/50 transition-all" 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <input 
            type="password" 
            required 
            placeholder="CONFIRM NEW CIPHER" 
            className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-[11px] text-white outline-none focus:border-indigo-500/50 transition-all" 
            onChange={(e) => setConfirmPassword(e.target.value)} 
          />
          
          <button disabled={isLoading} className={`w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.6em] transition-all ${isLoading ? 'bg-slate-900 text-slate-700' : 'bg-white text-black hover:bg-indigo-500 hover:text-white'}`}>
            {isLoading ? 'UPDATING...' : 'RECONFIGURE'}
          </button>
        </form>

        <AnimatePresence>
          {msg && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-10 p-4 rounded-xl border text-center text-[10px] tracking-widest uppercase font-black ${msg.includes('SUCCESS') ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'}`}>
              {msg}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
