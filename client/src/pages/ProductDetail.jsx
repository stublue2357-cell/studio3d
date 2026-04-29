import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { getProductById } from '../api'; 

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [activeTab, setActiveTab] = useState('description');
  const [selectedSize, setSelectedSize] = useState('M');

  useEffect(() => {
    const fetchSignal = async () => {
      try {
        const { data } = await getProductById(id);
        setProduct(data);
      } catch (error) {
        console.error("Signal Lost:", error);
        navigate('/products'); 
      } finally {
        setLoading(false);
      }
    };
    fetchSignal();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#010413] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) return <div className="min-h-screen bg-[#010413]" />;

  // 👉 DYNAMIC SPECS LOGIC (Database se array aayega)
  const specs = (product.specs && product.specs.length > 0) 
    ? product.specs 
    : ["100% Premium Material", "Cyberpunk Inspired", "High Durability", "Limited Edition"];

  const reviews = product.reviews || [
    { user: "SYSTEM_ADMIN", rating: 5, comment: "Authorized blueprint. Quality parameters optimal." },
    { user: "GHOST_USER", rating: 4, comment: "Solid design framework. Highly recommended." }
  ];

  return (
    <div className="min-h-screen bg-[#010413] text-white selection:bg-indigo-500 selection:text-white">
      {/* --- TOP NAV SPACE --- */}
      <div className="pt-32 pb-20 px-6 max-w-[1500px] mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-4 mb-12 overflow-hidden">
          <button onClick={() => navigate('/products')} className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-indigo-400 transition-colors">Archive</button>
          <span className="text-slate-800">/</span>
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white italic">{product.name}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-20">
          
          {/* --- LEFT: IMAGE GALLERY (Sticky) --- */}
          <div className="lg:w-3/5 lg:sticky lg:top-32 self-start">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group rounded-[3rem] overflow-hidden bg-white/[0.02] border border-white/5"
            >
              <img src={product.imageUrl} className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110" alt={product.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <div className="absolute bottom-10 left-10">
                <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest">High_Res_Visual</span>
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT: CONTENT --- */}
          <div className="lg:w-2/5 flex flex-col pt-4">
            <div className="mb-10">
              <span className="text-indigo-500 text-[10px] font-black tracking-[0.8em] uppercase mb-4 block">Product // Node_{product._id?.slice(-6)}</span>
              <h1 className="text-7xl font-black uppercase italic tracking-tighter mb-6 leading-[0.9]">{product.name}</h1>
              <div className="flex items-center gap-6">
                <span className="text-3xl font-mono font-bold text-white">${product.price}.00</span>
                <span className={`px-3 py-1 border text-[8px] font-black uppercase tracking-widest rounded-md ${product.stock > 0 ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                  {product.stock > 0 ? 'In_Stock' : 'Signal_Offline'}
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-lg leading-relaxed mb-12 italic border-l-2 border-indigo-500/30 pl-6">
              "{product.description}"
            </p>

            {/* SIZE SELECTOR */}
            <div className="mb-12">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.5em] block mb-6">Select Architecture</span>
              <div className="flex flex-wrap gap-4">
                {['S', 'M', 'L', 'XL'].map(size => (
                  <button 
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-16 h-16 rounded-2xl border transition-all flex items-center justify-center text-[12px] font-black ${
                      selectedSize === size 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' 
                      : 'border-white/10 text-slate-500 hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* ACTION BUTTON */}
            <motion.button 
              whileHover={product.stock > 0 ? { scale: 1.02 } : {}}
              whileTap={product.stock > 0 ? { scale: 0.98 } : {}}
              disabled={product.stock === 0}
              onClick={() => addToCart({...product, size: selectedSize})}
              className={`group relative w-full py-8 rounded-3xl text-[12px] font-black uppercase tracking-[0.5em] overflow-hidden ${product.stock > 0 ? 'bg-white text-black' : 'bg-white/5 text-slate-500 cursor-not-allowed'}`}
            >
              <span className="relative z-10">{product.stock > 0 ? 'Authorize Transaction' : 'Stock Depleted'}</span>
              {product.stock > 0 && <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
            </motion.button>

            {/* --- DETAILED INFO TABS --- */}
            <div className="mt-20 border-t border-white/5 pt-12">
              <div className="flex gap-10 mb-10 overflow-x-auto no-scrollbar">
                {['description', 'specifications', 'reviews'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-[9px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap ${
                      activeTab === tab ? 'text-white border-b-2 border-indigo-500 pb-2' : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="min-h-[200px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-slate-400 text-sm leading-relaxed"
                  >
                    {/* 👉 DYNAMIC LONG DESCRIPTION */}
                    {activeTab === 'description' && <p className="leading-loose">{product.longDescription || product.description}</p>}
                    
                    {/* 👉 DYNAMIC SPECS RENDER */}
                    {activeTab === 'specifications' && (
                      <div className="grid grid-cols-2 gap-4">
                        {specs.map((spec, index) => (
                          <div key={index} className="flex items-center gap-3 bg-white/[0.03] p-4 rounded-xl border border-white/5">
                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-widest">{spec}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTab === 'reviews' && (
                      <div className="space-y-6">
                        {reviews.map((rev, i) => (
                          <div key={i} className="border-b border-white/5 pb-6 last:border-0">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white font-black text-[10px] uppercase tracking-widest">{rev.user}</span>
                              <div className="flex text-indigo-500 text-[8px]">{'★'.repeat(rev.rating)}</div>
                            </div>
                            <p className="italic text-slate-500 text-xs">"{rev.comment}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;