// src/components/PaymentStatusDialog.js
import React from 'react';
import './paymentStatusDialog.css'; // You can create a CSS file for custom styling

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
      <div className="dialog-content1">
        <button className="close-button" onClick={onClose}>X</button>
        <h2>{guest.guestName}'s Payment Status</h2>
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
                      style={{ backgroundColor: renderStatusColor(paymentStatus), textAlign: 'center', fontSize: '12px' }}
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
  );
};

export default PaymentStatusDialog;
