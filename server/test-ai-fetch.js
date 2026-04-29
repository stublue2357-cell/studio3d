const dotenv = require('dotenv');
dotenv.config();

const testAI = async () => {
    try {
        console.log("Testing AI Neural Link (using fetch)...");
        const response = await fetch("https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5", {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: "a blue cat" }),
        });
        
        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);
        process.exit(0);
    } catch (err) {
        console.error("FAILED:", err.message);
        process.exit(1);
    }
};

testAI();
