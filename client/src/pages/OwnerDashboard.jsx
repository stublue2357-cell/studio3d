import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminOrders from './AdminOrders'; 
import UserManagement from './UserManagement';
import ProfileSettings from './ProfileSettings';
import { getAllOrdersAdmin } from '../api';

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('insights');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await getAllOrdersAdmin(token);
        setOrders(data);
      } catch (err) {
        console.error("DATA_FETCH_ERROR", err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const tabs = [
    { id: 'insights', label: 'Business Insights', icon: '💎' },
    { id: 'orders', label: 'Order Pipeline', icon: '📦' },
    { id: 'staff', label: 'System Access', icon: '👥' },
    { id: 'settings', label: 'Security & Profile', icon: '🛡️' },
    { id: 'reports', label: 'Executive Reports', icon: '📊' },
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-[#020617] text-slate-300 font-['Plus_Jakarta_Sans']">
      
      {/* Premium Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 flex flex-col lg:flex-row gap-10 relative z-10">
        
        {/* --- OWNER SIDEBAR --- */}
        <aside className="w-full lg:w-[320px] shrink-0">
          <div className="glass-panel p-10 rounded-[3rem] border-white/5 bg-black/60 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
            <div className="mb-12">
              <span className="text-indigo-400 text-[10px] font-black tracking-[0.5em] uppercase mb-2 block">Executive_Suite</span>
              <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
                OWNER<span className="text-indigo-500">.CORE</span>
              </h2>
            </div>

            <nav className="space-y-3">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-8 py-5 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-4 group ${
                    activeTab === tab.id 
                    ? 'bg-gradient-to-r from-indigo-600/20 to-transparent text-white border-l-4 border-indigo-500 shadow-xl' 
                    : 'text-slate-500 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="mt-20 p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Total Equity Value</div>
              <div className="text-3xl font-black text-white italic tracking-tighter">${totalRevenue.toLocaleString()}</div>
              <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: '75%' }} className="h-full bg-indigo-500" />
              </div>
            </div>

            <button onClick={handleLogout} className="w-full mt-10 py-5 bg-white text-black rounded-3xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-indigo-500 hover:text-white transition-all">
              Sign_Out
            </button>
          </div>
        </aside>

        {/* --- OWNER MAIN CONTENT --- */}
        <main className="flex-1 space-y-10">
          
          {/* Executive Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Net Revenue', val: `$${totalRevenue}`, icon: '💰', change: '+14%' },
              { label: 'Active Signals', val: totalOrders, icon: '📈', change: '+8%' },
              { label: 'Brand Power', val: '94/100', icon: '⚡', change: 'MAX' },
            ].map((m, i) => (
              <div key={i} className="glass-panel p-8 rounded-[2.5rem] border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent relative overflow-hidden group">
                <div className="absolute top-[-20%] right-[-10%] text-8xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">{m.icon}</div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{m.label}</span>
                  <span className="text-[9px] font-bold text-emerald-400 px-2 py-1 bg-emerald-500/10 rounded-full">{m.change}</span>
                </div>
                <div className="text-4xl font-black italic tracking-tighter text-white uppercase">{m.val}</div>
              </div>
            ))}
          </div>

          <div className="glass-panel p-10 rounded-[3.5rem] border-white/5 bg-black/40 backdrop-blur-md min-h-[75vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="w-full"
              >
                {activeTab === 'insights' && (
                  <div className="space-y-12">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-1">Growth_Trajectory</h3>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Comprehensive Market Performance Analysis</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="px-5 py-2 bg-indigo-500 text-white rounded-full text-[9px] font-black uppercase">Annual</div>
                        <div className="px-5 py-2 bg-white/5 text-slate-500 rounded-full text-[9px] font-black uppercase">Quarterly</div>
                      </div>
                    </div>

                    <div className="h-[450px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={orders.slice(0, 15).map((o, i) => ({ n: i, v: o.totalAmount }))}>
                          <defs>
                            <linearGradient id="ownerGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area type="stepAfter" dataKey="v" stroke="#818cf8" fill="url(#ownerGradient)" strokeWidth={2} />
                          <Tooltip contentStyle={{ background: '#111', border: 'none', borderRadius: '20px', color: '#fff' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="p-10 rounded-[3rem] bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/5">
                        <h4 className="text-[11px] font-black uppercase tracking-widest mb-8 text-white">Resource Distribution</h4>
                        <div className="flex items-center justify-between">
                          <div className="space-y-4">
                            {[
                              { l: 'Production', c: 'bg-indigo-500' },
                              { l: 'Marketing', c: 'bg-fuchsia-500' },
                              { l: 'Research', c: 'bg-emerald-500' }
                            ].map((item, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${item.c}`} />
                                <span className="text-[10px] font-bold uppercase text-slate-400">{item.l}</span>
                              </div>
                            ))}
                          </div>
                          <div className="w-32 h-32 bg-white/5 rounded-full border border-white/10 flex items-center justify-center italic font-black text-white">
                            OPTIMAL
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-6xl font-black italic text-indigo-500/20 uppercase tracking-tighter leading-none mb-4">Visionary<br/>Leadership</h4>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-loose">
                          Our trajectory remains exponential. Data synchronization confirms market dominance across all active nodes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'orders' && <AdminOrders isEmbedded={true} />}
                {activeTab === 'staff' && <UserManagement isEmbedded={true} />}
                {activeTab === 'settings' && <ProfileSettings />}
                
                {activeTab === 'reports' && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-black uppercase italic text-white mb-8">Executive_Briefings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {['Q4 Revenue Projections', 'Market Expansion Strategy', 'AI Studio Performance', 'User Retention Matrix'].map((r, i) => (
                        <div key={i} className="p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group">
                          <div className="flex justify-between items-center">
                            <span className="text-[12px] font-bold text-white group-hover:text-indigo-400 transition-colors uppercase">{r}</span>
                            <span className="text-[9px] font-black text-slate-600 uppercase">Download PDF</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>
    </div>
  );
};

export default OwnerDashboard;
