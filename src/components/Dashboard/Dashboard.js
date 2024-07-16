import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { auth, db } from "../shared/firebase";
import Modal from "react-modal";
import AddCustomerModal from "../AddCustomerModal/AddCustomerModal";
import "./dashboard.css";

Modal.setAppElement('#root');

const Dashboard = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [customerCount, setCustomerCount] = useState(0);
  const [pgData, setPgData] = useState(null); // State to hold PG data
  const history = useHistory();
  const { pgId } = useParams();

  useEffect(() => {
    const fetchPgData = async () => {
      try {
        const pgDoc = await db.collection(`users/${auth.currentUser.uid}/PGs`).doc(pgId).get();
        if (pgDoc.exists) {
          setPgData(pgDoc.data());
        } else {
          console.error("PG not found or unauthorized access.");
          history.push("/pg-selection"); // Redirect to selection page if unauthorized
        }
      } catch (error) {
        console.error("Error fetching PG data:", error.message);
        history.push("/pg-selection"); // Redirect to selection page on error
      }
    };

    fetchPgData();
  }, [pgId, history]);

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
    return null; // or LoadingSpinner or any loading indicator while fetching data
  }

  return (
    <div>
      <h1 className="dashboard-nav-heading">Welcome to PG Management Dashboard - {pgData.name}</h1>
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
        />
      </Modal>
    </div>
  );
};

export default Dashboard;
