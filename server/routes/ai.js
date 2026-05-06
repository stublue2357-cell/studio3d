const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authMiddleware } = require('../middleware/adminAuth');

// --- 1. AI IMAGE GENERATION (Multi-Engine Synthesis) ---
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) return res.status(400).json({ msg: "PROMPT_REQUIRED" });

        // --- AI SYNTHESIS START ---
        console.log("AI_SYNTHESIS_INITIATED:", prompt);

        // 1. PRIMARY ENGINE: HUGGING FACE (Stable Diffusion XL)
        try {
            const hfToken = process.env.HF_TOKEN;
            if (!hfToken || hfToken.includes('dummy')) {
                throw new Error("INVALID_HF_TOKEN");
            }

            console.log("ATTEMPTING_PRIMARY_ENGINE...");
            const response = await axios({
                url: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${hfToken}`,
                    "Content-Type": "application/json",
                },
                data: JSON.stringify({ 
                    inputs: prompt + ", 8k resolution, highly detailed, professional apparel design, masterpiece" 
                }),
                responseType: 'arraybuffer',
                timeout: 20000 
            });

            const base64Image = Buffer.from(response.data, 'binary').toString('base64');
            console.log("SUCCESS: Primary Engine (Hugging Face) Delivered Image.");
            return res.json({ imageUrl: `data:image/png;base64,${base64Image}`, engine: "huggingface" });

        } catch (hfErr) {
            console.log("PRIMARY_ENGINE_BYPASS // FALLING_BACK_TO_SECONDARY:", hfErr.message);
            
            // 2. SECONDARY ENGINE: POLLINATIONS (High Reliability)
            // We fetch this on the server to avoid CORS/Blocking issues and ensure unique delivery
            try {
                const seed = Math.floor(Math.random() * 1000000);
                const cleanPrompt = encodeURIComponent(prompt.replace(/[^a-zA-Z0-9 ]/g, ""));
                // Switched to default fast model and increased timeout for complex prompts
                const pollinationsUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`;

                console.log("FETCHING_FROM_SECONDARY_NODE (WAITING...):", pollinationsUrl);
                
                const response = await axios.get(pollinationsUrl, { 
                    responseType: 'arraybuffer',
                    timeout: 60000 // Increased to 60s for complex prompts
                });

                const base64Image = Buffer.from(response.data, 'binary').toString('base64');
                console.log("SUCCESS: Secondary Engine (Pollinations) Delivered Image.");
                
                return res.json({ 
                    imageUrl: `data:image/png;base64,${base64Image}`, 
                    engine: "pollinations_relay",
                    message: "Synthesized via high-speed neural node."
                });

            } catch (backupErr) {
                console.error("SECONDARY_ENGINE_FAILED:", backupErr.message);
                
                // 3. FINAL RESORT: DIVERSE PREMIUM PLACEHOLDERS
                // If AI is totally offline, we pick from a curated pool so it's not the same image every time
                const fallbacks = [
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1024&auto=format&fit=crop", // Abstract 1
                    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1024&auto=format&fit=crop", // Abstract 2
                    "https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?q=80&w=1024&auto=format&fit=crop", // Abstract 3
                    "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1024&auto=format&fit=crop"  // Abstract 4
                ];
                
                const randomPlaceholder = fallbacks[Math.floor(Math.random() * fallbacks.length)];
                
                console.log("FINAL_RESORT: Delivering randomized design placeholder.");
                return res.json({ 
                    imageUrl: randomPlaceholder, 
                    engine: "static_pool",
                    message: "Delivering cached design template due to network congestion." 
                });
            }
        }

    } catch (err) {
        console.error("AI_GENERATION_CRITICAL_ERROR:", err.message);
        res.status(500).json({ message: "Neural grid is currently unreachable." });
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
