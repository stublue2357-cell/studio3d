require('dotenv').config();
const axios = require('axios');

const testHFCorrectUrl = async () => {
    // Some accounts use /models/, some use /pipeline/text-to-image/
    const urls = [
        "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
        "https://api-inference.huggingface.co/pipeline/text-to-image/runwayml/stable-diffusion-v1-5"
    ];

    for (const url of urls) {
        console.log(`Testing URL: ${url}`);
        try {
            const res = await axios.post(url, { inputs: "test" }, { headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` } });
            console.log(`SUCCESS with ${url}!`);
            return;
        } catch (err) {
            console.log(`FAILED with ${url}: ${err.message}`);
        }
    }
    console.log("ALL HF URLS FAILED.");
};

testHFCorrectUrl();
