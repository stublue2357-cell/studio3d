import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import AdminOrders from './AdminOrders'; 
import UserManagement from './UserManagement';
import AdminProducts from './AdminProducts';
import ProfileSettings from './ProfileSettings';
import { getAllOrdersAdmin } from '../api';

const SubOwnerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ops');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await getAllOrdersAdmin(token);
        setOrders(data);
      } catch (err) {
        console.error("OPS_SYNC_ERROR", err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const tabs = [
    { id: 'ops', label: 'Operations', icon: '⚙️' },
    { id: 'inventory', label: 'Inventory', icon: '🏪' },
    { id: 'orders', label: 'Order Desk', icon: '📝' },
    { id: 'users', label: 'Staff Node', icon: '👤' },
    { id: 'settings', label: 'Security & Profile', icon: '🛡️' },
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-[#020617] text-slate-300 font-['Plus_Jakarta_Sans']">
      
      {/* Dynamic Operational Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle, #4f46e5 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* --- SUB-OWNER SIDEBAR --- */}
        <aside className="w-full lg:w-[280px] shrink-0">
          <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl">
            <div className="mb-10">
              <span className="text-emerald-400 text-[9px] font-black tracking-[0.4em] uppercase mb-1 block">Operations_Manager</span>
              <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
                SUPER<span className="text-emerald-500">.OPS</span>
              </h2>
            </div>

            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${
                    activeTab === tab.id 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/5' 
                    : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-16 p-5 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black uppercase text-slate-600">Active Duty</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="space-y-3">
                {['Logistics', 'Quality Control', 'Customer Support'].map((d, i) => (
                  <div key={i} className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest text-slate-500">
                    <span>{d}</span>
                    <span className="text-emerald-500">ONLINE</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleLogout} className="w-full mt-8 py-4 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-[9px] font-black uppercase text-rose-500 hover:bg-rose-500 hover:text-white transition-all tracking-widest">
              End_Shift
            </button>
          </div>
        </aside>

        {/* --- SUB-OWNER MAIN CONTENT --- */}
        <main className="flex-1 space-y-8">
          
          {/* Operational Pulse */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Orders Processed', val: orders.length, color: 'text-emerald-400' },
              { label: 'Dispatch Delay', val: '45m', color: 'text-amber-400' },
              { label: 'Team Efficiency', val: '92%', color: 'text-blue-400' },
              { label: 'Stock Level', val: '840', color: 'text-indigo-400' },
            ].map((s, i) => (
              <div key={i} className="glass-panel p-6 rounded-3xl border-white/5 bg-black/20">
                <div className="text-[8px] uppercase tracking-[0.2em] text-slate-600 mb-1 font-black">{s.label}</div>
                <div className={`text-2xl font-black italic tracking-tighter ${s.color}`}>{s.val}</div>
              </div>
            ))}
          </div>

          <div className="glass-panel p-8 rounded-[3rem] border-white/5 bg-black/40 backdrop-blur-md min-h-[70vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="w-full"
              >
                {activeTab === 'ops' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">Operational_Pulse</h3>
                      <div className="flex gap-4">
                        <div className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Stable
                        </div>
                      </div>
                    </div>

                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={orders.slice(0, 10).map((o, i) => ({ n: `ORD-${o._id.slice(-4)}`, v: o.totalAmount }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="n" hide />
                          <YAxis hide />
                          <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ background: '#000', border: '1px solid #10b981', color: '#fff' }} />
                          <Bar dataKey="v" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                      <div className="p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-4">Quality Assurance</h4>
                        <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                          All systems check passed. Current production throughput is within 5% of target capacity.
                        </p>
                      </div>
                      <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4">Logistics Sync</h4>
                        <p className="text-[11px] leading-relaxed text-slate-400 font-medium">
                          Automated courier dispatch active. 12 orders currently pending pickup from central node.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'inventory' && <AdminProducts isEmbedded={true} />}
                {activeTab === 'orders' && <AdminOrders isEmbedded={true} />}
                {activeTab === 'users' && <UserManagement isEmbedded={true} />}
                {activeTab === 'settings' && <ProfileSettings />}
                
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>
    </div>
  );
};

export default SubOwnerDashboard;
