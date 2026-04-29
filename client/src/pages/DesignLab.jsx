import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { placeOrder } from '../api';
import '@google/model-viewer';

const DesignLab = () => {
  const location = useLocation();
  const baseProduct = location.state?.baseProduct;

  const [mode, setMode] = useState('manual'); 
  const [apparel, setApparel] = useState(baseProduct?.category?.toLowerCase() || 't-shirt');
  const [color, setColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#000000');
  const [canvasElements, setCanvasElements] = useState([]);
  const [activeElementId, setActiveElementId] = useState(null);
  const [activeSidebarPanel, setActiveSidebarPanel] = useState('text');
  const [prompt, setPrompt] = useState('');
  const [aiImage, setAiImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);
  const [modelTexture, setModelTexture] = useState(null);

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const modelViewerRef = useRef(null);

  const glbModels = {
    't-shirt': baseProduct?.modelUrl || "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    'full-arm': baseProduct?.modelUrl || "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
    'half-sleeve': baseProduct?.modelUrl || "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    'hoodie': baseProduct?.modelUrl || "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
    'sweatshirt': baseProduct?.modelUrl || "https://modelviewer.dev/shared-assets/models/Horse.glb"
  };

  const handleAddText = () => {
    const id = Date.now();
    setCanvasElements([...canvasElements, { id, type: 'text', content: 'NEW TEXT', x: 50, y: 50, scale: 1, color: textColor }]);
    setActiveElementId(id);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const id = Date.now();
        setCanvasElements([...canvasElements, { id, type: 'image', content: reader.result, x: 50, y: 50, scale: 1 }]);
        setActiveElementId(id);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input
  };

  const handleReplaceImage = (e) => {
    const file = e.target.files[0];
    if (file && activeElementId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCanvasElements(els => els.map(el => el.id === activeElementId ? { ...el, content: reader.result } : el));
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input
  };

  const handleApplyTo3D = async () => {
    if (!canvasRef.current) return;
    setLoading(true);
    try {
      // Professional Texture Bake: Capture canvas with background color
      const canvas = await html2canvas(canvasRef.current, { 
        backgroundColor: color, // This syncs the fabric color into the texture
        useCORS: true,
        scale: 3 // Ultra High Def
      });
      
      const textureUrl = canvas.toDataURL('image/png');
      setModelTexture(textureUrl);

      const modelViewer = modelViewerRef.current;
      if (modelViewer && modelViewer.model) {
        const texture = await modelViewer.createTexture(textureUrl);
        
        for (const material of modelViewer.model.materials) {
          const pbr = material.pbrMetallicRoughness;
          // Apply the master design texture
          if (pbr.baseColorTexture) {
            await pbr.baseColorTexture.setTexture(texture);
          } else {
            await pbr.baseColorTexture.setTexture(texture);
          }
          // Set base color to white because the color is already in the texture
          pbr.setBaseColorFactor([1, 1, 1, 1]);
        }
        modelViewer.queueRender();
      }
    } catch (err) {
      console.error("SYNTHESIS_ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        products: [{
          quantity: 1,
          customDesign: {
            type: "CANVAS_3D",
            data: modelTexture || color
          }
        }],
        totalAmount: 49,
        shippingAddress: { address: "PROCESSED_AT_3D_LAB", city: "NEURAL_CITY", phone: "000-000-000" }
      };
      await placeOrder(orderData, token);
      setOrderStatus("SUCCESS // SENT_FOR_ADMIN_APPROVAL");
    } catch (err) {
      console.error("ORDER_TRANSMISSION_FAILED", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-0 animate-in fade-in duration-700 min-h-screen bg-[#020204] flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="flex justify-between items-end border-b border-white/5 pb-4 px-6 pt-4 shrink-0 bg-[#020204] z-40">
        <div>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none mb-1">
            Studio <span className="text-cyan-400">3D</span>
          </h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black">Professional Synthesis Suite</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleApplyTo3D} disabled={loading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all"
          >
            {loading ? 'SYNCHRONIZING...' : 'APPLY TO 3D MODEL'}
          </button>
          <button 
            onClick={handleOrder} disabled={loading || !modelTexture}
            className="px-6 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-30"
          >
            Confirm & Vault
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex flex-grow relative overflow-hidden">
        
        {/* LEFT SIDEBAR ICONS (Canva Style) */}
        <div className="w-20 bg-[#020204] border-r border-white/5 flex flex-col items-center py-4 gap-2 z-30 shrink-0">
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

        {/* FLYOUT PANELS */}
        <AnimatePresence>
          {activeSidebarPanel && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="bg-[#050508] border-r border-white/5 h-full overflow-y-auto flex flex-col z-20 shadow-[20px_0_30px_rgba(0,0,0,0.5)] shrink-0 custom-scrollbar"
            >
               <div className="p-6 w-[320px] space-y-8">
                 {/* Text Panel */}
                 {activeSidebarPanel === 'text' && (
                   <div className="space-y-4">
                     <h3 className="text-white font-bold tracking-wider mb-4">Text Elements</h3>
                     <button 
                       onClick={handleAddText}
                       className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
                     >
                       + Add a heading
                     </button>
                   </div>
                 )}

                 {/* Uploads Panel */}
                 {activeSidebarPanel === 'uploads' && (
                   <div className="space-y-4">
                     <h3 className="text-white font-bold tracking-wider mb-4">Upload Media</h3>
                     <button 
                       onClick={() => fileInputRef.current.click()}
                       className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-[0_0_15px_rgba(192,38,211,0.3)]"
                     >
                       Upload File
                     </button>
                     <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
                   </div>
                 )}

                 {/* Layers Panel */}
                 {activeSidebarPanel === 'layers' && (
                    <div className="space-y-4">
                      <h3 className="text-white font-bold tracking-wider mb-4">Layers</h3>
                      <div className="space-y-2">
                        {canvasElements.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-8 bg-white/5 rounded-xl border border-dashed border-white/10">No layers</p>
                        ) : (
                          [...canvasElements].reverse().map((el, idx) => (
                            <div 
                              key={el.id}
                              onClick={() => setActiveElementId(el.id)}
                              className={`flex justify-between items-center p-3 rounded-xl border transition-all cursor-pointer ${activeElementId === el.id ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                            >
                              <div className="flex items-center gap-3 overflow-hidden">
                                <span className="text-xs opacity-50 font-mono">{canvasElements.length - idx}</span>
                                <span className="text-xs font-bold truncate max-w-[150px]">
                                  {el.type === 'text' ? (el.content || 'Text') : 'Image Graphic'}
                                </span>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCanvasElements(els => els.filter(layer => layer.id !== el.id));
                                  if (activeElementId === el.id) setActiveElementId(null);
                                }}
                                className="text-red-500/50 hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                 )}

                 {/* Colors Panel */}
                 {activeSidebarPanel === 'colors' && (
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <h3 className="text-white font-bold tracking-wider mb-4">Fabric Color</h3>
                        <div className="flex gap-3 flex-wrap">
                          {['#ffffff', '#000000', '#1a1a1a', '#e11d48', '#2563eb', '#16a34a', '#fbbf24'].map(c => (
                            <button 
                              key={c} onClick={() => setColor(c)}
                              className={`w-12 h-12 rounded-full border-2 transition-all duration-300 ${color === c ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-white font-bold tracking-wider mb-4">Default Ink</h3>
                        <div className="flex gap-3 flex-wrap">
                          {['#ffffff', '#000000', '#fbbf24', '#f472b6', '#22d3ee', '#a855f7', '#10b981'].map(c => (
                            <button 
                              key={c} onClick={() => setTextColor(c)}
                              className={`w-12 h-12 rounded-full border-2 transition-all duration-300 ${textColor === c ? 'border-cyan-400 scale-110 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                 )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3D Preview Section */}
        <div className="flex-grow relative bg-[#0a0a0e] flex items-center justify-center overflow-hidden z-10" onClick={() => setActiveSidebarPanel(null)}>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          
          <model-viewer
            ref={modelViewerRef}
            src={glbModels[apparel]}
            alt="3D Apparel Model"
            auto-rotate={!activeElementId}
            camera-controls
            shadow-intensity="1"
            environment-image="neutral"
            style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
            exposure="1"
            onClick={() => {
               // Optional: Deselect when clicking 3D model outside canvas
            }}
          />

          <div className="absolute top-8 right-8 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
          </div>

          {/* OVERLAID INTERACTIVE DESIGN CANVAS - Invisible Borders */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div 
              ref={canvasRef}
              onClick={(e) => {
                if (e.target === canvasRef.current) {
                  setActiveElementId(null);
                }
              }}
              className="w-[300px] h-[400px] pointer-events-auto relative mt-[-40px] group transition-all"
            >
              {canvasElements.map(el => (
                <motion.div 
                  key={el.id} 
                  drag 
                  dragConstraints={canvasRef}
                  dragElastic={0}
                  dragMomentum={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveElementId(el.id);
                  }}
                  className={`absolute cursor-move origin-center ${activeElementId === el.id ? 'ring-1 ring-cyan-400 ring-offset-0 bg-cyan-400/10' : 'hover:ring-1 hover:ring-white/20'}`}
                  style={{ left: el.x, top: el.y, scale: el.scale || 1 }}
                >
                  {el.type === 'text' ? (
                    <span 
                      className="text-4xl font-black uppercase tracking-tighter drop-shadow-md whitespace-nowrap px-1 block"
                      style={{ color: el.color || textColor }}
                    >
                      {el.content}
                    </span>
                  ) : (
                    <img src={el.content} className="w-40 h-auto object-contain drop-shadow-md pointer-events-none" alt="" />
                  )}

                  {/* Canva-style Resizing Handles (Visual Only) */}
                  {activeElementId === el.id && (
                     <>
                       <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-cyan-400 rounded-full" />
                       <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-cyan-400 rounded-full" />
                       <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-cyan-400 rounded-full" />
                       <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-cyan-400 rounded-full" />
                     </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Element Edit Panel (Right Slide-out) */}
        <AnimatePresence>
          {activeElementId && (
            <motion.div 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="bg-[#050508] border-l border-white/5 h-full z-20 shadow-[-20px_0_30px_rgba(0,0,0,0.5)] flex flex-col shrink-0 custom-scrollbar overflow-y-auto"
            >
              <div className="p-6 w-[300px] space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <h3 className="text-white font-bold tracking-wider">Edit Element</h3>
                  <button 
                    onClick={() => setActiveElementId(null)}
                    className="text-xs text-slate-500 hover:text-white px-2 py-1 bg-white/5 rounded"
                  >
                    Done
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <span className="text-xs text-slate-400 block font-bold tracking-wide">Scale / Size</span>
                    <input 
                      type="range" min="0.2" max="3" step="0.1"
                      value={canvasElements.find(e => e.id === activeElementId)?.scale || 1}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setCanvasElements(els => els.map(el => el.id === activeElementId ? { ...el, scale: val } : el));
                      }}
                      className="w-full accent-cyan-400 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {canvasElements.find(e => e.id === activeElementId)?.type === 'text' && (
                    <>
                      <div className="space-y-3">
                        <span className="text-xs text-slate-400 block font-bold tracking-wide">Text Content</span>
                        <input 
                          type="text"
                          value={canvasElements.find(e => e.id === activeElementId)?.content || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setCanvasElements(els => els.map(el => el.id === activeElementId ? { ...el, content: val } : el));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setActiveElementId(null);
                          }}
                          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-400 transition-colors"
                          placeholder="Text..."
                        />
                      </div>
                      <div className="space-y-3">
                        <span className="text-xs text-slate-400 block font-bold tracking-wide">Text Color</span>
                        <div className="flex items-center gap-3">
                          <input 
                            type="color" 
                            value={canvasElements.find(e => e.id === activeElementId)?.color || textColor}
                            onChange={(e) => {
                              const val = e.target.value;
                              setCanvasElements(els => els.map(el => el.id === activeElementId ? { ...el, color: val } : el));
                            }}
                            className="w-12 h-12 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                          />
                          <span className="text-sm font-mono text-white">{canvasElements.find(e => e.id === activeElementId)?.color || textColor}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {canvasElements.find(e => e.id === activeElementId)?.type === 'image' && (
                    <div className="space-y-3">
                      <span className="text-xs text-slate-400 block font-bold tracking-wide">Replace Graphic</span>
                      <label className="cursor-pointer block px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all text-center w-full">
                        Upload New Image
                        <input type="file" hidden onChange={handleReplaceImage} accept="image/*" />
                      </label>
                    </div>
                  )}

                  <div className="pt-4 border-t border-white/5">
                    <button 
                      onClick={() => {
                        setCanvasElements(els => els.filter(el => el.id !== activeElementId));
                        setActiveElementId(null);
                      }}
                      className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                    >
                      Delete Element
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default DesignLab;
