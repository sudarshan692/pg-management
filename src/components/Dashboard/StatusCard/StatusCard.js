import React from 'react';
import './statusCard.css';
import inProgressImage from '../../../assets/inProgress.png';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const getCurrentMonth = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  return months[now.getMonth()];
};

const checkCircleIcon = {
  color: 'rgb(22, 255, 0)',
  marginTop: '-0.1vw',
  height: '0.8vw',
  width: '0.8vw',
  marginRight: '0.25vw',
};

const cancelIcon = {
  color: '#E72929',
  marginTop: '-0.1vw',
  height: '0.8vw',
  width: '0.8vw',
  marginRight: '0.25vw',
};

const StatusCard = ({ payingGuests }) => {
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
              <CheckCircleIcon style={checkCircleIcon}/>
              <span className='status-text-done'>Done</span>
            </div>
            <div className='status-item'>
              <img src={inProgressImage} alt="In Progress" className='status-image2' />
              <span className='status-text-partial'>Partial</span>
            </div>
            <div className='status-item'>
              <CancelIcon style={cancelIcon}/>
              <span className='status-text-not-paid'>Not Paid</span>
            </div>
          </div>
          <div className="status-card-values">
            <span className='done1'>{Done}</span>
            <span className='partial1'>{Partial}</span>
            <span className='not-paid1'>{NotPaid}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCard;
