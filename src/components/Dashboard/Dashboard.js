import React, { useState } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { auth, db } from "../shared/firebase";
import Modal from "react-modal";
import AddCustomerModal from "../AddCustomerModal/AddCustomerModal";
import "./dashboard.css";

Modal.setAppElement('#root');

const Dashboard = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [customerCount, setCustomerCount] = useState(0);
  const location = useLocation();
  const history = useHistory();
  const { pgId } = useParams();

  // Get PG details from location state
  const pgData = location.state?.pgDetails;

  const openAddCustomerModal = () => {
    setModalIsOpen(true);
  };

  const closeAddCustomerModal = () => {
    setModalIsOpen(false);
  };

  const saveCustomerData = async (customerData) => {
    try {
      await db.collection(`users/${auth.currentUser.uid}/PGs/${pgId}/CustomerData`).doc({
        ...customerData,
      });
      setCustomerCount(customerCount + 1);
      closeAddCustomerModal();
    } catch (error) {
      console.error("Error saving customer data:", error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      history.push("/login");
      console.log("Logout successful");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  if (!pgData) {
    return null; // You can replace this with a loading spinner or message
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-nav-heading">
        <span className="pg-number">{pgData.number}</span>
        <span className="heading-text">{pgData.name} PG Management Center</span>
      </div>
      <button className="add-customer-btn" onClick={openAddCustomerModal}>Add Customer</button>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeAddCustomerModal}
        contentLabel="Add Customer Modal"
      >
        <AddCustomerModal
          isOpen={modalIsOpen}
          onRequestClose={closeAddCustomerModal}
          onCustomerAdded={saveCustomerData}
          selectedPGId={pgId}
          pgData={pgData}
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
