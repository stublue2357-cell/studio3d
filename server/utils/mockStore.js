/**
 * MOCK_STORE // NEURAL_PERSISTENCE_LAYER
 * This utility provides in-memory persistence for Simulation Mode.
 * Data is lost on server restart, but stays consistent during runtime.
 */

class MockStore {
    constructor() {
        this.users = [
            { _id: "u1", name: "Haseeb Developer", email: "haseebsaleem312@gmail.com", role: "developer", createdAt: new Date() },
            { _id: "u2", name: "Test Admin", email: "admin@studio3d.com", role: "admin", createdAt: new Date() },
            { _id: "u3", name: "Demo User", email: "user@demo.com", role: "user", createdAt: new Date() }
        ];
        this.products = [
            {
                _id: "local_p1",
                name: "Liquid Silk Neural Tee",
                price: 49,
                description: "Seamless 3D-knit techwear tee with neural-adaptive fiber. [VAULT_SAMPLE]",
                category: "Designer",
                imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
                createdAt: new Date()
            },
            {
                _id: "local_p2",
                name: "Onyx Cyber Hoodie",
                price: 89,
                description: "Water-resistant matte finish hoodie with integrated climate control simulation. [VAULT_SAMPLE]",
                category: "Designer",
                imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop",
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
                customerNote: "Please ensure the neon glow is optimized for low-light environments.",
                adminFeedback: "Analyzing transmission... Glow protocols will be calibrated as requested.",
                handledBy: { name: "Architect" },
                products: [{ 
                    quantity: 2, 
                    product: { name: "Sample Item", price: 74.5, imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=200&auto=format&fit=crop" },
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
