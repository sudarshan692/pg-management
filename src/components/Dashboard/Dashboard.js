import React, { useEffect, useState } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { auth, db } from "../shared/firebase";
import Modal from "react-modal";
import AddPayingGuestModal from "./AddPayingGuestModal/AddPayingGuestModal";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import "./dashboard.css";
import PayingGuestTable from "./PayingGuestTable/PayingGuestTable";
import ChangePasswordDialog from "./ChangePassword/ChangePasswordDialog";
import AddPaymentDialog from "./AddPaymentDialog/AddPaymentDialog";

Modal.setAppElement('#root');

const fetchPayingGuests = async (pgId, setPayingGuests) => {
  try {
    console.log("Fetching paying guests for PG ID:", pgId);
    const data = [];
    
    // Fetch the paying guests collection
    const pgSnapshot = await db.collection(`users/${auth.currentUser.uid}/PGs/${pgId}/PayingGuestData`).get();
    
    // Iterate through each document in the collection
    pgSnapshot.forEach(doc => {
      const docData = doc.data();
      
      // Assuming each document has a `payingGuestMap` field and a `paymentDetails` map
      data.push({
        id: doc.id,
        ...docData.payingGuestMap, // Spread payingGuestMap
        paymentDetails: docData.paymentDetails // Add paymentDetails map
      });
    });
    
    setPayingGuests(data);
    console.log("Paying guests fetched successfully:", data);
  } catch (error) {
    console.error("Error fetching paying guests:", error);
  }
};


const Dashboard = () => {
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  const [payingGuestModalIsOpen, setPayingGuestModalIsOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [payingGuests, setPayingGuests] = useState([]);
  const [dataSaved, setDataSaved] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false); // Add state for payment dialog

  const location = useLocation();
  const history = useHistory();
  const { pgId } = useParams();
  const [pgData] = useState(location.state?.pgDetails || {});

  useEffect(() => {
    // console.log("Dashboard mounted or PG ID changed:", pgId);
    fetchPayingGuests(pgId, setPayingGuests);
  }, [pgId]);

  const openAddPayingGuestModal = () => {
    setPayingGuestModalIsOpen(true);
    setDataSaved(false);
  };

  const closeAddPayingGuestModal = () => {
    setPayingGuestModalIsOpen(false);
    if (dataSaved) {
      console.log("Data updated, no need to refetch");
      setDataSaved(false);
    }
  };

  const openChangePasswordDialog = () => {
    setChangePasswordDialogOpen(true);
  };

  const closeChangePasswordDialog = () => {
    setChangePasswordDialogOpen(false);
  };

  const openAddPaymentDialog = (guest) => {
    setSelectedGuest(guest);
    setPaymentDialogOpen(true);
  };

  const closeAddPaymentDialog = () => {
    setPaymentDialogOpen(false);
    setSelectedGuest(null);
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

  const handleDataUpdate = (newGuest) => {
    setPayingGuests(prevGuests => [newGuest, ...prevGuests]); // Add the new guest to the local state
    setDataSaved(true); // Set flag to true when data is saved
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-nav-heading">
        <span className="pg-number">{pgData.number}</span>
        <span className="heading-text">{pgData.name} PG Management Center</span>
      </div>
      <button className="change-password-link" onClick={openChangePasswordDialog}>Change Password</button>
      <ChangePasswordDialog
        open={changePasswordDialogOpen}
        onClose={closeChangePasswordDialog}
      />
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
      <button className="add-paying-guest-btn" onClick={openAddPayingGuestModal}>Add Paying Guest</button>
      <PayingGuestTable payingGuests={payingGuests} onAddPayment={openAddPaymentDialog}/>
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

      <Modal
        isOpen={paymentDialogOpen}
        onRequestClose={closeAddPaymentDialog}
        contentLabel="Add Payment Modal"
      >
      <AddPaymentDialog
         isOpen={paymentDialogOpen}
         onRequestClose={closeAddPaymentDialog}
         selectedGuest={selectedGuest}
         selectedPGId={pgId}
         onSnackbarOpen={handleSnackbarOpen}
      />
      </Modal>

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
