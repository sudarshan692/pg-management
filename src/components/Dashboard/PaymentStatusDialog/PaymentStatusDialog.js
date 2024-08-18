import React, { useState, useEffect, useMemo } from "react";
import { db, auth } from "../../shared/firebase";
import "./paymentStatusDialog.css";
import ConfirmDeleteDialog from "../../Dashboard/ConfirmDeleteDialog/ConfirmDeleteDialog";
import { FaTrashAlt} from "react-icons/fa";
import { doc, updateDoc, deleteField } from "firebase/firestore";
import jsPDF from "jspdf";

const PaymentStatusDialog = ({
  guest,
  isOpen,
  onClose,
  onSnackbarOpen,
  onPaymentUpdate,
  selectedPGId,
  pgDetails,
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
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [showDownloadLink, setShowDownloadLink] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState("");

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
        currentStatus: guest.currentStatus,
        rentAmount: Number(guest.rentAmount),
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
      rentAmount: "",
    });
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    if (selectedYear) {
      setShowDownloadLink(true);
    }
  };

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    if (selectedMonth) {
      setShowDownloadLink(true);
    }
  };

  const handlePaymentTypeChange = (e) => {
    setSelectedPaymentType(e.target.value);
  };


  const handleDownloadReceipt = () => {
    const paymentDetails = guest.paymentDetails || [];
    const paymentDetail = paymentDetails.find(
        (payment) =>
            payment.paymentForMonth === selectedMonth &&
            payment.paymentForYear === parseInt(selectedYear, 10)
    );
    if (!paymentDetail || paymentDetail.paymentStatus === "Not Paid") {
        onSnackbarOpen("No payment details available for the selected month and year.", "error");
        return;
    }
    const doc = new jsPDF({});
    // Set page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    // Set the background color
    doc.setFillColor(221, 221, 221); // #DDDDDD
    doc.rect(0, 0, pageWidth, pageHeight, 'F'); // Fill entire page with color
    // Draw a border around the page
    const borderMargin = 5;
    doc.setDrawColor(0, 0, 0); // Black border color
    doc.setLineWidth(1); // Border thickness
    doc.rect(borderMargin, borderMargin, pageWidth - 2 * borderMargin, pageHeight - 2 * borderMargin); // Draw border inside the page edges
    // Centered "RENT RECEIPT" heading
    const headingText = "RENT RECEIPT";
    const textWidth = doc.getTextWidth(headingText);
    const xPosition = (pageWidth - textWidth) / 2;
    const headingPadding = 2; // Reduced padding
    const boxWidth = textWidth + headingPadding * 2;
    const boxHeight = 10;
    doc.setFillColor(0, 0, 0);
    doc.rect(xPosition - headingPadding, 15, boxWidth, boxHeight, 'F'); // Adjusted Y position to 15
    doc.setTextColor(255, 255, 255); 
    doc.text(headingText, xPosition, 22); // Adjusted Y position to 22
    // Set font to size 12
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Set text color back to black
    // Format the payment date as DD-MM-YYYY
    const paymentDate = new Date(paymentDetail.paymentDate);
    const formattedDate = [
        String(paymentDate.getDate()).padStart(2, '0'),
        String(paymentDate.getMonth() + 1).padStart(2, '0'), // Months are 0-indexed
        paymentDate.getFullYear(),
    ].join('-');
    // Left-aligned "Receipt No:"
    doc.text(`Receipt No: ${guest.guestID}`, 10, 35);
    // Right-aligned "Payment Date:"
    const paymentDateText = `Payment Date: ${formattedDate}`;
    const paymentDateTextWidth = doc.getTextWidth(paymentDateText);
    doc.text(paymentDateText, pageWidth - paymentDateTextWidth - 10, 35);
    // Table:
    const tableMargin = 5; // Space between table and page border
    let tableStartY = 50; // Initial Y position for the table
    const tableWidth = pageWidth - 2 * (borderMargin + tableMargin);
    const column1Width = tableWidth / 3; // First column width
    const column2Width = tableWidth - column1Width; // Second column width
    const rowPadding = 1; // Padding within the cells (adjusted)
    doc.setLineWidth(0.2); // Thinner line for row border
    const rows = [
        { label: "Tenant", value: `${guest.guestName}`},
        { label: "Address of rented property", value: `${pgDetails.address}`},
        { label: "Rent for Month - Year", value: `${paymentDetail.paymentForMonth} - ${paymentDetail.paymentForYear}` },
        { label: "Payment Received Date", value: formattedDate },
        { label: "Recipient", value: `${pgDetails.ownerName}` },
        { label: "Payment type", value: `${selectedPaymentType}`},
        { label: "Total rent payable", value: `Rs.${guest.rentAmount}`},
        { label: "Total rent paid", value: `Rs.${paymentDetail.paymentAmount}`},
        { label: "Remaining Balanced owned", value: `Rs.${paymentDetail.remainingAmount != null ? paymentDetail.remainingAmount : 0}`}, // Handle null and undefined
    ];
    rows.forEach((row, index) => {
        const rowY = tableStartY;
        // Calculate the height required for the current row
        const textLines = doc.splitTextToSize(row.value, column2Width - rowPadding * 2);
        const lineCount = textLines.length;
        const currentRowHeight = lineCount * 5 + rowPadding * 2; // Adjust height based on number of lines
        // Draw row border
        doc.rect(borderMargin + tableMargin, rowY, tableWidth, currentRowHeight);
        doc.setFont("Arial", "bold");
        doc.text(row.label, borderMargin + tableMargin + rowPadding, rowY + 5); // Adjust Y to align in the middle
        doc.setFont("Arial", "normal");
        textLines.forEach((line, lineIndex) => {
            doc.text(line, borderMargin + tableMargin + column1Width + rowPadding, rowY + 5 + (lineIndex * 5)); // Adjust Y to account for multiple lines
        });
        doc.line(borderMargin + tableMargin + column1Width, rowY, borderMargin + tableMargin + column1Width, rowY + currentRowHeight);
        // Update tableStartY for the next row
        tableStartY += currentRowHeight;
    });
    // Draw vertical line separating the two columns
    doc.setDrawColor(0, 0, 0); // Ensure line is black
    doc.line(borderMargin + tableMargin + column1Width, 50, borderMargin + tableMargin + column1Width, tableStartY);
    
    // Add additional text below the table
    const additionalText = `This rent receipt acknowledges that, the rent for Month ${paymentDetail.paymentForMonth} - ${paymentDetail.paymentForYear}, ${guest.guestName} has paid the rent in full.`;
    const textMargin = 10;
    const additionalTextWidth = pageWidth - 2 * textMargin; // Width for the additional text

    // Split text into lines if it exceeds the page width
    const additionalTextLines = doc.splitTextToSize(additionalText, additionalTextWidth);

    // Position the additional text below the table with a margin
    const additionalTextY = tableStartY + textMargin;
    additionalTextLines.forEach((line, lineIndex) => {
        doc.text(line, textMargin, additionalTextY + lineIndex * 10); // Adjust line spacing as needed
    });

    // Save the PDF
    doc.save(`Receipt_${selectedMonth}_${selectedYear}.pdf`);
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
              { label: "Rent Amount", value: editedGuest.rentAmount, editable: true, key: "rentAmount" },
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
                      type={key === "depositAmount" || key === "maintenanceCharges" || key === "rentAmount" ? "number" : "text"}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                    />
                  )
                ) : (
                  <span>{key === "depositAmount" || key === "maintenanceCharges" || key === "rentAmount" ? `₹${value}` : key === "fullDeposit" ? (value ? "Yes" : "No") : value}</span>
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

            <div className="receipt-download-section">
            <select
                name="paymentType"
                value={selectedPaymentType}
                onChange={handlePaymentTypeChange}
              >
                <option value="">Select Payment Type</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI Scan">UPI Scan</option>
                <option value="Check">Check</option>
              </select>

              <select onChange={handleYearChange} value={selectedYear}>
                <option value="">Select Year</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select onChange={handleMonthChange} value={selectedMonth}>
                <option value="">Select Month</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              {showDownloadLink && (
                <button onClick={handleDownloadReceipt} className="download-receipt-button">
                  Download Receipt
                </button>
              )}
            </div>
            
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
