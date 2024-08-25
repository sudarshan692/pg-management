import React, { useState, useEffect, useCallback } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { auth, db } from "../shared/firebase";
import { getCurrentUserID } from "../shared/getCurrentUserID";
import "./pgSelection.css";
import LoadingSpinner from "../shared/LoadingSpinner";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { usePgContext } from "../../context/PgContext";
import { v4 as uuidv4 } from "uuid";
import logo from "../../assets/logo2.png"

const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const PgSelection = () => {
  const { pgData, setPgData, loading, setLoading, setError } = usePgContext();
  const [selectedPG, setSelectedPG] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const fetchPGs = useCallback(async () => {
    if (pgData && pgData.length > 0) return;
    try {
      setLoading(true);
      const userID = getCurrentUserID();
      if (!userID) throw new Error("User ID not found.");
      const snapshot = await db.collection(`users/${userID}/PGs`).get();
      const pgsData = snapshot.docs.map((doc) => {
        const pgDoc = doc.data();
        const pgId = doc.id;
        const pgDetails = pgDoc.PGDetails || {};
        return {
          id: pgId,
          name: pgDetails.name || "Unnamed PG",
          number: pgDetails.number || "",
          maxCustomers: pgDetails.maxCustomers || "",
          ownerName: pgDetails.ownerName || "",
          ownerEmail: pgDetails.ownerEmail || "",
          address: pgDetails.address || "",
          mobile: pgDetails.mobile || "",
          totalFloors: pgDetails.totalFloors || "",
          totalRoomsPerFloor: pgDetails.totalRoomsPerFloor || "",
          singleBedsPerRoom: pgDetails.singleBedsPerRoom || "",
          doubleSharingBedsPerRoom: pgDetails.doubleSharingBedsPerRoom || "",
          tripleSharingBedsPerRoom: pgDetails.tripleSharingBedsPerRoom || "",
        };
      });
      const sortedPgs = pgsData.sort((a, b) =>
        a.number.localeCompare(b.number)
      );
      setPgData(sortedPgs);
      console.log("PG data fetched:");
    } catch (error) {
      console.error("Error fetching PGs:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [pgData, setLoading, setError, setPgData]);

  useEffect(() => {
    if (!pgData || pgData.length === 0) {
      fetchPGs();
    } else {
      console.log("PG data already exists:");
    }
  }, [pgData, fetchPGs]);

  useEffect(() => {
    if (!loading && !paymentLoading && selectedPG) {
      console.log("Navigating to dashboard");
      history.push({
        pathname: `/dashboard/${selectedPG.id}`,
        state: { pgDetails: selectedPG },
      });
      setSelectedPG(null);
    }
  }, [loading, paymentLoading, selectedPG, history]);

  useEffect(() => {
    if (location.state && location.state.showSnackbar) {
      setSnackbarMessage(location.state.message);
      setSnackbarSeverity(location.state.severity);
      setSnackbarOpen(true);
      history.replace({
        pathname: location.pathname,
        state: {},
      });
    }
  }, [location, history]);

  const addPaymentDetailsIfNotExists = async (pgId) => {
    setPaymentLoading(true); // Start payment loading

    try {
      if (!auth.currentUser) {
        throw new Error("User not authenticated.");
      }
      const userID = auth.currentUser.uid;
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const pgRef = db.collection(
        `users/${userID}/PGs/${pgId}/PayingGuestData`
      );
      const pgSnapshot = await pgRef.get();
      if (pgSnapshot.empty) {
        console.log("No PayingGuestData found.");
        return;
      }
      let paymentExists = false;
      const updatePromises = [];
      for (const doc of pgSnapshot.docs) {
        const guestData = doc.data();
        const paymentDetails = guestData.paymentDetails || [];
        paymentExists = paymentDetails.some((payment) => {
          const createdAt = payment.createdAt?.toDate();
          return (
            createdAt &&
            createdAt.getMonth() + 1 === currentMonth &&
            createdAt.getFullYear() === currentYear
          );
        });
        if (!paymentExists) {
          const paymentId = uuidv4();
          const newPaymentDetail = {
            paymentId,
            paymentDate: "",
            paymentAmount: "-",
            paymentForMonth: monthNames[currentMonth - 1],
            paymentForYear: currentYear,
            paymentStatus: "Not Paid",
            createdAt: new Date(),
            remainingAmount: 0,
          };
          const updatedPaymentDetails = [...paymentDetails, newPaymentDetail];
          console.log("Updated payment details:");
          updatePromises.push(
            doc.ref.update({
              paymentDetails: updatedPaymentDetails,
            })
          );
        } else {
          console.log("Payment details already exist for the current month.");
        }
      }

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error adding payment details:", error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePGClick = async (pg) => {
    console.log("PG clicked");
    setSelectedPG(pg);
    setLoading(true);
    try {
      await addPaymentDetailsIfNotExists(pg.id);
      setLoading(false);
    } catch (error) {
      console.error("Error in handlePGClick:", error.message);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      console.log("Logging out...");
      await auth.signOut();
      history.push({
        pathname: "/login",
        state: {
          showSnackbar: true,
          message: "Logout successful",
          severity: "success",
        },
      });
      console.log("Logout successful");
    } catch (error) {
      console.error("Error logging out:", error.message);
      setSnackbarMessage("Error logging out");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <div>
      {(loading || paymentLoading) && (
        <div className="overlay">
          <LoadingSpinner />
        </div>
      )}
  
      <h1 className="pg-selection-heading"> <img className="img2" src={logo} alt="logo" />Select Residence</h1>
      <button className="logout-btn1" onClick={handleLogout}>
        Logout
      </button>
      <div className="pg-container">
        {pgData.map((pg) => (
          <div
            key={pg.id}
            className="pg-card"
            onClick={() => handlePGClick(pg)}
          >
            <div className="pg-header">
              <h2 className="pg-name">{pg.name}</h2>
              <p className="pg-number">{pg.number}</p>
            </div>
            <div className="pg-details">
              <p className="max-customers">
                <i className="material-icons">hotel</i> {pg.maxCustomers - 1}{" "}
                Available Beds
              </p>

              <p className="owner-name">
                <i className="material-icons">person</i> {pg.ownerName}
              </p>
              <p className="pg-address">
                <i className="material-icons">location_on</i> {pg.address}
              </p>
            </div>

            <div className="pg-footer">
              <a href={`tel:${pg.mobile}`} className="pg-mobile">
                <span className="material-icons">phone</span> {pg.mobile}
              </a>
              <a href={`mailto:${pg.ownerEmail}`} className="pg-email">
                <span className="material-icons">email</span> {pg.ownerEmail}
              </a>
            </div>
          </div>
        ))}
      </div>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PgSelection;
