const mongoose = require('mongoose');
const Product = require('./models/product');
const dotenv = require('dotenv');

dotenv.config();

const injectGranularApparel = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB for granular injection...");

        const plainItems = [
            {
                name: "Standard Half-Sleeve Shirt",
                price: 35,
                description: "Relaxed fit half-sleeve button-up. Classic summer vibe.",
                category: "Plain",
                imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop",
                modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
                stock: 50,
                specs: ["Linen Blend", "Half Sleeve", "Breathable"]
            },
            {
                name: "Premium Full-Arm Shirt",
                price: 45,
                description: "Formal/Casual full-sleeve shirt. Sleek silhouette.",
                category: "Plain",
                imageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c7176c8?q=80&w=1000&auto=format&fit=crop",
                modelUrl: "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb",
                stock: 50,
                specs: ["Oxford Cotton", "Full Arm", "Adjustable Cuffs"]
            }
        ];

        for (const item of plainItems) {
            const exists = await Product.findOne({ name: item.name });
            if (!exists) {
                await Product.create(item);
                console.log(`Injected: ${item.name}`);
            } else {
                console.log(`Exists: ${item.name}`);
            }
        }

        console.log("Granular Injection Complete.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

injectGranularApparel();
