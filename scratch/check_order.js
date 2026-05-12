const mongoose = require('mongoose');
const Order = require('./server/models/Order');
require('dotenv').config({ path: './server/.env' });

async function checkOrder() {
  await mongoose.connect(process.env.MONGO_URI);
  const order = await Order.findOne({ status: 'Price_Negotiation' }).sort({ createdAt: -1 });
  console.log('ORDER_DATA:', JSON.stringify(order, null, 2));
  await mongoose.disconnect();
}

checkOrder();
