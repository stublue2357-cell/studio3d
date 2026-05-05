import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { getProducts } from '../api';
import GlitchText from '../assets/components/GlitchText';

const Home = () => {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const result = await getProducts();
        if (result && result.data) {
          setLatestProducts(result.data.slice(0, 3));
        }
      } catch (err) {
        console.error("Error fetching latest drops:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  return (
    <div className="relative min-h-screen text-white bg-transparent font-['Plus_Jakarta_Sans'] select-none">
      
      {/* --- 1. SUPER HERO SECTION (Increased Height) --- */}
      <section className="relative min-h-[90vh] md:min-h-[110vh] flex flex-col items-center justify-center text-center px-6 md:px-10 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
          className="relative z-10 w-full"
        >
          <span className="text-cyan-400 text-[9px] md:text-[11px] font-bold tracking-[0.6em] md:tracking-[0.8em] uppercase mb-8 md:mb-12 block animate-pulse">
            Neural Fashion Intelligence // v1.0
          </span>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[12rem] font-black tracking-tighter leading-[0.85] md:leading-[0.75] mb-8 md:mb-14 text-white">
            <GlitchText text="LIMITLESS" /> <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-800 italic">
              IDENTITY.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-400 text-sm md:text-base lg:text-lg leading-relaxed mb-12 md:mb-20 tracking-wide font-medium opacity-80 px-4 md:px-0">
            Studio3D is rewriting the laws of apparel. We don't just make clothes; we synthesize high-fidelity neural patterns with liquid-silk technology to define the next era of human expression.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-8 justify-center items-center px-6 md:px-0">
            <Link to="/studio" className="w-full sm:w-auto bg-indigo-600 hover:bg-cyan-500 px-8 md:px-16 py-5 md:py-7 rounded-2xl text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.3em] md:tracking-[0.4em] shadow-2xl shadow-indigo-500/20 transition-all duration-500">
              Launch AI Studio
            </Link>
            <Link to="/products" className="w-full sm:w-auto glass-panel border border-white/10 px-8 md:px-16 py-5 md:py-7 rounded-2xl text-[10px] md:text-[11px] font-extrabold uppercase tracking-[0.3em] md:tracking-[0.4em] hover:bg-white/10 transition-all duration-500">
              Explore Archive
            </Link>
          </div>
        </motion.div>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-cyan-500/50 text-[10px] tracking-[0.3em] font-bold uppercase"
        >
          Scroll to Explore
        </motion.div>
      </section>

      {/* --- 2. THE VISION (New Paragraph Section) --- */}
      <section className="py-24 md:py-52 px-6 md:px-10 relative z-10 border-y border-white/5 bg-black/10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h2 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            className="text-3xl md:text-6xl font-bold tracking-tighter mb-8 md:mb-12"
          >
            A New Reality in <span className="italic text-cyan-500">Every Thread.</span>
          </motion.h2>
          <p className="text-lg md:text-2xl text-slate-500 leading-relaxed font-light px-4 md:px-0">
            Our generative algorithms analyze aesthetic frequencies to produce patterns that resonate with your digital aura. Every garment is a unique piece of code, rendered in the physical world.
          </p>
        </div>
      </section>

      {/* --- 3. FEATURED DROPS (Increased Spacing) --- */}
      <section className="py-60 px-10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-6">
            <div>
              <h2 className="text-6xl font-bold tracking-tighter italic">Latest <span className="text-cyan-500 font-black">Drops</span></h2>
              <p className="text-slate-500 text-[11px] tracking-[0.5em] uppercase font-bold mt-6 opacity-60">Season 01 // Archive Collection // v2.06</p>
            </div>
            <Link to="/products" className="text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">View All Archive -&gt;</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="glass-panel p-8 rounded-[4rem] animate-pulse h-[400px]" />
              ))
            ) : latestProducts.length > 0 ? (
              latestProducts.map((product) => (
                <motion.div key={product._id} whileHover={{ y: -15 }} className="glass-panel p-8 rounded-[4rem] group border-white/5 shadow-2xl transition-all duration-500">
                   <Link to={`/product/${product._id}`}>
                    <div className="aspect-[4/5] rounded-[3rem] overflow-hidden mb-10 bg-black/40">
                      <img src={product.imageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 scale-110 group-hover:scale-100 transition-all duration-1000" alt={product.name} />
                    </div>
                    <div className="px-4">
                      <h3 className="text-2xl font-bold text-white mb-3">{product.name}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-2">{product.description}</p>
                      <div className="h-px w-full bg-white/5 mb-6" />
                      <span className="text-cyan-400 font-bold tracking-widest text-xs uppercase">${product.price.toFixed(2)} // {product.category}</span>
                    </div>
                  </Link>
                </motion.div>
              ))
            ) : (
              <p className="text-slate-500 text-xs uppercase tracking-widest col-span-3 text-center">No drops detected in the neural grid.</p>
            )}
          </div>
        </div>
      </section>

      {/* --- 4. BRAND VALUES (New Visual Grid) --- */}
      <section className="py-24 md:py-52 px-6 md:px-10 bg-white/5 backdrop-blur-3xl relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
          <div className="order-2 md:order-1">
            <h3 className="text-[10px] md:text-[12px] font-black tracking-[0.4em] md:tracking-[0.6em] text-cyan-500 uppercase mb-6 md:mb-8 italic">The Technology</h3>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 md:mb-10 leading-[1] md:leading-[0.9]">Atomic Precision. <br />Digital Soul.</h2>
            <p className="text-base md:text-lg text-slate-400 leading-relaxed mb-8 md:mb-12">
              Our 3D knitting technology allows us to create seamless garments that fit perfectly while minimizing fabric waste. We use recycled ocean plastics infused with neural-conductive silk.
            </p>
            <ul className="space-y-4 md:space-y-6 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-slate-500">
              <li className="flex items-center gap-4"><span className="w-2 h-2 bg-cyan-500 rounded-full" /> Nano-Fiber Durability</li>
              <li className="flex items-center gap-4"><span className="w-2 h-2 bg-indigo-500 rounded-full" /> Generative Pattern Logic</li>
              <li className="flex items-center gap-4"><span className="w-2 h-2 bg-white rounded-full" /> Carbon-Negative Production</li>
            </ul>
          </div>
          <div className="order-1 md:order-2 glass-panel aspect-square rounded-[3rem] md:rounded-[5rem] overflow-hidden rotate-2 md:rotate-3 hover:rotate-0 transition-all duration-700">
             <img src="https://images.unsplash.com/photo-1558913926-276949021e86?w=1000" className="w-full h-full object-cover opacity-50" />
          </div>
        </div>
      </section>

      {/* --- 5. CALL TO ACTION --- */}
      <section className="py-60 text-center relative z-10">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}>
          <h2 className="text-7xl font-black tracking-tighter mb-10 uppercase italic">Join the <span className="text-cyan-500">Laboratory.</span></h2>
          <p className="text-slate-500 text-sm tracking-[0.5em] uppercase font-bold mb-16">Exclusive access to Season 02 // coming soon</p>
          <div className="flex justify-center gap-4">
             <input type="email" placeholder="ENTER ACCESS CODE..." className="bg-white/5 border border-white/10 px-8 py-5 rounded-2xl outline-none focus:border-cyan-500 w-80 text-[10px] tracking-widest font-bold uppercase" />
             <button className="bg-white text-black px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all">Submit</button>
          </div>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      {/* <footer className="py-32 px-10 relative z-10 border-t border-white/5 bg-black/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-2">
            <div className="text-3xl font-black italic tracking-tighter mb-8">STUDIO<span className="text-cyan-500">3D</span></div>
            <p className="max-w-xs text-slate-500 text-xs leading-relaxed">Defining the intersection of neural networks and high-performance apparel. Synthesized in 2026.</p>
          </div>
          <div className="space-y-6">
            <h5 className="text-[10px] font-bold tracking-widest uppercase text-white">Navigation</h5>
            <div className="flex flex-col gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <Link to="/products" className="hover:text-cyan-400">Store</Link>
              <Link to="/dashboard" className="hover:text-studio">Studio</Link>
              <Link to="/login" className="hover:text-cyan-400">Account</Link>
            </div>
          </div>
          <div className="space-y-6">
            <h5 className="text-[10px] font-bold tracking-widest uppercase text-white">Socials</h5>
            <div className="flex flex-col gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-cyan-400">Instagram</a>
              <a href="#" className="hover:text-cyan-400">Discord</a>
              <a href="#" className="hover:text-cyan-400">Twitter</a>
            </div>
          </div>
        </div>
      </footer> */}

    </div>
  );
};

export default Home;