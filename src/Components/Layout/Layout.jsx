// import { useState } from "react";
// import { Outlet, useLocation } from "react-router-dom";
// // import CryptoJS from "crypto-js";
// import Navbar from "../Navbar/Navbar";
// import "./Layout.css";
// import { FaCreditCard, FaRupeeSign, FaStore } from "react-icons/fa";

// const secretKey = import.meta.env.VITE_SECRET_KEY;

// const Layout = () => {
//     const [shopData, setShopData] = useState(null);
//     const location = useLocation();
  
//     // useEffect(() => {
//     //   const encryptedData = localStorage.getItem("data");
//     //   if (encryptedData) {
//     //     try {
//     //       const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
//     //       const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
//     //       const data = JSON.parse(decryptedStr);
//     //       setShopData(data);
//     //     } catch (error) {
//     //       console.error("Decryption failed:", error);
//     //     }
//     //   }
//     // }, []);
  
//     // Determine active page label based on the current path
//     let activePage = "";
//     if (location.pathname.includes("/prices")) {
//       activePage = "Prices";
//     } else if (location.pathname.includes("/order-list")) {
//       activePage = "Order List";
//     } else if (location.pathname.includes("/transactions")) {
//       activePage = "Transaction";
//     } else {
//       activePage = "Dashboard";
//     }
  
//     if (!shopData) {
//       return <div>Loading shop data...</div>;
//     }

//   return (
//     <div className="layout-container">
//       <div className="layout-sidebar">
//         <Navbar />
//       </div>
//       <div className="layout-main">
//         <header className="layout-header">
//             <div className="header-left-l">
//                 <FaStore className="header-icon-l" />
//                 <h1 className="shop-name-l">{shopData.ShopName || "Shop Name"}</h1>
//             </div>
//             <div className="header-center-l">
//                 <span className="active-page-l">{activePage}</span>
//             </div>
//             <div className="header-right-l">
//                 <div className="right-content">
//                     <p className="credits-l">
//                         <FaCreditCard />
//                         <span className="status-l">
//                             0000.0 <FaRupeeSign />
//                         </span>
//                     </p>
//                 </div>
//             </div>
//         </header>
//         <div className="layout-content">
//           {/* Pass shopData to child routes if needed */}
//           <Outlet context={{ shopData }} />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Layout;