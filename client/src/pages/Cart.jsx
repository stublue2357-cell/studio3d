import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const Cart = () => {
  const { cart, removeFromCart, totalPrice } = useCart();

  return (
    <div className="min-h-screen bg-[#020617] text-white pt-32 px-10">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold tracking-tighter mb-10">Your Selection</h2>

        {cart.length === 0 ? (
          <p className="text-slate-500 uppercase tracking-widest text-xs">Your cart is empty.</p>
        ) : (
          <div className="space-y-6">
            {cart.map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-3xl backdrop-blur-md"
              >
                <div className="flex items-center gap-6">
                  <img src={item.img} className="w-20 h-20 object-cover rounded-xl border border-white/10" alt={item.name} />
                  <div>
                    <h4 className="font-bold">{item.name}</h4>
                    <p className="text-indigo-400 text-sm">{item.price}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-rose-500/50 hover:text-rose-500 text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  Remove
                </button>
              </motion.div>
            ))}

            <div className="pt-10 border-t border-white/5 flex justify-between items-center">
              <div>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-1">Total Amount</p>
                <h3 className="text-3xl font-bold">${totalPrice.toFixed(2)}</h3>
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-500 px-10 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 transition-all">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;