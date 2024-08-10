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
    presentStatus: "",
    dateOfAdmission: "",
    floorNo: "",
    roomNo: "",
    roomType: "",
    depositAmount: "",
    maintenanceCharges: "",
    fullDeposit: false,
    aadharNumber: "",
    currentStatus: "Active",
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
        let currentID = 1;
        if (counterDoc.exists) {
          currentID = counterDoc.data().currentID || 1;
        }
        const nextID = currentID + 1;
        transaction.set(counterDocRef, { currentID: nextID });
        return currentID;
      });
      return newID;
    } catch (error) {
      console.error("Error generating guest ID:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Fetch and log current guest count
      const guestCountSnapshot = await db.collection(`users/${auth.currentUser.uid}/PGs/${selectedPGId}/Counters`).doc('guestIDCounter').get();
      const currentGuestCount = guestCountSnapshot.exists ? guestCountSnapshot.data().currentID : 0;

      // Fetch and log max customers
      const pgSnapshot = await db.collection(`users/${auth.currentUser.uid}/PGs`).doc(selectedPGId).get();
      const pgDetails = pgSnapshot.exists ? pgSnapshot.data().PGDetails : {};
      const maxCustomers = pgDetails.maxCustomers || 0;

      console.log(`Current Guest Count: ${currentGuestCount}`);
      console.log(`Max Customers: ${maxCustomers}`);

      // Check if the currentGuestCount exceeds maxCustomers before adding the new guest
      if (currentGuestCount >= maxCustomers) {
        onSnackbarOpen("Cannot add more guests. Max customer limit reached.", "error");
        setLoading(false);
        return;
      }
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
        guestID,
        guestName: guestData.guestName,
        guestMobileNo: Number(guestData.guestMobileNo),
        fatherName: guestData.fatherName,
        fatherMobileNo: Number(guestData.fatherMobileNo),
        permanentAddress: guestData.permanentAddress,
        presentStatus: guestData.presentStatus,
        dateOfAdmission: guestData.dateOfAdmission,
        floorNo: Number(guestData.floorNo),
        roomNo: Number(guestData.roomNo),
        roomType: roomTypeMap[guestData.roomType],
        depositAmount: Number(guestData.depositAmount),
        maintenanceCharges: Number(guestData.maintenanceCharges),
        fullDeposit: guestData.fullDeposit,
        aadharNumber: Number(guestData.aadharNumber),
        currentStatus: guestData.currentStatus,
      };

      // Add the new guest to Firestore
      const docRef = await db.collection(`users/${auth.currentUser.uid}/PGs/${selectedPGId}/PayingGuestData`).add({ payingGuestMap });
      const newGuest = { id: docRef.id, ...payingGuestMap };

      // Update guest count
      const newGuestCount = currentGuestCount + 1;

      console.log(`New Guest Count: ${newGuestCount}`);

      // Check if the newGuestCount exceeds maxCustomers after adding the guest
      if (newGuestCount > maxCustomers) {
        onSnackbarOpen("Guest added, but max customer limit exceeded!", "warning");
      } else {
        onSnackbarOpen("Paying guest added successfully!", "success");
      }
      onDataSaved(newGuest); // Pass the new guest to the Dashboard component
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
            maxHeight: '70vh',
            height: 'auto',
            margin: 'auto',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            backgroundColor: '#0d2136',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
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
              <input type="text" name="presentStatus" placeholder="Present Employee / Student" value={guestData.presentStatus} onChange={handleChange} required />
              <input type="number" name="aadharNumber" placeholder="Aadhar Number" value={guestData.aadharNumber} onChange={handleChange} required />
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
              <input type="number" name="maintenanceCharges" placeholder="Maintenance Charges" value={guestData.maintenanceCharges} onChange={handleChange} required />
              <div className="checkbox-container">
                <label><input type="checkbox" name="fullDeposit" checked={guestData.fullDeposit} onChange={handleChange} /> Full Deposit Paid </label>
              </div>
            </div>
            <div className="button-container">
              <button type="button" className="cancel-button" onClick={handleClose}>Cancel</button>
              <button type="submit" className="save-button">Save</button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};

export default AddPayingGuestModal;
