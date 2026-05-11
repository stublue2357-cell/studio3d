import React, { useState, useEffect } from 'react';
import CanvasModel from '../canvas';
import { useSearchParams } from 'react-router-dom';

// ====================================================================
// 🧊 View3D COMPONENT: 
// A dedicated full-screen page for rendering the 3D model with 
// high-resolution neural AI textures applied. Used by the Admin Panel.
// ====================================================================
const View3D = () => {
    const [searchParams] = useSearchParams();
    
    // Fallback to 'shirt_baked' if no specific model is requested via URL
    const model = searchParams.get('model') || 'shirt_baked';
    const label = searchParams.get('label') || '3D Design Preview';

    // State to hold the parsed AI texture strings/colors
    const [designData, setDesignData] = useState({ aiTexture: null, overlayTexture: null, partColors: {} });

    useEffect(() => {
        try {
            // Retrieve the temporary design data stored by AdminOrders.jsx before opening this tab
            const data = localStorage.getItem('view3d_design_data');
            if (data) {
                const parsed = JSON.parse(data);
                
                // Map the stored data to our CanvasModel props
                setDesignData({
                    aiTexture: parsed.aiTexture || parsed.aiImage,
                    overlayTexture: parsed.overlayTexture || parsed.data || parsed.overlayImage,
                    partColors: parsed.partColors || {}
                });
            }
        } catch(e) {
            console.error("Failed to parse design data from localStorage", e);
        }
    }, []);

    return (
        <div className="w-screen h-screen bg-[#020204] relative overflow-hidden">
            <div className="absolute top-6 left-6 z-10 p-4 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10">
                <h1 className="text-xl font-black italic uppercase text-white tracking-widest">{label}</h1>
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.4em]">High-Res Neural Preview</p>
            </div>
            
            <div className="w-full h-full">
                <CanvasModel 
                    baseType={model} 
                    aiTexture={designData?.aiTexture} 
                    overlayTexture={designData?.overlayTexture} 
                    initialPartColors={designData?.partColors}
                />
            </div>
            
            <div className="absolute bottom-6 right-6 z-10 flex gap-4">
                <button 
                    onClick={() => {
                        localStorage.removeItem('view3d_design_data');
                        window.close();
                    }} 
                    className="px-6 py-3 bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/50 hover:text-rose-400 text-[10px] text-slate-400 font-black uppercase tracking-widest rounded-xl transition-all"
                >
                    Close Preview
                </button>
            </div>
        </div>
    );
};

export default View3D;
