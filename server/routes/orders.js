const router = require('express').Router();
const Order = require('../models/Order');
const { authMiddleware, anyAdminLevel } = require('../middleware/adminAuth');
const { sendOrderShippedEmail } = require('../utils/emailService');

// ---------------------------------------------------------
// 1. PLACE NEW ORDER (Public User Route)
// ---------------------------------------------------------
router.post('/place', authMiddleware, async (req, res) => {
  // --- MOCK BYPASS ---
  if (global.isSimulationMode) {
      return res.status(201).json({ msg: "ORDER_INITIALIZED // MOCK_SUCCESS", order: { _id: "sim_" + Date.now(), ...req.body } });
  }
  try {
    const { products, totalAmount, shippingAddress, customerNote } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ msg: "EMPTY_VAULT // CANNOT_PROCESS" });
    }

    const newOrder = new Order({
      user: req.user.id,
      products,
      totalAmount,
      shippingAddress,
      customerNote
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ msg: "ORDER_INITIALIZED // SUCCESS", order: savedOrder });
  } catch (err) {
    console.error("Order Place Error:", err);
    res.status(500).json({ msg: "TRANSMISSION_ERROR // ORDER_FAILED" });
  }
});

// ---------------------------------------------------------
// 2. GET MY ORDERS (User Vault)
// ---------------------------------------------------------
router.get('/myorders', authMiddleware, async (req, res) => {
  try {
    if (global.isSimulationMode) {
        return res.json([
            {
                _id: "order_mock_001",
                status: "Pending",
                totalAmount: 149,
                createdAt: new Date(),
                customerNote: "Please ensure the neon glow is optimized for low-light environments.",
                adminFeedback: "Analyzing transmission... Glow protocols will be calibrated as requested.",
                products: [{ quantity: 2, product: { name: "Neon Hoodie", imageUrl: "https://via.placeholder.com/100" } }]
            }
        ]);
    }
    const orders = await Order.find({ user: req.user.id })
      .populate('products.product')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: "FETCH_ERROR // VAULT_ACCESS_DENIED" });
  }
});

// ---------------------------------------------------------
// 3. GET ALL ORDERS (Admin Control Center)
// ---------------------------------------------------------
// 👉 Is path ko dhyan se dekhein: /api/orders/admin/all
router.get('/admin/all', authMiddleware, anyAdminLevel, async (req, res) => {
  try {
    if (global.isSimulationMode) {
        console.log("FETCHING_MOCK_ADMIN_DATA...");
        return res.json([
            {
                _id: "order_mock_001",
                status: "Pending",
                totalAmount: 149,
                createdAt: new Date(),
                user: { name: "Agent Smith", email: "smith@matrix.net" },
                customerNote: "Please ensure the neon glow is optimized for low-light environments.",
                adminFeedback: "Analyzing transmission... Glow protocols will be calibrated as requested.",
                products: [{ quantity: 2, customDesign: { type: "CANVAS_3D", data: "#ff0000" } }]
            },
            {
                _id: "order_mock_002",
                status: "Shipped",
                totalAmount: 299,
                createdAt: new Date(Date.now() - 86400000),
                user: { name: "Neo", email: "neo@zion.org" },
                customerNote: "I need this before the next system reboot.",
                adminFeedback: "Priority override engaged. Order is in transit via encrypted courier.",
                products: [{ quantity: 1, customDesign: { type: "CANVAS_3D", data: "#000000" } }]
            }
        ]);
    }
    console.log("Admin Data Request Received..."); // Terminal mein check karne ke liye
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('products.product')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders.`); 
    res.json(orders);
  } catch (err) {
    console.error("Admin Fetch Error:", err);
    res.status(500).json({ msg: "FETCH_ERROR // ADMIN_NODE_FAILED" });
  }
});

// 4. UPDATE ORDER STATUS & PRICE (Admin Control Center)
// ---------------------------------------------------------
router.patch('/status/:id', authMiddleware, anyAdminLevel, async (req, res) => {
  try {
    const { status, totalAmount, adminFeedback } = req.body;
    
    // Find the order and populate user info to get the email address
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    if (!order) return res.status(404).json({ msg: "ORDER_NOT_FOUND" });

    const oldStatus = order.status;
    const oldPrice = order.totalAmount;

    if (status) order.status = status;
    if (totalAmount) order.totalAmount = totalAmount;
    if (adminFeedback) order.adminFeedback = adminFeedback;

    await order.save();

    const { sendOrderStatusUpdateEmail } = require('../utils/emailService');

    // TRIGGER EMAIL: If status or price changed
    if ((status && status !== oldStatus) || (totalAmount && totalAmount !== oldPrice)) {
        console.log(`Triggering Status Update Email Sequence for Order ${order._id}...`);
        sendOrderStatusUpdateEmail(
            order.user.email, 
            order.user.name, 
            order._id.toString(), 
            status || order.status, 
            totalAmount || order.totalAmount
        );
    }
    
    res.json({ msg: "PROTOCOL_UPDATED // TRANSMISSION_SENT", order });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ msg: "UPDATE_ERROR // PROTOCOL_FAILED" });
  }
});

module.exports = router;