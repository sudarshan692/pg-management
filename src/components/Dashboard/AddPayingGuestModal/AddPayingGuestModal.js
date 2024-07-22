import React, { useState, useEffect } from "react";
import { db, auth } from "../../shared/firebase";
import Modal from "react-modal";
import "./addPayingGuestModal.css";
import LoadingSpinner from '../../shared/LoadingSpinner';

const AddPayingGuestModal = ({ isOpen, onRequestClose, selectedPGId, pgData, onSnackbarOpen, onDataSaved }) => {
  const [guestData, setGuestData] = useState({
    guestName: "",
    guestMobileNo: "",
    fatherName: "",
    fatherMobileNo: "",
    permanentAddress: "",
    presentStatus: "", // Employee/Student
    dateOfAdmission: "",
    floorNo: "",
    roomNo: "",
    roomType: "", // Single, Double, Triple
    depositAmount: "",
    monthlyRent: "",
    maintenanceCharges: "",
    depositPaid: false, // New field for deposit paid status
    fullDeposit: false, // New field for full deposit
    rentPaid: false // New field for rent paid status
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Any initialization when modal opens
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGuestData({ ...guestData, [name]: type === 'checkbox' ? checked : value });
  };

  const generateGuestID = async () => {
    const counterDocRef = db.collection(`users/${auth.currentUser.uid}/PGs/${selectedPGId}/Counters`).doc('guestIDCounter');
    
    try {
      const newID = await db.runTransaction(async (transaction) => {
        const counterDoc = await transaction.get(counterDocRef);
        
        let currentID = 1; // Default value if no counter exists
        if (counterDoc.exists) {
          currentID = counterDoc.data().currentID || 1;
        }
  
        const nextID = currentID + 1;
        transaction.set(counterDocRef, { currentID: nextID });
  
        return currentID; // Return the currentID before incrementing
      });
      
      return newID;
    } catch (error) {
      console.error("Error generating guest ID:", error);
      throw error; // Propagate error
    }
  };
  
  

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const roomTypeMap = {
      "Single": "S",
      "Double": "D",
      "Triple": "T"
    };

    const guestID = await generateGuestID();

    if (guestID === undefined || guestID === null) {
      throw new Error("Failed to generate a valid guestID.");
    }

    const payingGuestMap = {
      guestID, // Ensure this value is not undefined
      guestName: guestData.guestName,
      guestMobileNo: guestData.guestMobileNo,
      fatherName: guestData.fatherName,
      fatherMobileNo: guestData.fatherMobileNo,
      permanentAddress: guestData.permanentAddress,
      presentStatus: guestData.presentStatus,
      dateOfAdmission: guestData.dateOfAdmission,
      floorNo: guestData.floorNo,
      roomNo: guestData.roomNo,
      roomType: roomTypeMap[guestData.roomType],
      depositAmount: guestData.depositAmount,
      monthlyRent: guestData.monthlyRent,
      maintenanceCharges: guestData.maintenanceCharges,
      depositPaid: guestData.depositPaid, // Save deposit paid status
      fullDeposit: guestData.fullDeposit, // Save full deposit status
      rentPaid: guestData.rentPaid // Save rent paid status
    };

    await db.collection(`users/${auth.currentUser.uid}/PGs/${selectedPGId}/PayingGuestData`).add({ payingGuestMap });
    onSnackbarOpen("Paying guest added successfully!", "success");
    onDataSaved(); // Notify Dashboard component that data was saved
    onRequestClose();
  } catch (error) {
    console.error("Error saving paying guest data:", error.message);
    onSnackbarOpen("Error saving paying guest data.", "error");
  } finally {
    setLoading(false);
  }
};

const handleClose = () => {
  onRequestClose();
};
  

  return (
    <>
      <Modal
        isOpen={isOpen}
        onRequestClose={handleClose}
        contentLabel="Add Paying Guest Modal"
        style={{
          content: {
            border: 'none',
            maxWidth: '900px',
            width: '90%',
            maxHeight: '75vh',
            height: 'auto',
            margin: 'auto',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            backgroundColor: '#0d2136',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }
        }}
      >
        <div className="modal-content">
          {loading && (
            <div className="overlay">
              <LoadingSpinner />
            </div>
          )}
          <div className="heading-container">
            <h2 className="add-guest-heading">Add Paying Guest</h2>
          </div>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-column">
              <input type="text" name="guestName" placeholder="Guest Name" value={guestData.guestName} onChange={handleChange} required />
              <input type="text" name="guestMobileNo" placeholder="Guest Mobile No" value={guestData.guestMobileNo} onChange={handleChange} required />
              <input type="text" name="fatherName" placeholder="Father Name" value={guestData.fatherName} onChange={handleChange} required />
              <input type="text" name="fatherMobileNo" placeholder="Father Mobile No" value={guestData.fatherMobileNo} onChange={handleChange} required />
              <input type="text" name="permanentAddress" placeholder="Permanent Address" value={guestData.permanentAddress} onChange={handleChange} required />
              <input type="text" name="presentStatus" placeholder="Present Status (Employee/Student)" value={guestData.presentStatus} onChange={handleChange} required />
              <label className="checkbox-label">
                <input type="checkbox" name="depositPaid" checked={guestData.depositPaid} onChange={handleChange} />
                Deposit Paid
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="fullDeposit" checked={guestData.fullDeposit} onChange={handleChange} />
                Full Deposit
              </label>
              <label className="checkbox-label">
                <input type="checkbox" name="rentPaid" checked={guestData.rentPaid} onChange={handleChange} />
                Rent Paid
              </label>
            </div>
            <div className="form-column">
              <input className="date" type="date" name="dateOfAdmission" value={guestData.dateOfAdmission} onChange={handleChange} required />
              <input type="text" name="floorNo" placeholder="Floor No" value={guestData.floorNo} onChange={handleChange} required />
              <input type="text" name="roomNo" placeholder="Room No" value={guestData.roomNo} onChange={handleChange} required />
              <select name="roomType" value={guestData.roomType} onChange={handleChange} required>
                <option value="" disabled>Select Room Type</option>
                <option value="Single">Single (S)</option>
                <option value="Double">Double (D)</option>
                <option value="Triple">Triple (T)</option>
              </select>
              <input type="number" name="depositAmount" placeholder="Deposit Amount" value={guestData.depositAmount} onChange={handleChange} required />
              <input type="number" name="monthlyRent" placeholder="Monthly Rent" value={guestData.monthlyRent} onChange={handleChange} required />
              <input type="number" name="maintenanceCharges" placeholder="Maintenance Charges" value={guestData.maintenanceCharges} onChange={handleChange} required />
            </div>
            <div className="form-buttons">
              <button type="submit" disabled={loading}>Save</button>
              <button type="button" onClick={handleClose} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default AddPayingGuestModal;
