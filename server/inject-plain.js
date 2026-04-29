const mongoose = require('mongoose');
const Product = require('./models/product');
const dotenv = require('dotenv');

dotenv.config();

const injectPlainApparel = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB for injection...");

        const plainItems = [
            {
                name: "Plain Essential T-Shirt",
                price: 29,
                description: "High-quality heavy cotton plain tee. Perfect base for manual or AI customization.",
                category: "Plain",
                imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
                stock: 100,
                specs: ["100% Cotton", "Pre-shrunk", "Reinforced seams"]
            },
            {
                name: "Plain Oversized Hoodie",
                price: 59,
                description: "Premium fleece-lined oversized hoodie. Optimized for large graphic prints.",
                category: "Plain",
                imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop",
                stock: 100,
                specs: ["Heavy Fleece", "Kangaroo Pocket", "Ribbed Cuffs"]
            },
            {
                name: "Plain Performance Sweatshirt",
                price: 49,
                description: "Clean aesthetic performance sweatshirt. Ideal for minimal lines or custom patterns.",
                category: "Plain",
                imageUrl: "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop",
                stock: 100,
                specs: ["Breathable Mesh", "Athletic Fit", "Sweat-wicking"]
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

        console.log("Injection Complete.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

injectPlainApparel();
