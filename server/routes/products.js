const router = require('express').Router();
const Product = require('../models/Product');
const { authMiddleware, anyAdminLevel, ownerOnly } = require('../middleware/adminAuth');

// --------------------------------------------------------
// 1. ADD NEW PRODUCT API (Any Admin Level Upload)
// --------------------------------------------------------
router.post('/add', authMiddleware, anyAdminLevel, async (req, res) => {
  try {
    // Frontend se aane wale naye variables (longDescription, specs) ko receive kiya
    const { name, price, description, longDescription, category, imageUrl, stock, specs } = req.body;
    
    const newProduct = new Product({
      name, 
      price, 
      description, 
      longDescription, // Naya add hua
      category, 
      imageUrl, 
      stock, 
      specs // Naya add hua
    });

    const savedProduct = await newProduct.save();
    res.status(201).json({ msg: "PRODUCT UPLOADED TO MAINFRAME", product: savedProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "SERVER ERROR // UPLOAD FAILED" });
  }
});

// --------------------------------------------------------
// 2. GET ALL PRODUCTS API (Archive / Collection Page ke liye)
// --------------------------------------------------------
router.get('/', async (req, res) => {
  try {
    console.log("FETCHING_PRODUCTS_INITIATED...");
    // 5-second timeout for DB response
    const products = await Product.find().sort({ createdAt: -1 }).maxTimeMS(5000);
    console.log("PRODUCTS_FETCHED_COUNT:", products.length);
    res.json(products);
  } catch (err) {
    console.error("DATABASE_OFFLINE // SWITCHING_TO_LOCAL_CACHE:", err.message);
    
    // FALLBACK: Essential items to keep the platform running
    const fallbackProducts = [
      {
        _id: "local_p1",
        name: "Liquid Silk Neural Tee",
        price: 49,
        description: "Seamless 3D-knit techwear tee with neural-adaptive fiber. [VAULT_SAMPLE]",
        category: "Designer",
        imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop"
      },
      {
        _id: "local_p2",
        name: "Onyx Cyber Hoodie",
        price: 89,
        description: "Water-resistant matte finish hoodie with integrated climate control simulation. [VAULT_SAMPLE]",
        category: "Designer",
        imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1000&auto=format&fit=crop"
      },
      {
        _id: "local_p3",
        name: "Carbon Utility Cargo",
        price: 129,
        description: "Multi-pocket utility pants designed for high-mobility urban exploration. [VAULT_SAMPLE]",
        category: "Designer",
        imageUrl: "https://images.unsplash.com/photo-1622260614153-03223fb72052?q=80&w=1000&auto=format&fit=crop"
      }
    ];
    res.json(fallbackProducts);
  }
});

// --------------------------------------------------------
// 3. GET SINGLE PRODUCT BY ID (Product Details Page ke liye)
// --------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ msg: "SIGNAL LOST // PRODUCT NOT FOUND" });
    }
    
    res.json(product);
  } catch (err) {
    if(err.kind === 'ObjectId') {
        return res.status(404).json({ msg: "SIGNAL LOST // INVALID ID NODE" });
    }
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