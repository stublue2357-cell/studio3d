import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AIChatbot = ({ onGenerate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Welcome to the Design Laboratory. I am your Neural Concierge. Need inspiration?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input) return;
    
    const newMessages = [...messages, { role: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    // Simulated AI Intelligence
    setTimeout(() => {
      setMessages([...newMessages, { 
        role: 'ai', 
        text: `Neural analysis complete. Based on "${input}", I recommend a Cyber-Modern aesthetic. Should I generate a render for you?`,
        canGenerate: true,
        suggestion: `High-fidelity ${input}, futuristic streetwear aesthetic, 8k, ultra-detailed`
      }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] font-['Plus_Jakarta_Sans']">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="w-96 h-[500px] glass-panel border border-white/10 rounded-[2.5rem] bg-black/60 backdrop-blur-2xl mb-6 overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Neural Concierge</span>
               </div>
               <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {messages.map((msg, i) => (
                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-[11px] leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white/5 text-slate-300 border border-white/5 rounded-bl-none'
                    }`}>
                      {msg.text}
                      {msg.canGenerate && (
                        <button 
                          onClick={() => onGenerate(msg.suggestion)}
                          className="block mt-4 text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:text-white transition-all underline"
                        >
                          Initialize Synth -&gt;
                        </button>
                      )}
                    </div>
                 </div>
               ))}
            </div>

            {/* Input */}
            <div className="p-6 bg-black/40 border-t border-white/5 flex gap-3">
               <input 
                 value={input}
                 onChange={(e) => setInput(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                 placeholder="Communicate..." 
                 className="flex-1 bg-white/5 border border-white/10 px-4 py-3 rounded-xl outline-none focus:border-cyan-500 text-[11px] text-white placeholder:text-slate-600"
               />
               <button onClick={handleSend} className="bg-white text-black px-4 py-3 rounded-xl hover:bg-cyan-500 hover:text-white transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.4)] border border-white/20 group"
      >
        <svg className="w-8 h-8 text-white group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
      </motion.button>
    </div>
  );
};

export default AIChatbot;
