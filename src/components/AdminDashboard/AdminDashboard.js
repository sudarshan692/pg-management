import React from 'react';
import { auth } from "../shared/firebase";
import { useHistory } from "react-router-dom";

const AdminDashboard = () => {
  const history = useHistory();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      history.push("/login");
      console.log("Logout successful");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <div>
      <div>AdminDashboard</div>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;
