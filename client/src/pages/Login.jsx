import { useState } from 'react';
import { loginUser, registerUser, googleLogin, forgotPassword } from '../api'; 
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import bgImage from '../assets/Gemini_Generated_Image_wv0mfbwv0mfbwv0m.png';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', adminSecret: '' });
  const [msg, setMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleAuthSuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.user.role);
    localStorage.setItem('user', JSON.stringify(data.user)); // 👉 Add this line

    const userRole = data.user.role;
    setMsg(`ACCESS GRANTED: ${userRole.toUpperCase()} LEVEL CLEARANCE. INITIALIZING...`);
    
    setTimeout(() => {
      switch (userRole) {
        case 'developer': navigate('/developer/dashboard'); break;
        case 'owner': navigate('/owner/dashboard'); break;
        case 'sub-owner': navigate('/sub-owner/dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
        default: navigate('/dashboard');
      }
    }, 1500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg("");
    
    try {
      if (isForgotMode) {
        const { data } = await forgotPassword(formData.email);
        setMsg(data.msg || "RECOVERY_SIGNAL_SENT. CHECK YOUR NODE.");
      } else if (isLogin) {
        const { data } = await loginUser({ email: formData.email, password: formData.password });
        handleAuthSuccess(data);
      } else {
        const { data } = await registerUser(formData);
        setMsg(data.msg || "IDENTITY SYNTHESIZED. PLEASE AUTHORIZE.");
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.msg || "PROTOCOL ERROR: VERIFICATION FAILED.";
      setMsg(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const { data } = await googleLogin(credentialResponse.credential);
      handleAuthSuccess(data);
    } catch (err) {
      setMsg("GOOGLE_AUTH_FAILED: CONNECTION_UNSTABLE.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden font-['Plus_Jakarta_Sans']">
      
      {/* Background Section */}
      <motion.div 
        initial={{ scale: 1.1 }} 
        animate={{ scale: 1 }} 
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }} 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: `url(${bgImage})`, filter: 'brightness(0.15) contrast(1.2)' }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </motion.div>
      
      {/* Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-1" />

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="relative z-10 w-full max-w-5xl glass-panel rounded-[3rem] border-white/10 flex flex-col md:flex-row overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]"
      >
        
        {/* Left Side: Info */}
        <div className="w-full md:w-5/12 p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/5 flex flex-col justify-between bg-gradient-to-br from-indigo-950/40 to-transparent">
          <div>
            <div className="text-xl md:text-2xl font-black italic mb-2 tracking-tighter text-white uppercase">STUDIO<span className="text-indigo-400">3D</span></div>
            <div className="h-px w-12 mb-6 md:mb-8 bg-indigo-500" />
            <h2 className="text-4xl md:text-5xl font-bold tracking-tighter leading-none mb-4 md:mb-6 text-white uppercase italic">
              {isForgotMode ? 'RECOVER' : (isLogin ? 'AUTHENTICATE' : 'REGISTER')} <br /> 
              <span className="text-indigo-400">IDENTITY.</span>
            </h2>
            <p className="text-slate-400 text-[8px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-bold leading-loose">
              {isForgotMode ? 'Neural recovery protocol active.' : (isLogin ? 'Secure node access protocol active.' : 'Join the elite design matrix.')}
            </p>
          </div>
          <div className="hidden md:block text-[9px] text-slate-600 font-mono tracking-widest uppercase mt-8">
            System Status: Nominal // Encryption: AES-256
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-7/12 p-12 md:p-16 flex flex-col justify-center bg-black/40">
          <div className="mb-10 flex justify-between items-center border-b border-white/10 pb-8">
            <div>
              <h3 className="text-[11px] font-black tracking-[0.3em] text-white uppercase">
                {isForgotMode ? 'RESET CIPHER' : (isLogin ? 'LOG INTO SYSTEM' : 'CREATE NEW NODE')}
              </h3>
            </div>
            <button 
              onClick={() => { setIsForgotMode(false); setIsLogin(!isLogin); setMsg(""); }} 
              className="text-[10px] font-black uppercase text-indigo-400 border border-indigo-400/30 px-6 py-2.5 rounded-full hover:bg-indigo-400/10 hover:border-indigo-400/60 transition-all"
            >
              {isLogin ? 'Request Access' : 'Return to Login'}
            </button>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {!isLogin && !isForgotMode && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <input type="text" required placeholder="FULL NAME" className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-[11px] text-white outline-none focus:border-indigo-500/50 transition-all" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </motion.div>
              )}
            </AnimatePresence>

            <input type="email" required placeholder="NODE_EMAIL@STUDIO3D.AI" className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-[11px] text-white outline-none focus:border-indigo-500/50 transition-all" onChange={(e) => setFormData({...formData, email: e.target.value})} />
            
            <AnimatePresence mode="wait">
              {!isForgotMode && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="relative">
                  <input type={showPassword ? "text" : "password"} required={!isForgotMode} placeholder="SECURITY CIPHER" className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-[11px] text-white outline-none focus:border-indigo-500/50 transition-all" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {!isLogin && !isForgotMode && (
              <div className="pt-2">
                <input type="password" placeholder="AUTHORIZATION KEY (OPTIONAL)" className="w-full bg-indigo-500/5 border border-indigo-500/10 px-8 py-5 rounded-2xl text-[11px] text-indigo-400 placeholder:text-indigo-900 outline-none focus:border-indigo-500/30 transition-all" onChange={(e) => setFormData({...formData, adminSecret: e.target.value})} />
              </div>
            )}

            <div className="flex justify-between items-center px-2">
              <button type="button" onClick={() => { setIsForgotMode(!isForgotMode); setIsLogin(true); setMsg(""); }} className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-all">
                {isForgotMode ? 'Back to Login' : 'Lost Access?'}
              </button>
            </div>

            <button disabled={isLoading} className={`w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.6em] transition-all relative overflow-hidden group ${isLoading ? 'bg-slate-900 text-slate-700 cursor-not-allowed' : 'bg-white text-black hover:bg-indigo-500 hover:text-white shadow-[0_20px_40px_rgba(79,70,229,0.2)]'}`}>
              <span className="relative z-10">{isLoading ? 'VERIFYING...' : (isForgotMode ? 'SEND RECOVERY' : (isLogin ? 'AUTHORIZE PORTAL' : 'INITIALIZE NODE'))}</span>
            </button>

            {isLogin && !isForgotMode && (
              <div className="flex flex-col items-center gap-6 mt-8">
                <div className="flex items-center gap-4 w-full">
                  <div className="h-px bg-white/5 flex-grow" />
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Neural Link Options</span>
                  <div className="h-px bg-white/5 flex-grow" />
                </div>
                
                <GoogleLogin 
                  onSuccess={handleGoogleSuccess} 
                  onError={() => setMsg("GOOGLE_AUTH_FAILED")}
                  theme="dark"
                  shape="pill"
                  width="100%"
                />
              </div>
            )}
          </form>

          <AnimatePresence>
            {msg && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-10 p-4 rounded-xl border text-center text-[10px] tracking-widest uppercase font-black ${msg.includes('GRANTED') || msg.includes('SUCCESS') || msg.includes('SENT') ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/5 border-rose-500/20 text-rose-400'}`}>
                {msg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;