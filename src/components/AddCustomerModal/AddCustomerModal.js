import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { db } from "../shared/firebase"; // Assuming you have a 'db' instance from Firebase
import "./addCustomerModal.css";
import { getCurrentUserID } from "../shared/getCurrentUserID";

// Functional component for the Add Customer Modal
const AddCustomerModal = ({
  isOpen,
  onRequestClose,
  isMobileUnique,
  setIsMobileUnique,
  onCustomerAdded,
  onCustomerCount,
  selectedPGId // Prop to pass the selected PG ID
}) => {
  // State to manage customer data and initialize it with default values
  const [customerData, setCustomerData] = useState({
    customerID: "",
    name: "",
    mobile: "",
    place: "",
    address: "",
    age: "",
    totalCost: "",
    startDate: "",
    createdAt: new Date(),
  });
  const userID = getCurrentUserID();
  const [customerCount, setCustomerCount] = useState(0);

  const [nameError, setNameError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [placeError, setPlaceError] = useState("");
  // const [addressError, setAddressError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [totalCostError, setTotalCostError] = useState("");
  const [startDateError, setStartDateError] = useState("");

  useEffect(() => {
    if (isOpen) {
      resetErrors();
    }
  }, [isOpen]);

  useEffect(() => {
    console.log("AddCustomerModal - selectedPGId:", selectedPGId); // Log selectedPGId to check its value
    // Add other necessary logic or useEffect dependencies
  }, [selectedPGId]);
  
  // useEffect hook to fetch the maximum customer ID when the modal is opened
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Query the 'customers' collection to get the document with the maximum customerID
        const maxCustomerSnapshot = await db
          .collection(`users/${userID}/PGs/${selectedPGId}/CustomerData`)
          .orderBy("customerID", "desc")
          .limit(1)
          .get();

        // Update the customerData state with the next customer ID
        if (!maxCustomerSnapshot.empty) {
          const maxCustomerID = maxCustomerSnapshot.docs[0].data().customerID;
          setCustomerData((prevData) => ({
            ...prevData,
            customerID: maxCustomerID + 1,
          }));
        } else {
          // No existing customers, set the initial customer ID to 1
          setCustomerData((prevData) => ({
            ...prevData,
            customerID: 1,
          }));
        }
  
        // Fetch the customer count
        const customerCountSnapshot = await db.collection(`users/${userID}/PGs/${selectedPGId}/CustomerData`).get();
        setCustomerCount(customerCountSnapshot.size);
      } catch (error) {
        console.error("Error fetching data:", error.message);
      }
    };

    // Call the fetchData function when the modal is opened
    fetchData();
  }, [isOpen, userID, selectedPGId]);

  const validateInputs = () => {
    let isValid = true;

    // Name validation
    if (!customerData.name.trim()) {
      setNameError("Name is required");
      isValid = false;
    } else {
      setNameError("");
    }

    // Mobile validation
    if (!customerData.mobile.trim()) {
      setMobileError("Mobile number is required");
      isValid = false;
    } else if (!/^\d{10}$/.test(customerData.mobile)) {
      setMobileError("Invalid mobile number");
      isValid = false;
    } else {
      setMobileError("");
    }

    // Place validation
    if (!customerData.place.trim()) {
      setPlaceError("Place is required");
      isValid = false;
    } else {
      setPlaceError("");
    }

    // // Address validation
    // if (!customerData.address.trim()) {
    //   setAddressError("Address is required");
    //   isValid = false;
    // } else {
    //   setAddressError("");
    // }

    // Age validation
    if (!customerData.age.trim()) {
      setAgeError("Age is required");
      isValid = false;
    } else if (isNaN(customerData.age) || parseInt(customerData.age) <= 0) {
      setAgeError("Invalid age");
      isValid = false;
    } else {
      setAgeError("");
    }

    // Total Cost validation
    if (!customerData.totalCost.trim()) {
      setTotalCostError("Total Cost is required");
      isValid = false;
    } else if (
      isNaN(customerData.totalCost) ||
      parseFloat(customerData.totalCost) < 0
    ) {
      setTotalCostError("Invalid total cost");
      isValid = false;
    } else {
      setTotalCostError("");
    }

    // Start Date validation
    if (!customerData.startDate.trim()) {
      setStartDateError("Start Date is required");
      isValid = false;
    } else {
      setStartDateError("");
    }
    return isValid;
  };

  // Event handler for input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Function to reset errors
  const resetErrors = () => {
    setNameError("");
    setMobileError("");
    setPlaceError("");
    // setAddressError('');
    setAgeError("");
    setTotalCostError("");
    setStartDateError("");
  };

  // Custom styles for the modal
  const customStyles = {
    content: {
      width: window.innerWidth < 768 ? "auto" : "1100px",
      height: window.innerWidth < 768 ? "auto" : "600px",
      margin: window.innerWidth < 768 ? "5px" : "auto",
      marginBottom: window.innerWidth < 768 ? "230px" : "auto",
      marginLeft: window.innerWidth < 768 ? "-30px" : "auto",
      marginRight: window.innerWidth < 768 ? "-30px" : "auto",
      padding: "0",
      overflow: "auto", // Allow scrolling if content overflows
    },
  };

  // Function to check the uniqueness of a mobile number in the 'customers' collection
  const checkMobileNumberUnique = async (mobileNumber) => {
    try {
      const snapshot = await db
        .collection(`users/${userID}/PGs/${selectedPGId}/CustomerData`)
        .where("mobile", "==", mobileNumber)
        .get();
      // Return true if no matching documents found (mobile number is unique)
      return snapshot.empty;
    } catch (error) {
      console.error("Error checking mobile number uniqueness:", error.message);
      return false;
    }
  };

  // Function to handle saving customer data to the 'customers' collection
  const handleSave = async () => {
    try {
      resetErrors();
      if (!validateInputs() || customerCount >= 100) {
        if (customerCount >= 100) {
          onRequestClose();
          onCustomerCount();
        }

        return;
      }
      // Check if the mobile number is unique
      const isUnique = await checkMobileNumberUnique(customerData.mobile);

      if (isUnique) {
        // Save data with the specified document ID (customerID) and include customerID as a field
        await db
          .collection(`users/${userID}/PGs/${selectedPGId}/CustomerData`)
          .doc(String(customerData.customerID))
          .set({
            // Include other customer data here
            ...customerData,
            // Set default values for status and endDate for new customers
            status: "In Progress",
            endDate: "",
          });
        // Clear input boxes after successful save
        setCustomerData({
          customerID: "",
          name: "",
          mobile: "",
          place: "",
          address: "",
          age: "",
          totalCost: "",
          startDate: "",
        });
        // Close the modal after successful save
        onRequestClose();
        onCustomerAdded();
      } else {
        // Handle case where mobile number is not unique
        setIsMobileUnique(false);
      }
    } catch (error) {
      console.error("Error saving customer data:", error.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      contentLabel="Add Customer Modal"
      style={customStyles}
    >
      <div className="add-customer-dialog">
        <h2 className="add-customer-heading">Add Customer</h2>
        <p className="customerID">CustomerID: {customerData.customerID}</p>
        <p className='total-customers'>Total Customers: {customerCount} / 100</p>
        <div className="container2">
          <label className="add-all-label">
            Name *
            <input
              className="inputbox2"
              placeholder="Name"
              type="text"
              name="name"
              value={customerData.name}
              onChange={handleInputChange}
            />
            <div className="add-error-messages">{nameError}</div>
          </label>
          <label className="add-all-label">
            Mobile Number *
            <input
              className="inputbox2"
              placeholder="Mobile Number"
              type="text"
              name="mobile"
              value={customerData.mobile}
              onChange={handleInputChange}
            />
            {isMobileUnique ? null : (
              <div style={{ color: "red" }}>Mobile number must be unique</div>
            )}
            <div className="add-error-messages">{mobileError}</div>
          </label>
        </div>

        <div className="container2">
          <label className="add-all-label">
            Place *
            <input
              className="inputbox2"
              placeholder="Place"
              type="text"
              name="place"
              value={customerData.place}
              onChange={handleInputChange}
            />
            <div className="add-error-messages">{placeError}</div>
          </label>
          <label className="add-all-label">
            Address
            <input
              className="inputbox2"
              placeholder="Address"
              type="text"
              name="address"
              value={customerData.address}
              onChange={handleInputChange}
            />
            {/* <div className="edit-error-messages">{addressError}</div>   */}
          </label>
        </div>

        <div className="container2">
          <label className="add-all-label">
            Age *
            <input
              className="inputbox2"
              placeholder="Age"
              type="text"
              name="age"
              value={customerData.age}
              onChange={handleInputChange}
            />
            <div className="add-error-messages">{ageError}</div>
          </label>
          <label className="add-all-label">
            Total Cost *
            <input
              className="inputbox2"
              placeholder="Total Cost"
              type="text"
              name="totalCost"
              value={customerData.totalCost}
              onChange={handleInputChange}
            />
            <div className="add-error-messages">{totalCostError}</div>
          </label>
        </div>

        <div className="container2">
          <label className="add-all-label">
            Start Date *
            <input
              className="inputbox2"
              type="date"
              name="startDate"
              value={customerData.startDate}
              onChange={handleInputChange}
            />
            <div className="add-error-messages">{startDateError}</div>
          </label>
        </div>

        <div>
          <button
            className="add-cancel-button"
            onClick={() => {
              resetErrors();
              onRequestClose();
            }}
          >
            Cancel
          </button>
        </div>

        <div>
          <button className="add-save-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddCustomerModal;
