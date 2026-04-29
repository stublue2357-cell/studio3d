const router = require('express').Router();
const Order = require('../models/Order');
const { authMiddleware, anyAdminLevel } = require('../middleware/adminAuth');
const { sendOrderShippedEmail } = require('../utils/emailService');

// ---------------------------------------------------------
// 1. PLACE NEW ORDER (Public User Route)
// ---------------------------------------------------------
router.post('/place', authMiddleware, async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ msg: "EMPTY_VAULT // CANNOT_PROCESS" });
    }

    const newOrder = new Order({
      user: req.user.id,
      products,
      totalAmount,
      shippingAddress
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

// ---------------------------------------------------------
// 4. UPDATE ORDER STATUS
// ---------------------------------------------------------
router.patch('/status/:id', authMiddleware, anyAdminLevel, async (req, res) => {
  try {
    const { status } = req.body;
    
    // Find the order and populate user info to get the email address
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    
    if (!order) return res.status(404).json({ msg: "ORDER_NOT_FOUND" });

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // TRIGGER EMAIL: Only if status changed to 'Shipped'
    if (status === 'Shipped' && oldStatus !== 'Shipped') {
        console.log("Triggering Shipped Email Sequence...");
        sendOrderShippedEmail(order.user.email, order.user.name, order._id.toString());
    }
    
    res.json({ msg: "STATUS_UPDATED", order });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ msg: "UPDATE_ERROR // PROTOCOL_FAILED" });
  }
});

module.exports = router;