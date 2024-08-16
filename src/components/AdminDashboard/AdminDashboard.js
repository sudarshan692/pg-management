import React, { useState, useEffect } from 'react';
import { auth, db } from "../shared/firebase";
import { useHistory, useLocation } from "react-router-dom";
import "./adminDashboard.css";
import PgTable from './PgTable/PgTable';
import LoadingSpinner from '../shared/LoadingSpinner';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const AdminDashboard = () => {
  const history = useHistory();
  const location = useLocation();
  const [userId, setUserId] = useState("");
  const [pgNumber, setPgNumber] = useState("");
  const [pgMaxCustomers, setpgMaxCustomers] = useState("");
  const [pgOwnerName, setPgOwnerName] = useState("");
  const [pgOwnerEmail, setPgOwnerEmail] = useState("");
  const [pgName, setPgName] = useState("");
  const [pgAddress, setPgAddress] = useState("");
  const [pgMobile, setPgMobile] = useState("");
  const [pgTotalFloors, setPgTotalFloors] = useState("");
  const [pgTotalRoomsPerFloor, setPgTotalRoomsPerFloor] = useState("");
  const [pgSingleBedsPerRoom, setPgSingleBedsPerRoom] = useState("");
  const [pgDoubleSharingBedsPerRoom, setPgDoubleSharingBedsPerRoom] = useState("");
  const [pgTripleSharingBedsPerRoom, setPgTripleSharingBedsPerRoom] = useState("");
  const [pgMobileError, setPgMobileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pgData, setPgData] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const updatePgData = ({ id, action, newData, updatedData }) => {
    if (action === 'delete') {
      setPgData(pgData.filter(pg => pg.id !== id));
    } else if (action === 'update') {
      setPgData(pgData.map(pg => (pg.id === id ? { ...pg, ...updatedData } : pg)));
    } else if (action === 'add') {
      console.log('Adding new PG data:', newData);
      setPgData([...pgData, { id, ...newData }]);
    }
  };

  const fetchPgData = async () => {
    try {
      setLoading(true);
      const snapshot = await db.collectionGroup('PGs').get();
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        userId: doc.ref.parent.parent.id,
        ...doc.data().PGDetails
      }));
      setPgData(data);
    } catch (error) {
      console.error("Error fetching PG data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPgData();
  }, []);

  useEffect(() => {
    if (location.state && location.state.showSnackbar) {
      setSnackbarMessage(location.state.message);
      setSnackbarSeverity(location.state.severity);
      setSnackbarOpen(true);
      history.replace({
        pathname: location.pathname,
        state: {}
      });
    }
  }, [location, history]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      history.push({
        pathname: "/login",
        state: { showSnackbar: true, message: "Logout successful", severity: "success" }
      });
      console.log("Logout successful");
    } catch (error) {
      console.error("Error logging out:", error.message);
      setSnackbarMessage("Error logging out");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleMobileChange = (e) => {
    const value = e.target.value;
    if (value.length > 10) {
      setPgMobileError("Mobile number cannot exceed 10 digits");
    } else {
      setPgMobile(value);
      setPgMobileError("");
    }
  };


  const addPG = async () => {
    try {
      setLoading(true);
      const pgRef = await db.collection(`users/${userId}/PGs`).add({
        PGDetails: {
          number: pgNumber,
          maxCustomers: pgMaxCustomers,
          ownerName: pgOwnerName,
          ownerEmail: pgOwnerEmail,
          name: pgName,
          address: pgAddress,
          mobile: pgMobile,
          totalFloors: Number(pgTotalFloors),
          totalRoomsPerFloor: Number(pgTotalRoomsPerFloor),
          singleBedsPerRoom: Number(pgSingleBedsPerRoom),
          doubleSharingBedsPerRoom: Number(pgDoubleSharingBedsPerRoom),
          tripleSharingBedsPerRoom: Number(pgTripleSharingBedsPerRoom),
        }
      });

      updatePgData({
        id: pgRef.id,
        action: 'add',
        newData: {
          userId,
          number: pgNumber,
          maxCustomers: pgMaxCustomers,
          ownerName: pgOwnerName,
          ownerEmail: pgOwnerEmail,
          name: pgName,
          address: pgAddress,
          mobile: pgMobile,
          totalFloors: Number(pgTotalFloors),
          totalRoomsPerFloor: Number(pgTotalRoomsPerFloor),
          singleBedsPerRoom: Number(pgSingleBedsPerRoom),
          doubleSharingBedsPerRoom: Number(pgDoubleSharingBedsPerRoom),
          tripleSharingBedsPerRoom: Number(pgTripleSharingBedsPerRoom),
        }
      });

      setUserId("");
      setPgNumber("");
      setpgMaxCustomers("");
      setPgOwnerName("");
      setPgOwnerEmail("");
      setPgName("");
      setPgAddress("");
      setPgMobile("");
      setPgTotalFloors("");
      setPgTotalRoomsPerFloor("");
      setPgSingleBedsPerRoom("");
      setPgDoubleSharingBedsPerRoom("");
      setPgTripleSharingBedsPerRoom("");
      setSnackbarMessage("PG added successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error adding PG:", error.message);
      setSnackbarMessage("Error adding PG");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      setLoading(true);

      // Check if email exists in Firebase Authentication
      const existingAuthUser = await auth.fetchSignInMethodsForEmail(newUserEmail);
      if (existingAuthUser.length > 0) {
        setSnackbarMessage("Email already exists in Firebase Authentication");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      // Check if email exists in Firestore
      const userDoc = await db.collection('users').where('email', '==', newUserEmail).get();
      if (!userDoc.empty) {
        setSnackbarMessage("Email already exists in Firestore");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        return;
      }

      // Create new user in Firebase Authentication
      await auth.createUserWithEmailAndPassword(newUserEmail, newUserPassword);
      const newUserId = auth.currentUser.uid;

      // Add user data to Firestore
      await db.collection('users').doc(newUserId).set({
        email: newUserEmail,
      });

      console.log("User created successfully");
      setNewUserEmail("");
      setNewUserPassword("");
      setSnackbarMessage("User created successfully");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      history.push('/admin-dashboard'); // Ensure admin remains on AdminDashboard
    } catch (error) {
      console.error("Error creating user:", error.message);
      if (error.code === "auth/email-already-in-use") {
        setSnackbarMessage("Email already exists");
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage("Error creating user");
        setSnackbarSeverity("error");
      }
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
      {loading && (
        <div className="overlay">
          <LoadingSpinner />
        </div>
      )}
      <h1 className="admin-nav-heading">Admin Dashboard</h1>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>

      <form onSubmit={(e) => {
        e.preventDefault();
        addPG();
      }}>
        <h2 className='heading'>Add New PG</h2>
        <input
          className='inputbox5'
          type="text"
          placeholder="User Document ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <input
          className='inputbox5'
          type="text"
          placeholder="PG Number"
          value={pgNumber}
          onChange={(e) => setPgNumber(e.target.value)}
          required
        />
        <input
          className='inputbox5'
          type="number"
          placeholder="Max Customers/PG"
          value={pgMaxCustomers}
          onChange={(e) => setpgMaxCustomers(e.target.value)}
          required
        />
        <input
          className='inputbox5'
          type="text"
          placeholder="PG Owner Name"
          value={pgOwnerName}
          onChange={(e) => setPgOwnerName(e.target.value)}
          required
        />
        <input
          className='inputbox5'
          type="email"
          placeholder="Owner Email ID"
          value={pgOwnerEmail}
          onChange={(e) => setPgOwnerEmail(e.target.value)}
          required
        />
        <input
          className='inputbox5'
          type="text"
          placeholder="PG Mobile Number"
          maxLength={10}
          value={pgMobile}
          onChange={handleMobileChange}
          required
        />
        {pgMobileError && <div className="error-message">{pgMobileError}</div>}
        <input
          className='inputbox5'
          type="text"
          placeholder="PG Name"
          value={pgName}
          onChange={(e) => setPgName(e.target.value)}
          required
        />
        <input
          className='inputbox5'
          type="text"
          placeholder="PG Address"
          value={pgAddress}
          onChange={(e) => setPgAddress(e.target.value)}
          required
        />
        <input
          className='inputbox5'
          type="number"
          placeholder="Total Floors"
          value={pgTotalFloors}
          onChange={(e) => setPgTotalFloors(e.target.value)}
          required
        />
        <input
          className='inputbox5'
          type="number"
          placeholder="Total Rooms Per Floor"
          value={pgTotalRoomsPerFloor}
          onChange={(e) => setPgTotalRoomsPerFloor(e.target.value)}
          required
        />
        <input
          className='inputbox5'
          type="number"
          placeholder="Single Beds Per Room"
          value={pgSingleBedsPerRoom}
          onChange={(e) => setPgSingleBedsPerRoom(e.target.value)}
          required
        />
        <input
          className='inputbox5'
          type="number"
          placeholder="Double Sharing Beds Per Room"
          value={pgDoubleSharingBedsPerRoom}
          onChange={(e) => setPgDoubleSharingBedsPerRoom(e.target.value)}
          required
        />
        <input
          className='inputbox5'
          type="number"
          placeholder="Triple Sharing Beds Per Room"
          value={pgTripleSharingBedsPerRoom}
          onChange={(e) => setPgTripleSharingBedsPerRoom(e.target.value)}
          required
        />
        <button className='add-pg' type="submit" disabled={loading}>Add PG</button>
      </form>

      <form onSubmit={(e) => {
        e.preventDefault();
        createUser();
      }}>
        <h2 className='heading'>Create New User</h2>
        <input
          className='inputbox5'
          type="email"
          placeholder="Enter New User Email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          required
        />
        <input
          className='inputbox5'
          type="password"
          placeholder="Enter New User Password"
          value={newUserPassword}
          onChange={(e) => setNewUserPassword(e.target.value)}
          required
        />
        <button className='add-pg' type="submit" disabled={loading}>Create User</button>
      </form>

      <PgTable pgData={pgData} updatePgData={updatePgData} />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminDashboard;
