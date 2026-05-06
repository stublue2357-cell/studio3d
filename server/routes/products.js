const router = require('express').Router();
const Product = require('../models/Product');
const { authMiddleware, anyAdminLevel, ownerOnly } = require('../middleware/adminAuth');
const mockStore = require('../utils/mockStore');

// --------------------------------------------------------
// 1. ADD NEW PRODUCT API (Any Admin Level Upload)
// --------------------------------------------------------
router.post('/add', authMiddleware, anyAdminLevel, async (req, res) => {
  if (global.isSimulationMode) {
      const savedProduct = mockStore.addProduct(req.body);
      return res.status(201).json({ msg: "PRODUCT UPLOADED TO MAINFRAME", product: savedProduct });
  }
  try {
    const { name, price, description, longDescription, category, imageUrl, stock, specs } = req.body;
    
    const newProduct = new Product({
      name, price, description, longDescription, category, imageUrl, stock, specs
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ msg: "PRODUCT UPLOADED TO MAINFRAME", product: savedProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "SERVER ERROR // UPLOAD FAILED" });
  }
});

// --------------------------------------------------------
// 2. GET ALL PRODUCTS API
// --------------------------------------------------------
router.get('/', async (req, res) => {
  if (global.isSimulationMode) {
      return res.json(mockStore.getProducts());
  }
  try {
    console.log("FETCHING_PRODUCTS_INITIATED...");
    const products = await Product.find().sort({ createdAt: -1 }).maxTimeMS(5000);
    res.json(products);
  } catch (err) {
    console.error("DATABASE_OFFLINE // SWITCHING_TO_LOCAL_CACHE:", err.message);
    res.json(mockStore.getProducts());
  }
});

// --------------------------------------------------------
// 3. GET SINGLE PRODUCT BY ID
// --------------------------------------------------------
router.get('/:id', async (req, res) => {
  if (global.isSimulationMode) {
      const product = mockStore.getProducts().find(p => p._id === req.params.id);
      if (!product) return res.status(404).json({ msg: "SIGNAL LOST // PRODUCT NOT FOUND" });
      return res.json(product);
  }
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "SIGNAL LOST // PRODUCT NOT FOUND" });
    res.json(product);
  } catch (err) {
    if(err.kind === 'ObjectId') return res.status(404).json({ msg: "SIGNAL LOST // INVALID ID NODE" });
    res.status(500).json({ msg: "SERVER ERROR // FETCH FAILED" });
  }
});

// --------------------------------------------------------
// 4. REQUEST DELETION (Admins)
// --------------------------------------------------------
router.post('/request-delete/:id', authMiddleware, anyAdminLevel, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: "PRODUCT NOT FOUND" });
        product.deletionRequested = true;
        product.requestedBy = req.user.id;
        await product.save();
        res.json({ msg: "DELETION REQUESTED // PENDING OWNER APPROVAL" });
    } catch (err) {
        res.status(500).json({ msg: "SERVER ERROR // REQUEST FAILED" });
    }
});

// --------------------------------------------------------
// 5. FINALIZE DELETION (Owners Only)
// --------------------------------------------------------
router.delete('/:id', authMiddleware, ownerOnly, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ msg: "PRODUCT NOT FOUND" });
        await Product.findByIdAndDelete(req.params.id);
        res.json({ msg: "SUCCESS // NODE PURGED FROM MAINFRAME" });
    } catch (err) {
        res.status(500).json({ msg: "SERVER ERROR // PURGE FAILED" });
    }
});

module.exports = router;