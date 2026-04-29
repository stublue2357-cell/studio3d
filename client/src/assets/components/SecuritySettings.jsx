import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { changePassword } from '../../api';

const SecuritySettings = () => {
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setStatus({ type: 'error', msg: "NEW_CIPHER_MISMATCH // VERIFICATION_FAILED" });
            return;
        }

        setLoading(true);
        setStatus({ type: 'info', msg: "TRANSMITTING_NEW_PROTOCOLS..." });

        try {
            const token = localStorage.getItem('token');
            const { data } = await changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            }, token);

            setStatus({ type: 'success', msg: data.msg });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setStatus({ type: 'error', msg: err.response?.data?.msg || "TRANSMISSION_FAILED // UNAUTHORIZED" });
        } finally {
            setLoading(false);
            setTimeout(() => setStatus(null), 5000);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10 text-center">
                <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-4 animate-pulse">
                    Security Architecture
                </div>
                <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                    Cipher <span className="text-indigo-400">Reconfiguration</span>
                </h3>
                <p className="text-slate-500 text-[9px] uppercase tracking-widest mt-2">Update identity verification protocols</p>
            </div>

            {status && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className={`mb-8 p-5 rounded-2xl border text-[9px] font-black uppercase tracking-widest text-center ${
                        status.type === 'error' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 
                        status.type === 'info' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 animate-pulse' :
                        'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}
                >
                    {status.msg}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Current Cipher</label>
                    <input 
                        type="password" required 
                        className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl text-white text-[11px] font-bold outline-none focus:border-indigo-500 transition-all"
                        placeholder="••••••••"
                        value={passwords.currentPassword}
                        onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">New Cipher</label>
                        <input 
                            type="password" required 
                            className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl text-white text-[11px] font-bold outline-none focus:border-indigo-400"
                            placeholder="••••••••"
                            value={passwords.newPassword}
                            onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Confirm New Cipher</label>
                        <input 
                            type="password" required 
                            className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl text-white text-[11px] font-bold outline-none focus:border-indigo-400"
                            placeholder="••••••••"
                            value={passwords.confirmPassword}
                            onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                        />
                    </div>
                </div>

                <button 
                    disabled={loading}
                    className="w-full mt-8 py-6 bg-white text-black rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.5em] hover:bg-indigo-600 hover:text-white transition-all shadow-2xl disabled:opacity-50"
                >
                    {loading ? 'Processing Protocol...' : 'Authorize Reconfiguration'}
                </button>
            </form>
        </div>
    );
};

export default SecuritySettings;
