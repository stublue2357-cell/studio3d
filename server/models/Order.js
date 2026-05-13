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
  status: { type: String, default: 'Review' }, // Review, Approved, Rejected, Processing, Shipped, Delivered
  paymentStatus: { type: String, default: 'Unpaid' }, // Unpaid, Paid
  customerNote: { type: String },
  adminFeedback: { type: String },
  negotiationStatus: { type: String, default: 'none' }, // none, awaiting_user, user_countered, accepted, rejected
  userSuggestedPrice: { type: Number },
  hasCountered: { type: Boolean, default: false },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);