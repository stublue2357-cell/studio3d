import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CanvasModel from '../../canvas';
import DesignEditor from './DesignEditor';
import { useCart } from '../../context/CartContext';
import { useLocation } from 'react-router-dom';

const AIStudio = () => {
  const { addToCart } = useCart();
  const location = useLocation();
  const baseProductFromState = location.state?.baseProduct;

  const [activeSidebarPanel, setActiveSidebarPanel] = useState('ai');
  const [prompt, setPrompt] = useState('');
  const [baseType, setBaseType] = useState(baseProductFromState?.name || 'Heavyweight Tee');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiImage, setAiImage] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);

  // Listen for prompt suggestions from the Global Chatbot
  useEffect(() => {
    const handleBotPrompt = (e) => {
        setPrompt(e.detail);
        setActiveSidebarPanel('ai');
    };
    window.addEventListener('TRIGGER_AI_SYNTH', handleBotPrompt);
    return () => window.removeEventListener('TRIGGER_AI_SYNTH', handleBotPrompt);
  }, []);

  const handleSynthesis = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setAiImage(null);
    
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'https://studio3d-production.up.railway.app/api';
      const response = await fetch(`${backendUrl}/ai/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token // Injecting security token
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setAiImage(data.imageUrl); 
      } else {
        const errorText = data.message || data.msg || "Internal Grid Error";
        alert(`Neural Engine Failure (${response.status}): ${errorText}`);
      }
    } catch (err) {
      alert("CRITICAL ERROR: Connection to Synthesis Engine severed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCart = () => {
    if (!aiImage && !overlayImage) return;

    const baseProduct = baseProductFromState || {
        _id: 'custom-base-01',
        name: baseType,
        color: 'White',
        size: 'M',
        price: 49.99,
        data: { aiImage, overlayImage },
        description: `Custom ${baseType} synthesized in the lab.`
    };

    const customDesign = {
        type: activeSidebarPanel,
        data: { aiImage, overlayImage }
    };

    addToCart(baseProduct, customDesign);
  };

  const apparelCategories = {
    'Shirts & Tops': ['Heavyweight Tee', 'Classic T-Shirt', 'Polo Shirt', 'V-Neck Shirt'],
    'Outerwear & Hoodies': ['Cyber Hoodie', 'Classic Hoodie', 'Zip-up Hoodie', 'Tech Jacket', 'Denim Jacket', 'Bomber Jacket'],
    'Pants & Bottoms': ['Cargo Pants', 'Trousers', 'Sweatpants', 'Shorts']
  };

  return (
    <div className="flex flex-col bg-[#020204] pt-[90px] min-h-screen">
      <div className="flex flex-grow border-t border-white/5 relative items-stretch pl-20">
      
      {/* FIXED LEFT SIDEBAR (Never moves) */}
      <div className="w-20 bg-[#020204] border-r border-white/5 flex flex-col items-center pt-[100px] pb-4 gap-2 z-[90] shrink-0 fixed left-0 top-0 bottom-0">
         <button onClick={() => setActiveSidebarPanel('ai')} className={`p-4 flex flex-col items-center gap-2 rounded-xl w-16 transition-all ${activeSidebarPanel==='ai' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <span className="text-xl leading-none">🧠</span>
            <span className="text-[9px] uppercase font-black">AI Maker</span>
         </button>
         <button onClick={() => setActiveSidebarPanel('text')} className={`p-4 flex flex-col items-center gap-2 rounded-xl w-16 transition-all ${activeSidebarPanel==='text' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <span className="text-xl font-serif leading-none">T</span>
            <span className="text-[9px] uppercase font-black">Text</span>
         </button>
         <button onClick={() => setActiveSidebarPanel('uploads')} className={`p-4 flex flex-col items-center gap-2 rounded-xl w-16 transition-all ${activeSidebarPanel==='uploads' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <span className="text-xl leading-none">☁️</span>
            <span className="text-[9px] uppercase font-black">Upload</span>
         </button>
         <button onClick={() => setActiveSidebarPanel('layers')} className={`p-4 flex flex-col items-center gap-2 rounded-xl w-16 transition-all ${activeSidebarPanel==='layers' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <span className="text-xl leading-none">☰</span>
            <span className="text-[9px] uppercase font-black">Layers</span>
         </button>
         <button onClick={() => setActiveSidebarPanel('colors')} className={`p-4 flex flex-col items-center gap-2 rounded-xl w-16 transition-all ${activeSidebarPanel==='colors' ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <span className="text-xl leading-none">🎨</span>
            <span className="text-[9px] uppercase font-black">Colors</span>
         </button>
      </div>

      {/* FLYOUT PANELS (Moves normally) */}
      <motion.div 
        animate={{ width: activeSidebarPanel ? 320 : 0, opacity: activeSidebarPanel ? 1 : 0 }}
        transition={{ type: "tween", duration: 0.2 }}
        className="bg-[#050508] border-r border-white/5 z-20 shadow-[20px_0_30px_rgba(0,0,0,0.5)] shrink-0 flex flex-col"
      >
         <div className="p-6 w-[320px] space-y-8 flex-grow">
           {activeSidebarPanel === 'ai' && (
             <>
               <h3 className="text-white font-bold tracking-wider mb-4">Neural Synthesis</h3>
               <div className="space-y-4 relative">
                 <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Fabric Type</label>
                 <select
                   value={baseType}
                   onChange={(e) => setBaseType(e.target.value)}
                   className="w-full py-4 px-5 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-indigo-400 transition-all appearance-none cursor-pointer"
                 >
                   {Object.entries(apparelCategories).map(([category, items]) => (
                     <optgroup key={category} label={category} className="bg-slate-900 text-indigo-400 font-black uppercase tracking-widest text-[9px] pt-2">
                       {items.map((apparel) => (
                         <option key={apparel} value={apparel} className="text-white text-[10px] tracking-normal font-medium py-1">
                           {apparel}
                         </option>
                       ))}
                     </optgroup>
                   ))}
                 </select>
               </div>

               <div className="space-y-4">
                 <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Neural Prompt</label>
                 <textarea
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   placeholder="Describe your design..."
                   className="w-full h-32 bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-400 text-[11px] font-medium text-white transition-all resize-none"
                 />
                 
                 {/* AI Suggestions Section */}
                 <div className="space-y-2 mt-2">
                   <label className="text-[8px] font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                     AI Suggestions
                   </label>
                   <div className="flex flex-wrap gap-2">
                     {["Cyberpunk neon graphic", "Minimalist abstract waves", "Vintage 90s typography"].map(s => (
                       <button 
                         key={s} 
                         onClick={() => setPrompt(s)}
                         className="px-3 py-1.5 bg-white/5 hover:bg-cyan-500/20 border border-white/5 hover:border-cyan-500/50 rounded-lg text-[9px] text-slate-400 hover:text-white transition-all cursor-pointer"
                       >
                         {s}
                       </button>
                     ))}
                   </div>
                 </div>
               </div>

               <motion.button
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={handleSynthesis}
                 disabled={isGenerating || !prompt}
                 className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] transition-all ${
                   isGenerating || !prompt ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-2xl'
                 }`}
               >
                 {isGenerating ? 'Synthesizing...' : 'Initialize Rendering'}
               </motion.button>
             </>
           )}

           <DesignEditor activePanel={activeSidebarPanel} onExport={(data) => setOverlayImage(data)} />
         </div>
      </motion.div>

      {/* 3D Preview Section (Moves normally) */}
      <div className="flex-grow relative bg-[#0a0a0e] flex items-center justify-center overflow-hidden z-10 min-h-[calc(100vh-90px)]" onClick={() => setActiveSidebarPanel(null)}>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          <CanvasModel 
             baseType={baseType}
             aiTexture={aiImage} 
             overlayTexture={['text', 'uploads', 'layers'].includes(activeSidebarPanel) ? null : overlayImage} 
          />
          
          {/* Portal Target for DesignEditor Canvas Overlay */}
          <div id="fabric-portal-target" className={`absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${['text', 'uploads', 'layers'].includes(activeSidebarPanel) ? 'opacity-100' : 'opacity-0'}`} />

          {/* Status Indicator */}
          <div className="absolute top-8 right-8 flex items-center gap-2 z-40 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
            <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-yellow-500 animate-pulse' : (aiImage || overlayImage) ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">
              {isGenerating ? 'Rendering Engine Active...' : (aiImage || overlayImage) ? 'Synthesis Complete' : 'Awaiting Input'}
            </span>
          </div>

          <div className="absolute bottom-8 right-8 z-40">
              <AnimatePresence>
                {(aiImage || overlayImage) && !isGenerating && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    onClick={handleAddToCart}
                    className="px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] transition-all bg-white text-black hover:bg-emerald-500 hover:text-white shadow-2xl"
                  >
                    Confirm & Add to Vault
                  </motion.button>
                )}
              </AnimatePresence>
          </div>

          <AnimatePresence>
            {isGenerating && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
              >
                <div className="text-center w-full max-w-sm px-10">
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-6">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3.5, ease: "easeInOut" }}
                    />
                  </div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em] animate-pulse">Synthesizing...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
      </div>

      </div>
    </div>
  );
};

export default AIStudio;
