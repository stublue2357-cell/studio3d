/**
 * MOCK_STORE // NEURAL_PERSISTENCE_LAYER
 * This utility provides in-memory persistence for Simulation Mode.
 * Data is lost on server restart, but stays consistent during runtime.
 */

class MockStore {
    constructor() {
        this.users = [
            { _id: "u1", name: "Haseeb Developer", email: "haseebsaleem312@gmail.com", role: "developer", createdAt: new Date() },
            { _id: "u2", name: "Studio Admin", email: "admin@studio3d.com", role: "admin", createdAt: new Date() },
            { _id: "u3", name: "Demo User", email: "user@demo.com", role: "user", createdAt: new Date() },
            { _id: "u4", name: "Test User", email: "test@test.com", role: "user", createdAt: new Date() }
        ];
        this.products = [
            {
                _id: "local_p1",
                name: "Blue Hoodie",
                glbModel: "blue_hoodie_with_print",
                price: 59,
                description: "Premium oversized hoodie with print. Available for full 3D customization.",
                category: "Designer",
                imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop",
                createdAt: new Date()
            },
            {
                _id: "local_p2",
                name: "Black Suit",
                glbModel: "black_suit",
                price: 149,
                description: "Tailored black suit set — Coat, Pants, Shirt, and Belt. Fully customizable per-part.",
                category: "Designer",
                imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop",
                createdAt: new Date()
            },
            {
                _id: "local_p3",
                name: "White Suit",
                glbModel: "white_suit",
                price: 129,
                description: "Classic white suit with Coat, Pants, Shirt, and Tie. Perfect for formal events.",
                category: "Designer",
                imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4b8a8f?q=80&w=1000&auto=format&fit=crop",
                createdAt: new Date()
            },
            {
                _id: "local_p4",
                name: "Bomber Jacket",
                glbModel: "bomber_jacket",
                price: 89,
                description: "Classic bomber jacket with customizable pockets and inner lining.",
                category: "Designer",
                imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop",
                createdAt: new Date()
            },
            {
                _id: "local_p5",
                name: "Pink Shirt",
                glbModel: "pink_shirt",
                price: 49,
                description: "Stylish pink shirt with zipper detail. Change colour per-part in the 3D Studio.",
                category: "Plain",
                imageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=1000&auto=format&fit=crop",
                createdAt: new Date()
            },
            {
                _id: "local_p6",
                name: "Pants",
                glbModel: "pants_1",
                price: 69,
                description: "Slim-fit pants with customizable front, back, and belt sections.",
                category: "Plain",
                imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1000&auto=format&fit=crop",
                createdAt: new Date()
            },
            {
                _id: "local_p7",
                name: "Classic Shirt",
                glbModel: "reality_texture_for_man_shirt",
                price: 45,
                description: "Classic men's shirt with realistic fabric texture. Button and shirt separately customizable.",
                category: "Plain",
                imageUrl: "https://images.unsplash.com/photo-1563630423918-b58f07336ac9?q=80&w=1000&auto=format&fit=crop",
                createdAt: new Date()
            },
            {
                _id: "local_p8",
                name: "Plaid Jacket",
                glbModel: "plaid_jacket",
                price: 109,
                description: "Plaid pattern jacket with full button detail and layered design.",
                category: "Designer",
                imageUrl: "https://images.unsplash.com/photo-1548126032-079a0fb0099d?q=80&w=1000&auto=format&fit=crop",
                createdAt: new Date()
            },
            {
                _id: "local_p9",
                name: "Sweater Pack",
                glbModel: "sweater_pack",
                price: 79,
                description: "Cozy knit sweater pack. Customize the full body in the 3D design lab.",
                category: "Plain",
                imageUrl: "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=1000&auto=format&fit=crop",
                createdAt: new Date()
            },
            {
                _id: "local_p10",
                name: "Female Outfit",
                glbModel: "female_cloth1",
                price: 99,
                description: "Complete women's outfit set — Hood and Bottom. Designed for custom artwork.",
                category: "Designer",
                imageUrl: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000&auto=format&fit=crop",
                createdAt: new Date()
            }
        ];
        this.orders = [
            {
                _id: "order_mock_001",
                status: "Review",
                paymentStatus: "Unpaid",
                totalAmount: 149,
                createdAt: new Date(),
                user: { _id: "u3", name: "Demo User", email: "user@demo.com" },
                customerNote: "Please use a dark color theme for the suit.",
                adminFeedback: "Design received. Will review within 24 hours.",
                handledBy: { name: "Studio Admin" },
                products: [{ 
                    quantity: 1, 
                    product: { name: "Black Suit", price: 149, imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=200&auto=format&fit=crop" },
                    customDesign: { type: "CANVAS_3D", data: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=500&auto=format&fit=crop" } 
                }]
            }
        ];
        this.activities = [];
        this.sessions = [
            { 
                _id: "sim_session_01", 
                userId: "u1",
                name: "Cyberpunk Circuits", 
                baseType: "Heavyweight Tee", 
                updatedAt: new Date(), 
                thumbnail: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=200&auto=format&fit=crop",
                canvasJSON: "[]",
                fabricColor: "#ffffff"
            },
            { 
                _id: "sim_session_02", 
                userId: "u1",
                name: "Neon Grid Protocol", 
                baseType: "Cyber Hoodie", 
                updatedAt: new Date(Date.now() - 86400000), 
                thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop",
                canvasJSON: "[]",
                fabricColor: "#ffffff"
            }
        ];
    }

    // --- USERS ---
    getUsers() { return this.users; }
    addUser(user) {
        const newUser = { ...user, _id: "sim_u_" + Date.now(), createdAt: new Date() };
        this.users.unshift(newUser); // Add to top
        return newUser;
    }
    findUserByEmail(email) {
        return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    // --- PRODUCTS ---
    getProducts() { return this.products; }
    addProduct(product) {
        const newProd = { ...product, _id: "sim_p_" + Date.now(), createdAt: new Date() };
        this.products.unshift(newProd); // Add to top
        return newProd;
    }

    // --- ORDERS ---
    getOrders() { return this.orders; }
    addOrder(order, userId) {
        const user = this.users.find(u => u._id === userId) || { name: "Guest Node", email: "guest@sim.com" };
        
        // Ensure products have proper structure for display
        const enrichedProducts = (order.products || []).map(p => ({
            ...p,
            product: p.product ? (this.products.find(prod => prod._id === p.product) || { name: "Custom Base", price: 49 }) : { name: "Custom Base", price: 49 }
        }));

        const newOrder = { 
            ...order, 
            _id: "sim_o_" + Date.now(), 
            createdAt: new Date(),
            user: user,
            status: "Review",
            products: enrichedProducts
        };
        this.orders.unshift(newOrder); // Add to top
        return newOrder;
    }

    // --- SESSIONS (Neural Drafts) ---
    getSessions(userId) {
        return this.sessions.filter(s => s.userId === userId).sort((a, b) => b.updatedAt - a.updatedAt);
    }
    getSessionById(id) {
        return this.sessions.find(s => s._id === id);
    }
    saveSession(sessionData, userId) {
        const { sessionId, ...rest } = sessionData;
        if (sessionId) {
            const index = this.sessions.findIndex(s => s._id === sessionId && s.userId === userId);
            if (index !== -1) {
                this.sessions[index] = { ...this.sessions[index], ...rest, updatedAt: new Date() };
                return this.sessions[index];
            }
        }
        const newSession = { 
            ...rest, 
            _id: "sim_sess_" + Date.now(), 
            userId, 
            updatedAt: new Date(),
            createdAt: new Date() 
        };
        this.sessions.unshift(newSession); // Add to top
        return newSession;
    }
    deleteSession(id, userId) {
        this.sessions = this.sessions.filter(s => !(s._id === id && s.userId === userId));
    }

    // --- ACTIVITIES ---
    addActivity(userId, action, details) {
        this.activities.unshift({ // Add to top
            _id: "act_" + Date.now(),
            user: userId,
            action,
            details,
            timestamp: new Date()
        });
    }
    getActivities(userId) {
        if (!userId) return this.activities;
        return this.activities.filter(a => a.user === userId).sort((a, b) => b.timestamp - a.timestamp);
    }
}

// Global instance for the whole app
if (!global.mockStore) {
    global.mockStore = new MockStore();
}

module.exports = global.mockStore;
