import React from 'react';
import ReactDOM from 'react-dom';

/**
 * PROFESSIONAL RECEIPT COMPONENT
 * -------------------------------
 * This component is specifically designed for printing. 
 * It uses a React Portal to render as a direct child of the body, 
 * making it easy to isolate during print triggers.
 */
const Receipt = ({ order }) => {
  if (!order) return null;

  const subtotal = (order.products || []).reduce((acc, item) => acc + ((item.product?.price || 49.99) * (item.quantity || 1)), 0);
  const shipping = 15;
  const total = order.totalAmount || (subtotal + shipping);

  const receiptJSX = (
    <div className="printable-receipt-container font-sans text-black p-10 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-black pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-1 text-black">Studio<span className="text-blue-600">3D</span></h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Neural Apparel Synthesis Lab</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-black uppercase mb-1">Official Invoice</h2>
          <p className="text-[10px] font-bold text-gray-500 uppercase">Order ID: #{(order._id || 'SIM-0000').slice(-12)}</p>
          <p className="text-[10px] font-bold text-gray-500 uppercase">Date: {new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-10 mb-10">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Billed To</h4>
          <p className="text-sm font-bold uppercase text-black">{order.user?.name || 'Valued Customer'}</p>
          <p className="text-[11px] text-gray-600 lowercase">{order.user?.email || 'customer@network.com'}</p>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Destination</h4>
          <p className="text-[11px] font-bold uppercase leading-relaxed text-black">
            {order.shippingAddress?.address || 'N/A'}<br />
            {order.shippingAddress?.city || 'N/A'}<br />
            Phone: {order.shippingAddress?.phone || 'N/A'}
          </p>
        </div>
      </div>

      {/* Line Items */}
      <table className="w-full mb-10">
        <thead>
          <tr className="border-b border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400 text-left">
            <th className="py-4">Payload Description</th>
            <th className="py-4 text-center">Qty</th>
            <th className="py-4 text-right">Unit Price</th>
            <th className="py-4 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="text-sm text-black">
          {(order.products || []).map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100">
              <td className="py-6">
                <p className="font-bold uppercase text-black">{item.product?.name || 'Custom Apparel'}</p>
                <p className="text-[10px] text-gray-500 uppercase font-medium mt-1">Size: {item.size || 'M'} | Type: {item.customDesign?.type || 'Standard'}</p>
              </td>
              <td className="py-6 text-center font-bold">{item.quantity || 1}</td>
              <td className="py-6 text-right font-bold">${(item.product?.price || 49.99).toFixed(2)}</td>
              <td className="py-6 text-right font-bold">${((item.product?.price || 49.99) * (item.quantity || 1)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-16">
        <div className="w-64 space-y-3">
          <div className="flex justify-between text-[11px] font-bold uppercase text-gray-500">
            <span>Subtotal</span>
            <span className="text-black">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px] font-bold uppercase text-gray-500">
            <span>Shipping Protocol</span>
            <span className="text-black">${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-black uppercase border-t-2 border-black pt-3">
            <span>Total</span>
            <span className="text-blue-600">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer / Notes */}
      <div className="border-t border-gray-100 pt-8">
        <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Protocol Notes</h4>
        <p className="text-[10px] text-gray-500 leading-relaxed max-w-lg italic">
          This document serves as an official proof of transaction for Studio3D Apparel. 
          Custom designs are approved via the Neural Synthesis Hub. Thank you for using the futuristic apparel engine.
        </p>
      </div>

      <div className="mt-16 text-center">
        <p className="text-[8px] font-bold uppercase tracking-[0.4em] text-gray-300">Generated by Studio3D Core // System Active</p>
      </div>
    </div>
  );

  // Render using Portal to be a direct child of body
  return ReactDOM.createPortal(receiptJSX, document.body);
};

export default Receipt;
