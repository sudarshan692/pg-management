import React, { useEffect, useState } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { auth, db } from "../shared/firebase";
import Modal from "react-modal";
import AddPayingGuestModal from "./AddPayingGuestModal/AddPayingGuestModal";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import "./dashboard.css";
import PayingGuestTable from "./PayingGuestTable/PayingGuestTable";

Modal.setAppElement('#root');

const fetchPayingGuests = async (pgId, setPayingGuests) => {
  try {
    console.log("Fetching paying guests for PG ID:", pgId); // Log when fetching starts
    const data = [];
    const pgSnapshot = await db.collection(`users/${auth.currentUser.uid}/PGs/${pgId}/PayingGuestData`).get();
    pgSnapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data().payingGuestMap
      });
    });
    setPayingGuests(data);
    console.log("Paying guests fetched successfully:", data); // Log when fetching is successful
  } catch (error) {
    console.error("Error fetching paying guests:", error);
  }
};

const Dashboard = () => {
  const [payingGuestModalIsOpen, setPayingGuestModalIsOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [payingGuests, setPayingGuests] = useState([]);
  const [dataSaved, setDataSaved] = useState(false); // Track if data was saved
  const location = useLocation();
  const history = useHistory();
  const { pgId } = useParams();
  const [pgData] = useState(location.state?.pgDetails || {});

  useEffect(() => {
    console.log("Dashboard mounted or PG ID changed:", pgId); // Log when component mounts or PG ID changes
    fetchPayingGuests(pgId, setPayingGuests);
  }, [pgId]);

  const openAddPayingGuestModal = () => {
    setPayingGuestModalIsOpen(true);
    setDataSaved(false); // Reset save flag when opening the modal
  };

  const closeAddPayingGuestModal = () => {
    setPayingGuestModalIsOpen(false);
    if (dataSaved) {
      console.log("Updating data after closing modal"); // Log before fetching new data
      fetchPayingGuests(pgId, setPayingGuests); // Fetch new data after modal closes if data was saved
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

  const handleSnackbarOpen = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  const handleDataUpdate = () => {
    setDataSaved(true); // Set flag to true when data is saved
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-nav-heading">
        <span className="pg-number">{pgData.number}</span>
        <span className="heading-text">{pgData.name} PG Management Center</span>
      </div>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
      <button className="add-paying-guest-btn" onClick={openAddPayingGuestModal}>Add Paying Guest</button>
      <PayingGuestTable payingGuests={payingGuests} />
      <Modal
        isOpen={payingGuestModalIsOpen}
        onRequestClose={closeAddPayingGuestModal}
        contentLabel="Add Paying Guest Modal"
      >
      <AddPayingGuestModal
          isOpen={payingGuestModalIsOpen}
          onRequestClose={() => {
            closeAddPayingGuestModal();
          }}
          selectedPGId={pgId}
          pgData={pgData}
          onSnackbarOpen={handleSnackbarOpen}
          onDataSaved={handleDataUpdate} // Pass handleDataUpdate to the modal
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
