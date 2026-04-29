import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addProduct, getProducts, updateProduct, deleteProduct } from '../api'; 

const AdminProducts = ({ isEmbedded }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [formData, setFormData] = useState({ 
    name: '', price: '', category: 'Hoodies', stock: '', image: '', 
    longDesc: '', specs: '', modelUrl: '' 
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await getProducts();
      setProducts(data);
    } catch (error) { console.error("Sync Error:", error); }
    finally { setLoading(false); }
  };

  const handleEdit = (p) => {
    setEditMode(true);
    setSelectedId(p._id);
    setFormData({
      name: p.name, price: p.price, category: p.category, stock: p.stock,
      image: p.imageUrl, longDesc: p.longDescription || '', 
      specs: p.specs?.join(', ') || '',
      modelUrl: p.modelUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { 
        ...formData, 
        price: Number(formData.price), 
        stock: Number(formData.stock),
        specs: formData.specs ? formData.specs.split(',').map(s => s.trim()) : []
      };
      
      if (editMode) await updateProduct(selectedId, payload, token);
      else await addProduct(payload, token);
      
      fetchProducts();
      closeModal();
    } catch (err) { alert("TRANSMISSION_FAILED"); }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setEditMode(false);
      setFormData({ name: '', price: '', category: 'Hoodies', stock: '', image: '', longDesc: '', specs: '', modelUrl: '' });
    }, 200); // Animation smooth karne ke liye
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setFormData({ ...formData, image: reader.result });
    }
  };

  const handleModelChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file); // GLB file ko Base64 banaye ga
      reader.onloadend = () => setFormData({ ...formData, modelUrl: reader.result });
    }
  };

  return (
    <div className={`w-full ${!isEmbedded ? 'min-h-screen pt-24 pb-10 px-6' : 'p-0'}`}>
      
      {/* --- HEADER (Exactly like Orders) --- */}
      <div className="flex justify-between items-center mb-8 px-4">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            Inventory <span className="text-indigo-400">Archive</span>
          </h2>
          <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.4em]">ROOT_ACCESS // SIGNAL_CONTROL</p>
        </div>
        <button onClick={() => { setEditMode(false); setIsModalOpen(true); }} className="px-6 py-3 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-white hover:text-black transition-all shadow-lg">
          + Synthesize Signal
        </button>
      </div>

      {/* --- TABLE (Matched Layout) --- */}
      <div className="glass-panel rounded-[1.5rem] border border-white/5 bg-black/40 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px] font-bold uppercase tracking-widest border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02] text-slate-500">
                <th className="py-5 px-6 italic">Visual</th>
                <th className="py-5 px-4 italic">Identity</th>
                <th className="py-5 px-4 italic">Status</th>
                <th className="py-5 px-6 text-right italic">Protocol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-white/[0.02] transition-all">
                  <td className="py-4 px-6">
                    <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden bg-white/5 shadow-lg">
                      <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-white text-[12px] font-black block tracking-tight leading-none mb-1">{p.name}</span>
                    <span className="text-[10px] text-indigo-400 font-mono italic">${p.price}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-md text-[7px] font-black border ${p.stock <= 5 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                      {p.stock <= 5 ? `LOW: ${p.stock}` : `STABLE: ${p.stock}`}
                    </span>
                    {p.deletionRequested && (
                      <span className="block mt-2 text-[7px] text-rose-500 font-black animate-pulse">PENDING_PURGE</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right space-x-6">
                    <button onClick={() => handleEdit(p)} className="text-indigo-400 hover:text-white transition-all text-[10px] font-black uppercase underline decoration-indigo-500/30">Edit</button>
                    <button 
                      onClick={() => handlePurge(p)} 
                      className={`text-[10px] font-black uppercase transition-all ${role === 'admin' ? 'text-amber-500/40 hover:text-amber-500' : 'text-rose-500/40 hover:text-rose-500'}`}
                    >
                      {role === 'admin' ? 'Request Purge' : 'Purge'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL (Fixed Black Screen Issue) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-[850px] bg-[#0a0a0c] border border-white/10 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                  {editMode ? 'Update' : 'Synthesize'} <span className="text-indigo-400">Signal</span>
                </h3>
                <button onClick={closeModal} className="text-slate-500 hover:text-white text-3xl transition-colors">&times;</button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Section */}
                <div className="space-y-6">
                  <div className="aspect-square rounded-3xl border border-white/10 bg-white/5 overflow-hidden relative group shadow-inner">
                    {formData.image ? (
                      <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-indigo-500 text-3xl mb-2">↑</span>
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Select Visual Node</span>
                      </div>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} />
                  </div>
                  <input required value={formData.name} className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl text-white text-[11px] font-bold uppercase outline-none focus:border-indigo-500 transition-all" placeholder="Identity Name" onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>

                {/* Info Section */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input required value={formData.price} type="number" className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl text-white text-[11px] font-bold outline-none focus:border-indigo-500" placeholder="Price ($)" onChange={e => setFormData({...formData, price: e.target.value})} />
                    <input required value={formData.stock} type="number" className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl text-white text-[11px] font-bold outline-none focus:border-indigo-500" placeholder="Stock" onChange={e => setFormData({...formData, stock: e.target.value})} />
                  </div>
                  <select value={formData.category} className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl text-white text-[11px] font-bold outline-none focus:border-indigo-500 cursor-pointer" onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Hoodies">Hoodies</option>
                    <option value="Shirts">Shirts</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Full-Arm">Full-Arm</option>
                    <option value="Half-Sleeve">Half-Sleeve</option>
                    <option value="Plain">Plain</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                  <textarea value={formData.longDesc} className="w-full h-32 bg-white/[0.03] border border-white/10 p-4 rounded-2xl text-white text-[11px] font-bold outline-none focus:border-indigo-500 resize-none" placeholder="Detailed Intel / Description..." onChange={e => setFormData({...formData, longDesc: e.target.value})} />
                  
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest pl-2">3D Model Payload (.glb)</label>
                    <div className="relative group">
                      <input 
                        type="file" 
                        accept=".glb" 
                        onChange={handleModelChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                      />
                      <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl text-[10px] font-bold text-slate-400 group-hover:border-indigo-500 transition-all flex items-center justify-between">
                        <span>{formData.modelUrl ? "MODEL_SYNCED // READY" : "UPLOAD_GLB_MODEL"}</span>
                        {formData.modelUrl && <span className="text-indigo-400 text-[8px] animate-pulse">✓</span>}
                      </div>
                    </div>
                  </div>

                  <input value={formData.specs} className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-2xl text-white text-[11px] font-bold outline-none focus:border-indigo-500" placeholder="Specs (e.g. Cotton, 240GSM)" onChange={e => setFormData({...formData, specs: e.target.value})} />
                </div>

                <div className="col-span-1 md:col-span-2 pt-6 flex gap-4">
                  <button type="submit" className="flex-grow py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.5em] hover:bg-indigo-600 hover:text-white transition-all shadow-xl">
                    {editMode ? 'Update Signal' : 'Authorize Synthesis'}
                  </button>
                  <button type="button" onClick={closeModal} className="px-8 py-5 bg-white/5 border border-white/10 text-slate-500 rounded-2xl text-[10px] font-black uppercase hover:text-white transition-all">
                    Abort
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;