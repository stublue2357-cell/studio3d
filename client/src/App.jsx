import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// --- GLOBAL CONTEXT & COMPONENTS ---
import { CartProvider } from './context/CartContext.jsx';
import Navbar from './assets/components/Navbar.jsx';
import Footer from './assets/components/Footer.jsx'; 
import CustomCursor from './assets/components/CustomCursor.jsx';
import CartDrawer from './assets/components/CartDrawer.jsx';
import ProtectedRoute from './assets/components/ProtectedRoute.jsx'; 
import AIChatbot from './assets/components/AIChatbot.jsx';
import CyberBackground from './assets/components/CyberBackground.jsx';
import Preloader from './assets/components/Preloader.jsx';

// --- PAGES ---
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderSuccess from './pages/OrderSuccess.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Cart from './pages/Cart.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

// --- ADMIN PAGES ---
import AdminDashboard from './pages/AdminDashboard.jsx';
import DeveloperDashboard from './pages/DeveloperDashboard.jsx';
import OwnerDashboard from './pages/OwnerDashboard.jsx';
import SubOwnerDashboard from './pages/SubOwnerDashboard.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import AdminOrders from './pages/AdminOrders.jsx'; 
import UserManagement from './pages/UserManagement.jsx'; 
import AIStudio from './assets/components/AIStudio.jsx';

import Unauthorized from './pages/Unauthorized.jsx';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.5 }}
    className="w-full h-full"
  >
    {children}
  </motion.div>
);

function AppContent() {
  const location = useLocation();

  return (
    <div className="relative min-h-screen text-white bg-transparent font-['Plus_Jakarta_Sans'] select-none">
      
      <CyberBackground />
      <CustomCursor />
      <Navbar />
      <CartDrawer />
      <AIChatbot onGenerate={(prompt) => {
          // If on AI Studio page, trigger synthesis (In a real app, I'd use an event bus or context)
          window.dispatchEvent(new CustomEvent('TRIGGER_AI_SYNTH', { detail: prompt }));
      }} />

      <main className="relative z-10 flex-grow flex flex-col">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            
            {/* GUEST ROUTES (Open to everyone) */}
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/products" element={<PageWrapper><Products /></PageWrapper>} />
            <Route path="/product/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
            <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
            <Route path="/login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
            <Route path="/reset-password/:token" element={<PageWrapper><ResetPassword /></PageWrapper>} />
            
            {/* ADMIN ALIASES (For ease of use during demo) */}
            <Route path="/admin-login" element={<PageWrapper><Login /></PageWrapper>} />
            <Route path="/admin-orders" element={
              <ProtectedRoute isAdminRoute={true}>
                <PageWrapper><AdminOrders /></PageWrapper>
              </ProtectedRoute>
            } />
            
            {/* USER PROTECTED ROUTES */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageWrapper><Dashboard /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <PageWrapper><Checkout /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/success" element={<PageWrapper><OrderSuccess /></PageWrapper>} />
            <Route path="/studio" element={
              <ProtectedRoute>
                <PageWrapper><AIStudio /></PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/unauthorized" element={<PageWrapper><Unauthorized /></PageWrapper>} />
            
            {/* ROLE-SPECIFIC PROTECTED ROUTES */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <PageWrapper><AdminDashboard /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/developer/dashboard" element={
              <ProtectedRoute allowedRoles={['developer']}>
                <PageWrapper><DeveloperDashboard /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/owner/dashboard" element={
              <ProtectedRoute allowedRoles={['owner']}>
                <PageWrapper><OwnerDashboard /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/sub-owner/dashboard" element={
              <ProtectedRoute allowedRoles={['sub-owner']}>
                <PageWrapper><SubOwnerDashboard /></PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/admin/products" element={
              <ProtectedRoute isAdminRoute={true}>
                <PageWrapper><AdminProducts /></PageWrapper>
              </ProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <ProtectedRoute isAdminRoute={true}>
                <PageWrapper><AdminOrders /></PageWrapper>
              </ProtectedRoute>
            } />

            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['developer', 'owner', 'sub-owner']}>
                <PageWrapper><UserManagement /></PageWrapper>
              </ProtectedRoute>
            } />
            
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Preloader />
      <Router>
        <AppContent />
      </Router>
    </CartProvider>
  );
}

export default App;