import React from 'react';
import './paymentStatusDialog.css'; // Ensure this CSS file is imported

const PaymentStatusDialog = ({ guest, onClose }) => {
  const getPaymentDetails = (month, year) => {
    const paymentDetails = guest.paymentDetails || {};
    const payment = Object.values(paymentDetails).find(payment => 
      payment.paymentForMonth === month && payment.paymentForYear === year
    );
    return payment || { paymentStatus: 'Not Paid', paymentAmount: 0 };
  };

  const renderStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'green';
      case 'Partial': return '#FBC02D';
      case 'Not Paid': return 'red';
      default: return 'grey';
    }
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = [...new Set(Object.values(guest.paymentDetails || {}).map(payment => payment.paymentForYear))].sort();

  return (
    <div className="dialog-overlay">
      <div className="dialog-card">
        <div className="card-header">
          <h3>Guest Details</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="card-content">
          {/* Display Guest Details */}
          <div className="guest-details">
            <div className="detail-item">
              <strong>Guest ID:</strong>
              <span>{guest.guestID}</span>
            </div>
            <div className="detail-item">
              <strong>Name:</strong>
              <span>{guest.guestName}</span>
            </div>
            <div className="detail-item">
              <strong>Mobile No:</strong>
              <span>{guest.guestMobileNo}</span>
            </div>
            <div className="detail-item">
              <strong>Father's Name:</strong>
              <span>{guest.fatherName}</span>
            </div>
            <div className="detail-item">
              <strong>Father's Mobile No:</strong>
              <span>{guest.fatherMobileNo}</span>
            </div>
            <div className="detail-item">
              <strong>Floor No:</strong>
              <span>{guest.floorNo}</span>
            </div>
            <div className="detail-item">
              <strong>Room No:</strong>
              <span>{guest.roomNo}</span>
            </div>
            <div className="detail-item">
              <strong>Room Type:</strong>
              <span>{guest.roomType}</span>
            </div>
            <div className="detail-item">
              <strong>Date of Admission:</strong>
              <span>{guest.dateOfAdmission}</span>
            </div>
            <div className="detail-item">
              <strong>Permanent Address:</strong>
              <span>{guest.permanentAddress}</span>
            </div>
            <div className="detail-item">
              <strong>Present Status:</strong>
              <span>{guest.presentStatus}</span>
            </div>
            <div className="detail-item">
              <strong>Deposit Amount:</strong>
              <span>{guest.depositAmount}</span>
            </div>
            <div className="detail-item">
              <strong>Maintenance Charges:</strong>
              <span>{guest.maintenanceCharges}</span>
            </div>
            <div className="detail-item">
              <strong>Full Deposit:</strong>
              <span>{guest.fullDeposit ? 'Yes' : 'No'}</span>
            </div>
          </div>
          
          {/* Display Payment Status Table */}
          <div className="table-container">
            <h3 className='payment-details'>Payment Status</h3>
            <table>
              <thead>
                <tr>
                  <th>Year/Month</th>
                  {months.map(month => <th key={month}>{month}</th>)}
                </tr>
              </thead>
              <tbody>
                {years.map(year => (
                  <tr key={year}>
                    <td>{year}</td>
                    {months.map(month => {
                      const { paymentStatus, paymentAmount } = getPaymentDetails(month, year);
                      return (
                        <td
                          key={month}
                          style={{ backgroundColor: renderStatusColor(paymentStatus), textAlign: 'center', fontSize: '12px', color: paymentAmount > 0 ? '#f0f0f0' : 'inherit' }}
                        >
                          {paymentAmount > 0 ? `${paymentAmount.toFixed(2)}` : ''}
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
    </div>
  );
};

export default PaymentStatusDialog;
