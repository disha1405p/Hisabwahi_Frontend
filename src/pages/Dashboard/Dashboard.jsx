import React, { useState, useEffect, useRef } from "react";
import { FiEye, FiEdit, FiTrash } from "react-icons/fi";
import { Link } from "react-router-dom";
import axios from "axios";
// import MenuDrawer from "../../Components/Navbar/Navbar";
import "./Dashboard.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Dashboard() {
  // Existing state variables...
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // NEW: State to control view dialog when FiEye is clicked
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
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
    Date: "",
    Amount: "",
    Remarks: "",
  });
  const [viewSelectedSales, setviewSelectedSales] = useState();

  // 1. Load local storage data, then fetch from backend
  useEffect(() => {
    const storedCustomers = localStorage.getItem("customers");
    if (storedCustomers) {
      const parsedCustomers = JSON.parse(storedCustomers);
      setCustomers(parsedCustomers);
      setFilteredCustomers(parsedCustomers);
      console.log("Loaded customers from local storage:", parsedCustomers);
    }
    fetchSalesData(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Infinite scroll effect on the table container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (loading || !hasMore) return;
      const scrollThreshold = 100;
      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollTop + clientHeight >= scrollHeight - scrollThreshold) {
        fetchSalesData(startFrom);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, startFrom, pageSize]);

  const fetchViewSelectedSalesData = async (customerId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("http://localhost:1405/get/sales", {
        startFrom: 0, // Always start from 0 for specific customer view
        pageSize: 50, // You can adjust this if needed
        sortColumn: sortColumn,
        sortOrder: sortOrder,
        customer_id: customerId,
      });
  
      if (response.data.status === 1) {
        const salesData = response.data.data;
        setviewSelectedSales(salesData);
      } else {
        setviewSelectedSales([]); // Clear if no data
      }
    } catch (err) {
      setError("Failed to fetch selected customer data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSalesData = async (
    offset,
    column = sortColumn,
    order = sortOrder
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("http://localhost:1405/get/sales", {
        startFrom: offset,
        pageSize: pageSize,
        sortColumn: column,
        sortOrder: order,
        // customer_id: null, // Always fetch general customers
      });
  
      if (response.data.status === 1) {
        const salesData = response.data.data;
  
        if (offset === 0) {
          setNewCustomer(salesData);
        } else {
          setNewCustomer((prev) => [...prev, ...salesData]); // Append new data
        }
  
        if (salesData.length === 0) {
          setHasMore(false);
          return;
        }
  
        const updatedCustomers =
          offset === 0 ? salesData : [...customers, ...salesData];
        setCustomers(updatedCustomers);
        setFilteredCustomers(updatedCustomers);
        localStorage.setItem("customers", JSON.stringify(updatedCustomers));
        setStartFrom(
          response.data.pagination.startFrom || offset + salesData.length
        );
        setHasMore(
          response.data.pagination.hasMore !== undefined
            ? response.data.pagination.hasMore
            : true
        );
      } else {
        setHasMore(false);
        if (offset === 0) {
          setCustomers([]);
          setFilteredCustomers([]);
        }
      }
    } catch (err) {
      setError("Failed to fetch sales data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };  

  const handleSort = (column) => {
    let newSortOrder = 1;
    if (sortColumn === column) {
      newSortOrder = sortOrder === 1 ? -1 : 1;
    }
    setSortColumn(column);
    setSortOrder(newSortOrder);
    fetchSalesData(0, column, newSortOrder);
  };

  // Existing Dialog functions (for Add, Edit, Delete) remain the same
  const handleDialogOpen = () => {
    const now = new Date();
    const offsetTime = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + offsetTime);
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
    setNewCustomer({
      MobileNumber: "",
      CustomerName: "",
      Amount: "",
      Remarks: "",
      Date: "",
    });
  };

  const handleInputChange = async (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
    if (name === "MobileNumber" && value.length === 10) {
      try {
        const response = await axios.post(
          "http://localhost:1405/get/transactioncustomer",
          {
            mobileNumber: value,
          }
        );
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

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const customer_response = await axios.post(
        "http://localhost:1405/add/customer",
        {
          mobile: newCustomer.MobileNumber,
          name: newCustomer.CustomerName,
        }
      );
      if (customer_response.data.status === 1) {
        const transaction_response = await axios.post(
          "http://localhost:1405/add/transaction",
          {
            customer_id: customer_response.data.data.id,
            date: newCustomer.Date,
            amount: newCustomer.Amount,
            remarks: newCustomer.Remarks,
          }
        );
        if (transaction_response.data.status === 1) {
          const savedCustomer = transaction_response.data.data;
          const updatedCustomers = [...customers, savedCustomer];
          setCustomers(updatedCustomers);
          setFilteredCustomers(updatedCustomers);
          localStorage.setItem("customers", JSON.stringify(updatedCustomers));
          handleDialogClose();
        } else {
          alert("Error in transaction: " + transaction_response.data.message);
        }
      } else {
        alert("Error in customer response: " + customer_response.data.message);
      }
    } catch (error) {
      console.error("Error adding customer:", error);
      alert("Failed to add customer. Please try again.");
    }
  };

  const handleEditCustomer = (customer, index) => {
    setNewCustomer({
      MobileNumber: customer.customer_mobile,
      CustomerName: customer.customer_name,
      Date: new Date(customer.date).toISOString().slice(0, 16),
      Amount: customer.amount,
      Remarks: customer.remarks,
    });
    setSelectedCustomer(customer);
    setSelectedIndex(index);
    setIsDialogOpen(true);
  };

  const confirmEdit = () => {
    if (selectedCustomer && selectedIndex !== null) {
      setNewCustomer(selectedCustomer);
      setIsDialogOpen(true);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteCustomer = (index) => {
    setSelectedIndex(index);
    setSelectedCustomer(customers[index]);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedCustomer) {
      try {
        const response = await axios.delete(
          `http://localhost:1405/delete/transaction/${selectedCustomer._id}`
        );
        if (response.data.status === 1) {
          const updatedCustomers = customers.filter(
            (customer) => customer._id !== selectedCustomer._id
          );
          setCustomers(updatedCustomers);
          setFilteredCustomers(updatedCustomers);
          localStorage.setItem("customers", JSON.stringify(updatedCustomers));
          setIsDeleteDialogOpen(false);
        } else {
          alert("Failed to delete transaction: " + response.data.message);
        }
      } catch (error) {
        console.error("Error deleting transaction:", error);
        alert("Failed to delete transaction. Please try again.");
      }
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (!value) {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter((customer) =>
        Object.values(customer).some((val) =>
          val.toString().toLowerCase().includes(value.toLowerCase())
        )
      );
      setFilteredCustomers(filtered);
    }
  };

  const handleEditTransaction = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert("No transaction selected for editing.");
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:1405/edit/transaction/${selectedCustomer._id}`,
        {
          customer_id: selectedCustomer.customer_id,
          mobile_number: newCustomer.MobileNumber,
          customer_name: newCustomer.CustomerName,
          date: newCustomer.Date,
          amount: newCustomer.Amount,
          remarks: newCustomer.Remarks,
        }
      );
      if (response.data.status === 1) {
        const updatedCustomer = response.data.data;
        const updatedCustomers = [...customers];
        updatedCustomers[selectedIndex] = {
          ...updatedCustomers[selectedIndex],
          ...updatedCustomer,
        };
        setCustomers(updatedCustomers);
        setFilteredCustomers(updatedCustomers);
        localStorage.setItem("customers", JSON.stringify(updatedCustomers));
        handleDialogClose();
      } else {
        alert("Failed to update transaction: " + response.data.message);
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to update transaction. Please try again.");
    }
  };

  // NEW: Handler to open the view dialog when FiEye icon is clicked
  const handleViewCustomer = (customer, index) => {
    setSelectedCustomer(customer);
    setSelectedIndex(index); // Set the index here so you can display it
    fetchViewSelectedSalesData(customer.customer_id);
    setIsViewDialogOpen(true);
 };

  // Shortcut to open dialog with Ctrl+D
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
    <div className="main-container-dashboard">
      {/* <MenuDrawer active="Dashboard" /> */}

      <div className="button-container-dashboard">
        <input
          type="text"
          placeholder="Search anything"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input-dashboard"
        />
        <button
          title="short cut key ctrl + D"
          onClick={handleDialogOpen}
          className="add-transaction-dashboard-btn"
        >
          Add Transaction
        </button>
      </div>

      {/* Add Transaction Dialog */}
      {isDialogOpen && (
        <div className="dialog-overlay-dashboard">
          <div className="dialog-dashboard">
            <h2>{selectedCustomer ? "Edit Transaction" : "Add Transaction"}</h2>
            <form
              onSubmit={
                selectedCustomer ? handleEditTransaction : handleAddCustomer
              }
            >
              <div className="form-group-dashboard">
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
              <div className="form-group-dashboard">
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
              <div className="form-group-dashboard">
                <label htmlFor="dateTime">Date and Time:</label>
                <input
                  type="datetime-local"
                  id="dateTime"
                  name="Date"
                  value={newCustomer.Date}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-dashboard">
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
              <div className="form-group-dashboard">
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
              <div className="dialog-actions-dashboard">
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
        <div className="dialog-overlay-edit-dashboard">
          <div className="dialog-edit-dashboard">
            <h2>Edit Transaction</h2>
            <p>Are you sure you want to edit this transaction?</p>
            <div className="dialog-actions-edit-dashboard">
              <button onClick={confirmEdit}>Yes</button>
              <button onClick={handleDialogClose}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="dialog-overlay-delete-dashboard">
          <div className="dialog-delete-dashboard">
            <h2>Delete Transaction</h2>
            <p>Are you sure you want to delete this transaction?</p>
            <div className="dialog-actions-delete-dashboard">
              <button onClick={confirmDelete}>Yes</button>
              <button onClick={handleDialogClose}>No</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: View Details Dialog - shows details of a specific record */}
      {isViewDialogOpen &&
  viewSelectedSales &&
  viewSelectedSales.length > 0 && (
    <div className="dialog-overlay-view-dashboard">
      <div className="dialog-view-dashboard">
        <h2>Transaction Details</h2>

        {/* Display the Tag at the top */}
        <div className="customer-info-tag">
          <strong>Customer Name:</strong> {viewSelectedSales[0].customer_name}{" "}
          | <strong>Mobile Number:</strong> {viewSelectedSales[0].customer_mobile}
        </div>

        {/* Scrollable Table */}
        <div className="table-container-view-dashboard">
          <table className="view-details-table-dashboard">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Date & Time</th>
                <th>Amount</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {viewSelectedSales.map((transaction, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>
                    {new Date(transaction.date).toLocaleString("en-IN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dialog-actions-view-dashboard">
          <button onClick={handleDialogClose}>Close</button>
        </div>
      </div>
    </div>
  )}



      {/* Loading and Error States */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Table container with infinite scroll */}
      <div className="table-container-dashboard" ref={containerRef}>
        <table className="table-dashboard">
          <thead>
            <tr>
              <th className="sr-no-dashboard">Sr. No.</th>
              <th className="date-dashboard" onClick={() => handleSort("date")}>
                Date & Time <i className="fas fa-sort"></i>
              </th>
              <th
                className="customer-name-dashboard"
                onClick={() => handleSort("customer_name")}
              >
                Customer Name <i className="fas fa-sort"></i>
              </th>
              <th
                className="mobile-no-dashboard"
                onClick={() => handleSort("customer_mobile")}
              >
                Mobile Number <i className="fas fa-sort"></i>
              </th>
              <th
                className="amount-dashboard"
                onClick={() => handleSort("amount")}
              >
                Amount <i className="fas fa-sort"></i>
              </th>
              <th
                className="remarks-dashboard"
                onClick={() => handleSort("remarks")}
              >
                Remarks <i className="fas fa-sort"></i>
              </th>
              <th className="action-dashboard">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer, index) => {
              const formattedDate = new Date(customer.date).toLocaleString(
                "en-IN",
                {
                  dateStyle: "short",
                  timeStyle: "short",
                }
              );
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{formattedDate}</td>
                  <td>{customer.customer_name}</td>
                  <td>{customer.customer_mobile}</td>
                  <td>{customer.amount}</td>
                  <td>{customer.remarks}</td>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
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
                          onClick={() => handleDeleteCustomer(index)}
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
