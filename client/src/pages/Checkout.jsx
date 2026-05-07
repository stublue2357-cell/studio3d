import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx'; 
// 👉 Nayi API import ki
import { placeOrder } from '../api'; 

const Checkout = () => {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // 👉 Shipping form ke liye states
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zip: '',
    phone: '', 
    customerNote: '' 
  });

  const cartContext = useCart() || {};
  const cartItems = cartContext.cartItems || []; 
  // 👉 Context se clearCart bhi le sakte hain (Optional but good)
  const { clearCart } = cartContext;
  
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 15;
  const total = subtotal + shipping;

  // 👉 Form input handle karne ka function
  const handleInputChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  // 🚀 LIVE CHECKOUT LOGIC
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert("VAULT IS EMPTY");

    setIsProcessing(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Backend ke Order Model ke mutabiq data tyar karna
      const orderPayload = {
        products: cartItems.map(item => {
          const productId = item.originalId || item._id;
          const isValidObjectId = typeof productId === 'string' && productId.length === 24 && /^[0-9a-fA-F]{24}$/.test(productId);
          
          return {
            product: isValidObjectId ? productId : null,
            quantity: item.quantity,
            size: item.size || 'M',
            customDesign: item.customDesign ? {
              type: item.customDesign.type,
              data: item.customDesign.data
            } : null
          };
        }),
        totalAmount: total,
        shippingAddress: {
          address: `${shippingData.firstName} ${shippingData.lastName}, ${shippingData.address}`,
          city: shippingData.city,
          phone: shippingData.phone || "000-000-0000" // Form mein phone input zaroori hai
        },
        customerNote: shippingData.customerNote,
        paymentMethod: paymentMethod
      };

      // API Call
      await placeOrder(orderPayload, token);
      
      // Success: Cart khali karein aur redirect karein
      if(clearCart) clearCart(); 
      navigate('/success'); 

    } catch (err) {
      console.error("Order Transmission Failed:", err);
      alert("CRITICAL ERROR // ORDER_FAILED");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-32 pb-20 px-6 max-w-[1400px] mx-auto w-full">
      <div className="mb-10 pb-6 border-b border-white/5">
        <span className="text-indigo-400 text-[10px] font-black tracking-[0.5em] uppercase mb-4 block">
          Secure Encrypted Channel
        </span>
        <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">
          Initialize <span className="text-indigo-400">Checkout</span>
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        <div className="w-full lg:flex-1 space-y-10">
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-10">
            
            <div className="glass-panel p-8 rounded-[2rem] border-white/5 bg-white/[0.02]">
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-indigo-500 rounded-full" /> Shipping Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">First Name</label>
                  <input required name="firstName" value={shippingData.firstName} onChange={handleInputChange} type="text" placeholder="NODE" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Last Name</label>
                  <input required name="lastName" value={shippingData.lastName} onChange={handleInputChange} type="text" placeholder="USER" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Transmission Address</label>
                  <input required name="address" value={shippingData.address} onChange={handleInputChange} type="text" placeholder="123 NEURAL NETWORK BLVD" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">City / Hub</label>
                  <input required name="city" value={shippingData.city} onChange={handleInputChange} type="text" placeholder="CYBER CITY" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all" />
                </div>
                {/* 👉 Phone input zaroori hai Orders ke liye */}
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Contact Protocol (Phone)</label>
                  <input required name="phone" value={shippingData.phone} onChange={handleInputChange} type="text" placeholder="+92 000 0000" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Special Instructions / Custom Notes</label>
                  <textarea name="customerNote" value={shippingData.customerNote} onChange={handleInputChange} placeholder="SPECIFY SPECIAL REQUESTS OR DESIGN INSTRUCTIONS FOR THE ADMIN..." className="w-full h-32 bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all resize-none" />
                </div>
              </div>
            </div>

            <div className="glass-panel p-8 rounded-[2rem] border-white/5 bg-white/[0.02]">
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-cyan-500 rounded-full" /> Payment Protocol
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div onClick={() => setPaymentMethod('card')} className={`cursor-pointer p-5 rounded-xl border transition-all ${paymentMethod === 'card' ? 'bg-indigo-500/10 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Credit Card</span>
                    <div className={`w-3 h-3 rounded-full border ${paymentMethod === 'card' ? 'bg-indigo-400 border-indigo-400' : 'border-slate-500'}`} />
                  </div>
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Standard Network</p>
                </div>
                <div onClick={() => setPaymentMethod('crypto')} className={`cursor-pointer p-5 rounded-xl border transition-all ${paymentMethod === 'crypto' ? 'bg-indigo-500/10 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Crypto</span>
                    <div className={`w-3 h-3 rounded-full border ${paymentMethod === 'crypto' ? 'bg-indigo-400 border-indigo-400' : 'border-slate-500'}`} />
                  </div>
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Web3 Transfer</p>
                </div>
                <div onClick={() => setPaymentMethod('cod')} className={`cursor-pointer p-5 rounded-xl border transition-all ${paymentMethod === 'cod' ? 'bg-indigo-500/10 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">C.O.D</span>
                    <div className={`w-3 h-3 rounded-full border ${paymentMethod === 'cod' ? 'bg-indigo-400 border-indigo-400' : 'border-slate-500'}`} />
                  </div>
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Pay on Delivery</p>
                </div>
              </div>

              <AnimatePresence>
                {paymentMethod === 'card' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 space-y-4 overflow-hidden">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Card Number</label>
                      <input required type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all placeholder:text-slate-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Expiry (MM/YY)</label>
                        <input required type="text" placeholder="12/28" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all placeholder:text-slate-700" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">CVV</label>
                        <input required type="text" placeholder="123" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all placeholder:text-slate-700" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </div>

        <div className="w-full lg:w-[450px] shrink-0 space-y-8 sticky top-32">
          <div className="glass-panel p-8 rounded-[2rem] border-white/5 bg-white/[0.02]">
            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white mb-8 border-b border-white/5 pb-4">
              Vault <span className="text-indigo-400">Summary</span>
            </h3>
            <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <div className="w-16 h-16 bg-black rounded-xl overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                    <img 
                      src={item.customDesign?.data?.overlayImage || item.customDesign?.data?.aiImage || item.imageUrl || item.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=200&auto=format&fit=crop'} 
                      alt={item.name} 
                      className="w-full h-full object-cover opacity-90" 
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">{item.name}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Qty: {item.quantity} | {item.size || 'M'}</p>
                  </div>
                  <div className="text-[11px] font-black tracking-widest text-indigo-400">
                    ${item.price * item.quantity}.00
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4 border-t border-white/5 pt-6 mb-8">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span>Subtotal</span>
                <span className="text-white">${subtotal}.00</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <span>Shipping</span>
                <span className="text-white">${shipping}.00</span>
              </div>
              <div className="flex justify-between items-center text-[14px] font-black uppercase tracking-[0.2em] text-white pt-4 border-t border-white/5">
                <span>Total</span>
                <span className="text-indigo-400 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">${total.toFixed(2)}</span>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} form="checkout-form" type="submit" disabled={isProcessing} className={`w-full py-5 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-2xl ${isProcessing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:shadow-indigo-500/20'}`}>
              {isProcessing ? 'Transmitting Design...' : 'Submit Design for Review'}
            </motion.button>
            <p className="mt-4 text-[8px] text-slate-600 font-bold uppercase tracking-widest text-center">
              Note: Payment protocol will sync after Admin Verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;