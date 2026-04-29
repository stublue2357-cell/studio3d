import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import AdminProducts from './AdminProducts'; 
import AdminOrders from './AdminOrders'; 
import UserManagement from './UserManagement';
import ProfileSettings from './ProfileSettings';
import { getAllOrdersAdmin } from '../api';

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('system');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await getAllOrdersAdmin(token);
        setOrders(data);
      } catch (err) {
        console.error("SYNC_ERROR", err);
      } finally { setLoading(false); }
    };
    fetchData();

    // Simulated logs for developer aesthetic
    const logInterval = setInterval(() => {
      const messages = [
        "DB_SYNC: OK", "API_REQUEST: /api/orders", "WEBSOCKET_CONNECTED", 
        "CACHE_HIT: users_list", "SSL_VERIFIED", "WORKER_PROCESS: 7283"
      ];
      const newLog = `[${new Date().toLocaleTimeString()}] ${messages[Math.floor(Math.random() * messages.length)]}`;
      setLogs(prev => [newLog, ...prev].slice(0, 5));
    }, 3000);

    return () => clearInterval(logInterval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const tabs = [
    { id: 'system', label: 'System Overview', icon: '⚡' },
    { id: 'users', label: 'Node Management', icon: '👥' },
    { id: 'orders', label: 'Transmission Logs', icon: '📦' },
    { id: 'settings', label: 'Security & Profile', icon: '🛡️' },
    { id: 'config', label: 'Kernel Config', icon: '⚙️' },
  ];

  return (
    <div className="relative min-h-screen pt-24 pb-12 bg-[#020617] text-slate-300 font-mono">
      
      {/* Matrix-like Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="max-w-[1600px] mx-auto px-6 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* --- DEV SIDEBAR --- */}
        <aside className="w-full lg:w-[300px] shrink-0 space-y-6">
          <div className="glass-panel p-8 rounded-[2rem] border-indigo-500/20 bg-black/60 backdrop-blur-3xl shadow-[0_0_50px_rgba(79,70,229,0.1)]">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                <span className="text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase">Super_User_Access</span>
              </div>
              <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
                DEV<span className="text-indigo-500">_CORE</span>
              </h2>
            </div>

            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-6 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-between group ${
                    activeTab === tab.id 
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                    : 'hover:bg-white/5 text-slate-500 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="opacity-50">{tab.icon}</span>
                    {tab.label}
                  </span>
                  <span className={`w-1 h-1 rounded-full bg-indigo-500 transition-transform ${activeTab === tab.id ? 'scale-150' : 'scale-0'}`} />
                </button>
              ))}
            </nav>

            <div className="mt-12 pt-8 border-t border-white/5">
              <div className="text-[9px] text-slate-600 mb-4 tracking-widest uppercase">Live Activity Logs</div>
              <div className="space-y-2">
                {logs.map((log, i) => (
                  <div key={i} className="text-[8px] text-indigo-500/60 font-mono overflow-hidden whitespace-nowrap">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleLogout} className="w-full mt-8 py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-[9px] font-black uppercase text-rose-500 hover:bg-rose-500 hover:text-white transition-all tracking-[0.3em]">
              Kill_Process
            </button>
          </div>
        </aside>

        {/* --- DEV MAIN CONTENT --- */}
        <main className="flex-1 space-y-8">
          
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'CPU Usage', val: '24%', color: 'text-indigo-400' },
              { label: 'Latency', val: '12ms', color: 'text-emerald-400' },
              { label: 'Active Sockets', val: '1,204', color: 'text-blue-400' },
              { label: 'Memory', val: '4.2GB', color: 'text-amber-400' },
            ].map((s, i) => (
              <div key={i} className="glass-panel p-6 rounded-3xl border-white/5 bg-black/40">
                <div className="text-[8px] uppercase tracking-widest text-slate-500 mb-1">{s.label}</div>
                <div className={`text-xl font-black italic ${s.color}`}>{s.val}</div>
              </div>
            ))}
          </div>

          <div className="glass-panel p-8 rounded-[3rem] border-white/5 bg-black/40 backdrop-blur-md min-h-[70vh]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full"
              >
                {activeTab === 'system' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">System_Analytics</h3>
                      <div className="px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] text-indigo-400">STATUS: OPTIMAL</div>
                    </div>
                    
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={orders.slice(0, 10).map((o, i) => ({ n: i, v: o.totalAmount }))}>
                          <defs>
                            <linearGradient id="devGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Tooltip contentStyle={{ background: '#000', border: '1px solid #4f46e5', color: '#fff', fontSize: '10px' }} />
                          <Area type="monotone" dataKey="v" stroke="#6366f1" fill="url(#devGradient)" strokeWidth={4} dot={{ r: 4, fill: '#6366f1' }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                        <h4 className="text-[10px] font-black uppercase mb-4 text-slate-500">API Traffic Pulse</h4>
                        <div className="h-[150px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[{n: 'Mon', v: 40}, {n: 'Tue', v: 30}, {n: 'Wed', v: 60}, {n: 'Thu', v: 80}, {n: 'Fri', v: 50}]}>
                              <Bar dataKey="v" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-center">
                        <div className="text-center">
                          <div className="text-4xl font-black text-white mb-2">99.9%</div>
                          <div className="text-[10px] uppercase tracking-widest text-slate-500">Uptime Reliability</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'users' && <UserManagement isEmbedded={true} />}
                {activeTab === 'orders' && <AdminOrders isEmbedded={true} />}
                {activeTab === 'settings' && <ProfileSettings />}
                
                {activeTab === 'config' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-black uppercase italic text-white">Kernel_Configuration</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Production Mode", status: "ENABLED", color: "text-emerald-400" },
                        { label: "SSL Termination", status: "ACTIVE", color: "text-emerald-400" },
                        { label: "Auto-Scale Workers", status: "DISABLED", color: "text-rose-400" },
                        { label: "AI Synthesis Engine", status: "V2.4_READY", color: "text-indigo-400" }
                      ].map((cfg, i) => (
                        <div key={i} className="flex justify-between items-center p-6 rounded-2xl bg-white/5 border border-white/10">
                          <span className="text-[11px] font-bold uppercase tracking-widest">{cfg.label}</span>
                          <span className={`text-[10px] font-black ${cfg.color}`}>{cfg.status}</span>
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

export default DeveloperDashboard;
