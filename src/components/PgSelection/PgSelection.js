import React, { useState, useEffect, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { auth, db } from '../shared/firebase';
import { getCurrentUserID } from '../shared/getCurrentUserID';
import './pgSelection.css';
import LoadingSpinner from '../shared/LoadingSpinner';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { usePgContext } from '../../context/PgContext';

const PgSelection = () => {
  const { pgData, setPgData, loading, setLoading, setError } = usePgContext();
  const [selectedPG, setSelectedPG] = useState(null);
  const history = useHistory();
  const location = useLocation();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const fetchPGs = useCallback(async () => {
    // Check if data already exists to avoid unnecessary fetch
    if (pgData && pgData.length > 0) return;
  
    try {
      setLoading(true); // Set loading state before fetching
  
      const userID = getCurrentUserID();
      if (!userID) throw new Error('User ID not found.');
  
      const snapshot = await db.collection(`users/${userID}/PGs`).get();
      const pgsData = snapshot.docs.map(doc => {
        const pgDoc = doc.data();
        const pgId = doc.id;
        const pgDetails = pgDoc.PGDetails || {};
  
        return {
          id: pgId,
          name: pgDetails.name || 'Unnamed PG',
          number: pgDetails.number || '',
          maxCustomers: pgDetails.maxCustomers || '',
          ownerName: pgDetails.ownerName || '',
          ownerEmail: pgDetails.ownerEmail || '',
          address: pgDetails.address || '',
          mobile: pgDetails.mobile || ''
        };
      });
  
      // Sort data by PG number if necessary
      const sortedPgs = pgsData.sort((a, b) => a.number.localeCompare(b.number));
  
      setPgData(sortedPgs); // Update state with fetched data
      console.log('PG data fetched:', sortedPgs);
    } catch (error) {
      console.error('Error fetching PGs:', error.message);
      setError(error.message); // Handle errors
    } finally {
      setLoading(false); // Reset loading state
    }
  }, [pgData, setLoading, setError, setPgData]); // Ensure dependencies are correct

  useEffect(() => {
    if (!pgData || pgData.length === 0) {
      fetchPGs();
    } else {
      console.log('PG data already exists:', pgData);
    }
  }, [pgData, fetchPGs]);

  useEffect(() => {
    if (loading && selectedPG) {
      console.log('Loading and selectedPG:', selectedPG);
      const timer = setTimeout(() => {
        history.push({
          pathname: `/dashboard/${selectedPG.id}`,
          state: { pgDetails: selectedPG }
        });
        setLoading(false);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Clean up timer
    }
  }, [loading, selectedPG, history, setLoading]);

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

  const handlePGClick = (pg) => {
    console.log('PG clicked:', pg);
    setSelectedPG(pg);
    setLoading(true); // Show loading spinner after selecting PG
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      history.push({
        pathname: '/login',
        state: { showSnackbar: true, message: 'Logout successful', severity: 'success' }
      }); // Redirect to login page after logout
      console.log('Logout successful');
    } catch (error) {
      console.error('Error logging out:', error.message);
      setSnackbarMessage('Error logging out');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
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
      <h1 className="dashboard-nav-heading">PG Selection Dashboard</h1>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
      <div className="pg-container">
        {pgData.map(pg => (
          <div key={pg.id} className="pg-card" onClick={() => handlePGClick(pg)}>
            <h2 className="pg-name">{pg.name}</h2>
            <p><strong>PG Number:</strong> {pg.number}</p>
            <p><strong>Max Customers:</strong> {pg.maxCustomers-1}</p>
            <p><strong>Owner Name:</strong> {pg.ownerName}</p>
            <p><strong>Owner Email:</strong> {pg.ownerEmail}</p>
            <p><strong>Address:</strong> {pg.address}</p>
            <p><strong>Mobile:</strong> {pg.mobile}</p>
          </div>
        ))}
      </div>
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

export default PgSelection;
