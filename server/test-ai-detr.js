const dotenv = require('dotenv');
dotenv.config();

const testAI = async () => {
    try {
        console.log("Testing AI Neural Link (Model: Detr)...");
        const response = await fetch("https://api-inference.huggingface.co/models/facebook/detr-resnet-50", {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${process.env.HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: "https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/cats.png" }),
        });
        
        console.log("Status:", response.status);
        const text = await response.text();
        console.log("Response Snippet:", text.slice(0, 200));
        process.exit(0);
    } catch (err) {
        console.error("FAILED:", err.message);
        process.exit(1);
    }
};

testAI();
