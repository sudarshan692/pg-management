import React, { useState } from 'react';
import './paymentStatusDialog.css'; // Ensure this CSS file is imported

const PaymentStatusDialog = ({ guest, onClose, onToggleStatus }) => {
  const [isActive, setIsActive] = useState(guest.currentStatus === 'Active');

  const getPaymentDetails = (month, year) => {
    const paymentDetails = guest.paymentDetails || {};
    const payment = Object.values(paymentDetails).find(payment => 
      payment.paymentForMonth === month && payment.paymentForYear === year
    );
    return payment || { paymentStatus: 'Not Paid', paymentAmount: 0 };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const renderStatusColor = (status) => {
    switch (status) {
      case 'Done': return '#32cd32'; // Bright green for done
      case 'Partial': return '#ffa500'; // Vibrant orange for partial
      case 'Not Paid': return '#e74c3c'; // Bold red for not paid
      default: return '#95a5a6'; // Grey for unknown
    }
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = [...new Set(Object.values(guest.paymentDetails || {}).map(payment => payment.paymentForYear))].sort();

  const handleToggleStatus = () => {
    const newStatus = isActive ? 'Inactive' : 'Active';
    setIsActive(!isActive);
    if (onToggleStatus) {
      onToggleStatus(guest.guestID, newStatus);
    }
  };

  return (
    <div className="dialog-overlay" style={{ display: 'flex' }}>
      <div className="dialog-card">
        <div className="card-header">
          <h3>Guest Details</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <div className="card-content">
          {/* Display Guest Details */}
          <div className="guest-details">
            {[
              { label: 'Guest ID', value: guest.guestID },
              { label: 'Name', value: guest.guestName },
              { label: 'Mobile Number', value: guest.guestMobileNo },
              { label: 'Father\'s Name', value: guest.fatherName },
              { label: 'Father\'s Mobile Number', value: guest.fatherMobileNo },
              { label: 'Aadhar Number', value: guest.aadharNumber },
              { label: 'Date of Admission', value: formatDate(guest.dateOfAdmission) },
              { label: 'Permanent Address', value: guest.permanentAddress },
              { label: 'Floor/Room/Type', value: `${guest.floorNo}/${guest.roomNo}/${guest.roomType}` },
              { label: 'Present Status', value: guest.presentStatus },
              { label: 'Deposit Amount', value: `₹${guest.depositAmount}` },
              { label: 'Maintenance Charges', value: `₹${guest.maintenanceCharges}` },
              { label: 'Full Deposit', value: guest.fullDeposit ? 'Yes' : 'No' },
              { label: 'Current Status', value: (
                <div className="status-container">
                  <span>{guest.currentStatus}</span>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={isActive} onChange={handleToggleStatus} />
                    <span className="slider"></span>
                  </label>
                </div>
              )},
            ].map(({ label, value }) => (
              <div key={label} className="detail-item">
                <strong>{label}:</strong>
                <span>{value}</span>
              </div>
            ))}
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
                          style={{ backgroundColor: renderStatusColor(paymentStatus), color: paymentAmount > 0 ? '#fff' : '#f0f0f0' }}
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
