import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getProducts } from '../api'; 
import { useCart } from '../context/CartContext.jsx';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchLiveInventory = async () => {
      try {
        const result = await getProducts();
        if (result && result.data) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error("Transmission Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLiveInventory();
  }, []);

  const filteredProducts = products.filter(p => 
    activeCategory === 'All' || p.category === activeCategory
  );

  return (
    <div className="min-h-screen bg-[#010413] pt-32 pb-20 px-6">
      <div className="max-w-[1600px] mx-auto">
        
        {/* --- PAGE HEADER --- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
          <div>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white">
              The <span className="text-indigo-400 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">Archive</span>
            </h1>
            <div className="flex gap-4 mt-6">
              {['All', 'Designer', 'Plain'].map(cat => (
                <button 
                  key={cat} onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full border transition-all ${activeCategory === cat ? 'bg-indigo-500 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'text-slate-500 border-white/5 hover:text-white'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-6 py-3 rounded-full border border-indigo-500/20">
            Live Database Connected
          </div>
        </motion.div>

        {/* --- LOADER --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[40vh] space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-bold animate-pulse">Extracting Core Metrics...</p>
          </div>
        ) : products.length === 0 ? (
          /* --- EMPTY STATE --- */
          <div className="flex flex-col items-center justify-center h-[40vh] bg-white/[0.02] border border-white/5 rounded-3xl">
            <span className="text-4xl mb-4">📭</span>
            <p className="text-slate-500 text-[12px] uppercase tracking-[0.3em] font-bold">No Signals Detected in Mainframe</p>
          </div>
        ) : (
          /* --- PRODUCTS GRID --- */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <motion.div 
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white/[0.02] border border-white/10 rounded-[2rem] overflow-hidden hover:border-indigo-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] flex flex-col"
              >
                {/* 👉 Yahan se Link shuru hota hai (Image aur Details ke liye) */}
                <Link to={`/product/${product._id}`} className="block flex-grow cursor-pointer">
                  
                  {/* Visual Image */}
                  <div className="relative aspect-[4/5] bg-[#050507] overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700 text-xs tracking-widest uppercase">NO VISUAL DATA</div>
                    )}
                    <div className="absolute top-4 left-4 px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-white">
                      {product.category}
                    </div>
                  </div>

                  {/* Core Metrics */}
                  <div className="p-6">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2 leading-none group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-slate-400 text-[10px] leading-relaxed line-clamp-2">
                      {product.description}
                    </p>
                  </div>
                </Link>

                {/* 👉 Button ko Link se bahar rakha hai taake "Add to Vault" theek kaam kare */}
                {/* 👉 Buttons to interact with the neural network */}
                <div className="px-6 pb-6 mt-auto flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl font-black italic tracking-tighter text-indigo-400">
                      ${product.price}
                    </span>
                    <button 
                      onClick={() => addToCart(product)}
                      className="px-6 py-3 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-cyan-500 hover:text-white transition-all shadow-lg relative z-10"
                    >
                      Add to Vault
                    </button>
                  </div>
                  <Link 
                    to="/dashboard" 
                    state={{ baseProduct: product }}
                    className="w-full py-3 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest rounded-full text-center hover:bg-white/10 transition-all text-slate-400"
                  >
                    Customize Design
                  </Link>
                </div>

              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;