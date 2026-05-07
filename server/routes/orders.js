const router = require('express').Router();
const Order = require('../models/Order');
const { authMiddleware, anyAdminLevel } = require('../middleware/adminAuth');
const { sendOrderShippedEmail } = require('../utils/emailService');
const { logActivity } = require('../utils/activityLogger');
const mockStore = require('../utils/mockStore');

// ---------------------------------------------------------
// 1. PLACE NEW ORDER (Public User Route)
// ---------------------------------------------------------
router.post('/place', authMiddleware, async (req, res) => {
  // --- MOCK BYPASS ---
  if (global.isSimulationMode) {
      const newOrder = mockStore.addOrder(req.body, req.user.id);
      return res.status(201).json({ msg: "ORDER_INITIALIZED // MOCK_SUCCESS", order: newOrder });
  }
  try {
    const { products, totalAmount, shippingAddress, customerNote } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ msg: "EMPTY_VAULT // CANNOT_PROCESS" });
    }

    // SANITIZE PRODUCTS: Ensure 'product' is a valid ObjectId or null
    const sanitizedProducts = products.map(p => {
      const isValid = p.product && typeof p.product === 'string' && p.product.length === 24 && /^[0-9a-fA-F]{24}$/.test(p.product);
      return {
        ...p,
        product: isValid ? p.product : undefined // Omit if invalid
      };
    });

    const newOrder = new Order({
      user: req.user.id,
      products: sanitizedProducts,
      totalAmount,
      shippingAddress,
      customerNote
    });

    const savedOrder = await newOrder.save();
    
    // LOG ACTIVITY
    await logActivity(req.user.id, "ORDER_PLACED", `New order protocol initiated (#${savedOrder._id.toString().slice(-6)}) for $${totalAmount}`);

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
        const userOrders = mockStore.getOrders().filter(o => (o.user && o.user._id === req.user.id) || (o.user === req.user.id));
        return res.json(userOrders);
    }
    const orders = await Order.find({ user: req.user.id })
      .populate('products.product')
      .populate('handledBy', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: "FETCH_ERROR // VAULT_ACCESS_DENIED" });
  }
});

// ---------------------------------------------------------
// 3. GET ALL ORDERS (Admin Control Center)
// ---------------------------------------------------------
router.get('/admin/all', authMiddleware, anyAdminLevel, async (req, res) => {
  try {
    if (global.isSimulationMode) {
        console.log("FETCHING_MOCK_ADMIN_DATA...");
        return res.json(mockStore.getOrders());
    }
    console.log("Admin Data Request Received...");
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('products.product')
      .populate('handledBy', 'name')
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
    const { status, totalAmount, adminFeedback, handledBy } = req.body;
    
    if (global.isSimulationMode) {
        const order = mockStore.getOrders().find(o => o._id === req.params.id);
        if (!order) return res.status(404).json({ msg: "ORDER_NOT_FOUND" });
        if (status) order.status = status;
        if (totalAmount) order.totalAmount = totalAmount;
        if (adminFeedback) order.adminFeedback = adminFeedback;
        return res.json({ msg: "PROTOCOL_UPDATED // MOCK_SUCCESS", order });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ msg: "ORDER_NOT_FOUND" });

    const oldStatus = order.status;
    const oldPrice = order.totalAmount;

    if (status) order.status = status;
    if (totalAmount) order.totalAmount = totalAmount;
    if (adminFeedback) order.adminFeedback = adminFeedback;
    if (handledBy) {
        order.handledBy = handledBy;
        await logActivity(handledBy, "ORDER_CLAIMED", `Administrator claimed responsibility for Order #${order._id.toString().slice(-6)}`);
    }

    await order.save();
    await logActivity(req.user.id, "STATUS_UPDATED", `Order #${order._id.toString().slice(-6)} status reconfigured to ${status}`);

    const { sendOrderStatusUpdateEmail } = require('../utils/emailService');

    if ((status && status !== oldStatus) || (totalAmount && totalAmount !== oldPrice)) {
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

// 5. ADMIN PERFORMANCE ANALYTICS
router.get('/admin/performance', authMiddleware, anyAdminLevel, async (req, res) => {
    try {
        if (global.isSimulationMode) {
            return res.json([
                { _id: "adm_1", name: "Agent Smith", ordersHandled: 12, completed: 8, pending: 4 },
                { _id: "adm_2", name: "Architect", ordersHandled: 25, completed: 20, pending: 5 }
            ]);
        }
        const performance = await Order.aggregate([
            { $match: { handledBy: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: "$handledBy",
                    ordersHandled: { $sum: 1 },
                    completed: { $sum: { $cond: [{ $in: ["$status", ["Delivered", "Shipped"]] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] } }
                }
            },
            { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "adminInfo" } },
            { $unwind: "$adminInfo" },
            { $project: { name: "$adminInfo.name", email: "$adminInfo.email", ordersHandled: 1, completed: 1, pending: 1 } }
        ]);
        res.json(performance);
    } catch (err) {
        res.status(500).json({ msg: "ANALYTICS_FAILED // NODE_OFFLINE" });
    }
});

module.exports = router;