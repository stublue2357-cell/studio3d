import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { placeOrder, saveSession, getSessions, deleteSession } from '../api';
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

  // --- PERSISTENCE STATES ---
  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const [modelPath, setModelPath] = useState("shirt_baked.glb");

  useEffect(() => {
    const fileName = apparel.toLowerCase().replace(/[\s-]/g, '_') + '.glb';
    fetch(fileName, { method: 'HEAD' })
      .then(res => {
        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && !contentType.includes('text/html')) {
          setModelPath(fileName);
        } else {
          // Fallback to default external models if local file not found
          const defaults = {
            't-shirt': "shirt_baked.glb",
            'full-arm': "shirt_baked.glb",
            'hoodie': "shirt_baked.glb",
            'sweatshirt': "shirt_baked.glb"
          };
          setModelPath(baseProduct?.modelUrl || defaults[apparel] || defaults['t-shirt']);
        }
      })
      .catch(() => {
        setModelPath(baseProduct?.modelUrl || "shirt_baked.glb");
      });
  }, [apparel, baseProduct]);

  const handleAddText = () => {
    const id = Date.now();
    // Centered placement: 300px width / 2 = 150, minus estimated text half-width
    setCanvasElements([...canvasElements, { id, type: 'text', content: 'NEW TEXT', x: 100, y: 180, scale: 1, color: textColor }]);
    setActiveElementId(id);
  };

  const handleAddLine = () => {
    const id = Date.now();
    setCanvasElements([...canvasElements, { id, type: 'line', width: 100, height: 4, x: 100, y: 200, scale: 1, color: textColor }]);
    setActiveElementId(id);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const id = Date.now();
        // Centered placement: 300x400 canvas -> 70, 150
        setCanvasElements([...canvasElements, { id, type: 'image', content: reader.result, x: 70, y: 150, scale: 1 }]);
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

  // Keyboard Shortcuts for Deletion
  useEffect(() => {
    const handleKeyDown = (e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && activeElementId) {
            // Check if user is not typing in an input
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                setCanvasElements(els => els.filter(el => el.id !== activeElementId));
                setActiveElementId(null);
            }
        }
        
        if (e.key === 'Escape') {
            setActiveElementId(null);
            setActiveSidebarPanel(null);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeElementId]);

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
      // 👉 AUTO-BAKE: If user didn't click "Apply to 3D", capture it now
      let finalDesignData = modelTexture;
      if (!finalDesignData && canvasRef.current) {
        const canvas = await html2canvas(canvasRef.current, { 
          backgroundColor: color, 
          useCORS: true,
          scale: 2 
        });
        finalDesignData = canvas.toDataURL('image/png');
        setModelTexture(finalDesignData);
      }

      const token = localStorage.getItem('token');
      const orderData = {
        products: [{
          quantity: 1,
          customDesign: {
            type: "CANVAS_3D",
            data: finalDesignData || color
          }
        }],
        totalAmount: 49,
        shippingAddress: { address: "PROCESSED_AT_3D_LAB", city: "NEURAL_CITY", phone: "000-000-000" }
      };
      await placeOrder(orderData, token);
      setOrderStatus("SUCCESS // SENT_FOR_ADMIN_APPROVAL");
      alert("ORDER_TRANSMITTED: Your design is now in the Admin Vault.");
    } catch (err) {
      console.error("ORDER_TRANSMISSION_FAILED", err);
    } finally {
      setLoading(false);
    }
  };

  // --- PERSISTENCE LOGIC ---
  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const { data } = await getSessions(token);
      setSessions(data);
    } catch (err) { console.error("History fetch failed", err); }
  };

  useEffect(() => { fetchSessions(); }, [activeSidebarPanel]);

  const handleSaveSession = async (isAuto = false) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setIsSaving(true);
    try {
      const sessionData = {
        sessionId,
        name: `Design Lab - ${apparel} - ${new Date().toLocaleTimeString()}`,
        canvasJSON: JSON.stringify(canvasElements),
        fabricColor: color,
        baseType: apparel,
        aiTexture: modelTexture,
        thumbnail: modelTexture
      };
      const { data } = await saveSession(sessionData, token);
      setSessionId(data._id);
    } catch (err) { if (!isAuto) alert("Failed to save"); }
    finally { setIsSaving(false); }
  };

  useEffect(() => {
    if (canvasElements.length === 0) return;
    const timer = setTimeout(() => handleSaveSession(true), 5000);
    return () => clearTimeout(timer);
  }, [canvasElements, color, apparel]);

  const handleLoadSession = (session) => {
    setSessionId(session._id);
    setApparel(session.baseType);
    setColor(session.fabricColor);
    setCanvasElements(JSON.parse(session.canvasJSON || '[]'));
    setModelTexture(session.aiTexture);
    setActiveSidebarPanel(null);
  };

  return (
    <div className="flex flex-col bg-[#020204] pt-[0px] min-h-screen overflow-hidden">
      <div className="flex flex-col md:flex-row flex-grow border-t border-white/5 relative items-stretch md:pl-20">
      
      {/* SIDEBAR - Fixed Left */}
      <div className="fixed bottom-0 left-0 right-0 h-20 md:h-auto md:w-20 bg-[#020204] border-t md:border-t-0 md:border-r border-white/5 flex flex-row md:flex-col items-center justify-around md:justify-start md:pt-[40px] md:pb-4 gap-2 z-[90] shrink-0 md:top-0 md:bottom-0">
         {[
            { id: 'vault', icon: '💎', label: 'Vault' },
            { id: 'history', icon: '🕒', label: 'History' },
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

      {/* FLYOUT PANELS */}
      <AnimatePresence>
        {activeSidebarPanel && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-20 md:bottom-0 md:relative md:inset-auto md:w-[320px] bg-[#050508] border-t md:border-t-0 md:border-r border-white/5 z-[85] shadow-[20px_0_30px_rgba(0,0,0,0.5)] shrink-0 flex flex-col max-h-[60vh] md:max-h-none overflow-y-auto"
          >
             <div className="p-6 w-full md:w-[320px] space-y-8 flex-grow">
                {/* Vault Panel */}
                {activeSidebarPanel === 'vault' && (
                  <div className="space-y-6">
                    <h3 className="text-white font-bold tracking-wider mb-4 uppercase text-[10px]">Cloth Sample Vault</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { name: 'T-Shirt', icon: '👕', type: 't-shirt' },
                        { name: 'Hoodie', icon: '🧥', type: 'hoodie' },
                        { name: 'Sweatshirt', icon: '🧶', type: 'sweatshirt' }
                      ].map(item => (
                        <button 
                          key={item.type}
                          onClick={() => setApparel(item.type)}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${apparel === item.type ? 'bg-indigo-500/20 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'}`}
                        >
                          <span className="text-2xl mb-2">{item.icon}</span>
                          <span className="text-[8px] font-black uppercase tracking-widest">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeSidebarPanel === 'history' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-white font-bold tracking-wider uppercase text-xs">Project History</h3>
                      {isSaving && <span className="text-[8px] text-indigo-400 animate-pulse font-black uppercase">Saving...</span>}
                    </div>
                    <div className="space-y-3">
                      {sessions.length === 0 ? (
                        <p className="text-[10px] text-slate-500 text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/10 uppercase font-black">No History Node Found</p>
                      ) : (
                        sessions.map(s => (
                          <div 
                            key={s._id} onClick={() => handleLoadSession(s)}
                            className={`group p-4 rounded-2xl border transition-all cursor-pointer ${sessionId === s._id ? 'bg-indigo-600/20 border-indigo-500' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-black rounded-lg border border-white/5 flex items-center justify-center">
                                {s.thumbnail ? <img src={s.thumbnail} className="w-full h-full object-cover" /> : <span className="text-xs">🎨</span>}
                              </div>
                              <div className="flex-grow min-w-0">
                                <p className="text-[10px] font-black text-white uppercase truncate">{s.name}</p>
                                <p className="text-[8px] text-slate-500 font-bold uppercase">{new Date(s.updatedAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                {/* Text Panel */}
                {activeSidebarPanel === 'text' && (
                  <div className="space-y-4">
                    <h3 className="text-white font-bold tracking-wider mb-4 uppercase text-[10px]">Typography Protocol</h3>
                    <button 
                      onClick={handleAddText}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-2xl"
                    >
                      + Initialize Heading
                    </button>
                  </div>
                )}

                {/* Shapes Panel */}
                {activeSidebarPanel === 'shapes' && (
                  <div className="space-y-4">
                    <h3 className="text-white font-bold tracking-wider mb-4 uppercase text-[10px]">Geometry Engine</h3>
                    <button 
                      onClick={handleAddLine}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-2xl"
                    >
                      + Construct Line
                    </button>
                  </div>
                )}

                {/* Uploads Panel */}
                {activeSidebarPanel === 'uploads' && (
                  <div className="space-y-4">
                    <h3 className="text-white font-bold tracking-wider mb-4 uppercase text-[10px]">Media Uplink</h3>
                    <button 
                      onClick={() => fileInputRef.current.click()}
                      className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all"
                    >
                      Upload Graphic
                    </button>
                    <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
                  </div>
                )}

                {/* Layers Panel */}
                {activeSidebarPanel === 'layers' && (
                   <div className="space-y-4">
                     <h3 className="text-white font-bold tracking-wider mb-4 uppercase text-[10px]">Neural Layers</h3>
                     <div className="space-y-2">
                       {canvasElements.length === 0 ? (
                         <p className="text-[8px] text-slate-500 text-center py-8 bg-white/5 rounded-xl border border-dashed border-white/10 uppercase font-black">No Active Layers</p>
                       ) : (
                         [...canvasElements].reverse().map((el, idx) => (
                           <div 
                             key={el.id}
                             onClick={() => setActiveElementId(el.id)}
                             className={`flex justify-between items-center p-3 rounded-xl border transition-all cursor-pointer ${activeElementId === el.id ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                           >
                             <div className="flex items-center gap-3 overflow-hidden">
                               <span className="text-[8px] font-black truncate max-w-[150px] uppercase">
                                 {el.type === 'text' ? (el.content || 'Text') : el.type === 'line' ? 'Geometry Line' : 'Image Graphic'}
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
                       <h3 className="text-white font-bold tracking-wider mb-4 uppercase text-[10px]">Fabric Color</h3>
                       <div className="flex gap-3 flex-wrap">
                         {['#ffffff', '#000000', '#1a1a1a', '#e11d48', '#2563eb', '#16a34a', '#fbbf24'].map(c => (
                           <button 
                             key={c} onClick={() => setColor(c)}
                             className={`w-10 h-10 rounded-full border-2 transition-all duration-300 ${color === c ? 'border-indigo-500 scale-110' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
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
      <div className="flex-grow relative bg-[#0a0a0e] flex items-center justify-center overflow-hidden z-10 min-h-[50vh]" onClick={() => { setActiveSidebarPanel(null); setActiveElementId(null); }}>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          
          <model-viewer
            ref={modelViewerRef}
            src={modelPath}
            alt="3D Apparel Model"
            auto-rotate={!activeElementId}
            camera-controls
            shadow-intensity="1"
            environment-image="neutral"
            style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
            exposure="1"
          />

          {/* OVERLAID INTERACTIVE DESIGN CANVAS */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div 
              ref={canvasRef}
              className="w-[300px] h-[400px] pointer-events-auto relative mt-[-40px]"
            >
              {canvasElements.map(el => (
                <motion.div 
                  key={el.id} drag dragConstraints={canvasRef} dragElastic={0} dragMomentum={false}
                  onDragStart={() => setActiveElementId(el.id)}
                  onClick={(e) => { e.stopPropagation(); setActiveElementId(el.id); }}
                  className={`absolute cursor-move origin-center ${activeElementId === el.id ? 'ring-1 ring-indigo-500 bg-indigo-500/10 z-50' : 'hover:ring-1 hover:ring-white/20 z-10'}`}
                  style={{ left: el.x, top: el.y, scale: el.scale || 1 }}
                >
                  {el.type === 'text' ? (
                    <span className="text-4xl font-black uppercase tracking-tighter drop-shadow-md whitespace-nowrap px-1 block" style={{ color: el.color || textColor }}>{el.content}</span>
                  ) : el.type === 'line' ? (
                    <div 
                      style={{ 
                        width: `${el.width || 100}px`, 
                        height: `${el.height || 4}px`, 
                        backgroundColor: el.color || textColor,
                        borderRadius: '10px'
                      }} 
                    />
                  ) : (
                    <img src={el.content} className="w-40 h-auto object-contain drop-shadow-md pointer-events-none" alt="" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div className="absolute top-8 right-8 flex items-center gap-2 z-40 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 backdrop-blur-md">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500 animate-pulse' : 'bg-cyan-500'}`} />
            <span className="text-[9px] font-black uppercase tracking-widest text-white">
              {loading ? 'Processing...' : 'Active Node'}
            </span>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 z-40 flex gap-4 w-full md:w-auto px-6">
              <button 
                onClick={handleApplyTo3D} disabled={loading}
                className="flex-1 md:flex-none px-8 py-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-2xl"
              >
                Apply to 3D
              </button>
              <button 
                onClick={handleOrder} disabled={loading || !modelTexture}
                className="flex-1 md:flex-none px-8 py-4 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-30 shadow-2xl"
              >
                Confirm & Vault
              </button>
          </div>
      </div>

      {/* RIGHT EDIT PANEL */}
      <AnimatePresence>
        {activeElementId && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-[#050508] border-l border-white/5 h-full z-[85] shadow-[-20px_0_30px_rgba(0,0,0,0.5)] flex flex-col shrink-0 overflow-y-auto"
          >
            <div className="p-6 w-[300px] space-y-6">
               <h3 className="text-white font-bold tracking-wider text-[10px] uppercase border-b border-white/5 pb-4">Configuration</h3>
               
               <div className="space-y-6">
                  <div className="space-y-3">
                    <span className="text-[9px] text-slate-500 block font-black uppercase tracking-widest">Dimension Scale</span>
                    <input 
                      type="range" min="0.2" max="3" step="0.1"
                      value={canvasElements.find(e => e.id === activeElementId)?.scale || 1}
                      onChange={(e) => setCanvasElements(els => els.map(el => el.id === activeElementId ? { ...el, scale: parseFloat(e.target.value) } : el))}
                      className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {canvasElements.find(e => e.id === activeElementId)?.type === 'text' && (
                    <div className="space-y-3">
                      <span className="text-[9px] text-slate-500 block font-black uppercase tracking-widest">Text Input</span>
                      <input 
                        type="text"
                        value={canvasElements.find(e => e.id === activeElementId)?.content || ''}
                        onChange={(e) => setCanvasElements(els => els.map(el => el.id === activeElementId ? { ...el, content: e.target.value } : el))}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-[11px] text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  )}

                  {canvasElements.find(e => e.id === activeElementId)?.type === 'line' && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <span className="text-[9px] text-slate-500 block font-black uppercase tracking-widest">Line Width</span>
                        <input 
                          type="range" min="10" max="300" step="1"
                          value={canvasElements.find(e => e.id === activeElementId)?.width || 100}
                          onChange={(e) => setCanvasElements(els => els.map(el => el.id === activeElementId ? { ...el, width: parseInt(e.target.value) } : el))}
                          className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="space-y-3">
                        <span className="text-[9px] text-slate-500 block font-black uppercase tracking-widest">Thickness</span>
                        <input 
                          type="range" min="1" max="50" step="1"
                          value={canvasElements.find(e => e.id === activeElementId)?.height || 4}
                          onChange={(e) => setCanvasElements(els => els.map(el => el.id === activeElementId ? { ...el, height: parseInt(e.target.value) } : el))}
                          className="w-full accent-indigo-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="space-y-3">
                        <span className="text-[9px] text-slate-500 block font-black uppercase tracking-widest">Line Color</span>
                        <div className="flex gap-2 flex-wrap">
                          {['#ffffff', '#000000', '#ff0000', '#00ff00', '#2563eb', '#fbbf24', '#e11d48'].map(c => (
                            <button 
                              key={c}
                              onClick={() => setCanvasElements(els => els.map(el => el.id === activeElementId ? { ...el, color: c } : el))}
                              className={`w-6 h-6 rounded-full border-2 transition-all ${canvasElements.find(e => e.id === activeElementId)?.color === c ? 'border-white scale-110' : 'border-transparent opacity-60'}`}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => setActiveElementId(null)}
                    className="w-full py-4 bg-white/5 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-white transition-all"
                  >
                    Close Element Edit
                  </button>
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
