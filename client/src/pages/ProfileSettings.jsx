import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { updateProfile, changePassword } from '../api';

const ProfileSettings = () => {
  const [name, setName] = useState(localStorage.getItem('userName') || '');
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await updateProfile({ name }, token);
      localStorage.setItem('userName', data.user.name);
      setMsg({ text: "IDENTITY_RECONFIGURED // SUCCESS", type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.msg || "UPDATE_FAILED", type: 'error' });
    } finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await changePassword({ currentPassword: passwords.current, newPassword: passwords.new }, token);
      setMsg({ text: "CIPHER_UPDATED // SUCCESS", type: 'success' });
      setPasswords({ current: '', new: '' });
    } catch (err) {
      setMsg({ text: err.response?.data?.msg || "RECONFIGURATION_FAILED", type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black uppercase italic tracking-tighter text-white">Security_&_Profile</h3>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Node Identity Management</p>
        </div>
        {msg.text && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}
          >
            {msg.text}
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* Name Update */}
        <form onSubmit={handleUpdateName} className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-6">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-400">Identity Synthesis</h4>
          <div className="space-y-2">
            <label className="text-[8px] uppercase tracking-[0.3em] text-slate-600 font-black pl-2">Full Name</label>
            <input 
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-[11px] text-white outline-none focus:border-indigo-500/50 transition-all"
              placeholder="ENTER_NEW_IDENTITY"
            />
          </div>
          <button disabled={loading} className="w-full py-4 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-indigo-600 transition-all">
            {loading ? 'SYNCHRONIZING...' : 'UPDATE_IDENTITY'}
          </button>
        </form>

        {/* Password Update */}
        <form onSubmit={handleChangePassword} className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/5 space-y-6">
          <h4 className="text-[11px] font-black uppercase tracking-widest text-rose-400">Cipher Reconfiguration</h4>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-[0.3em] text-slate-600 font-black pl-2">Current Cipher</label>
              <div className="relative">
                <input 
                  type={showCurrentPass ? "text" : "password"} 
                  value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-[11px] text-white outline-none focus:border-rose-500/50 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showCurrentPass ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[8px] uppercase tracking-[0.3em] text-slate-600 font-black pl-2">New Cipher</label>
              <div className="relative">
                <input 
                  type={showNewPass ? "text" : "password"} 
                  value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 px-6 py-4 rounded-2xl text-[11px] text-white outline-none focus:border-rose-500/50 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showNewPass ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <button disabled={loading} className="w-full py-4 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-rose-500 hover:text-white transition-all">
            {loading ? 'ENCRYPTING...' : 'RECONFIGURE_CIPHER'}
          </button>
        </form>

      </div>

      <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-6">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-2xl">🛡️</div>
        <div>
          <h5 className="text-[11px] font-black uppercase text-white mb-1 tracking-widest">Security Protocol Alpha</h5>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed">
            Your data is encrypted using AES-256 standards. Ensure your cipher remains confidential to maintain node integrity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
