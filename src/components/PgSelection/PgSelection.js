import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { auth, db } from '../shared/firebase';
import { getCurrentUserID } from '../shared/getCurrentUserID';
import './pgSelection.css';
import LoadingSpinner from '../shared/LoadingSpinner';

const PgSelection = () => {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPG, setSelectedPG] = useState(null);
  const history = useHistory();

  useEffect(() => {
    fetchPGs();
  }, []);

  useEffect(() => {
    if (loading && selectedPG) {
      const timer = setTimeout(() => {
        history.push({
          pathname: `/dashboard/${selectedPG.id}`,
          state: { pgDetails: selectedPG }
        });
        setLoading(false);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Clean up timer
    }
  }, [loading, selectedPG, history]);

  const fetchPGs = async () => {
    try {
      const userID = getCurrentUserID();
      if (!userID) {
        throw new Error('User ID not found.');
      }

      const snapshot = await db.collection(`users/${userID}/PGs`).get();
      const pgsData = [];

      snapshot.docs.forEach(doc => {
        const pgDoc = doc.data();
        const pgId = doc.id;

        const pgDetails = pgDoc.PGDetails || {};

        pgsData.push({
          id: pgId,
          name: pgDetails.name || 'Unnamed PG',
          number: pgDetails.number || '',
          ownerName: pgDetails.ownerName || '',
          ownerEmail: pgDetails.ownerEmail || '',
          address: pgDetails.address || '',
          mobile: pgDetails.mobile || ''
        });
      });

      // Sort PGs by number field
      const sortedPgs = pgsData.sort((a, b) => a.number.localeCompare(b.number));

      setPgs(sortedPgs);
      setLoading(false); // Data fetched, hide loading spinner
    } catch (error) {
      console.error('Error fetching PGs:', error.message);
    }
  };

  const handlePGClick = (pg) => {
    setSelectedPG(pg);
    setLoading(true); // Show loading spinner after selecting PG
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      history.push('/login'); // Redirect to login page after logout
      console.log('Logout successful');
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
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
        {pgs.map(pg => (
          <div key={pg.id} className="pg-card" onClick={() => handlePGClick(pg)}>
            <h2 className="pg-name">{pg.name}</h2>
            <p><strong>PG Number:</strong> {pg.number}</p>
            <p><strong>Owner Name:</strong> {pg.ownerName}</p>
            <p><strong>Owner Email:</strong> {pg.ownerEmail}</p>
            <p><strong>Address:</strong> {pg.address}</p>
            <p><strong>Mobile:</strong> {pg.mobile}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PgSelection;
