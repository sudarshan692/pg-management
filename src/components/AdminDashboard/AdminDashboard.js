import React, { useState } from 'react';
import { auth, db } from "../shared/firebase";
import { useHistory } from "react-router-dom";
import "./adminDashboard.css";

const AdminDashboard = () => {
  const history = useHistory();
  const [userId, setUserId] = useState("");
  const [pgNumber, setPgNumber] = useState("");
  const [pgMaxCustomers, setpgMaxCustomers] = useState("");
  const [pgOwnerName, setPgOwnerName] = useState("");
  const [pgOwnerEmail, setPgOwnerEmail] = useState("");
  const [pgName, setPgName] = useState("");
  const [pgAddress, setPgAddress] = useState("");
  const [pgMobile, setPgMobile] = useState("");
  const [loading, setLoading] = useState(false);

  // New user state
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

  const handleLogout = async () => {
    try {
      await auth.signOut();
      history.push("/login");
      console.log("Logout successful");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const addPG = async () => {
    try {
      setLoading(true);
      await db.collection(`users/${userId}/PGs`).add({
        PGDetails: {
          number: pgNumber,
          maxCustomers: pgMaxCustomers,
          ownerName: pgOwnerName,
          ownerEmail: pgOwnerEmail,
          name: pgName,
          address: pgAddress,
          mobile: pgMobile,
        }
      });
      console.log("PG added successfully");
      // Clear the form
      setUserId("");
      setPgNumber("");
      setpgMaxCustomers("");
      setPgOwnerName("");
      setPgOwnerEmail("");
      setPgName("");
      setPgAddress("");
      setPgMobile("");
    } catch (error) {
      console.error("Error adding PG:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      setLoading(true);
      // Create a new user with email and password
      const userCredential = await auth.createUserWithEmailAndPassword(newUserEmail, newUserPassword);
      const newUserId = userCredential.user.uid;
      
      // Add the new user's details to Firestore
      await db.collection('users').doc(newUserId).set({
        email: newUserEmail,
        // Add other user details if necessary
      });

      console.log("User created successfully");
      // Clear the form
      setNewUserEmail("");
      setNewUserPassword("");
    } catch (error) {
      console.error("Error creating user:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="admin-nav-heading">Admin Dashboard</h1>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        addPG();
      }}>
        <input
          type="text"
          placeholder="Enter User Document ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter PG Number"
          value={pgNumber}
          onChange={(e) => setPgNumber(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter Max Customers/PG"
          value={pgMaxCustomers}
          onChange={(e) => setpgMaxCustomers(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter PG Owner Name"
          value={pgOwnerName}
          onChange={(e) => setPgOwnerName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Enter PG Owner Email ID"
          value={pgOwnerEmail}
          onChange={(e) => setPgOwnerEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter PG Name"
          value={pgName}
          onChange={(e) => setPgName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter PG Address"
          value={pgAddress}
          onChange={(e) => setPgAddress(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter PG Mobile Number"
          value={pgMobile}
          onChange={(e) => setPgMobile(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>Add PG</button>
      </form>

      <form onSubmit={(e) => {
        e.preventDefault();
        createUser();
      }}>
        <h2>Create New User</h2>
        <input
          type="email"
          placeholder="Enter New User Email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter New User Password"
          value={newUserPassword}
          onChange={(e) => setNewUserPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>Create User</button>
      </form>

      {loading && <p>Loading...</p>}
    </div>
  );
};

export default AdminDashboard;
