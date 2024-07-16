import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { auth, db } from "../shared/firebase";
import { getCurrentUserID } from "../shared/getCurrentUserID";
import "./pgSelection.css";
import LoadingSpinner from "../shared/LoadingSpinner";

const PgSelection = () => {
  const [pgs, setPgs] = useState([]);
  const history = useHistory();
  const [newPgName, setNewPgName] = useState("");
  const [loading, setLoading] = useState(true); // Initially true to show loading spinner
  const [selectedPG, setSelectedPG] = useState(null);

  useEffect(() => {
    fetchPGs();
  }, []);

  useEffect(() => {
    // Navigate to dashboard after selecting a PG and a delay of 2 seconds
    if (loading && selectedPG) {
      const timer = setTimeout(() => {
        history.push(`/dashboard/${selectedPG}`);
        setLoading(false);
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer); // Clean up timer
    }
  }, [loading, selectedPG, history]);

  const fetchPGs = async () => {
    try {
      const userID = getCurrentUserID();
      if (!userID) {
        throw new Error("User ID not found.");
      }

      const snapshot = await db.collection(`users/${userID}/PGs`).get();
      const pgsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort PGs alphabetically by name
      const sortedPgs = pgsData.sort((a, b) => a.name.localeCompare(b.name));
      setPgs(sortedPgs);
      setLoading(false); // Data fetched, hide loading spinner
    } catch (error) {
      console.error("Error fetching PGs:", error.message);
    }
  };

  const handlePGClick = (pgId) => {
    setSelectedPG(pgId);
    setLoading(true); // Show loading spinner after selecting PG
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      history.push("/login"); // Redirect to login page after logout
      console.log("Logout successful");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };



  const addPG = async () => {
    try {
      const userID = getCurrentUserID();
      if (!userID) {
        throw new Error("User ID not found.");
      }

      await db.collection(`users/${userID}/PGs`).add({
        name: newPgName
      });
      fetchPGs();
      setNewPgName("");
    } catch (error) {
      console.error("Error adding PG:", error.message);
    }
  };

  return (
    <div>
      {loading && (
        <div className="overlay">
          <LoadingSpinner />
        </div>
      )}
      <h1 className="dashboard-nav-heading">Select PG</h1>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
      <div className="pg-container">
        {pgs.map(pg => (
          <div key={pg.id} className="pg-item" onClick={() => handlePGClick(pg.id)}>
            {pg.name}
          </div>
        ))}
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        addPG();
      }}>
        <input
          type="text"
          placeholder="Enter new PG name"
          value={newPgName}
          onChange={(e) => setNewPgName(e.target.value)}
        />
        <button type="submit">Add PG</button>
      </form>
    </div>
  );
};

export default PgSelection;
