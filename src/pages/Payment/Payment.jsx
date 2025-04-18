import React, { useState, useEffect, useRef } from "react";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
// import MenuDrawer from "../../Components/Navbar/Navbar";
import "./Payment.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Payment() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
 // NEW: State to control view dialog when FiEye is clicked
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [customers, setCustomers] = useState([]); // Payment records from API
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [startFrom, setStartFrom] = useState(0);
  const pageSize = 15;
  const [hasMore, setHasMore] = useState(true);


const [sortColumn, setSortColumn] = useState("date");
  const [sortOrder, setSortOrder] = useState(-1);

  const mobileNumberRef = useRef(null);
  // Ref for the scrollable container
  const containerRef = useRef(null);

  const [newCustomer, setNewCustomer] = useState({
    MobileNumber: "",
    CustomerName: "",
    Amount: "",
    Remarks: "",
    Date: "",
  });

const [viewSelectedPayment, setviewSelectedPayment] = useState();


  // Initial load: Fetch the first page
  useEffect(() => {
    fetchPaymentData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll: Attach scroll listener on container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (loading || !hasMore) return;

      const scrollThreshold = 0.10; // pixels from bottom
      const { scrollTop, scrollHeight, clientHeight } = container;
      console.log("Container scrollTop:", scrollTop, "clientHeight:", clientHeight, "scrollHeight:", scrollHeight);

      if (scrollTop + clientHeight >= scrollHeight - scrollThreshold) {
        console.log("Threshold reached. Fetching more payment data from offset:", startFrom);
        fetchPaymentData(startFrom);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, startFrom]);


 const fetchViewSelectedPaymentData = async (customerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("http://192.168.1.111:1405/get/payment", {
        startFrom: 0, // Always start from 0 for specific customer view
        pageSize: 50, // You can adjust this if needed
        sortColumn: sortColumn,
        sortOrder: sortOrder,
        customer_id: customerId,
      });
  
      if (response.data.status === 1) {
        const paymentData = response.data.data;
        setviewSelectedPayment(paymentData);
      } else {
        setviewSelectedPayment([]); // Clear if no data
      }
    } catch (err) {
      setError("Failed to fetch selected customer data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  



  // Function to fetch payment data with pagination
  const fetchPaymentData = async (offset, column = sortColumn, order = sortOrder) => {
    console.log("Fetching payment data from offset:", offset);
    setLoading(true);
    setError(null);
    console.log('Api Body: ',{
      startFrom: offset,
      pageSize: pageSize,
      sortColumn: column,  // Send sort column
      sortOrder: order,    // Send sort order (1 for ascending, -1 for descending)
      // customer_id: customerId,
  });
    try {
      const response = await axios.post("http://192.168.1.111:1405/get/payment", {
        startFrom: offset,
        pageSize: pageSize,
        sortColumn: column,  // Send sort column
        sortOrder: order,    // Send sort order (1 for ascending, -1 for descending)
        // customer_id: customerId,
      });
      // console.log("Server response:", response.data);
      if (response.data.status === 1) {
        const paymentData = response.data.data;

         // Conditionally update state based on customerId
         if (offset === 0) {
          setviewSelectedPayment(paymentData); // Update viewSelectedPayment if customerId is not null
        } else {
          setNewCustomer((prev) => ({
            ...prev,
            ...paymentData[0], // Assuming salesData contains an array, take the first item
          }));
        }
  
        if (paymentData.length === 0) {
          setHasMore(false);
          return;
        }


        // Append new data if offset is not zero; else, replace data
        const updatedData = offset === 0 ? paymentData : [...customers, ...paymentData];
        setCustomers(updatedData);
        setFilteredCustomers(updatedData);
        // Update pagination state from response
        setStartFrom(response.data.pagination.startFrom);
        setHasMore(response.data.pagination.hasMore);
        console.log("Payment data loaded successfully. New items:", paymentData);
      } else {
        setHasMore(false);
        if (offset === 0) {
          setCustomers([]);
          setFilteredCustomers([]);
        }
        console.log(response.data.message || "No more payment data available");
      }
    } catch (err) {
      console.error("Error fetching payment data:", err);
      setError("Failed to fetch payment data. Please try again later.");
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
    fetchPaymentData(0, column, newSortOrder);
  };


  // Dialog open/close functions
  const handleDialogOpen = () => {
    const now = new Date();
    const offset = 5.5 * 60 * 60 * 1000; // IST offset in ms
    const istTime = new Date(now.getTime() + offset);
    const formattedDateTime = istTime.toISOString().slice(0, 16);
    setNewCustomer((prev) => ({ ...prev, Date: formattedDateTime }));
    setIsDialogOpen(true);
    setTimeout(() => {
      mobileNumberRef.current?.focus();
    }, 0);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setIsViewDialogOpen(false); // Close the view dialog if open
    setNewCustomer({ MobileNumber: "", CustomerName: "", Amount: "", Remarks: "", Date: "" });
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
    if (name === "MobileNumber" && value.length === 10) {
      try {
        const response = await axios.post("http://192.168.1.111:1405/get/paymentcustomer", {
          mobileNumber: value,
        });
        if (response.data.status === 1) {
          setNewCustomer((prev) => ({
            ...prev,
            CustomerName: response.data.data.customerName,
          }));
        } else {
          setNewCustomer((prev) => ({ ...prev, CustomerName: "" }));
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
        alert("Failed to fetch customer data. Please try again.");
      }
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    try {
      const customer_response = await axios.post("http://192.168.1.111:1405/add/customer", {
        mobile: newCustomer.MobileNumber,
        name: newCustomer.CustomerName,
      });
      if (customer_response.data.status === 1) {
        const payment_response = await axios.post("http://192.168.1.111:1405/add/payment", {
          customer_id: customer_response.data.data.id,
          date: newCustomer.Date,
          amount: newCustomer.Amount,
          remarks: newCustomer.Remarks,
        });
        if (payment_response.data.status === 1) {
          const savedPayment = payment_response.data.data;
          // Append the new payment record at the end
          const updatedPayments = [...customers, savedPayment];
          setCustomers(updatedPayments);
          setFilteredCustomers(updatedPayments);
          localStorage.setItem("customers", JSON.stringify(updatedPayments));
          console.log("Payment added successfully:", savedPayment);
          handleDialogClose();
        } else {
          alert("Error Payment Response: " + payment_response.data.message);
        }
      } else {
        alert("Error Customer Response: " + customer_response.data.message);
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Failed to add payment. Please try again.");
    }
  };

  // Edit and Delete handlers
  const handleEditCustomer = (customer, index) => {
    setSelectedCustomer(customer);
    setSelectedIndex(index);
    setNewCustomer({
      MobileNumber: customer.customer_mobile,
      CustomerName: customer.customer_name,
      Amount: customer.amount,
      Remarks: customer.remarks,
      Date: new Date(customer.date).toISOString().slice(0, 16),
    });
    setIsDialogOpen(true);
  };
  

  const confirmEdit = () => {
    if (selectedCustomer && selectedIndex !== null) {
      setNewCustomer(selectedCustomer);
      setIsDialogOpen(true);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteCustomer = (paymentId, index) => {
    setSelectedPaymentId(paymentId);
    setSelectedIndex(index);
    setIsDeleteDialogOpen(true);
  };

  
  const confirmDelete = async () => {
    if (!selectedPaymentId) return;
  
    try {
      const response = await axios.delete(`http://192.168.1.111:1405/delete/payment/${selectedPaymentId}`);
  
      if (response.data.status === 1) {
        // Remove the deleted payment from state
        const updatedPayments = customers.filter((payment) => payment._id !== selectedPaymentId);
        setCustomers(updatedPayments);
        setFilteredCustomers(updatedPayments);
        console.log("Payment deleted successfully:", response.data.message);
      } else {
        alert("Failed to delete payment: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Failed to delete payment. Please try again.");
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };
  


  const handleEditPayment = async (e) => {
    e.preventDefault();
  
    try {
      const updatedPayment = {
        customer_id: selectedCustomer.customer_id, // Pass the existing customer ID
        mobile_number: newCustomer.MobileNumber,
        customer_name: newCustomer.CustomerName,
        date: newCustomer.Date,
        amount: newCustomer.Amount,
        remarks: newCustomer.Remarks,
      };
  
      const response = await axios.put(
        `http://192.168.1.111:1405/edit/payment/${selectedCustomer._id}`, // Use the selected payment's ID
        updatedPayment
      );
  
      if (response.data.status === 1) {
        const updatedPayments = customers.map((payment, index) =>
          index === selectedIndex ? { ...payment, ...response.data.data } : payment
        );
        setCustomers(updatedPayments);
        setFilteredCustomers(updatedPayments);
        localStorage.setItem("customers", JSON.stringify(updatedPayments));
        console.log("Payment updated successfully:", response.data.data);
        handleDialogClose();
      } else {
        alert("Failed to update payment: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Failed to update payment. Please try again.");
    }
  };
  
  // Inside your form's onSubmit handler
  const handleSavePayment = (e) => {
    if (selectedCustomer) {
      handleEditPayment(e); // Call the edit function if a customer is selected
    } else {
      handleAddPayment(e); // Call the add function for a new payment
    }
  };
  
  const handleDeletePayment = async (paymentId, index) => {
    if (!paymentId) return;
  
    const confirmDelete = window.confirm("Are you sure you want to delete this payment?");
    if (!confirmDelete) return;
  
    try {
      const response = await axios.delete(`http://192.168.1.111:1405/delete/payment/${paymentId}`);
  
      if (response.data.status === 1) {
        // Remove the deleted payment from state
        const updatedPayments = customers.filter((payment) => payment._id !== paymentId);
        setCustomers(updatedPayments);
        setFilteredCustomers(updatedPayments);
        console.log("Payment deleted successfully:", response.data.message);
      } else {
        alert("Failed to delete payment: " + response.data.message);
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert("Failed to delete payment. Please try again.");
    }
  };
  


 // NEW: Handler to open the view dialog when FiEye icon is clicked
 const handleViewCustomer = (customer, index) => {
  console.log(customer);
  setSelectedCustomer(customer);
  setSelectedIndex(index);  // Set the index here so you can display it
  fetchViewSelectedPaymentData(customer.customer_id);
  setIsViewDialogOpen(true);
};


  // Search by Mobile Number
  const handleSearchChange = (e) => {
    const value = e.target.value; // Get the new value from the input
    setSearchQuery(value);
  
    if (!value) {
      // If search query is empty, reset to the full list
      setFilteredCustomers(customers);
    } else {
      // Filter customers based on the input value
      const filtered = customers.filter((customer) =>
        Object.values(customer).some((field) =>
          field.toString().toLowerCase().includes(value.toLowerCase())
        )
      );
      setFilteredCustomers(filtered);
    }
  };
  // const handleSearchChange = (e) => {
  //   setSearchQuery(e.target.value);
  // };

  // const handleSearch = () => {
  //   if (!searchQuery) {
  //     setFilteredCustomers(customers);
  //   } else {
  //     const filtered = customers.filter((customer) =>
  //       // customer.customer_mobile?.toString().includes(searchQuery)
  //     Object.values(customer).some((value) =>
  //       value.toString().toLowerCase().includes(searchQuery.toLowerCase())
  // )
  //     );
  //     setFilteredCustomers(filtered);
  //   }
  // };

  // Shortcut: Ctrl+D to open dialog
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
    <div className="main-container-payment">
      {/* <MenuDrawer active="Payment" /> */}

      <div className="button-container-payment">
        <input
          type="text"
          placeholder="Search anything"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input-payment"
        />
        
        {/* <input
          type="text"
          placeholder="Search anything"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className="search-input-payment"
        />
        <button onClick={handleSearch} className="search-btn">
          Search
        </button> */}
        <button  title="short cut key ctrl + D" onClick={handleDialogOpen} className="add-payment-btn">
          Add Payment
        </button>
      </div>

      {/* Add Payment Dialog */}
      {isDialogOpen && (
        <div className="dialog-overlay-payment">
          <div className="dialog-payment">
            <h2>{selectedCustomer ? "Edit Payment" : "Add Payment"}</h2>
            <form onSubmit={selectedCustomer ? handleSavePayment : handleAddPayment}>
              <div className="form-group-payment">
                <label htmlFor="mobileNumber">Mobile Number:</label>
                <input
                  type="number"
                  id="mobileNumber"
                  name="MobileNumber"
                  value={newCustomer.MobileNumber}
                  ref={mobileNumberRef}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 10) {
                      handleInputChange(e);
                    }
                  }}
                  required
                />
              </div>
              <div className="form-group-payment">
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
              <div className="form-group-payment">
                <label htmlFor="dateTime">Date and Time:</label>
                <input
                  type="datetime-local"
                  id="dateTime"
                  name="Date"
                  value={newCustomer.Date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-payment">
                <label htmlFor="amount">Amount:</label>
                <input
                  type="number"
                  id="amount"
                  name="Amount"
                  value={newCustomer.Amount}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group-payment">
                <label htmlFor="remarks">Remarks:</label>
                <input
                  type="text"
                  id="remarks"
                  name="Remarks"
                  value={newCustomer.Remarks}
                  onChange={handleInputChange}
                  style={{ height: "50px" }}
                />
              </div>
              <div className="dialog-actions-payment">
                <button type="button" onClick={handleDialogClose}>
                  Cancel
                </button>
                <button type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Confirmation Dialog */}
      {isEditDialogOpen && (
        <div className="dialog-overlay-edit-payment">
          <div className="dialog-edit-payment">
            <h2>Edit Payment</h2>
            <p>Are you sure you want to edit this payment?</p>
            <div className="dialog-actions-edit-payment">
              <button onClick={confirmEdit}>Yes</button>
              <button onClick={handleDialogClose}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="dialog-overlay-delete-payment">
          <div className="dialog-delete-payment">
            <h2>Delete Payment</h2>
            <p>Are you sure you want to delete this payment?</p>
            <div className="dialog-actions-delete-payment">
              <button onClick={confirmDelete}>Yes</button>
              <button onClick={handleDialogClose}>No</button>
            </div>
          </div>
        </div>
      )}

  {/* NEW: View Details Dialog - shows details of multiple records */}
{isViewDialogOpen && viewSelectedPayment && viewSelectedPayment.length > 0 && (
  <div className="dialog-overlay-view-payment">
    <div className="dialog-view-payment">
      <h2>Payment Details</h2>

        {/* Display the Tag at the top */}
        <div className="customer-info-tag">
            <strong>Customer Name:</strong> {viewSelectedPayment[0].customer_name}{" "}
          | <strong>Mobile Number:</strong> {viewSelectedPayment[0].customer_mobile}
        </div>

      {/* Scrollable Table */}
      <div className="table-container-view-payment">
      <table className="view-details-table-payment">
        <thead>
          <tr>
            <th>Sr. No.</th>
            <th>Date & Time</th>
            <th>Amount</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {viewSelectedPayment.map((customer, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                {new Date(customer.date).toLocaleString("en-IN", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </td>
              <td>{customer.amount}</td>
              <td>{customer.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="dialog-actions-view-payment">
        <button onClick={handleDialogClose}>Close</button>
      </div>
    </div>
  </div>
)}




      {/* Loading and Error States */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Payment Table inside a scrollable container */}
      <div className="table-container-payment" ref={containerRef}>
        <table className="table-payment">
          <thead>
            <tr>
              <th className="sr-no-payment">Sr. No.</th>
              <th className="date-payment" onClick={() => handleSort("date")}>Date & Time <i className="fas fa-sort"></i></th>
              <th className="customer-name-payment" onClick={() => handleSort("customer_name")}>Customer Name <i className="fas fa-sort"></i></th>
              <th className="mobile-no-payment" onClick={() => handleSort("customer_mobile")}>Mobile Number <i className="fas fa-sort"></i></th>
              <th className="amount-payment" onClick={() => handleSort("amount")}>Amount <i className="fas fa-sort"></i></th>
              <th className="remarks-payment" onClick={() => handleSort("remarks")}>Remarks <i className="fas fa-sort"></i></th>
              <th className="action-payment">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer, index) => {
              const formattedDate = new Date(customer.date).toLocaleString("en-IN", {
                dateStyle: "short",
                timeStyle: "short",
              });
              return (
                <tr key={index}>
                  <td className="sr-no-payment">{index + 1}</td>
                  <td className="date-payment">{formattedDate}</td>
                  <td className="customer-name-payment">{customer.customer_name}</td>
                  <td className="mobile-no-payment">{customer.customer_mobile}</td>
                  <td className="amount-payment">{customer.amount}</td>
                  <td className="remarks-payment">{customer.remarks}</td>
                  <td className="action-payment">
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
                          onClick={() => handleDeleteCustomer(customer._id, index)}
                        />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
