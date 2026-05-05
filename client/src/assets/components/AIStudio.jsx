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

  // --- NEW AI STATES ---
  const [activeAiSubTab, setActiveAiSubTab] = useState('visual'); // 'visual' | 'consultant'
  const [suggestionPrompt, setSuggestionPrompt] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);

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
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${backendUrl}/ai/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
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

  const handleSuggestion = async () => {
    if (!suggestionPrompt) return;
    setIsSuggesting(true);
    setAiSuggestion('');
    
    try {
      const token = localStorage.getItem('token');
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${backendUrl}/ai/suggest`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        },
        body: JSON.stringify({ prompt: suggestionPrompt }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setAiSuggestion(data.suggestion); 
      } else {
        alert("Consultant Node is busy.");
      }
    } catch (err) {
      alert("Consultant Offline.");
    } finally {
      setIsSuggesting(false);
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
    <div className="flex flex-col bg-[#020204] pt-[70px] md:pt-[90px] min-h-screen">
      <div className="flex flex-col md:flex-row flex-grow border-t border-white/5 relative items-stretch md:pl-20">
      
      {/* SIDEBAR - Fixed Left on Desktop, Bottom on Mobile */}
      <div className="fixed bottom-0 left-0 right-0 h-20 md:h-auto md:w-20 bg-[#020204] border-t md:border-t-0 md:border-r border-white/5 flex flex-row md:flex-col items-center justify-around md:justify-start md:pt-[100px] md:pb-4 gap-2 z-[90] shrink-0 md:top-0 md:bottom-0">
          {[
            { id: 'ai', icon: '🧠', label: 'AI Maker' },
            { id: 'text', icon: 'T', label: 'Text', font: 'serif' },
            { id: 'shapes', icon: '━', label: 'Lines' },
            { id: 'uploads', icon: '☁️', label: 'Upload' },
            { id: 'layers', icon: '☰', label: 'Layers' },
            { id: 'colors', icon: '🎨', label: 'Colors' }
          ].map(item => (
           <button 
             key={item.id}
             onClick={() => setActiveSidebarPanel(activeSidebarPanel === item.id ? null : item.id)} 
             className={`p-2 md:p-4 flex flex-col items-center gap-1 md:gap-2 rounded-xl w-14 md:w-16 transition-all ${activeSidebarPanel === item.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
           >
             <span className={`text-lg md:text-xl leading-none ${item.font === 'serif' ? 'font-serif' : ''}`}>{item.icon}</span>
             <span className="text-[7px] md:text-[9px] uppercase font-black">{item.label}</span>
           </button>
         ))}
      </div>

      {/* FLYOUT PANELS - Bottom Sheet on Mobile, Left Panel on Desktop */}
      <AnimatePresence>
        {activeSidebarPanel && (
          <motion.div 
            initial={window.innerWidth < 768 ? { y: '100%' } : { width: 0, opacity: 0 }}
            animate={window.innerWidth < 768 ? { y: 0 } : { width: 320, opacity: 1 }}
            exit={window.innerWidth < 768 ? { y: '100%' } : { width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-20 md:bottom-0 md:relative md:inset-auto md:w-[320px] bg-[#050508] border-t md:border-t-0 md:border-r border-white/5 z-[85] shadow-[0_-20px_30px_rgba(0,0,0,0.5)] md:shadow-[20px_0_30px_rgba(0,0,0,0.5)] shrink-0 flex flex-col max-h-[60vh] md:max-h-none overflow-y-auto"
          >
             <div className="p-6 w-full md:w-[320px] space-y-8 flex-grow">
               <div className="flex justify-between items-center md:hidden mb-4">
                 <h3 className="text-white font-bold tracking-wider uppercase text-xs">Configuration</h3>
                 <button onClick={() => setActiveSidebarPanel(null)} className="text-slate-500 text-xs">Close</button>
               </div>

               {activeSidebarPanel === 'ai' && (
                  <>
                    <h3 className="text-white font-bold tracking-wider mb-6 hidden md:block uppercase text-xs">Neural Lab</h3>
                    
                    {/* SUB-TAB SWITCHER */}
                    <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5">
                       <button 
                         onClick={() => setActiveAiSubTab('visual')}
                         className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${activeAiSubTab === 'visual' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                       >
                         Visual Synthesizer
                       </button>
                       <button 
                         onClick={() => setActiveAiSubTab('consultant')}
                         className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${activeAiSubTab === 'consultant' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                       >
                         Creative Consultant
                       </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {activeAiSubTab === 'visual' ? (
                        <motion.div key="visual" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                           <div className="space-y-4">
                             <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Neural Prompt</label>
                             <textarea
                               value={prompt}
                               onChange={(e) => setPrompt(e.target.value)}
                               placeholder="Visualize your design concept..."
                               className="w-full h-32 bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-400 text-[11px] font-medium text-white transition-all resize-none placeholder:text-slate-700"
                             />
                             
                             <div className="space-y-2">
                               <label className="text-[8px] font-black uppercase tracking-[0.3em] text-cyan-500 flex items-center gap-2">
                                 <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                 Synthetic Seeds
                               </label>
                               <div className="flex flex-wrap gap-2">
                                 {["Cyberpunk Neon", "Minimal Abstract", "Retro Glitch"].map(s => (
                                   <button key={s} onClick={() => setPrompt(s)} className="px-3 py-1.5 bg-white/5 hover:bg-indigo-500/20 border border-white/5 hover:border-indigo-500/50 rounded-lg text-[9px] text-slate-400 hover:text-white transition-all">{s}</button>
                                 ))}
                               </div>
                             </div>
                           </div>

                           <motion.button
                             whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                             onClick={handleSynthesis}
                             disabled={isGenerating || !prompt}
                             className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] transition-all ${isGenerating || !prompt ? 'bg-slate-800 text-slate-500' : 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-2xl'}`}
                           >
                             {isGenerating ? 'Synthesizing...' : 'Initialize Rendering'}
                           </motion.button>
                        </motion.div>
                      ) : (
                        <motion.div key="consultant" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                           <div className="space-y-4">
                             <label className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500">Consultation Focus</label>
                             <textarea
                               value={suggestionPrompt}
                               onChange={(e) => setSuggestionPrompt(e.target.value)}
                               placeholder="Ask for design advice or style suggestions..."
                               className="w-full h-32 bg-white/[0.03] border border-white/10 p-5 rounded-2xl outline-none focus:border-indigo-400 text-[11px] font-medium text-white transition-all resize-none placeholder:text-slate-700"
                             />
                           </div>

                           <motion.button
                             whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                             onClick={handleSuggestion}
                             disabled={isSuggesting || !suggestionPrompt}
                             className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] transition-all ${isSuggesting || !suggestionPrompt ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20'}`}
                           >
                             {isSuggesting ? 'Analyzing...' : 'Get Design Advice'}
                           </motion.button>

                           {aiSuggestion && (
                             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 relative group overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest mb-3">Consultant Output:</p>
                                <p className="text-[10px] text-slate-300 leading-relaxed font-medium whitespace-pre-wrap italic">
                                  "{aiSuggestion}"
                                </p>
                             </motion.div>
                           )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
               )}

               <DesignEditor activePanel={activeSidebarPanel} onExport={(data) => setOverlayImage(data)} />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Preview Section */}
      <div className="flex-grow relative bg-[#0a0a0e] flex items-center justify-center overflow-hidden z-10 min-h-[50vh] md:min-h-[calc(100vh-90px)]" onClick={() => window.innerWidth > 768 && setActiveSidebarPanel(null)}>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          <div className="w-full h-full md:scale-110 lg:scale-100 transition-transform">
            <CanvasModel 
            baseType={baseType}
            aiTexture={aiImage} 
            overlayTexture={['text', 'uploads', 'layers', 'shapes'].includes(activeSidebarPanel) ? null : overlayImage} 
          />
          </div>
          
          {/* Portal Target for DesignEditor Canvas Overlay */}
          <div id="fabric-portal-target" className={`absolute inset-0 z-30 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${['text', 'uploads', 'layers', 'shapes'].includes(activeSidebarPanel) ? 'opacity-100' : 'opacity-0'}`} />

          {/* Status Indicator */}
          <div className="absolute top-4 right-4 md:top-8 md:right-8 flex items-center gap-2 z-40 bg-black/40 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full border border-white/5 backdrop-blur-md">
            <div className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${isGenerating ? 'bg-yellow-500 animate-pulse' : (aiImage || overlayImage) ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
            <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-white">
              {isGenerating ? 'Rendering...' : (aiImage || overlayImage) ? 'Success' : 'Awaiting'}
            </span>
          </div>

          <div className="absolute bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 z-40 w-full px-6 md:w-auto">
              <AnimatePresence>
                {(aiImage || overlayImage) && !isGenerating && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    onClick={handleAddToCart}
                    className="w-full md:w-auto px-6 md:px-8 py-4 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all bg-white text-black hover:bg-emerald-500 hover:text-white shadow-2xl"
                  >
                    Confirm & Vault
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
                <div className="text-center w-full max-w-[200px] md:max-w-sm px-4 md:px-10">
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mb-4 md:mb-6">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                      initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 3.5, ease: "easeInOut" }}
                    />
                  </div>
                  <p className="text-[8px] md:text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] md:tracking-[0.5em] animate-pulse">Synthesizing...</p>
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
