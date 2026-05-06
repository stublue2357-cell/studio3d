import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAdminPerformance } from '../api';

const AdminPerformance = () => {
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await getAdminPerformance(token);
        setPerformanceData(data);
      } catch (err) {
        console.error("ANALYTICS_FETCH_FAILED", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  if (loading) return <div className="py-20 text-center text-indigo-400 animate-pulse tracking-[0.5em] text-[10px] uppercase font-black">Decrypting_Agent_Activity...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-6">
        <div>
          <h3 className="text-2xl font-black italic uppercase text-white tracking-tighter">Agent <span className="text-indigo-400">Activity_Logs</span></h3>
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mt-1">Real-time performance tracking for all administrative nodes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performanceData.map((admin) => (
          <motion.div 
            key={admin._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
               <span className="text-4xl font-black italic text-indigo-500">#{performanceData.indexOf(admin) + 1}</span>
            </div>

            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-indigo-500/10">
                👤
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">{admin.name}</h4>
                <p className="text-[8px] text-slate-500 lowercase font-bold">{admin.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
               <div className="text-center">
                  <span className="text-[7px] font-black text-slate-600 uppercase block mb-1">Claimed</span>
                  <span className="text-xl font-black text-white italic">{admin.ordersHandled}</span>
               </div>
               <div className="text-center">
                  <span className="text-[7px] font-black text-emerald-500 uppercase block mb-1">Resolved</span>
                  <span className="text-xl font-black text-white italic">{admin.completed}</span>
               </div>
               <div className="text-center">
                  <span className="text-[7px] font-black text-amber-500 uppercase block mb-1">Pending</span>
                  <span className="text-xl font-black text-white italic">{admin.pending}</span>
               </div>
            </div>

            {/* Performance Bar */}
            <div className="space-y-2">
               <div className="flex justify-between items-center text-[7px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Efficiency Protocol</span>
                  <span className="text-indigo-400">{admin.ordersHandled > 0 ? Math.round((admin.completed / admin.ordersHandled) * 100) : 0}%</span>
               </div>
               <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${admin.ordersHandled > 0 ? (admin.completed / admin.ordersHandled) * 100 : 0}%` }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                  />
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
               <span className="text-[8px] font-black text-slate-600 uppercase">Status: <span className="text-emerald-500 ml-1">Active</span></span>
               <button className="text-[8px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-colors">Details &rarr;</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminPerformance;
