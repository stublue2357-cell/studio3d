import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { placeOrder } from '../api';

const Checkout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

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
  const { clearCart } = cartContext;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = 15;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    setShippingData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return alert('Your cart is empty!');

    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const orderPayload = {
        products: cartItems.map(item => {
          const productId = item.originalId || item._id;
          const isValidObjectId = typeof productId === 'string' && productId.length === 24 && /^[0-9a-fA-F]{24}$/.test(productId);
          return {
            product: isValidObjectId ? productId : null,
            quantity: item.quantity,
            size: item.size || 'M',
            customDesign: item.customDesign ? { type: item.customDesign.type, data: item.customDesign.data } : null
          };
        }),
        totalAmount: total,
        shippingAddress: {
          address: `${shippingData.firstName} ${shippingData.lastName}, ${shippingData.address}`,
          city: shippingData.city,
          phone: shippingData.phone || '000-000-0000'
        },
        customerNote: shippingData.customerNote,
        paymentMethod: 'after_approval'
      };

      await placeOrder(orderPayload, token);
      if (clearCart) clearCart();
      navigate('/success');
    } catch (err) {
      console.error('Order failed:', err);
      alert('Order submission failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-32 pb-20 px-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div className="mb-10 pb-6 border-b border-white/5">
        <span className="text-indigo-400 text-[10px] font-black tracking-[0.5em] uppercase mb-4 block">
          Secure Checkout
        </span>
        <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white">
          Complete <span className="text-indigo-400">Order</span>
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start">

        {/* LEFT: Form */}
        <div className="w-full lg:flex-1 space-y-10">
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-10">

            {/* Shipping Address */}
            <div className="glass-panel p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-indigo-500 rounded-full" /> Shipping Address
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">First Name</label>
                  <input required name="firstName" value={shippingData.firstName} onChange={handleInputChange} type="text" placeholder="JOHN" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all placeholder:text-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Last Name</label>
                  <input required name="lastName" value={shippingData.lastName} onChange={handleInputChange} type="text" placeholder="DOE" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all placeholder:text-slate-700" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Street Address</label>
                  <input required name="address" value={shippingData.address} onChange={handleInputChange} type="text" placeholder="123 MAIN STREET" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all placeholder:text-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">City</label>
                  <input required name="city" value={shippingData.city} onChange={handleInputChange} type="text" placeholder="KARACHI" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all placeholder:text-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">ZIP / Postal Code</label>
                  <input name="zip" value={shippingData.zip} onChange={handleInputChange} type="text" placeholder="74000" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all placeholder:text-slate-700" />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                  <input required name="phone" value={shippingData.phone} onChange={handleInputChange} type="text" placeholder="+92 300 0000000" className="w-full bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all placeholder:text-slate-700" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 ml-1">Special Instructions / Design Notes</label>
                  <textarea name="customerNote" value={shippingData.customerNote} onChange={handleInputChange} placeholder="ADD ANY SPECIAL REQUESTS OR DESIGN NOTES FOR THE ADMIN..." className="w-full h-28 bg-white/[0.03] border border-white/10 px-6 py-4 rounded-xl outline-none focus:border-indigo-400 text-[11px] font-bold tracking-widest text-white transition-all resize-none placeholder:text-slate-700" />
                </div>
              </div>
            </div>

            {/* Payment Notice - No Card Fields */}
            <div className="glass-panel p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
              <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white mb-6 flex items-center gap-3">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Payment Information
              </h3>
              <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-4">
                <div className="text-2xl">✅</div>
                <div>
                  <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-widest leading-relaxed">
                    No payment required now.
                  </p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed mt-2">
                    Your order will be submitted for admin review. Once your custom design is approved, payment instructions will be sent to your dashboard.
                  </p>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* RIGHT: Order Summary */}
        <div className="w-full lg:w-[450px] shrink-0 space-y-8 sticky top-32">
          <div className="glass-panel p-8 rounded-[2rem] border border-white/5 bg-white/[0.02]">
            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-white mb-8 border-b border-white/5 pb-4">
              Order <span className="text-indigo-400">Summary</span>
            </h3>
            <div className="space-y-6 mb-8 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.length === 0 ? (
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center py-6">Cart is empty</p>
              ) : cartItems.map((item, index) => (
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
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Qty: {item.quantity} | Size: {item.size || 'M'}</p>
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

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              form="checkout-form"
              type="submit"
              disabled={isProcessing}
              className={`w-full py-5 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] transition-all shadow-2xl ${
                isProcessing
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white hover:shadow-indigo-500/30'
              }`}
            >
              {isProcessing ? '⏳ Placing Order...' : '✓ Submit Order for Review'}
            </motion.button>
            <p className="mt-4 text-[8px] text-slate-600 font-bold uppercase tracking-widest text-center">
              Payment processed only after admin approves your design
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
