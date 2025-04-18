import React, { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { MdDashboard, MdPerson, MdPayment } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { Link, Outlet, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const location = useLocation();

  // Determine the active page title based on the current URL
  let activePage = "Dashboard";
  if (location.pathname.includes("customer")) {
    activePage = "Customer";
  } else if (location.pathname.includes("payment")) {
    activePage = "Payment";
  } else if (location.pathname.includes("dashboard")) {
    activePage = "Dashboard";
  }

  // Toggle the sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Open the logout dialog
  const openDialog = () => {
    setIsDialogOpen(true);
  };

  // Close the logout dialog
  const closeDialog = () => {
    setIsDialogOpen(false);
  };

  // Handle logout action
  const handleLogout = () => {
    localStorage.clear();
    setIsDialogOpen(false);
    window.location.href = "/login";
  };

  // Close sidebar on link click (optional)
  const updateActivePage = () => {
    setIsOpen(false);
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <nav className={`sidebar ${isOpen ? "open" : "closed"}`}
      onMouseEnter={() => setIsOpen(true)} 
      onMouseLeave={() => setIsOpen(false)}
      >
        <ul className="menu-list">
          <li>
            <Link to="/dashboard" onClick={updateActivePage}>
            <div className="menu-icon-container">
                <MdDashboard className="menu-icon" />
            </div>
            </Link>
            <span className={isOpen ? "show" : "hide"}>
              <Link to="/dashboard" onClick={updateActivePage}>
                Dashboard
              </Link>
            </span>
          </li>
          <li>
            <Link to="/customer" onClick={updateActivePage}>
            <div className="menu-icon-container">
              <MdPerson className="menu-icon" />
            </div>
            </Link>
            <span className={isOpen ? "show" : "hide"}>
              <Link to="/customer" onClick={updateActivePage}>
                Customer
              </Link>
            </span>
          </li>
          <li>
            <Link to="/payment" onClick={updateActivePage}>
            <div className="menu-icon-container">
              <MdPayment className="menu-icon" />
            </div>  
            </Link>
            <span className={isOpen ? "show" : "hide"}>
              <Link to="/payment" onClick={updateActivePage}>
                Payment
              </Link>
            </span>
          </li>
          <li>
            <Link to="#" onClick={openDialog}>
            <div className="menu-icon-container">
              <FiLogOut className="menu-icon" />
            </div>  
            </Link>
            <span className={isOpen ? "show" : "hide"}>
              <Link to="#" onClick={openDialog}>
                Logout
              </Link>
            </span>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div className={`main-content ${isOpen ? "shifted" : ""}`}>
        {/* Header */}
        <header className="header-nav">
          <button className="menu-btn" onClick={toggleSidebar}>
            {/* {isOpen ? <FiX size={24} /> : <FiMenu size={24} />} */}
             <FiMenu size={24} />
          </button>
          <h2 className="active-page-title">{activePage}</h2>
          <h1 className="title">HISABWAHI</h1>
        </header>

        {/* Logout Confirmation Dialog */}
        {isDialogOpen && (
          <div className="dialog-overlay">
            <div className="dialog">
              <h2>Are you sure you want to logout?</h2>
              <div className="dialog-actions">
                <button onClick={handleLogout} className="confirm-btn">
                  Yes, Logout
                </button>
                <button onClick={closeDialog} className="cancel-btn">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nested Routes */}
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
