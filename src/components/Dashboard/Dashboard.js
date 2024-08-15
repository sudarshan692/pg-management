import React, { useEffect, useState, useCallback, useRef } from "react";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { auth, db } from "../shared/firebase";
import Modal from "react-modal";
import AddPayingGuestModal from "./AddPayingGuestModal/AddPayingGuestModal";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import "./dashboard.css";
import PayingGuestTable from "./PayingGuestTable/PayingGuestTable";
import ChangePasswordDialog from "./ChangePassword/ChangePasswordDialog";
import AddPaymentDialog from "./AddPaymentDialog/AddPaymentDialog";
import LoadingSpinner from "../shared/LoadingSpinner"; // Ensure you have a loading spinner component
import PgDetailsDialog from "../Dashboard/PgDetailsDialog/PgDetailsDialog";
import RoomMatrixDialog from "../Dashboard/RoomMatrixDialog/RoomMatrixDialog";
import PaymentStatusDialog from "./PaymentStatusDialog/PaymentStatusDialog";

Modal.setAppElement("#root");

const Dashboard = () => {
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] =
    useState(false);
  const [payingGuestModalIsOpen, setPayingGuestModalIsOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [payingGuests, setPayingGuests] = useState([]);
  const [dataSaved, setDataSaved] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPgDetailsDialogOpen, setIsPgDetailsDialogOpen] = useState(false);
  const [isRoomMatrixDialogOpen, setIsRoomMatrixDialogOpen] = useState(false);
  const [guestStatuses, setGuestStatuses] = useState({});
  const [isPaymentStatusDialogOpen, setIsPaymentStatusDialogOpen] = useState(false);

  const location = useLocation();
  const history = useHistory();
  const { pgId } = useParams();
  const [pgData] = useState(location.state?.pgDetails || {});
  const previousPgIdRef = useRef(null);

  // Use pgDetails from location state
  const pgDetails = location.state?.pgDetails || {};
  // const pgData1 = location.state?.pgData || {};

  const toggleRoomMatrixDialog = () => {
    setIsRoomMatrixDialogOpen((prevState) => !prevState);
  };

  const fetchPayingGuests = useCallback(async (pgId) => {
    try {
      const data = [];
      const pgSnapshot = await db
        .collection(`users/${auth.currentUser.uid}/PGs/${pgId}/PayingGuestData`)
        .get();
      pgSnapshot.forEach((doc) => {
        const docData = doc.data();
        data.push({
          id: doc.id,
          ...docData.payingGuestMap,
          paymentDetails: docData.paymentDetails,
        });
      });
      // Update the guestStatuses state with the initial status of all guests
      setGuestStatuses((prevStatuses) => {
        return {
          ...prevStatuses,
          ...data.reduce(
            (acc, guest) => ({ ...acc, [guest.guestID]: guest.currentStatus }),
            {}
          ),
        };
      });
      setPayingGuests(data);
      console.log("Paying guests fetched successfully:");
    } catch (error) {
      console.error("Error fetching paying guests:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (pgId) {
      const currentPgId =
        typeof pgId === "object" ? pgId.id || pgId.value : pgId;
      console.log("Current pgId:", currentPgId);
      console.log("Previous pgId:", previousPgIdRef.current);
      if (currentPgId !== previousPgIdRef.current) {
        fetchPayingGuests(currentPgId);
        previousPgIdRef.current = currentPgId; // Update the ref to the new pgId
      }
    }
  }, [pgId, fetchPayingGuests]);

  const handleToggleStatus = (guestID, newStatus) => {
    setGuestStatuses((prevStatuses) => ({
      ...prevStatuses,
      [guestID]: newStatus,
    }));
    const guestIndex = payingGuests.findIndex(
      (guest) => guest.guestID === guestID
    );
    if (guestIndex !== -1) {
      const guestDocId = payingGuests[guestIndex].id;
      const guestDocRef = db.collection(`users/${auth.currentUser.uid}/PGs/${pgId}/PayingGuestData`).doc(guestDocId);
  
      guestDocRef.update({
        "payingGuestMap.currentStatus": newStatus,
      })
      .then(() => {
        console.log("Status updated successfully");
        setPayingGuests((prevGuests) => {
          return prevGuests.map((guest, index) => {
            if (index === guestIndex) {
              return {
                ...guest,
                payingGuestMap: {
                  ...guest.payingGuestMap,
                  currentStatus: newStatus,
                },
              };
            }
            return guest;
          });
        });
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
    } else {
      console.error(`Guest with ID ${guestID} not found in payingGuests array.`);
    }
  };

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

  const handleCloseDialog = () => {
    setSelectedGuest(null); 
    setIsPaymentStatusDialogOpen(false);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await auth.signOut();
      history.push("/login");
      console.log("Logout successful");
    } catch (error) {
      console.error("Error logging out:", error.message);
    } finally {
      setLoading(false);
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
    setPayingGuests((prevGuests) => [newGuest, ...prevGuests]);
    setDataSaved(true);
    setGuestStatuses((prevStatuses) => ({
      ...prevStatuses,
      [newGuest.guestID]: "Active",
    }));
  };

  const handlePaymentUpdate = (updatedGuest) => {
    setPayingGuests((prevGuests) => {
      return prevGuests.map((guest) =>
        guest.id === updatedGuest.id ? updatedGuest : guest
      );
    });
  };

  const handleAddPgDetailsClick = () => {
    setIsPgDetailsDialogOpen(true);
  };

  const handlePgDetailsDialogClose = () => {
    setIsPgDetailsDialogOpen(false);
  };

  const handleSavePgDetails = async (newDetails) => {
    try {
      if (pgId) {
        const pgRef = db
          .collection(`users/${auth.currentUser.uid}/PGs`)
          .doc(pgId);
        // Fetch the existing document
        const docSnapshot = await pgRef.get();
        if (!docSnapshot.exists) {
          console.error("PG document does not exist.");
          return;
        }
        const existingDetails = docSnapshot.data().PGDetails || {};
        // Merge existing details with new details
        const mergedDetails = { ...existingDetails, ...newDetails };
        // Update the document with merged details
        await pgRef.update({
          PGDetails: mergedDetails,
        });
        console.log("PG Details updated with ID:", pgId);
      } else {
        console.error("PG ID is not available.");
      }
    } catch (error) {
      console.error("Error saving PG Details:", error);
    }
    handlePgDetailsDialogClose();
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-nav-heading">
        <span className="pg-number-dashboard">{pgData.number}</span>
        <span className="heading-text">{pgData.name} Management Center</span>
      </div>
      <button className="add-pg-details-link" onClick={handleAddPgDetailsClick}>Add PG Details</button>
      <button className="change-password-link" onClick={openChangePasswordDialog}>Change Password</button>
      <button className="matrix" onClick={toggleRoomMatrixDialog}>Available Beds</button>
      <RoomMatrixDialog open={isRoomMatrixDialogOpen} onClose={toggleRoomMatrixDialog} pgDetails={pgDetails} payingGuests={payingGuests}/>
      <ChangePasswordDialog handleLogout={handleLogout} open={changePasswordDialogOpen} onClose={closeChangePasswordDialog}/>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
      {loading && (<div className="overlay"> <LoadingSpinner /> </div>)}
      <PayingGuestTable payingGuests={payingGuests} onAddPayment={openAddPaymentDialog} onPaymentUpdate={handlePaymentUpdate} guestStatuses={guestStatuses} selectedPGId={pgId} onSnackbarOpen={handleSnackbarOpen} onToggleStatus={handleToggleStatus}/>
      {isPaymentStatusDialogOpen && selectedGuest && (
        <PaymentStatusDialog guest={selectedGuest} onClose={handleCloseDialog} onToggleStatus={handleToggleStatus} guestStatuses={guestStatuses} setGuestData={setPayingGuests} selectedPGId={pgId}/>
      )}
      <div className="add-paying-guest-container">
        <button className="add-paying-guest-btn" onClick={openAddPayingGuestModal}>Add Paying Guest</button>
      </div>
      <Modal isOpen={payingGuestModalIsOpen} onRequestClose={closeAddPayingGuestModal} contentLabel="Add Paying Guest Modal">
        <AddPayingGuestModal isOpen={payingGuestModalIsOpen} onRequestClose={closeAddPayingGuestModal} selectedPGId={pgId} pgData={pgData} onSnackbarOpen={handleSnackbarOpen} onDataSaved={handleDataUpdate}/>
      </Modal>
      <Modal isOpen={paymentDialogOpen} onRequestClose={closeAddPaymentDialog} contentLabel="Add Payment Modal">
        <AddPaymentDialog isOpen={paymentDialogOpen} onRequestClose={closeAddPaymentDialog} selectedGuest={selectedGuest} selectedPGId={pgId} onSnackbarOpen={handleSnackbarOpen} onPaymentUpdate={handlePaymentUpdate}/>
      </Modal>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {isPgDetailsDialogOpen && (
        <PgDetailsDialog
          onClose={handlePgDetailsDialogClose}
          onSave={handleSavePgDetails}
        />
      )}
    </div>
  );
};

export default Dashboard;
