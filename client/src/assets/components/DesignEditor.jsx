import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

/**
 * DESIGN EDITOR COMPONENT (2D CANVAS LAYER)
 * -----------------------------------------
 */
const DesignEditor = ({ onExport, activePanel }) => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [fabricColor, setFabricColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(40);
  const [portalTarget, setPortalTarget] = useState(null);
  const [layers, setLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);

  useEffect(() => {
    // Locate the portal target on mount
    setPortalTarget(document.getElementById('fabric-portal-target'));
  }, []);

  useEffect(() => {
    if (!portalTarget || !canvasRef.current) return;

    // Load Professional Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Pacifico&family=Inter:wght@900&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 400,
      height: 400,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
    });
    setFabricCanvas(canvas);

    return () => {
      canvas.dispose();
      document.head.removeChild(link);
    };
  }, [portalTarget]);

  // Professional Sync: Tell the 3D model to change color
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('FABRIC_COLOR_SYNC', { detail: fabricColor }));
  }, [fabricColor]);

  // Auto-export design on modification for real-time 3D updates
  useEffect(() => {
    if (!fabricCanvas) return;
    
    const triggerExport = () => {
      const dataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 1 });
      onExport(dataUrl);
      
      // Update layers UI
      const objects = fabricCanvas.getObjects();
      setLayers(objects.map((obj, i) => ({
        id: obj.id || `layer_${i}`,
        type: obj.type,
        text: obj.text || `Image ${i+1}`,
        objRef: obj
      })));
      
      const activeObj = fabricCanvas.getActiveObject();
      setActiveLayerId(activeObj ? (activeObj.id || `layer_${objects.indexOf(activeObj)}`) : null);
    };

    fabricCanvas.on('object:modified', triggerExport);
    fabricCanvas.on('object:added', triggerExport);
    fabricCanvas.on('object:removed', triggerExport);
    fabricCanvas.on('selection:created', triggerExport);
    fabricCanvas.on('selection:updated', triggerExport);
    fabricCanvas.on('selection:cleared', triggerExport);

    return () => {
      fabricCanvas.off('object:modified', triggerExport);
      fabricCanvas.off('object:added', triggerExport);
      fabricCanvas.off('object:removed', triggerExport);
      fabricCanvas.off('selection:created', triggerExport);
      fabricCanvas.off('selection:updated', triggerExport);
      fabricCanvas.off('selection:cleared', triggerExport);
    };
  }, [fabricCanvas, onExport]);

  // Keyboard Shortcuts (Ctrl+C, Ctrl+V, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    if (!fabricCanvas) return;

    let _clipboard = null;
    let history = [];
    let historyIndex = -1;
    let isHistoryProcessing = false;

    const saveHistory = () => {
      if (isHistoryProcessing) return;
      const json = JSON.stringify(fabricCanvas.toJSON());
      history = history.slice(0, historyIndex + 1);
      history.push(json);
      historyIndex++;
    };

    fabricCanvas.on('object:added', saveHistory);
    fabricCanvas.on('object:modified', saveHistory);
    fabricCanvas.on('object:removed', saveHistory);
    
    // Save initial state
    saveHistory();

    const handleKeyDown = (e) => {
      // Only process if fabric canvas is the focus or no other input is focused
      if (e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'textarea') return;

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'c': // Copy
            e.preventDefault();
            const activeObject = fabricCanvas.getActiveObject();
            if (activeObject) {
              activeObject.clone().then((cloned) => {
                _clipboard = cloned;
              });
            }
            break;
          case 'v': // Paste
            e.preventDefault();
            if (_clipboard) {
              _clipboard.clone().then((clonedObj) => {
                fabricCanvas.discardActiveObject();
                clonedObj.set({
                  left: clonedObj.left + 20,
                  top: clonedObj.top + 20,
                  evented: true,
                });
                if (clonedObj.type === 'activeSelection') {
                  clonedObj.canvas = fabricCanvas;
                  clonedObj.forEachObject((obj) => {
                    fabricCanvas.add(obj);
                  });
                  clonedObj.setCoords();
                } else {
                  fabricCanvas.add(clonedObj);
                }
                _clipboard.top += 20;
                _clipboard.left += 20;
                fabricCanvas.setActiveObject(clonedObj);
                fabricCanvas.requestRenderAll();
              });
            }
            break;
          case 'z': // Undo
            e.preventDefault();
            if (historyIndex > 0) {
              isHistoryProcessing = true;
              historyIndex--;
              fabricCanvas.loadFromJSON(history[historyIndex]).then(() => {
                fabricCanvas.requestRenderAll();
                isHistoryProcessing = false;
                // Trigger export manually after history load
                const dataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 1 });
                onExport(dataUrl);
              });
            }
            break;
          case 'y': // Redo
            e.preventDefault();
            if (historyIndex < history.length - 1) {
              isHistoryProcessing = true;
              historyIndex++;
              fabricCanvas.loadFromJSON(history[historyIndex]).then(() => {
                fabricCanvas.requestRenderAll();
                isHistoryProcessing = false;
                // Trigger export manually after history load
                const dataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 1 });
                onExport(dataUrl);
              });
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      fabricCanvas.off('object:added', saveHistory);
      fabricCanvas.off('object:modified', saveHistory);
      fabricCanvas.off('object:removed', saveHistory);
    };
  }, [fabricCanvas, onExport]);

  const addText = () => {
    if (!fabricCanvas) return;
    const text = new fabric.IText('Your Text', {
      id: `layer_${Date.now()}`,
      left: 100,
      top: 100,
      fontFamily: fontFamily,
      fill: textColor,
      fontSize: fontSize,
      fontWeight: '900'
    });
    fabricCanvas.add(text);
    fabricCanvas.setActiveObject(text);
  };

  const handleTextColorChange = (color) => {
    setTextColor(color);
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text' || activeObject.type === 'IText')) {
        activeObject.set('fill', color);
        fabricCanvas.renderAll();
        // Trigger export
        onExport(fabricCanvas.toDataURL({ format: 'png', quality: 1 }));
      }
    }
  };

  const handleFontSizeChange = (size) => {
    const val = parseInt(size);
    setFontSize(val);
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text' || activeObject.type === 'IText')) {
        activeObject.set('fontSize', val);
        fabricCanvas.renderAll();
        onExport(fabricCanvas.toDataURL({ format: 'png', quality: 1 }));
      }
    }
  };

  const handleFontChange = (font) => {
    setFontFamily(font);
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text' || activeObject.type === 'IText')) {
        activeObject.set('fontFamily', font);
        fabricCanvas.renderAll();
        onExport(fabricCanvas.toDataURL({ format: 'png', quality: 1 }));
      }
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !fabricCanvas) return;
    const reader = new FileReader();
    reader.onload = (f) => {
      const data = f.target.result;
      
      const imgElement = new Image();
      imgElement.src = data;
      imgElement.onload = () => {
        const ImageClass = fabric.Image || fabric.FabricImage;
        const img = new ImageClass(imgElement);
        img.set({ id: `layer_${Date.now()}` });
        img.scaleToWidth(150);
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
        onExport(fabricCanvas.toDataURL({ format: 'png', quality: 1 }));
      };
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
  };

  const exportDesign = () => {
    if (!fabricCanvas) return;
    const dataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 1 });
    onExport(dataUrl);
  };

  const deleteLayer = (objRef) => {
    if (!fabricCanvas) return;
    fabricCanvas.remove(objRef);
    fabricCanvas.discardActiveObject();
    fabricCanvas.renderAll();
  };

  const selectLayer = (objRef) => {
    if (!fabricCanvas) return;
    fabricCanvas.setActiveObject(objRef);
    fabricCanvas.renderAll();
  };

  return (
    <>
      {activePanel === 'colors' && (
        <div className="space-y-8">
          <h3 className="text-white font-bold tracking-wider mb-4">Color Modules</h3>
          <div className="space-y-8">
            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Fabric Color
              </label>
              <div className="flex gap-2 flex-wrap items-center">
                {['#ffffff', '#000000', '#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#3b82f6', '#818cf8', '#c084fc', '#f472b6', '#94a3b8'].map(c => (
                  <button 
                    key={c} onClick={() => setFabricColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${fabricColor === c ? 'border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-40 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-dashed border-white/20 hover:border-white/50 transition-all cursor-pointer flex items-center justify-center">
                   <span className="absolute text-white text-[10px] pointer-events-none">+</span>
                   <input 
                     type="color" 
                     value={fabricColor}
                     onChange={(e) => setFabricColor(e.target.value)}
                     className="w-[200%] h-[200%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer opacity-0"
                     title="Custom Fabric Color"
                   />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                Ink Color
              </label>
              <div className="flex gap-2 flex-wrap items-center">
                {['#ffffff', '#000000', '#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#3b82f6', '#818cf8', '#c084fc', '#f472b6', '#94a3b8'].map(c => (
                  <button 
                    key={c} onClick={() => handleTextColorChange(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${textColor === c ? 'border-cyan-400 scale-110 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-transparent opacity-40 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-dashed border-white/20 hover:border-white/50 transition-all cursor-pointer flex items-center justify-center bg-transparent">
                   <span className="absolute text-white text-[10px] pointer-events-none">+</span>
                   <input 
                     type="color" 
                     value={textColor}
                     onChange={(e) => handleTextColorChange(e.target.value)}
                     className="w-[200%] h-[200%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer opacity-0"
                     title="Custom Ink Color"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activePanel === 'text' && (
        <div className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-white font-bold tracking-wider mb-4">Text Elements</h3>
            <button 
              onClick={addText}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
              + Add a heading
            </button>
          </div>
          
          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Scale (Size)
            </label>
            <input 
              type="range" min="10" max="150" value={fontSize} 
              onChange={(e) => handleFontSizeChange(e.target.value)}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(251,191,36,1)]" />
              Typography Style
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { name: 'Street', family: 'Bebas Neue' },
                { name: 'Classic', family: 'Inter' },
                { name: 'Artistic', family: 'Pacifico' }
              ].map(f => (
                <button 
                  key={f.family} 
                  onClick={() => handleFontChange(f.family)}
                  className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${fontFamily === f.family ? 'bg-amber-500 text-black scale-105 shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'}`}
                  style={{ fontFamily: f.family }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activePanel === 'uploads' && (
        <div className="space-y-4">
          <h3 className="text-white font-bold tracking-wider mb-4">Upload Media</h3>
          <label className="cursor-pointer block px-4 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all text-center w-full shadow-[0_0_15px_rgba(192,38,211,0.3)]">
            Upload Image
            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
          </label>
        </div>
      )}

      {activePanel === 'layers' && (
        <div className="space-y-4">
          <h3 className="text-white font-bold tracking-wider mb-4">Design Layers</h3>
          {layers.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-white/10 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              No Layers Found
            </div>
          ) : (
            <div className="space-y-2">
              {[...layers].reverse().map((layer, index) => (
                <div 
                  key={layer.id} 
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    activeLayerId === layer.id ? 'bg-indigo-600/20 border-indigo-500 shadow-lg' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                  }`}
                  onClick={() => selectLayer(layer.objRef)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{layer.type === 'image' ? '🖼️' : 'T'}</span>
                    <span className="text-[10px] font-black uppercase text-white truncate max-w-[120px]">
                      {layer.text}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteLayer(layer.objRef); }}
                    className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-rose-500/20 text-rose-500 transition-all"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Force Sync button visible only on tools */}
      {['text', 'uploads', 'colors', 'layers'].includes(activePanel) && (
        <div className="pt-8 mt-4 border-t border-white/5">
          <button onClick={exportDesign} className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all shadow-xl">
            Force Render Sync
          </button>
        </div>
      )}

      {/* PORTAL RENDER: This renders the canvas directly over the 3D Viewer in AIStudio */}
      {portalTarget && createPortal(
        <div className={`relative w-[300px] h-[400px] mt-[-40px] transition-all ${['text', 'uploads', 'layers'].includes(activePanel) ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <canvas ref={canvasRef} className="max-w-full h-auto" />
        </div>,
        portalTarget
      )}
    </>
  );
};

export default DesignEditor;
