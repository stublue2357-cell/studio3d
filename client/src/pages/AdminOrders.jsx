import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllOrdersAdmin, updateOrderStatus } from '../api';
import '@google/model-viewer';

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
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error(err); 
      setOrders([]);
    }
    finally { setLoading(false); }
  };

  const handleStatusChange = async (id, newStatus, newPrice = null, feedback = null) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { status: newStatus };
      if (newPrice !== null) payload.totalAmount = Number(newPrice);
      if (feedback !== null) payload.adminFeedback = feedback;
      
      await updateOrderStatus(id, payload, token);
      fetchOrders();
    } catch (err) { alert("PROTOCOL_ERROR"); }
  };

  const handleClaim = async (id) => {
    try {
      const token = localStorage.getItem('token');
      let user = null;
      try {
        user = userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        console.error("USER_PARSE_ERROR", e);
      }
      
      if (!user) return alert("AUTH_ERROR // RE-LOGIN_REQUIRED");

      const payload = { handledBy: user._id };
      await updateOrderStatus(id, payload, token);
      fetchOrders();
    } catch (err) { alert("CLAIM_ERROR // LINK_FAILED"); }
  };

  // 👉 Invoice Open Logic
  const openInvoice = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    if (!order) return false;
    const matchesSearch = (order._id || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
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
              <th className="py-5 px-4 italic">Agent</th>
              <th className="py-5 px-6 text-right italic">Protocol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {loading ? (
              <tr><td colSpan="6" className="py-20 text-center text-indigo-400 animate-pulse tracking-[0.5em]">Syncing_Mainframe...</td></tr>
            ) : filteredOrders.map((order) => (
              <tr key={order._id} className="hover:bg-white/[0.01] transition-colors">
                <td className="py-4 px-6 text-indigo-400 font-mono">#{ (order?._id || "SIM_NODE").slice(-6) }</td>
                <td className="py-4 px-4 text-white font-black">{order.user?.name || "Guest_Node"}</td>
                <td className="py-4 px-4 text-white text-[12px] font-black italic">${Number(order.totalAmount || 0).toFixed(2)}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded-md text-[7px] font-black border ${
                    order.status === 'Review' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                    order.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    order.status === 'Rejected' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {order.handledBy ? (
                    <span className="text-indigo-400 text-[8px] font-black uppercase tracking-widest">
                      {typeof order.handledBy === 'object' ? (order.handledBy?.name || "ACTIVE_ADMIN") : "ASSIGNED_AGENT"}
                    </span>
                  ) : (
                    <button 
                      onClick={() => handleClaim(order._id)}
                      className="bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 text-[7px] px-2 py-1 rounded hover:bg-indigo-600 hover:text-white transition-all font-black"
                    >
                      CLAIM_NODE
                    </button>
                  )}
                </td>
                <td className="py-4 px-6 text-right space-x-4">
                  <button onClick={() => openInvoice(order)} className="text-indigo-400 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest">Protocol_Details</button>
                  <select 
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="bg-black/60 border border-white/10 text-[8px] p-2 rounded-lg text-slate-400 outline-none font-black"
                    value={order.status}
                  >
                    <option value="Review">IN_REVIEW</option>
                    <option value="Approved">APPROVE_DESIGN</option>
                    <option value="Rejected">REJECT_DESIGN</option>
                    <option value="Processing">SET_PROCESSING</option>
                    <option value="Shipped">SET_SHIPPED</option>
                    <option value="Delivered">SET_DELIVERED</option>
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
                  {selectedOrder.handledBy && (
                    <div className="text-indigo-400 text-[8px] font-black uppercase mt-1">Assigned Agent: {selectedOrder.handledBy.name}</div>
                  )}
                  <div className="flex items-center justify-end gap-3 mt-4">
                     <span className="text-slate-500 text-[9px] uppercase font-black">Price:</span>
                     <input 
                        type="number" 
                        defaultValue={selectedOrder.totalAmount}
                        onBlur={(e) => handleStatusChange(selectedOrder._id, selectedOrder.status, e.target.value)}
                        className="bg-white/5 border border-white/10 text-white text-xl font-black italic w-24 text-right px-2 rounded-lg outline-none focus:border-indigo-500"
                     />
                     <span className="text-white text-xl font-black italic">.00</span>
                  </div>
                </div>
              </div>

              {selectedOrder.customerNote && (
                <div className="mb-12 relative z-10 p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl">
                   <h4 className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                     User_Intelligence / Note
                   </h4>
                   <p className="text-[11px] text-slate-300 font-medium italic leading-relaxed">
                     "{selectedOrder.customerNote}"
                   </p>
                </div>
              )}

              <div className="relative z-10">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Payload_Intel</h4>
                <div className="grid grid-cols-1 gap-4 max-h-[250px] overflow-y-auto pr-4">
                  {(selectedOrder?.products || []).map((item, idx) => (
                    <div key={idx} className="flex flex-col bg-white/[0.03] p-6 rounded-3xl border border-white/5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img src={item.product?.imageUrl} className="w-12 h-12 rounded-lg object-cover border border-white/10" alt="" />
                          <div>
                            <div className="text-white text-[11px] font-black uppercase">{item.product?.name}</div>
                            <div className="text-slate-500 text-[8px] uppercase font-bold">Qty: {item.quantity} // Size: {item.size || 'M'}</div>
                          </div>
                        </div>
                            <div className="text-white text-[11px] font-black italic">${(item.product?.price || 49) * item.quantity}.00</div>
                          </div>
    
                          {/* --- CUSTOM DESIGN PREVIEW (3D VIEW) --- */}
                          {item.customDesign?.data && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                               <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                 <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                 Live_Neural_3D_Preview ({item.customDesign?.type || 'STANDARD'})
                               </p>
                               <div className="flex flex-col md:flex-row gap-6">
                                 {/* Flat Texture / Color View */}
                                 <div className="aspect-square w-full max-w-[150px] rounded-2xl overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center">
                                    {(() => {
                                        const designData = item.customDesign?.data;
                                        const actualData = typeof designData === 'object' ? (designData.overlayImage || designData.aiImage) : designData;
                                        
                                        if (typeof actualData === 'string' && actualData.startsWith('#')) {
                                            return <div className="w-full h-full" style={{ backgroundColor: actualData }} />;
                                        }
                                        return <img src={actualData || '/placeholder_design.png'} className="w-full h-full object-cover" alt="Texture" />;
                                    })()}
                                 </div>
                                 
                                 {/* 3D Model View */}
                                 <div className="flex-grow h-[220px] rounded-2xl overflow-hidden border border-white/10 bg-black/60 relative group">
                                    <model-viewer
                                      src="/shirt_baked.glb"
                                      camera-controls
                                      auto-rotate
                                      shadow-intensity="1"
                                      style={{ width: '100%', height: '100%' }}
                                      onLoad={(e) => {
                                        const mv = e.target;
                                        if (mv.model) {
                                          const designData = item.customDesign?.data;
                                          const actualData = typeof designData === 'object' ? (designData.overlayImage || designData.aiImage) : designData;

                                          if (typeof actualData === 'string' && actualData.startsWith('data:image')) {
                                            mv.createTexture(actualData).then(tex => {
                                              for (const mat of mv.model.materials) {
                                                if (mat.pbrMetallicRoughness.baseColorTexture) {
                                                    mat.pbrMetallicRoughness.baseColorTexture.setTexture(tex);
                                                }
                                                mat.pbrMetallicRoughness.setBaseColorFactor([1,1,1,1]);
                                              }
                                            }).catch(e => console.error("TEX_ERROR", e));
                                          } else if (typeof actualData === 'string' && actualData.startsWith('#')) {
                                            // Apply solid color to 3D model
                                            const hex = actualData;
                                            try {
                                              const r = parseInt(hex.slice(1,3), 16) / 255 || 1;
                                              const g = parseInt(hex.slice(3,5), 16) / 255 || 1;
                                              const b = parseInt(hex.slice(5,7), 16) / 255 || 1;
                                              for (const mat of mv.model.materials) {
                                                mat.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
                                              }
                                            } catch (e) {
                                              console.error("COLOR_PARSE_ERROR", e);
                                            }
                                          }
                                        }
                                      }}
                                    />
                                    <div className="absolute top-2 right-2 text-[6px] font-black uppercase text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 px-2 py-1 rounded">Interactive_Node</div>
                                 </div>
                               </div>
                            </div>
                          )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 relative z-10">
                <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  Admin_Response_Protocol
                </h4>
                <textarea 
                  defaultValue={selectedOrder.adminFeedback}
                  onBlur={(e) => handleStatusChange(selectedOrder._id, selectedOrder.status, null, e.target.value)}
                  placeholder="ENTER DECISION RATIONALE OR FEEDBACK FOR THE USER..."
                  className="w-full h-24 bg-white/[0.03] border border-white/10 p-5 rounded-2xl text-[10px] text-white outline-none focus:border-indigo-500 transition-all resize-none font-medium placeholder:text-slate-700"
                />
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