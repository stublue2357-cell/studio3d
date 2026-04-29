import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import AdminProducts from './AdminProducts'; 
import AdminOrders from './AdminOrders'; 
import ProfileSettings from './ProfileSettings';
import { getAllOrdersAdmin } from '../api';

// --- SECURITY SETTINGS MODULE ---
const SecuritySettings = () => (
  <div className="space-y-6">
    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-6">Security // Access Control</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {['Encryption Status: AES-256', '2FA Authorization: Active', 'Last Secure Sync: 2m ago', 'Active Sessions: 1'].map((item, i) => (
        <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400">{item}</span>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      ))}
    </div>
  </div>
);

// --- ADVANCED ANALYTICS MODULE ---
const AnalyticsData = ({ orders }) => {
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  // Chart Data: Last 7 transmissions
  const chartData = orders.slice(0, 7).map(o => ({
    name: o._id.slice(-4),
    amt: o.totalAmount
  })).reverse();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Revenue', value: `$${totalRevenue}`, color: 'text-blue-500' },
          { label: 'Active Signals', value: orders.length, color: 'text-cyan-400' },
          { label: 'Pending Synthesis', value: pendingOrders, color: 'text-amber-400' }
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-[2rem] border border-white/5 bg-black/40 shadow-[0_0_20px_rgba(59,130,246,0.05)]">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1 block">{stat.label}</span>
            <h4 className={`text-2xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</h4>
          </div>
        ))}
      </div>

      {/* --- REVENUE GRAPH --- */}
      <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-black/40 h-[300px] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <h1 className="text-6xl font-black italic text-blue-500">DATA</h1>
        </div>
        <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] mb-6">Transmission Flow // Revenue Stream</h4>
        <ResponsiveContainer width="100%" height="80%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ background: '#000', border: '1px solid #3b82f6', borderRadius: '10px', fontSize: '10px' }}
              itemStyle={{ color: '#3b82f6' }}
            />
            <Area type="monotone" dataKey="amt" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    const syncMainframe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        const { data } = await getAllOrdersAdmin(token);
        setOrders(data);
        setConnectionError(null);
      } catch (err) {
        setConnectionError("CONNECTION_LOST // RECHECK_API_ENDPOINTS");
      } finally { setLoading(false); }
    };
    syncMainframe();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('isAdmin');
    navigate('/login');
  };

  const adminTabs = [
    { id: 'orders', label: 'Live Orders', section: 'Operations' },
    { id: 'products', label: 'Inventory', section: 'Operations' },
    { id: 'analytics', label: 'Metrics', section: 'Data' },
    { id: 'identity', label: 'Identity', section: 'Data', restricted: true },
    { id: 'settings', label: 'Config', section: 'Data' },
  ];

  const myRole = localStorage.getItem('role');

  const filteredTabs = adminTabs.filter(tab => {
    if (tab.restricted) return ['developer', 'owner', 'sub-owner'].includes(myRole);
    return true;
  });

  return (
    <div className="relative min-h-screen pt-20 pb-10 flex flex-col lg:flex-row max-w-[1700px] mx-auto w-full px-4 gap-6 bg-[#020617]">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      {/* --- SIDEBAR --- */}
      <aside className="w-full lg:w-[240px] shrink-0 glass-panel rounded-[2rem] p-6 flex flex-col gap-8 border-white/5 h-fit bg-black/60 backdrop-blur-2xl sticky top-24 z-10">
        <div>
          <div className="mb-8">
            <span className="text-blue-500 text-[7px] font-black tracking-[0.6em] uppercase mb-1 block animate-pulse">Root_Access</span>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">
              Admin <span className="text-blue-500">Node</span>
            </h2>
          </div>
          
          <div className="space-y-6">
            {['Operations', 'Data'].map((section) => (
              <div key={section}>
                <h4 className="text-[8px] font-black text-slate-600 uppercase tracking-[0.4em] mb-3 pl-2">{section}</h4>
                <nav className="flex flex-col gap-1.5">
                  {filteredTabs.filter(t => t.section === section).map(tab => (
                    <button 
                      key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`text-left px-5 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'text-slate-500 hover:text-white hover:bg-white/5 border border-transparent'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleLogout} className="py-4 px-6 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[8px] font-black uppercase text-rose-500 hover:bg-rose-500 hover:text-white transition-all tracking-widest">
          Terminate Session
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 w-full bg-black/40 rounded-[2.5rem] border border-white/5 p-6 md:p-8 min-h-[85vh] backdrop-blur-md relative z-10">
        
        {connectionError && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-widest animate-bounce">
            ⚠️ {connectionError}
          </div>
        )}

        <div className="mb-8 pb-4 border-b border-white/5 flex justify-between items-end">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 leading-none mb-1">
              {adminTabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-slate-600 text-[7px] uppercase tracking-widest font-bold italic">Authorized Admin Node // ST3D-V1</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${connectionError ? 'bg-rose-500' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'}`} />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
              {connectionError ? 'System_Error' : 'Live_System_Active'}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {activeTab === 'orders' && <AdminOrders isEmbedded={true} />}
            {activeTab === 'products' && <AdminProducts isEmbedded={true} />}
            {activeTab === 'analytics' && <AnalyticsData orders={orders} />}
            {activeTab === 'identity' && <UserManagement isEmbedded={true} />}
            {activeTab === 'settings' && <ProfileSettings />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;