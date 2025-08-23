import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/landingPage";
import LoginPage from "./components/login";
import RegisterForm from "./components/register";
import Dashboard from "./pages/ceo";
import PaymentPage from "./pages/paymentPage"; // Add this
import AdminLogin from "./pages/admin/admin_login";
import AdminDashboard from "./pages/admin/admin_dashboard";
import { Toaster } from "react-hot-toast";
import AboutGrant from './pages/about';
import Contact from './pages/contact';
import Redirect from './pages/redirecting'

export default function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterForm />} />

          {/* Payment Route */}
          <Route path="/payment" element={<PaymentPage />} />

          {/* CEO Dashboard */}
          <Route path="/ceo_dashboard" element={<Dashboard />} />

          {/* contact page */}
          <Route path="/contact" element={<Contact/>}/>

          {/* redirecting */}
          <Route path="/redirecting" element={<Redirect/>}/>


          {/* about */}
          <Route path="/about" element={<AboutGrant/>}/>

          {/* Admin Routes */}
          <Route path="/admin_login" element={<AdminLogin />} />
          <Route path="/admin_dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </>
  );
}
