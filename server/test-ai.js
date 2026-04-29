const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const testAI = async () => {
    try {
        console.log("Testing AI Neural Link (Model: SD 2.1)...");
        const response = await axios({
            url: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            data: JSON.stringify({ inputs: "a futuristic cyberpunk shirt" }),
            responseType: 'arraybuffer'
        });
        console.log("Success! Image received, size:", response.data.byteLength);
        process.exit(0);
    } catch (err) {
        if (err.response) {
            console.error("AI_API_STATUS:", err.response.status);
            try {
               console.error("AI_API_BODY:", JSON.parse(err.response.data.toString()));
            } catch (e) {
               console.error("AI_API_BODY_RAW:", err.response.data.toString().slice(0, 500));
            }
        } else {
            console.error("AI_CONNECTION_ERROR:", err.message);
        }
        process.exit(1);
    }
};

testAI();
