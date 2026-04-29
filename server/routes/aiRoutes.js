const express = require('express');
const axios = require('axios'); 
const router = express.Router();

/**
 * AI GENERATION ROUTE (HUGGING FACE INTEGRATION)
 * ----------------------------------------------
 * This route interfaces with Hugging Face's Inference API to generate 
 * images using the Stable Diffusion XL model.
 * 
 * Key Concept: PROPER API INTEGRATION
 * Using an API key stored in .env ensures security. We send a POST
 * request to Hugging Face and convert the binary response to Base64.
 */
const HF_API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
const HF_TOKEN = process.env.HF_TOKEN;
router.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log("Synthesizing prompt:", prompt);

        // 👉 💻 SANITIZATION:
        // Removing special characters from the prompt to avoid API errors.
        const cleanPrompt = prompt.replace(/[^a-zA-Z0-9 ]/g, "");
        
        const finalPrompt = cleanPrompt + " seamless fabric texture pattern 8k, highly detailed, professional apparel design";
        
        console.log("Sending request to Hugging Face...");
        
        const response = await axios.post(
            HF_API_URL,
            { inputs: finalPrompt },
            { 
                headers: { Authorization: `Bearer ${HF_TOKEN}` },
                responseType: 'arraybuffer' 
            }
        );
        
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        const finalData = `data:image/png;base64,${base64Image}`;

        console.log("Success: Hugging Face image generated and encoded");
        res.status(200).json({ imageUrl: finalData });

    } catch (error) {
        console.error("Server AI Error:", error.message);
        res.status(500).json({ message: "Neural Engine failure." });
    }
});

module.exports = router;