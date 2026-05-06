import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Products from './Products.jsx'; 
import ProfileSettings from './ProfileSettings';
import DesignLab from './DesignLab.jsx';
import { getMyOrders, getMyActivity, getSessions } from '../api';

// --- MODULE 1: ORDER LOG (With Invoice Trigger) ---
const OrderHistory = ({ orders, loading, onOpenInvoice }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
      <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">Transmission <span className="text-blue-500">History</span></h3>
    </div>

    {loading ? (
      <div className="py-20 text-center text-blue-500 text-[10px] font-black tracking-[0.5em] animate-pulse">DECRYPTING_SIGNALS...</div>
    ) : orders.length === 0 ? (
      <div className="glass-panel rounded-3xl p-16 border-white/5 bg-white/[0.02] text-center border-dashed border-2">
        <div className="text-slate-600 text-[10px] font-black tracking-widest uppercase">No transaction records found in this node.</div>
      </div>
    ) : (
      <div className="space-y-4">
        {orders.map((order) => (
          <motion.div key={order._id} className="glass-panel rounded-2xl p-6 border border-white/5 bg-black/40 flex justify-between items-center group hover:border-blue-500/30 transition-all">
            <div className="flex items-center gap-6">
              <div className="text-left">
                <span className="text-[8px] font-black text-blue-500 uppercase block mb-1">NODE_ID: {(order?._id || "SIM_NODE").slice(-8)}</span>
                <h4 className="text-xs font-black text-white uppercase">{new Date(order.createdAt).toLocaleDateString()}</h4>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-right">
                <span className="text-lg font-black text-white italic block">${Number(order?.totalAmount || 0).toFixed(2)}</span>
                <div className="flex flex-col items-end">
                   <span className={`text-[8px] font-black uppercase tracking-widest ${
                     order.status === 'Review' ? 'text-amber-500' : 
                     order.status === 'Approved' ? 'text-emerald-500' : 
                     order.status === 'Rejected' ? 'text-rose-500' : 'text-blue-500'
                   }`}>
                     Status: {order.status}
                   </span>
                   {order.status === 'Approved' && order.paymentStatus === 'Unpaid' && (
                     <span className="text-[7px] text-cyan-400 font-black uppercase animate-pulse mt-1">Ready for Payment</span>
                   )}
                </div>
              </div>
              <div className="flex gap-2">
                {order.status === 'Approved' && order.paymentStatus === 'Unpaid' && (
                  <button className="px-5 py-2.5 bg-emerald-600 border border-emerald-500/50 rounded-xl text-[9px] font-black uppercase text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all">
                    Secure Payment
                  </button>
                )}
                <button 
                  onClick={() => onOpenInvoice(order)}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase text-slate-400 hover:text-white hover:bg-blue-600 transition-all"
                >
                  Details
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);


// --- MODULE 2: ACTIVITY LOG ---
const ActivityLog = ({ activities, loading }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
      <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">Signal <span className="text-blue-500">Log</span></h3>
    </div>

    {loading ? (
      <div className="py-20 text-center text-blue-500 text-[10px] font-black tracking-[0.5em] animate-pulse">RECONSTRUCTING_DATA...</div>
    ) : activities.length === 0 ? (
      <div className="glass-panel rounded-3xl p-16 border-white/5 bg-white/[0.02] text-center border-dashed border-2">
        <div className="text-slate-600 text-[10px] font-black tracking-widest uppercase">No activity signatures detected.</div>
      </div>
    ) : (
      <div className="space-y-4">
        {activities.map((activity) => (
          <motion.div key={activity._id} className="glass-panel rounded-2xl p-5 border border-white/5 bg-black/40 flex gap-6 items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-lg shrink-0">
               {activity.action.includes('LOGIN') ? '🔐' : activity.action.includes('DESIGN') ? '🎨' : '📦'}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{activity.action}</span>
                <span className="text-[8px] text-slate-600 uppercase">{new Date(activity.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{activity.details}</p>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);


// --- MODULE 3: SHIPPING PROTOCOL ---
const BillingSettings = () => (
  <div className="max-w-2xl space-y-8 animate-in fade-in duration-500">
    <div className="mb-8 border-b border-white/5 pb-4">
      <h3 className="text-2xl font-black italic uppercase text-white">Shipping <span className="text-blue-500">Protocol</span></h3>
    </div>
    <div className="space-y-6">
      <textarea className="w-full h-32 bg-white/5 border border-white/10 p-5 rounded-2xl text-white text-xs outline-none focus:border-blue-500 resize-none" placeholder="Enter Full Destination Address..." />
      <button className="py-4 px-10 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">Save Destination</button>
    </div>
  </div>
);

// --- MAIN DASHBOARD COMPONENT ---
// --- MODULE 3: NEURAL VAULT (Draft Management) ---
const NeuralVault = ({ sessions, loading }) => (
  <div className="space-y-6 animate-in fade-in duration-500">
    <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
      <h3 className="text-xl font-black italic uppercase text-white tracking-tighter">Neural <span className="text-blue-500">Vault</span></h3>
    </div>

    {loading ? (
      <div className="py-20 text-center text-blue-500 text-[10px] font-black tracking-[0.5em] animate-pulse">SYNCHRONIZING_DRAFTS...</div>
    ) : sessions.length === 0 ? (
      <div className="glass-panel rounded-3xl p-16 border-white/5 bg-white/[0.02] text-center border-dashed border-2">
        <div className="text-slate-600 text-[10px] font-black tracking-widest uppercase">No neural snapshots found.</div>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sessions.map((session) => (
          <motion.div key={session._id} className="glass-panel rounded-2xl p-4 border border-white/5 bg-black/40 hover:border-blue-500/30 transition-all flex gap-4 items-center group">
            <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
               {session.thumbnail ? (
                 <img src={session.thumbnail} alt="" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-xl">🎨</span>
               )}
            </div>
            <div className="flex-1 min-w-0">
               <h4 className="text-[10px] font-black text-white uppercase truncate">{session.name || "Unnamed Design"}</h4>
               <p className="text-[8px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">{session.baseType || "Apparel"} Protocol</p>
               <span className="text-[7px] text-slate-600 block mt-1">{new Date(session.updatedAt).toLocaleString()}</span>
            </div>
            <button className="px-4 py-2 bg-blue-600/10 border border-blue-500/30 rounded-lg text-[8px] font-black uppercase text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
               RESUME
            </button>
          </motion.div>
        ))}
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [orders, setOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const [orderRes, activityRes, sessionRes] = await Promise.all([
            getMyOrders(token),
            getMyActivity(token),
            getSessions(token)
          ]);
          setOrders(Array.isArray(orderRes.data) ? orderRes.data : []);
          setActivities(Array.isArray(activityRes.data) ? activityRes.data : []);
          setSessions(Array.isArray(sessionRes.data) ? sessionRes.data : []);
        }
      } catch (error) { console.error("Signal Lost:", error); }
      finally { 
        setLoading(false); 
        setActivityLoading(false);
        setSessionsLoading(false);
      }
    };
    fetchSignals();
  }, []);

  const openInvoice = (order) => {
    setSelectedOrder(order);
    setIsInvoiceOpen(true);
  };

  const sidebarTabs = [
    { id: 'lab', label: 'Design Lab', section: 'Creation' },
    { id: 'drafts', label: 'Neural Drafts', section: 'Creation' },
    { id: 'collection', label: 'Vault', section: 'Creation' },
    { id: 'orders', label: 'History', section: 'Account' },
    { id: 'activity', label: 'Signal Log', section: 'Account' },
    { id: 'profile', label: 'Security & Profile', section: 'Account' },
    { id: 'billing', label: 'Destination', section: 'Account' },
  ];

  return (
    <div className="relative min-h-screen pt-32 pb-20 flex flex-col lg:flex-row max-w-[1700px] mx-auto w-full px-6 gap-10 bg-[#020617]">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[150px] rounded-full" />
      </div>

      <aside className="w-full lg:w-[280px] shrink-0 glass-panel rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 bg-black/40 backdrop-blur-3xl border-white/5 h-fit lg:sticky top-24 md:top-32 z-20">
        <h2 className="text-2xl md:text-3xl font-black italic uppercase mb-6 md:mb-10 text-white leading-none">User <span className="text-blue-500">Node</span></h2>
        <div className="flex lg:flex-col gap-8 md:gap-10 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-hide no-scrollbar">
          {['Creation', 'Account'].map((section) => (
            <div key={section} className="shrink-0 lg:shrink">
              <h4 className="text-[8px] md:text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] md:tracking-[0.5em] mb-4 pl-2">{section}</h4>
              <nav className="flex lg:flex-col gap-2">
                {sidebarTabs.filter(t => t.section === section).map(tab => (
                  <button 
                    key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap text-left px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'text-slate-500 hover:text-white border border-transparent'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>

      <main className={`flex-1 w-full bg-black/40 rounded-[3.5rem] border border-white/5 min-h-[75vh] backdrop-blur-md relative z-10 shadow-2xl overflow-hidden transition-all duration-500 ${activeTab === 'lab' ? 'p-0' : 'p-8 md:p-12'}`}>
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
            {activeTab === 'lab' && <DesignLab />}
            {activeTab === 'drafts' && <div className="p-8"><NeuralVault sessions={sessions} loading={sessionsLoading} /></div>}
            {activeTab === 'collection' && <div className="p-8"><Products isDashboard={true} /></div>}
            {activeTab === 'orders' && <div className="p-8"><OrderHistory orders={orders} loading={loading} onOpenInvoice={openInvoice} /></div>}
            {activeTab === 'activity' && <div className="p-8"><ActivityLog activities={activities} loading={activityLoading} /></div>}
            {activeTab === 'profile' && <div className="p-8"><ProfileSettings /></div>}
            {activeTab === 'billing' && <div className="p-8"><BillingSettings /></div>}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --- DIGITAL PROTOCOL MODAL (INVOICE) --- */}
      <AnimatePresence>
        {isInvoiceOpen && selectedOrder && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-3xl bg-[#050507] border border-white/10 p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">Order <span className="text-blue-500">Protocol</span></h3>
                <button onClick={() => setIsInvoiceOpen(false)} className="text-slate-500 hover:text-white text-4xl">&times;</button>
              </div>

              <div className="grid grid-cols-2 gap-8 mb-10 text-[10px] uppercase font-bold tracking-widest">
                <div className="space-y-2">
                  <p className="text-slate-500">Transmission Date: <span className="text-white ml-2">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span></p>
                  <p className="text-slate-500">ID Node: <span className="text-white ml-2">#{(selectedOrder?._id || "SIM_NODE").slice(-8)}</span></p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-slate-500">Status Node: <span className="text-blue-500 ml-2">{selectedOrder.status}</span></p>
                  <p className="text-white text-xl font-black italic mt-2">${selectedOrder.totalAmount}.00</p>
                </div>
              </div>

              <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 mb-8 custom-scrollbar">
                {(selectedOrder?.products || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white/[0.03] p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <img src={item.product?.imageUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                      <span className="text-white text-[10px] font-black uppercase">{item.product?.name}</span>
                    </div>
                    <span className="text-slate-500 text-[9px]">Qty: {item.quantity || 1}</span>
                  </div>
                ))}
              </div>

              {/* Message Exchange Log */}
              <div className="space-y-4 mb-8">
                {selectedOrder.customerNote && (
                  <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">Your Submission Note</p>
                    <p className="text-[10px] text-slate-300 italic font-medium leading-relaxed">"{selectedOrder.customerNote}"</p>
                  </div>
                )}

                {selectedOrder.adminFeedback && (
                  <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[8px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                        Admin Feed / Reply
                      </p>
                      {selectedOrder.handledBy && (
                        <span className="text-[7px] text-blue-300/50 uppercase font-bold tracking-widest">Handled by {selectedOrder.handledBy.name}</span>
                      )}
                    </div>
                    <p className="text-[10px] text-white font-bold tracking-wide leading-relaxed">
                      {selectedOrder.adminFeedback}
                    </p>
                  </div>
                )}
              </div>

              <button onClick={() => window.print()} className="w-full py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all">
                Download Invoice Protocol
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;