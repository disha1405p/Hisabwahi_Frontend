import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hisabwahi from '../../Components/Assets/hisabwahi_logo.png';
import './LoginSignup.css';

import { MdEmail } from "react-icons/md"; // Email Icon
import { RiLockPasswordFill } from "react-icons/ri"; // Password Icon
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const LoginSignup = ({ onLogin }) => {
  const [action, setAction] = useState("Hisabwahi Login");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      // Call backend API using axios
      const response = await axios.post('http://192.168.1.111:1405/login/loginApi', {
        emailId: email,
        password: password,
      });
      
      const data = response.data;
      
      if (data.status === 1) {
        // If onLogin function is provided, call it to update authentication state
        if (onLogin) onLogin();
        // Login successful, redirect to dashboard
        navigate('/dashboard');
      } else {
        // Show error message if login fails
        setErrorMessage(data.message);
      }
    } catch (error) {
      console.error('Error during API call:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  // Allow submission with Enter key
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="loginOverlay">
      <div className='login-container'>
        <div className='logo-hisabwahi'>
          <img src={Hisabwahi} alt="Hisabwahi Logo" />
        </div>
        <div className="header">
          <div className="text" tabIndex="-1">
            <span style={{ fontFamily: "cursive" }}>Hisabwahi Login</span>
          </div>
        </div>
        <div className="inputs">
          <div className="input">
            <MdEmail className="icon" />
            <input 
              type="email" 
              placeholder="Email Id" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
          <div className="input">
            <RiLockPasswordFill className="icon" />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <div className="icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEye size={24} /> : <FaEyeSlash size={24} />}
            </div>
          </div>
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <div className="forgot-password">Forgot Password?</div>
        <div className="Submit-container">
          <div 
            className="submit" 
            onClick={handleSubmit} 
            tabIndex="-1"
          >
            Login
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
