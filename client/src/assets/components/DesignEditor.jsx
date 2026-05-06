import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

/**
 * DESIGN EDITOR COMPONENT (2D CANVAS LAYER)
 * -----------------------------------------
 */
const DesignEditor = ({ onExport, activePanel, initialState, onStateChange }) => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [fabricColor, setFabricColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(40);
  const [portalTarget, setPortalTarget] = useState(null);
  const [uiPortalTarget, setUiPortalTarget] = useState(null);
  const [layers, setLayers] = useState([]);
  const [activeLayerId, setActiveLayerId] = useState(null);
  const [shapeSize, setShapeSize] = useState(50);
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(0);
  const lastLoadedStateRef = useRef(null);

  useEffect(() => {
    // Locate the portal targets
    const findTargets = () => {
      setPortalTarget(document.getElementById('fabric-portal-target'));
      setUiPortalTarget(document.getElementById('design-editor-ui-portal'));
    };

    const handleAddAiImage = (e) => {
      if (!fabricCanvas) return;
      const imageUrl = e.detail;
      
      const imgElement = new Image();
      imgElement.crossOrigin = "anonymous";
      imgElement.src = imageUrl;
      imgElement.onload = () => {
        const ImageClass = fabric.Image || fabric.FabricImage;
        const img = new ImageClass(imgElement);
        img.set({ id: `ai_layer_${Date.now()}` });
        img.scaleToWidth(200);
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.centerObject(img);
        fabricCanvas.renderAll();
        
        // Trigger export
        const dataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 1 });
        onExport(dataUrl);
      };
    };

    window.addEventListener('ADD_AI_IMAGE', handleAddAiImage);
    findTargets();
    // Re-check after a short delay to account for AnimatePresence timing
    const timer = setTimeout(findTargets, 100);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('ADD_AI_IMAGE', handleAddAiImage);
    };
  }, [activePanel, fabricCanvas, onExport]);

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
  }, [portalTarget]); // Removed initialState from here

  // Separate effect for loading initial state to prevent re-initialization
  useEffect(() => {
    if (!fabricCanvas || !initialState) return;
    
    // Only load if it's different from what we last loaded
    if (initialState === lastLoadedStateRef.current) return;

    fabricCanvas.loadFromJSON(initialState).then(() => {
      fabricCanvas.renderAll();
      lastLoadedStateRef.current = initialState;
      const dataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 1 });
      onExport(dataUrl);
    });
  }, [fabricCanvas, initialState, onExport]);


  useEffect(() => {
    if (!fabricCanvas || !onStateChange) return;

    const handleChange = () => {
      const json = JSON.stringify(fabricCanvas.toJSON());
      // Prevent recursive updates
      if (json === lastLoadedStateRef.current) return;
      onStateChange(json);
    };

    fabricCanvas.on('object:modified', handleChange);
    fabricCanvas.on('object:added', handleChange);
    fabricCanvas.on('object:removed', handleChange);

    return () => {
      fabricCanvas.off('object:modified', handleChange);
      fabricCanvas.off('object:added', handleChange);
      fabricCanvas.off('object:removed', handleChange);
    };
  }, [fabricCanvas, onStateChange]);

  // Professional Sync: Tell the 3D model to change color
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('FABRIC_COLOR_SYNC', { detail: fabricColor }));
  }, [fabricColor]);

  // Auto-export design on modification for real-time 3D updates
  useEffect(() => {
    if (!fabricCanvas) return;
    
    const syncStates = () => {
      const activeObj = fabricCanvas.getActiveObject();
      if (!activeObj) {
        setActiveLayerId(null);
        return;
      }

      setActiveLayerId(activeObj.id || `layer_${fabricCanvas.getObjects().indexOf(activeObj)}`);
      
      // Sync Color
      if (activeObj.fill) {
        let color = activeObj.fill;
        if (typeof color !== 'string' && color.toLive) {
           // It's a fabric color object or gradient
           color = color.toLive(fabricCanvas.contextContainer);
        }
        if (typeof color === 'string') {
          setTextColor(color);
        } else if (color && color.toRgb) {
          setTextColor(color.toRgb());
        }
      }

      // Sync Stroke
      if (activeObj.stroke) setStrokeColor(activeObj.stroke);
      if (activeObj.strokeWidth !== undefined) setStrokeWidth(activeObj.strokeWidth);

      // Sync Font/Size for Text
      if (activeObj.type === 'text' || activeObj.type === 'i-text' || activeObj.type === 'IText') {
        if (activeObj.fontSize) setFontSize(activeObj.fontSize);
        if (activeObj.fontFamily) setFontFamily(activeObj.fontFamily);
      }

      // Sync Shape Size
      if (activeObj.type === 'rect') {
        setShapeSize(Math.round(activeObj.height * (activeObj.scaleY || 1)));
      } else if (activeObj.type === 'circle') {
        setShapeSize(Math.round(activeObj.radius * (activeObj.scaleX || 1)));
      } else if (activeObj.type === 'triangle') {
        setShapeSize(Math.round((activeObj.width * (activeObj.scaleX || 1)) / 2));
      }
    };

    const triggerExport = () => {
      const dataUrl = fabricCanvas.toDataURL({ format: 'png', quality: 1 });
      onExport(dataUrl);
      
      // Update layers UI
      const objects = fabricCanvas.getObjects();
      setLayers(objects.map((obj, i) => ({
        id: obj.id || `layer_${i}`,
        type: obj.type,
        text: obj.text || (obj.type === 'rect' ? 'Line' : obj.type === 'circle' ? 'Circle' : obj.type === 'triangle' ? 'Triangle' : `Image ${i+1}`),
        objRef: obj
      })));
      
      syncStates();
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
      } else {
        // --- NON-MODIFIER KEYS ---
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            const activeObjects = fabricCanvas.getActiveObjects();
            if (activeObjects.length > 0) {
              e.preventDefault();
              fabricCanvas.discardActiveObject();
              fabricCanvas.remove(...activeObjects);
              fabricCanvas.requestRenderAll();
            }
            break;
          case 'Escape':
            e.preventDefault();
            fabricCanvas.discardActiveObject();
            fabricCanvas.requestRenderAll();
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

  const addLine = () => {
    if (!fabricCanvas) return;
    const line = new fabric.Rect({
      id: `layer_${Date.now()}`,
      left: 100,
      top: 150,
      width: 150,
      height: 5,
      fill: textColor,
      rx: 2,
      ry: 2,
      strokeWidth: 0
    });
    fabricCanvas.add(line);
    fabricCanvas.setActiveObject(line);
  };

  const addCircle = () => {
    if (!fabricCanvas) return;
    const circle = new fabric.Circle({
      id: `layer_${Date.now()}`,
      left: 150,
      top: 150,
      radius: 50,
      fill: textColor,
      strokeWidth: 0
    });
    fabricCanvas.add(circle);
    fabricCanvas.setActiveObject(circle);
  };

  const addTriangle = () => {
    if (!fabricCanvas) return;
    const triangle = new fabric.Triangle({
      id: `layer_${Date.now()}`,
      left: 150,
      top: 150,
      width: 100,
      height: 100,
      fill: textColor,
      strokeWidth: 0
    });
    fabricCanvas.add(triangle);
    fabricCanvas.setActiveObject(triangle);
  };

  const handleTextColorChange = (color) => {
    console.log('Changing color to:', color);
    setTextColor(color);
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject) {
        console.log('Applying color to active object:', activeObject.type);
        if (activeObject.type === 'activeSelection') {
          activeObject.forEachObject((obj) => {
            obj.set('fill', color);
          });
        } else {
          activeObject.set('fill', color);
        }
        fabricCanvas.renderAll();
        
        // IMPORTANT: Manually trigger the modification events so listeners update 3D model and history
        fabricCanvas.fire('object:modified', { target: activeObject });
      } else {
        console.log('No active object to apply color to');
      }
    }
  };

  const handleStrokeColorChange = (color) => {
    setStrokeColor(color);
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject) {
        if (activeObject.type === 'activeSelection') {
          activeObject.forEachObject((obj) => {
            obj.set('stroke', color);
          });
        } else {
          activeObject.set('stroke', color);
        }
        fabricCanvas.renderAll();
        fabricCanvas.fire('object:modified', { target: activeObject });
      }
    }
  };

  const handleStrokeWidthChange = (width) => {
    const val = parseInt(width);
    setStrokeWidth(val);
    if (fabricCanvas) {
      const activeObject = fabricCanvas.getActiveObject();
      if (activeObject) {
        if (activeObject.type === 'activeSelection') {
          activeObject.forEachObject((obj) => {
            obj.set('strokeWidth', val);
          });
        } else {
          activeObject.set('strokeWidth', val);
        }
        fabricCanvas.renderAll();
        fabricCanvas.fire('object:modified', { target: activeObject });
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
        fabricCanvas.fire('object:modified', { target: activeObject });
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
        fabricCanvas.fire('object:modified', { target: activeObject });
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
      {uiPortalTarget && createPortal(
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

              {/* Quick Ink Color for Text */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  Text Color
                </label>
                <div className="flex gap-2 flex-wrap items-center">
                  {['#ffffff', '#000000', '#f87171', '#3b82f6', '#4ade80', '#facc15'].map(c => (
                    <button 
                      key={c} onClick={() => handleTextColorChange(c)}
                      className={`w-6 h-6 rounded-full border transition-all ${textColor === c ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <input 
                    type="color" value={textColor} onChange={(e) => handleTextColorChange(e.target.value)}
                    className="w-6 h-6 rounded-full bg-transparent border-none cursor-pointer p-0 overflow-hidden"
                  />
                </div>
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
              <label 
                htmlFor="design-upload"
                className="cursor-pointer block px-4 py-4 bg-fuchsia-600 hover:bg-fuchsia-500 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all text-center w-full shadow-[0_0_15px_rgba(192,38,211,0.3)]"
              >
                Upload Image
              </label>
              <input 
                id="design-upload"
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          {activePanel === 'shapes' && (
            <>
              <div className="space-y-8">
                <h3 className="text-white font-bold tracking-wider mb-4">Geometric Elements</h3>
                <div className="grid grid-cols-1 gap-3">
                  <button 
                    onClick={addLine}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <span className="text-lg">━</span> Construct Line
                  </button>
                  <button 
                    onClick={addCircle}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <span className="text-lg">●</span> Construct Circle
                  </button>
                  <button 
                    onClick={addTriangle}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all shadow-lg flex items-center justify-center gap-3"
                  >
                    <span className="text-lg">▲</span> Construct Triangle
                  </button>
                </div>

                {/* Quick Ink Color for Shapes */}
                <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    Shape Color
                  </label>
                  <div className="flex gap-2 flex-wrap items-center">
                    {['#ffffff', '#000000', '#f87171', '#3b82f6', '#4ade80', '#facc15'].map(c => (
                      <button 
                        key={c} onClick={() => handleTextColorChange(c)}
                        className={`w-6 h-6 rounded-full border transition-all ${textColor === c ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input 
                      type="color" value={textColor} onChange={(e) => handleTextColorChange(e.target.value)}
                      className="w-6 h-6 rounded-full bg-transparent border-none cursor-pointer p-0 overflow-hidden"
                    />
                  </div>
                </div>

                {/* Stroke/Outline Color */}
                <div className="space-y-4 pt-6 mt-6 border-t border-white/5">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-400 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Outline Color
                  </label>
                  <div className="flex gap-2 flex-wrap items-center">
                    {['#ffffff', '#000000', '#f87171', '#3b82f6', '#4ade80', '#facc15'].map(c => (
                      <button 
                        key={c} onClick={() => handleStrokeColorChange(c)}
                        className={`w-6 h-6 rounded-full border transition-all ${strokeColor === c ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input 
                      type="color" value={strokeColor} onChange={(e) => handleStrokeColorChange(e.target.value)}
                      className="w-6 h-6 rounded-full bg-transparent border-none cursor-pointer p-0 overflow-hidden"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mt-8">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-cyan-400 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  Shape Properties
                </label>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Dimension / Thickness</span>
                      <span className="text-[10px] text-white font-bold">{shapeSize}px</span>
                    </div>
                    <input 
                      type="range" min="1" max="200" step="1"
                      value={shapeSize}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setShapeSize(val);
                        const activeObject = fabricCanvas?.getActiveObject();
                        if (!activeObject) return;

                        if (activeObject.type === 'rect') {
                          activeObject.set({ height: val, scaleY: 1 });
                        } else if (activeObject.type === 'circle') {
                          activeObject.set({ radius: val, scaleX: 1, scaleY: 1 });
                        } else if (activeObject.type === 'triangle') {
                          activeObject.set({ width: val * 2, height: val * 2, scaleX: 1, scaleY: 1 });
                        }
                        
                        fabricCanvas.renderAll();
                        fabricCanvas.fire('object:modified', { target: activeObject });
                      }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Outline Weight</span>
                      <span className="text-[10px] text-white font-bold">{strokeWidth}px</span>
                    </div>
                    <input 
                      type="range" min="0" max="20" step="1"
                      value={strokeWidth}
                      onChange={(e) => handleStrokeWidthChange(e.target.value)}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mt-4">
                Note: Use the "Colors" panel to change the line color while the line is selected.
              </p>
            </>
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
                        <span className="text-lg">
                          {layer.type === 'image' ? '🖼️' : 
                           layer.type === 'rect' ? '━' : 
                           layer.type === 'circle' ? '●' :
                           layer.type === 'triangle' ? '▲' : 'T'}
                        </span>
                        <span className="text-[10px] font-black uppercase text-white truncate max-w-[120px]">
                          {layer.type === 'rect' ? 'Geometry Line' : 
                           layer.type === 'circle' ? 'Geometry Circle' :
                           layer.type === 'triangle' ? 'Geometry Triangle' : layer.text}
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
          {['text', 'uploads', 'colors', 'layers', 'shapes'].includes(activePanel) && (
            <div className="pt-8 mt-4 border-t border-white/5">
              <button onClick={exportDesign} className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all shadow-xl">
                Force Render Sync
              </button>
            </div>
          )}
        </>,
        uiPortalTarget
      )}

      {/* PORTAL RENDER: This renders the canvas directly over the 3D Viewer in AIStudio */}
      {portalTarget && createPortal(
        <div className={`relative w-[300px] h-[400px] mt-[-40px] transition-all ${['ai', 'text', 'uploads', 'layers', 'shapes'].includes(activePanel) ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          <canvas ref={canvasRef} className="max-w-full h-auto" />
        </div>,
        portalTarget
      )}
    </>
  );
};

export default DesignEditor;
