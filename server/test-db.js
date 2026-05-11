require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('Testing MongoDB Connection...');
  console.log('URI:', process.env.MONGO_URI.replace(/:([^:@]{8})[^:@]*@/, ':****@')); // Hide password
  
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    console.log('✅ Successfully connected to the database!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to connect to the database.');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.message.includes('IP that isn\'t whitelisted') || error.message.includes('timeout')) {
      console.log('\n--- HOW TO FIX ---');
      console.log('1. Go to your MongoDB Atlas Dashboard (https://cloud.mongodb.com/)');
      console.log('2. Click on "Network Access" in the left sidebar.');
      console.log('3. Click "Add IP Address".');
      console.log('4. Click "Add Current IP Address" and then "Confirm".');
      console.log('5. Wait a minute for it to become active, then restart the server.');
    }
    process.exit(1);
  }
}

testConnection();
