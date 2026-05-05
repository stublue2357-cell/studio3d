const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, required: true },
      size: { type: String },
      customDesign: { 
        type: { type: String }, // 'AI' or 'MANUAL'
        data: { type: String }  // Base64 Image URL
      }
    }
  ],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true }
  },
  status: { type: String, default: 'Pending' }, // Pending, Shipped, Delivered
  customerNote: { type: String },
  adminFeedback: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);