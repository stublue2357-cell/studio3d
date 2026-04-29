const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true }, // Short description (Cards ke liye)
  longDescription: { type: String }, // Detailed description (Product page ke liye)
  category: { type: String, required: true },
  imageUrl: { type: String, required: true }, // Base64 ya Link
  modelUrl: { type: String }, // .glb file URL
  stock: { type: Number, default: 10 },
  specs: { type: [String], default: [] }, // Specifications ki list
  deletionRequested: { type: Boolean, default: false }, // Admin request ke liye
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Kis admin ne delete karne ko kaha
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);