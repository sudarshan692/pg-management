import React, { useState, useEffect, useMemo } from "react";
import { db, auth } from "../../shared/firebase";
import "./paymentStatusDialog.css";
import ConfirmDeleteDialog from "../../Dashboard/ConfirmDeleteDialog/ConfirmDeleteDialog";
import { FaTrashAlt} from "react-icons/fa";
import { doc, updateDoc, deleteField } from "firebase/firestore";

const PaymentStatusDialog = ({
  guest,
  isOpen,
  onClose,
  onSnackbarOpen,
  onPaymentUpdate,
  selectedPGId,
}) => {
  const roomTypeMap = useMemo(() => ({
    Single: 'S',
    Double: 'D',
    Triple: 'T'
  }), []);

  const roomTypeMapReverse = useMemo(() => ({
    S: 'Single',
    D: 'Double',
    T: 'Triple'
  }), []);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialGuest, setInitialGuest] = useState(null);
  const [editedGuest, setEditedGuest] = useState({});

  useEffect(() => {
    if (isOpen) {
      const guestData = { ...guest, roomType: roomTypeMapReverse[guest.roomType] || '' };
      setInitialGuest(guestData);
      setEditedGuest(guestData);
    }
  }, [isOpen, guest, roomTypeMapReverse]);

  const getPaymentDetails = (month, year) => {
    const paymentDetails = guest.paymentDetails || {};
    const payment = Object.values(paymentDetails).find(
      (payment) =>
        payment.paymentForMonth === month && payment.paymentForYear === year
    );
    return payment || { paymentStatus: "Not Paid", paymentAmount: 0 };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const renderStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "#32cd32";
      case "Partial":
        return "#ffa500";
      case "Not Paid":
        return "#e74c3c";
      default:
        return "#95a5a6";
    }
  };

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const years = [
    ...new Set(
      Object.values(guest.paymentDetails || {}).map(
        (payment) => payment.paymentForYear
      )
    ),
  ].sort();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const guestRef = doc(db, `users/${auth.currentUser.uid}/PGs/${selectedPGId}/PayingGuestData`, guest.id);
      await updateDoc(guestRef, {
        paymentDetails: deleteField()
      });
      onPaymentUpdate({
        ...guest,
        paymentDetails: null,
      });
      onSnackbarOpen("Payment details deleted successfully!", "success");
      onClose();
    } catch (error) {
      console.error("Error deleting payment details: ", error);
      onSnackbarOpen("Error deleting payment details. Please try again.", "error");
    } finally {
      setLoading(false);
      setShowConfirmDelete(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      setEditedGuest(initialGuest);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedGuest((prevState) => ({
      ...prevState,
      [name]: name === "floorNo" || name === "roomNo" || name === "depositAmount" || name === "maintenanceCharges" ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setEditedGuest((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setEditedGuest((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const guestRef = doc(db, `users/${auth.currentUser.uid}/PGs/${selectedPGId}/PayingGuestData`, guest.id);
      const updatedPayingGuestMap = {
        guestID: guest.guestID,
        guestName: editedGuest.guestName,
        guestMobileNo: Number(editedGuest.guestMobileNo),
        fatherName: editedGuest.fatherName,
        fatherMobileNo: Number(editedGuest.fatherMobileNo),
        permanentAddress: editedGuest.permanentAddress,
        presentStatus: editedGuest.presentStatus,
        dateOfAdmission: editedGuest.dateOfAdmission,
        floorNo: Number(editedGuest.floorNo),
        roomNo: Number(editedGuest.roomNo),
        roomType: roomTypeMap[editedGuest.roomType], // Convert to short code
        depositAmount: Number(editedGuest.depositAmount),
        maintenanceCharges: Number(editedGuest.maintenanceCharges),
        fullDeposit: editedGuest.fullDeposit,
        aadharNumber: Number(editedGuest.aadharNumber),
        currentStatus: guest.currentStatus
      };
      await updateDoc(guestRef, {
        payingGuestMap: updatedPayingGuestMap
      });
      setInitialGuest(updatedPayingGuestMap);
      onPaymentUpdate({ ...guest, ...updatedPayingGuestMap });
      onSnackbarOpen("Guest details updated successfully!", "success");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating guest details: ", error);
      onSnackbarOpen("Error updating guest details. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setEditedGuest({
      guestName: "",
      guestMobileNo: "",
      fatherName: "",
      fatherMobileNo: "",
      aadharNumber: "",
      dateOfAdmission: "",
      permanentAddress: "",
      floorNo: "",
      roomNo: "",
      roomType: "",
      presentStatus: "",
      depositAmount: "",
      maintenanceCharges: "",
      fullDeposit: false,
    });
  };

  return (
    <div className="dialog-overlay" style={{ display: isOpen ? "flex" : "none" }}>
      <div className="dialog-card">
        <div className="card-header">
          <h3>Guest Details: <span className="guest-id1">{guest.guestID}</span> </h3>
          <button className="close-button" onClick={onClose}>x</button>
          {isEditing && (<button className="clear-button" onClick={handleClear}>Clear</button>)}
          <button className="edit-button1" onClick={handleEditToggle}>
            Edit
          </button>
        </div>
        <div className="card-content">
          {/* Display Guest Details */}
          <div className="guest-details">
            {[
              { label: "Name", value: editedGuest.guestName, editable: true, key: "guestName" },
              { label: "Mobile Number", value: editedGuest.guestMobileNo, editable: true, key: "guestMobileNo" },
              { label: "Father's Name", value: editedGuest.fatherName, editable: true, key: "fatherName" },
              { label: "Father's Mobile Number", value: editedGuest.fatherMobileNo, editable: true, key: "fatherMobileNo" },
              { label: "Aadhar Number", value: editedGuest.aadharNumber, editable: true, key: "aadharNumber" },
              { label: "Date of Admission", value: editedGuest.dateOfAdmission, editable: true, key: "dateOfAdmission" },
              { label: "Permanent Address", value: editedGuest.permanentAddress, editable: true, key: "permanentAddress" },
              { label: "Floor No", value: editedGuest.floorNo, editable: true, key: "floorNo" },
              { label: "Room No", value: editedGuest.roomNo, editable: true, key: "roomNo" },
              { label: "Room Type", value: editedGuest.roomType, editable: true, key: "roomType" },
              { label: "Deposit Amount", value: editedGuest.depositAmount, editable: true, key: "depositAmount" },
              { label: "Maintenance Charges", value: editedGuest.maintenanceCharges, editable: true, key: "maintenanceCharges" },
              { label: "Present Status", value: editedGuest.presentStatus, editable: true, key: "presentStatus" },
              { label: "Full Deposit", value: editedGuest.fullDeposit, editable: true, key: "fullDeposit" },
            ].map(({ label, value, editable, key }) => (
              <div key={key} className="detail-item">
                <strong>{label}:</strong>
                {editable && isEditing ? (
                  key === "fullDeposit" ? (
                    <div>
                      <label>
                        <input
                          type="checkbox"
                          name={key}
                          checked={value}
                          onChange={handleCheckboxChange}
                          className={isEditing ? 'input-half-width' : ''}
                        />
                        {value ? "Yes" : "No"}
                      </label>
                    </div>
                  ) : key === "roomType" ? (
                    <select
                      name={key}
                      value={value}
                      onChange={handleSelectChange}
                    >
                      <option value="">Select Room Type</option>
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Triple">Triple</option>
                    </select>
                  ) : key === "dateOfAdmission" ? (
                    <input
                      type="date"
                      name={key}
                      value={formatDate(value)}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <input
                      type={key === "depositAmount" || key === "maintenanceCharges" ? "number" : "text"}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                    />
                  )
                ) : (
                  <span>{key === "depositAmount" || key === "maintenanceCharges" ? `₹${value}` : key === "fullDeposit" ? (value ? "Yes" : "No") : value}</span>
                )}
              </div>
            ))}
            {isEditing && (
              <div className="edit-buttons">
                <button className="cancel-button1" onClick={handleEditToggle}>Cancel</button>
                <button className="save-button1" onClick={handleSave}>Save</button>
              </div>
            )}
          </div>

          {/* Display Payment Status Table */}
          <div className="table-container">
            <h3 className="payment-details">Payment Status</h3>
            <button onClick={() => setShowConfirmDelete(true)} className="delete-button" disabled={loading}>
              <FaTrashAlt />
            </button>
            <table className="payment-table">
              <thead>
                <tr>
                  <th>Year/Month</th>
                  {months.map((month) => (
                    <th key={month}>{month}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {years.map((year) => (
                  <tr key={year}>
                    <td>{year}</td>
                    {months.map((month) => {
                      const { paymentStatus, paymentAmount } = getPaymentDetails(month, year);
                      return (
                        <td
                          key={month}
                          style={{
                            backgroundColor: renderStatusColor(paymentStatus),
                            color: paymentAmount > 0 ? "#fff" : "#f0f0f0",
                          }}
                        >
                          {paymentAmount > 0 ? `${paymentAmount.toFixed(2)}` : ""}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDelete}
        loading={loading}
      />
    </div>
  );
};

export default PaymentStatusDialog;
