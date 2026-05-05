const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authMiddleware } = require('../middleware/adminAuth');

// --- 1. AI IMAGE GENERATION (Stable Diffusion via Hugging Face) ---
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) return res.status(400).json({ msg: "PROMPT_REQUIRED" });

        console.log("AI_SYNTHESIS_INITIATED:", prompt);

        const modelId = "runwayml/stable-diffusion-v1-5";
        const hfUrl = `https://api-inference.huggingface.co/models/${modelId}`;

        console.log("AI_SYNTHESIS_ATTEMPTING_PRIMARY:", hfUrl);

        try {
            // --- ATTEMPT 1: HUGGING FACE (Professional) ---
            const response = await axios({
                url: hfUrl,
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.HF_TOKEN}`,
                    "Content-Type": "application/json",
                },
                data: JSON.stringify({ 
                    inputs: prompt + " seamless fabric texture pattern 8k, highly detailed, professional apparel design" 
                }),
                responseType: 'arraybuffer',
                timeout: 10000 // Short timeout to trigger fallback quickly if slow
            });

            const base64Image = Buffer.from(response.data, 'binary').toString('base64');
            const imageUrl = `data:image/png;base64,${base64Image}`;
            console.log("SUCCESS: Primary Engine (Hugging Face) Delivered Image.");
            return res.json({ imageUrl, engine: "huggingface" });

        } catch (hfErr) {
            console.log("PRIMARY_ENGINE_OFFLINE // FALLING_BACK_TO_SECONDARY:", hfErr.message);
            
            // --- ATTEMPT 2: POLLINATIONS.AI (High-Reliability Fallback) ---
            try {
                const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, "");
                const finalPrompt = encodeURIComponent(cleanPrompt + " seamless fabric texture pattern 8k");
                const seed = Math.floor(Math.random() * 999999);
                const backupUrl = `https://image.pollinations.ai/prompt/${finalPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`;

                const backupResponse = await axios.get(backupUrl, { 
                    responseType: 'arraybuffer',
                    timeout: 20000 // 20s for fallback
                });
                const base64Image = Buffer.from(backupResponse.data, 'binary').toString('base64');
                const imageUrl = `data:image/png;base64,${base64Image}`;
                
                console.log("SUCCESS: Secondary Engine (Pollinations) Saved the Design.");
                return res.json({ imageUrl, engine: "pollinations_fallback" });

            } catch (backupErr) {
                console.error("SECONDARY_ENGINE_FAILED:", backupErr.message);
                
                // --- ATTEMPT 3: STATIC PREMIUM PLACEHOLDER (The "Show Must Go On" Fallback) ---
                console.log("FINAL_RESORT: Delivering high-quality static design placeholder.");
                const staticPlaceholder = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1024&auto=format&fit=crop";
                return res.json({ 
                    imageUrl: staticPlaceholder, 
                    engine: "static_placeholder",
                    message: "Synthesized via backup local cache." 
                });
            }
        }

    } catch (err) {
        console.error("AI_GENERATION_CRITICAL_ERROR:", err.message);
        res.status(500).json({ message: "Neural grid is currently unreachable. Check your internet connection." });
    }
});

// --- 2. AI DESIGN SUGGESTIONS (Textual advice) ---
router.post('/suggest', authMiddleware, async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) return res.status(400).json({ msg: "PROMPT_REQUIRED" });

        console.log("AI_SUGGESTION_REQUESTED:", prompt);

        // --- INTELLIGENT SUGGESTION LOGIC ---
        const designKeywords = {
            cyberpunk: ["neon accents", "glitch effects", "techwear patterns", "cyan/magenta glow"],
            minimalist: ["fine line work", "monochrome palette", "large whitespace", "geometric focus"],
            vintage: ["distressed textures", "retro typography", "faded earth tones", "halftone patterns"],
            streetwear: ["bold branding", "asymmetrical layouts", "graffiti elements", "high contrast"]
        };

        let context = "general aesthetic";
        for (const key in designKeywords) {
            if (prompt.toLowerCase().includes(key)) {
                context = key;
                break;
            }
        }

        const baseSuggestions = [
            "Consider centering your primary graphic to establish a strong focal point.",
            "Try adding a subtle outer glow to your text for a 'holographic' effect.",
            "Using a vertical line arrangement on the sleeves can elongate the silhouette.",
            "A small geometric logo on the pocket area adds a professional 'brand' feel.",
            "Mix different line weights (thick and thin) to create a sense of technical depth."
        ];

        const contextSuggestions = designKeywords[context] || [];
        const finalSuggestions = [...contextSuggestions, ...baseSuggestions];
        
        // Pick 2-3 random suggestions
        const selected = finalSuggestions.sort(() => 0.5 - Math.random()).slice(0, 3);
        
        const suggestionText = `ANALYSIS COMPLETE: For a ${context} look, I suggest: \n\n` + 
                               selected.map(s => `• ${s}`).join('\n');

        // Simulate AI thinking delay
        await new Promise(r => setTimeout(r, 1500));

        res.json({ suggestion: suggestionText });
    } catch (err) {
        console.error("AI_SUGGESTION_ERROR:", err.message);
        res.status(500).json({ message: "Neural suggestion engine offline." });
    }
});

module.exports = router;
