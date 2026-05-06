const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, default: 'Untitled Design' },
  canvasJSON: { type: String }, // Fabric.js JSON
  fabricColor: { type: String, default: '#ffffff' },
  baseType: { type: String, default: 'Heavyweight Tee' },
  aiTexture: { type: String },
  chatHistory: [{
    role: { type: String, enum: ['user', 'ai'] },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  thumbnail: { type: String }, // Base64 or URL
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
