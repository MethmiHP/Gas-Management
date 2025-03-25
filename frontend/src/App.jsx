import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ComplaintPage from "./components/customerSupport/pages/ComplaintPage";
import SupporterPage from "./components/customerSupport/pages/SupporterPage";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            
          </div>
        </nav>
        
        <main className="container">
          <Routes>
            {/* Default route redirects to complaints page */}
            <Route path="/" element={<Navigate to="/customer-support/complaints" replace />} />
            
            {/* Complaint Routes */}
            <Route path="/customer-support/complaints" element={<ComplaintPage />} />
            <Route path="/customer-support/complaints/supporter" element={<SupporterPage />} />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/customer-support/complaints" replace />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;