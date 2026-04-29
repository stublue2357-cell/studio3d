import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllOrdersAdmin, updateOrderStatus } from '../api';

const AdminOrders = ({ isEmbedded }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null); // 👉 Invoice Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await getAllOrdersAdmin(token);
      setOrders(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await updateOrderStatus(id, newStatus, token);
      fetchOrders();
    } catch (err) { alert("PROTOCOL_ERROR"); }
  };

  // 👉 Invoice Open Logic
  const openInvoice = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`w-full ${!isEmbedded ? 'min-h-screen pt-32 pb-20 px-6' : ''}`}>
      
      {/* Search & Filter Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 px-4 gap-4">
        <h2 className="text-xl font-black italic uppercase text-white tracking-tighter">Live <span className="text-indigo-400">Transmissions</span></h2>
        <div className="flex gap-4 w-full md:w-auto">
          <input 
            type="text" placeholder="SEARCH_BY_ID_OR_NAME..." 
            className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[9px] font-bold text-white outline-none focus:border-indigo-500 transition-all w-full md:w-64"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-[9px] font-bold text-slate-400 outline-none"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All_Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-[2rem] border border-white/5 bg-black/40 overflow-hidden shadow-2xl backdrop-blur-md">
        <table className="w-full text-left text-[10px] font-bold uppercase tracking-widest border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02] text-slate-500">
              <th className="py-5 px-6 italic">Node_ID</th>
              <th className="py-5 px-4 italic">Identity</th>
              <th className="py-5 px-4 italic">Value</th>
              <th className="py-5 px-4 italic">Status</th>
              <th className="py-5 px-6 text-right italic">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {loading ? (
              <tr><td colSpan="5" className="py-20 text-center text-indigo-400 animate-pulse tracking-[0.5em]">Syncing_Mainframe...</td></tr>
            ) : filteredOrders.map((order) => (
              <tr key={order._id} className="hover:bg-white/[0.01] transition-colors">
                <td className="py-4 px-6 text-indigo-400 font-mono">#{order._id.slice(-6)}</td>
                <td className="py-4 px-4 text-white font-black">{order.user?.name || "Guest_Node"}</td>
                <td className="py-4 px-4 text-white text-[12px] font-black italic">${order.totalAmount}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-md text-[7px] font-black border ${order.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right space-x-4">
                  {/* 👉 Digital Protocol Button */}
                  <button onClick={() => openInvoice(order)} className="text-indigo-400 hover:text-white transition-all text-[9px] underline underline-offset-4">Details</button>
                  <select 
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="bg-black/60 border border-white/10 text-[8px] p-2 rounded-lg text-slate-400 outline-none"
                    value={order.status}
                  >
                    <option value="Pending">Set_Pending</option>
                    <option value="Shipped">Set_Shipped</option>
                    <option value="Delivered">Set_Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- DIGITAL PROTOCOL MODAL (INVOICE) --- */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-4xl bg-[#050507] border border-white/10 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
              
              {/* Watermark */}
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none select-none">
                <h1 className="text-[120px] font-black italic uppercase text-white">PROTOCOL</h1>
              </div>

              <div className="flex justify-between items-start mb-12 relative z-10">
                <div>
                  <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Digital <span className="text-indigo-400">Protocol</span></h3>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.4em]">Transaction_ID: {selectedOrder._id}</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white text-4xl">&times;</button>
              </div>

              <div className="grid grid-cols-2 gap-12 relative z-10 mb-12">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">User_Identity</h4>
                  <div className="text-white text-sm font-black">{selectedOrder.user?.name}</div>
                  <div className="text-slate-500 text-[10px] lowercase">{selectedOrder.user?.email}</div>
                  <div className="text-slate-400 text-[9px] leading-relaxed uppercase font-bold tracking-widest mt-4">
                    Destination: {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city} <br />
                    Phone: {selectedOrder.shippingAddress?.phone}
                  </div>
                </div>
                <div className="space-y-4 text-right">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Status_Node</h4>
                  <div className="text-indigo-400 text-sm font-black italic tracking-widest uppercase">{selectedOrder.status}</div>
                  <div className="text-slate-500 text-[9px] uppercase font-bold tracking-widest">Method: {selectedOrder.paymentMethod}</div>
                  <div className="text-white text-2xl font-black italic mt-4">${selectedOrder.totalAmount}.00</div>
                </div>
              </div>

              <div className="relative z-10">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Payload_Intel</h4>
                <div className="grid grid-cols-1 gap-4 max-h-[250px] overflow-y-auto pr-4">
                  {selectedOrder.products.map((item, idx) => (
                    <div key={idx} className="flex flex-col bg-white/[0.03] p-6 rounded-3xl border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={item.product?.imageUrl} className="w-12 h-12 rounded-lg object-cover border border-white/10" alt="" />
                          <div>
                            <div className="text-white text-[11px] font-black uppercase">{item.product?.name}</div>
                            <div className="text-slate-500 text-[8px] uppercase font-bold">Qty: {item.quantity} // Size: {item.size || 'M'}</div>
                          </div>
                        </div>
                        <div className="text-white text-[11px] font-black italic">${item.product?.price * item.quantity}.00</div>
                      </div>

                      {/* --- CUSTOM DESIGN PREVIEW --- */}
                      {item.customDesign?.data && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                           <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                             <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                             Custom_Design_Output ({item.customDesign.type})
                           </p>
                           <div className="aspect-square w-full max-w-[200px] rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                              <img src={item.customDesign.data} className="w-full h-full object-cover" alt="Custom Design" />
                           </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={() => window.print()} className="mt-12 w-full py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.5em] hover:bg-indigo-600 hover:text-white transition-all shadow-2xl">
                Execute Hard_Copy Print
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;