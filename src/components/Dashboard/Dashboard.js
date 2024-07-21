import React, { useState } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { auth } from "../shared/firebase";
import Modal from "react-modal";
import AddPayingGuestModal from "./AddPayingGuestModal/AddPayingGuestModal";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import "./dashboard.css";

Modal.setAppElement('#root');

const Dashboard = () => {
  const [payingGuestModalIsOpen, setPayingGuestModalIsOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const location = useLocation();
  const history = useHistory();
  const { pgId } = useParams();
  const [pgData] = useState(location.state?.pgDetails || {});

  const openAddPayingGuestModal = () => {
    setPayingGuestModalIsOpen(true);
  };

  const closeAddPayingGuestModal = () => {
    setPayingGuestModalIsOpen(false);
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

  const handleSnackbarOpen = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-nav-heading">
        <span className="pg-number">{pgData.number}</span>
        <span className="heading-text">{pgData.name} PG Management Center</span>
      </div>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
      <button className="add-paying-guest-btn" onClick={openAddPayingGuestModal}>Add Paying Guest</button>

      <Modal
        isOpen={payingGuestModalIsOpen}
        onRequestClose={closeAddPayingGuestModal}
        contentLabel="Add Paying Guest Modal"
      >
        <AddPayingGuestModal
          isOpen={payingGuestModalIsOpen}
          onRequestClose={closeAddPayingGuestModal}
          selectedPGId={pgId}
          pgData={pgData}
          onSnackbarOpen={handleSnackbarOpen} // Pass callback to handle snackbar
        />
      </Modal>

      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Dashboard;
