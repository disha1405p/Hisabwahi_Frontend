import React, { useState, useEffect, useRef } from "react";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
// import MenuDrawer from "../../Components/Navbar/Navbar";
import "./Customer.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Customer() {
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); 
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // NEW: State to control view dialog when FiEye is clicked
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Data states
  const [customers, setCustomers] = useState([]); // All customers from backend
  const [filteredCustomers, setFilteredCustomers] = useState([]); // For search filtering
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Customer for edit/delete
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");


const [sortColumn, setSortColumn] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState(-1);

  // Form state for adding a new customer
  const [newCustomer, setNewCustomer] = useState({
    MobileNumber: "",
    CustomerName: "",
    Address: "",
  });

const [viewSelectedCustomer, setviewSelectedCustomer] = useState();

useEffect(()=>{
  console.log('aaa',viewSelectedCustomer);
},[viewSelectedCustomer])
  // Pagination states
  const [startFrom, setStartFrom] = useState(0);
  const pageSize = 15; // Change page size if needed
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const mobileNumberRef = useRef(null);

  // 1. Fetch initial data from the server
  useEffect(() => {
    fetchCustomers(0); // Start from offset 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const fetchViewSelectedCustomerData = async (customerId) => {
    setLoading(true); // Show loading indicator
    try {
      const response = await axios.post("http://localhost:1405/get/customer", {
        customer_id: customerId, // Pass the customer ID to the API
      });
  
      if (response.data.status === 1) {
        const customerData = response.data.data;
        setviewSelectedCustomer(customerData); // Use the correct state setter
        setIsViewDialogOpen(true); // Open the customer details dialog
      } else {
        alert("No details available for the selected customer.");
        setviewSelectedCustomer(null); // Clear the current selected customer
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
      alert("Failed to fetch customer details. Please try again later.");
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };
  


  // 2. Fetch data with offset-based pagination
  const fetchCustomers = async (offset, column = sortColumn, order = sortOrder) => {
    setLoading(true);
    console.log('Api Body: ',{
      startFrom: offset,
      pageSize: pageSize,
      sortColumn: column,  // Send sort column
      sortOrder: order,    // Send sort order (1 for ascending, -1 for descending)
    });
    try {
      const response = await axios.post("http://localhost:1405/get/customer", {
        startFrom: offset,
        pageSize: pageSize,
        sortColumn: column,  // Send sort column
        sortOrder: order,    // Send sort order (1 for ascending, -1 for descending)
      });

      if (response.data.status === 1) {
        // New data fetched from server
        console.log('Data length',response.data.data.length);
        console.log('pagination details:', response.data.pagination);
        
        const fetchedData = response.data.data;
        // If offset is 0, replace; otherwise, append new data
        const updatedCustomers = offset === 0 ? fetchedData : [...customers, ...fetchedData];

        setCustomers(updatedCustomers);
        setFilteredCustomers(updatedCustomers);

        // Update pagination state from server response
        setStartFrom(response.data.pagination.startFrom); 
        setHasMore(response.data.pagination.hasMore);
      } else {
        // No more data or error from API
        setHasMore(false);
        if (offset === 0) {
          setCustomers([]);
          setFilteredCustomers([]);
        }
        alert(response.data.message || "No more customer data available.");
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      alert("Failed to fetch customers. Please try again later.");
    } finally {
      setLoading(false);
    }
  };


  const handleSort = (column) => {
    let newSortOrder = 1;
  
    // Toggle order if same column is clicked again
    if (sortColumn === column) {
      newSortOrder = sortOrder === 1 ? -1 : 1;
    }
  
    setSortColumn(column);
    setSortOrder(newSortOrder);
  
    // Fetch sorted data from API
    fetchCustomers(0, column, newSortOrder);
  };

  // 3. Infinite scroll: load more when near bottom of page
  useEffect(() => {
    const container = document.querySelector(".table-container-customer");
    if (!container) return;
    
    const handleScroll = () => {
      const scrollThreshold = 0.10;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - scrollThreshold && hasMore && !loading) {
        console.log("Scrolling reached threshold in container, loading more...");
        fetchCustomers(startFrom);
      }
    };
    
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, startFrom]);  

  // Dialog open/close
  const handleDialogOpen = () => {
    setIsDialogOpen(true);
    setTimeout(() => {
      mobileNumberRef.current?.focus();
    }, 0);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsViewDialogOpen(false); 
    // Clear form fields
    setNewCustomer({ MobileNumber: "", CustomerName: "", Address: "" });
  };

  // 4. Handle adding a new customer
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:1405/add/customer", {
        mobile: newCustomer.MobileNumber,
        name: newCustomer.CustomerName,
        address: newCustomer.Address,
      });
      const data = response.data;

      if (data.status === 1) {
        // Create a new entry matching the API response shape
        const newEntry = {
          mobile: newCustomer.MobileNumber,
          name: newCustomer.CustomerName,
          address: newCustomer.Address,
          _id: data.data.id, // if your API returns the new document id
        };

        // Prepend the new entry to the list
        const updatedCustomers = [newEntry, ...customers];
        setCustomers(updatedCustomers);
        setFilteredCustomers(updatedCustomers);

        // Reset form and close dialog
        setNewCustomer({ MobileNumber: "", CustomerName: "", Address: "" });
        handleDialogClose();
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer. Please try again.");
    }
  };

  // 5. Edit / Delete Confirmation

  const handleEditCustomer = (customer, index) => {
    setNewCustomer({
      MobileNumber: customer.mobile, // Match the state variable names
      CustomerName: customer.name,
      Address: customer.address,
    });
  
    setSelectedCustomer(customer);
    setSelectedIndex(index);
    setIsDialogOpen(true); // Open the Edit Dialog
  };
  
  


  const confirmEditCustomer = () => {
    if (selectedCustomer && selectedIndex !== null) {
      setNewCustomer(selectedCustomer);
      setIsDialogOpen(true);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteCustomer = (customer, index) => {
    setSelectedCustomer(customer); // Store selected customer
    setSelectedIndex(index);
    setIsDeleteDialogOpen(true);
  };
  

  const confirmDeleteCustomer = async () => {
    if (!selectedCustomer) return;
  
    try {
      const response = await axios.delete(
        `http://localhost:1405/delete/customer/${selectedCustomer._id}`
      );
  
      console.log("API Response:", response.data);

      if (response.data.status === 1) {
        // Remove customer from state after successful deletion
        const updatedCustomers = customers.filter(
          (customer) => customer._id !== selectedCustomer._id
        );
        setCustomers(updatedCustomers);
        setFilteredCustomers(updatedCustomers);
  
        console.log("Customer deleted successfully:", selectedCustomer);

        alert("Customer deleted successfully.");
      } else {
        console.log("Delete failed:", response.data.message);
        alert(response.data.message || "Failed to delete customer.");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  



  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
  
    if (!selectedCustomer) {
      alert("No customer selected for editing.");
      return;
    }
  
    try {
      const response = await axios.put(
        `http://localhost:1405/edit/customer/${selectedCustomer._id}`,
        {
          name: newCustomer.CustomerName,
          mobile: newCustomer.MobileNumber,
          address: newCustomer.Address,
        }
      );
  
      if (response.data.status === 1) {
        const updatedCustomer = response.data.data;
  
        // Update the customer in the local state
        const updatedCustomers = [...customers];
        updatedCustomers[selectedIndex] = {
          ...updatedCustomers[selectedIndex],
          ...updatedCustomer, // Ensure updated fields are applied
        };
  
        setCustomers(updatedCustomers);
        setFilteredCustomers(updatedCustomers);
        localStorage.setItem("customers", JSON.stringify(updatedCustomers));
  
        console.log("Customer updated successfully:", updatedCustomer);
        handleDialogClose();
      } else {
        alert("Failed to update customer: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      alert("Failed to update customer. Please try again.");
    }
  };
  


  // 6. Search by mobile number
const handleSearchChange = (e) => {
  const value = e.target.value; // Get the new value
  setSearchQuery(value);

  if (!value) {
    // If the search query is empty, reset to the original customers list
    setFilteredCustomers(customers);
  } else {
    // Otherwise, filter the customers
    const filtered = customers.filter((customer) =>
      Object.values(customer).some((val) =>
        val.toString().toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredCustomers(filtered);
  }
};


 // NEW: Handler to open the view dialog when FiEye icon is clicked
 const handleViewCustomer = (customer, index) => {
  setSelectedCustomer(customer);
  setSelectedIndex(index); // Set the index here so you can display it
  fetchViewSelectedCustomerData(customer.customer_id);
  setIsViewDialogOpen(true);
};


  // 7. Shortcut: Ctrl+D to open dialog
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.ctrlKey && event.key.toLowerCase() === "d") {
        event.preventDefault();
        handleDialogOpen();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="main-container-customer">
      {/* <MenuDrawer active="Customer" /> */}

      {/* Top buttons: Search + Add Customer */}
      <div className="button-container-customer">
        {/* <input
          type="number"
          placeholder="Search by Mobile Number"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="search-input-customer"
        />
        <button onClick={handleSearch} className="search-btn-customer">
          Search
        </button> */}
        <input
          type="text"
          placeholder="Search anything"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input-customer"
        />
        <button  title="short cut key ctrl + D" onClick={handleDialogOpen} className="add-customer-button">
          Add Customer
        </button>
      </div>

      {/* Add/Edit Customer Dialog */}
      {isDialogOpen && (
        <div className="dialog-overlay-customer">
          <div className="dialog-customer">
            <h2>{selectedCustomer ? "Edit Customer" : "Add Customer"}</h2>
            <form onSubmit={selectedCustomer ? handleUpdateCustomer : handleAddCustomer}>
              <div className="form-group-customer">
                <label htmlFor="mobileNumber">Mobile Number:</label>
                <input
                  type="number"
                  id="mobileNumber"
                  name="MobileNumber"
                  value={newCustomer.MobileNumber}
                  ref={mobileNumberRef}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Limit to 10 digits
                    if (value.length <= 10) {
                      handleInputChange(e);
                    }
                  }}
                  required
                />
              </div>

              <div className="form-group-customer">
                <label htmlFor="customerName">Customer Name:</label>
                <input
                  type="text"
                  id="customerName"
                  name="CustomerName"
                  value={newCustomer.CustomerName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group-customer">
                <label htmlFor="address">Address:</label>
                <input
                  type="text"
                  id="address"
                  name="Address"
                  value={newCustomer.Address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="dialog-actions-customer">
                <button type="button" onClick={handleDialogClose}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Table */}
      <div className="table-container-customer">
        <table className="table-customer">
          <thead>
            <tr>
              <th className="sr-no-customer">Sr. No.</th>
              <th className="customer-name-customer" onClick={() => handleSort("name")}>Customer Name <i className="fas fa-sort"></i></th>
              <th className="mobile-no-customer" onClick={() => handleSort("mobile")}>Mobile Number <i className="fas fa-sort"></i></th>
              <th className="total-amount-customer" onClick={() => handleSort("outstanding")}>Total Amount <i className="fas fa-sort"></i></th>
              <th className="address-customer" onClick={() => handleSort("address")}>Address <i className="fas fa-sort"></i></th>
              <th className="action-customer">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{customer.name}</td>
                  <td>{customer.mobile}</td>
                  <td>{customer.outstanding}</td>
                  <td>{customer.address}</td>
                  <td>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <Link onClick={() => handleViewCustomer(customer, index)}>
                        <FiEye size={20} style={{ cursor: "pointer" }} />
                      </Link>
                      <Link>
                        <FiEdit
                          size={20}
                          style={{ cursor: "pointer", color: "blue" }}
                          title="Edit"
                          onClick={() => handleEditCustomer(customer, index)}
                        />
                      </Link>
                      <Link>
                        <FiTrash
                          size={20}
                          style={{ cursor: "pointer", color: "red" }}
                          title="Delete"
                          onClick={() => handleDeleteCustomer(customer, index)}
                        />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No Customers Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {loading && <p style={{ textAlign: "center" }}>Loading...</p>}

      {/* Edit Confirmation Dialog */}
      {isEditDialogOpen && (
        <div className="dialog-overlay-edit-customer">
          <div className="dialog-edit-customer">
            <h2>Edit Customer</h2>
            <p>Are you sure you want to edit this customer?</p>
            <div className="dialog-actions-edit-customer">
              <button onClick={confirmEditCustomer}>Yes</button>
              <button onClick={() => setIsEditDialogOpen(false)}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="dialog-overlay-delete-customer">
          <div className="dialog-delete-customer">
            <h2>Delete Customer</h2>
            <p>Are you sure you want to delete this customer?</p>
            <div className="dialog-actions-delete-customer">
              <button onClick={confirmDeleteCustomer}>Yes</button>
              <button onClick={() => setIsDeleteDialogOpen(false)}>No</button>
            </div>
          </div>
        </div>
      )}


       {/* NEW: View Details Dialog - shows details of a specific record */}
       {isViewDialogOpen &&
  viewSelectedCustomer &&
  viewSelectedCustomer.length > 0 && (
    <div className="dialog-overlay-view-customer">
      <div className="dialog-view-customer">
        <h2>Customer Details</h2>

        {/* Customer Information */}
        <div className="customer-info-tag">
          <strong>Customer Name:</strong> {viewSelectedCustomer[0].customer_name} |{" "}
          <strong>Mobile Number:</strong> {viewSelectedCustomer[0].customer_mobile}
        </div>

        {/* Scrollable Table */}
        <div className="table-container-view-customer">
          <table className="view-details-table-customer">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Date and Time</th>
                <th>Transaction</th>
                <th>Payment</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {viewSelectedCustomer.map((customer, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{customer.dateTime}</td>
                  <td>{customer.transaction}</td>
                  <td>{customer.payment}</td>
                  <td>{customer.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total Due Payment */}
        <div className="total-due-payment">
          <strong>Total Due Payment: </strong>
          {viewSelectedCustomer.reduce((total, customer) => total + (customer.due || 0), 0)}
        </div>

        {/* Close Button */}
        <div className="dialog-actions-view-customer">
          <button onClick={handleDialogClose}>Close</button>
        </div>
      </div>
    </div>
  )}

    </div>
  );
}

 