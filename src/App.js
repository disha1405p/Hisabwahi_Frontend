import './App.css';
import Navbar from './Components/Navbar/Navbar';
import Dashboard from './pages/Dashboard/Dashboard';
import LoginSignup from './pages/LoginSignup/LoginSignup';
import Customer from './pages/Customer/Customer';
import Payment from './pages/Payment/Payment';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Call this when login is successful
  const handleLogin = () => setIsAuthenticated(true);

  return (
    <Router>
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <LoginSignup onLogin={handleLogin} />
            )
          }
        />

        {/* Protected Routes under Navbar */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navbar />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="customer" element={<Customer />} />
          <Route path="payment" element={<Payment />} />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
