import React from 'react';
import './statusCard.css'; // Import the CSS file for styling
import completedImage from "../../../assets/completed.png";
import inProgressImage from '../../../assets/inProgress.png';
import notPaidImage from '../../../assets/NotPaid.png';

// Utility function to get current month
const getCurrentMonth = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  return months[now.getMonth()];
};

const StatusCard = ({ payingGuests }) => {
  // Function to calculate the status counts
  const getStatusCounts = () => {
    const statusCounts = {
      Done: 0,
      Partial: 0,
      NotPaid: 0,
    };

    payingGuests.forEach(guest => {
      // Ensure paymentDetails is defined and is an array
      const paymentDetails = guest.paymentDetails || [];
      const lastPayment = paymentDetails[paymentDetails.length - 1];
      const paymentStatus = lastPayment ? lastPayment.paymentStatus : 'Not Paid';

      // Increment payment status counts
      if (paymentStatus === 'Done') {
        statusCounts.Done++;
      } else if (paymentStatus === 'Partial') {
        statusCounts.Partial++;
      } else {
        statusCounts.NotPaid++;
      }
    });

    return statusCounts;
  };

  // Calculate status counts
  const { Done, Partial, NotPaid } = getStatusCounts();

  // Get the current month
  const currentMonth = getCurrentMonth();

  return (
    <div className="status-card">
      <div className="status-card-header">
        <h3>Status Overview [ {currentMonth} ]</h3>
      </div>
      <div className="status-card-body">
        <div className="status-card-content">
          <div className="status-card-heading">
            <div className='status-item'>
              <img src={completedImage} alt="Completed" className='status-image1' />
              <span className='status-text-done'>Done</span>
            </div>
            <div className='status-item'>
              <img src={inProgressImage} alt="In Progress" className='status-image2' />
              <span className='status-text-partial'>Partial</span>
            </div>
            <div className='status-item'>
              <img src={notPaidImage} alt="Not Paid" className='status-image3' />
              <span className='status-text-not-paid'>Not Paid</span>
            </div>
          </div>
          <div className="status-card-values">
            <span className='done'>{Done}</span>
            <span className='partial'>{Partial}</span>
            <span className='not-paid'>{NotPaid}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
