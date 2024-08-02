import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { FaPlus, FaArrowUp, FaExclamationTriangle } from 'react-icons/fa';
import LoadingSpinner from '../../shared/LoadingSpinner'; // Adjust the path as needed
import PaymentStatusDialog from '../PaymentStatusDialog/PaymentStatusDialog';
import './payingGuestTable.css';

const CustomNoDataComponent = () => (
  <div className="no-data">
    There are no records to display.
  </div>
);

const StatusBoxedCell = ({ status }) => {
  let boxColor = 'red';
  let displayText = 'NP';

  if (status === 'Done') {
    boxColor = 'green';
    displayText = 'D';
  } else if (status === 'Partial') {
    boxColor = 'yellow';
    displayText = 'P';
  }

  return (
    <div className={`box status-box ${boxColor}`}>
      <div className="status-label">{displayText}</div>
      <div className="status-text">{displayText === 'D' ? 'Done' : displayText === 'P' ? 'Partial' : 'Not Paid'}</div>
    </div>
  );
};

const BoxedCell = ({ value, className, color, label, fullDeposit }) => {
  const isZeroDeposit = value === 0;
  const isFullDeposit = fullDeposit;
  
  let boxColor = color;
  
  if (isZeroDeposit) {
    boxColor = 'red';
  } else if (isFullDeposit) {
    boxColor = 'green';
  } else {
    boxColor = 'yellow';
  }
  
  return (
    <div className={`box ${className} ${boxColor}`}>
      {fullDeposit !== undefined && !isZeroDeposit && (
        <div className={`status-label ${fullDeposit ? 'done' : 'partial'}`}>
          {fullDeposit ? 'D' : 'P'}
        </div>
      )}
      {isZeroDeposit ? (
        <>
          <div className="status-label np">NP</div>
          <div className="no-deposit">Not Paid</div>
        </>
      ) : (
        <>
          <div className="label">{label}</div>
          {value}
        </>
      )}
    </div>
  );
};

const BoxContainer = ({ floorNo, roomNo, roomType }) => (
  <div className="box-container">
    <BoxedCell value={floorNo || '-'} className="floor" color="floor" label="F" />
    <BoxedCell value={roomNo || '-'} className="room" color="room" label="R" />
    <BoxedCell value={roomType || '-'} className="type" color="type" label="T" />
  </div>
);

const depositAmountSort = (rowA, rowB, columnId, sortDirection) => {
  const depositA = rowA.fullDeposit ? 1 : rowA.depositPaid ? 0.5 : 0;
  const depositB = rowB.fullDeposit ? 1 : rowB.depositPaid ? 0.5 : 0;
  return sortDirection === 'asc' ? depositA - depositB : depositB - depositA;
};

const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const parseDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date(0) : date; // Return epoch if invalid
};

const getHighestPayment = (paymentDetails) => {
  if (!paymentDetails || Object.keys(paymentDetails).length === 0) {
    return null;
  }
  const highestIndexId = Object.keys(paymentDetails).sort().pop();
  return paymentDetails[highestIndexId] || null;
};

const sortPaymentDate = (rowA, rowB, sortDirection) => {
  const highestPaymentA = getHighestPayment(rowA.paymentDetails);
  const highestPaymentB = getHighestPayment(rowB.paymentDetails);

  if (!highestPaymentA || !highestPaymentB) {
    return 0;
  }

  const dateA = parseDate(highestPaymentA.paymentDate);
  const dateB = parseDate(highestPaymentB.paymentDate);

  return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
};

const sortPaymentAmount = (rowA, rowB, sortDirection) => {
  const highestPaymentA = getHighestPayment(rowA.paymentDetails);
  const highestPaymentB = getHighestPayment(rowB.paymentDetails);

  if (!highestPaymentA || !highestPaymentB) {
    return 0;
  }

  const amountA = highestPaymentA.paymentAmount || 0;
  const amountB = highestPaymentB.paymentAmount || 0;

  return sortDirection === 'asc' ? amountA - amountB : amountB - amountA;
};

const sortPaymentStatus = (rowA, rowB, sortDirection) => {
  const statusOrder = { 'Not Paid': 1, 'Done': 2, 'Partial': 3 }; // Define status order
  const highestPaymentA = getHighestPayment(rowA.paymentDetails);
  const highestPaymentB = getHighestPayment(rowB.paymentDetails);

  if (!highestPaymentA || !highestPaymentB) {
    return 0;
  }

  const statusA = highestPaymentA.paymentStatus || 'Not Paid';
  const statusB = highestPaymentB.paymentStatus || 'Not Paid';

  const orderA = statusOrder[statusA] || 0; // Default to 0 if status not found
  const orderB = statusOrder[statusB] || 0; // Default to 0 if status not found

  return sortDirection === 'asc' ? orderA - orderB : orderB - orderA;
};

const getPreviousMonthPaymentStatus = (paymentDetails) => {
  const paymentEntries = Object.keys(paymentDetails).map(key => ({
    ...paymentDetails[key],
    index: key
  }));

  // If there's only one entry, return 'Not Paid'
  if (paymentEntries.length <= 1) {
    return 'Not Paid';
  }

  // Sort by index to find the latest and previous payments
  paymentEntries.sort((a, b) => a.index.localeCompare(b.index));

  // Check the previous month's entry
  const previousMonthEntry = paymentEntries[paymentEntries.length - 2];
  const status = previousMonthEntry.paymentStatus || 'Not Paid';

  // Return 'Partial' or 'Not Paid' if applicable
  return status === 'Partial' || status === 'Not Paid' ? status : 'Paid';
};

const getCurrentMonthYear = () => {
  const now = new Date();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const currentMonth = months[now.getMonth()];
  const currentYear = now.getFullYear();
  return { currentMonth, currentYear };
};

const PayingGuestTable = ({ payingGuests, onAddPayment }) => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = payingGuests.filter((item) => {
    // Check if any property of the item matches the search text
    const itemMatches = Object.values(item).some(
      (value) => value && value.toString().toLowerCase().includes(searchText.toLowerCase())
    );
  
    // Check if any payment detail matches the search text
    const paymentDetailsMatches = Object.values(item.paymentDetails || {}).some(
      (detail) => {
        const detailValues = Object.values(detail);
        return detailValues.some(value => value && value.toString().toLowerCase().includes(searchText.toLowerCase()));
      }
    );
  
    return itemMatches || paymentDetailsMatches;
  });

  const handleRowClicked = (row) => {
    setSelectedGuest(row);
  };

  const handleCloseDialog = () => {
    setSelectedGuest(null);
  };

  const columns = [
    { name: 'Guest ID', selector: (row) => row.guestID, sortable: true },
    { name: 'Guest Name', selector: (row) => row.guestName || '-', sortable: true },
    { 
      name: 'Floor/Room/Type', 
      cell: (row) => <BoxContainer floorNo={row.floorNo} roomNo={row.roomNo} roomType={row.roomType} />, 
      sortable: true 
    },
    { 
      name: 'Date Of Admission', 
      selector: (row) => formatDate(row.dateOfAdmission), 
      sortable: true 
    },
    { 
      name: 'Deposit Amount', 
      cell: (row) => (
        <BoxedCell
          value={row.depositAmount}
          className="deposit"
          color={row.depositAmount === 0 ? 'red' : 'yellow'}
          fullDeposit={row.fullDeposit}
        />
      ), 
      sortable: true,
      sortFunction: depositAmountSort
    },
    { 
      name: 'Payment Month',
      cell: (row) => {
        const highestPayment = getHighestPayment(row.paymentDetails);
        const currentMonth = getCurrentMonthYear().currentMonth;
        return highestPayment ? highestPayment.paymentForMonth : currentMonth;
      },
      sortable: true
    },
    { 
      name: 'Payment Year',
      cell: (row) => {
        const highestPayment = getHighestPayment(row.paymentDetails);
        const currentYear = getCurrentMonthYear().currentYear;
        return highestPayment ? highestPayment.paymentForYear : currentYear;
      },
      sortable: true
    },
    {
      name: 'Payment Date',
      cell: (row) => {
        const highestPayment = getHighestPayment(row.paymentDetails);
        return highestPayment ? formatDate(highestPayment.paymentDate) : '-';
      },
      sortable: true,
      sortFunction: sortPaymentDate
    },
    {
      name: 'Payment Amount',
      cell: (row) => {
        const highestPayment = getHighestPayment(row.paymentDetails);
        return highestPayment ? highestPayment.paymentAmount : '-';
      },
      sortable: true,
      sortFunction: sortPaymentAmount
    },
    {
      name: 'Payment Status',
      cell: (row) => {
        const highestPayment = getHighestPayment(row.paymentDetails);
        const status = highestPayment ? highestPayment.paymentStatus : 'Not Paid';
        return (
          <StatusBoxedCell status={status} />
        );
      },
      sortable: true,
      sortFunction: sortPaymentStatus
    },
    {
      name: 'Actions',
      cell: (row) => {
        const paymentEntries = row.paymentDetails ? Object.keys(row.paymentDetails) : [];
        const showAlert = paymentEntries.length > 1 && (getPreviousMonthPaymentStatus(row.paymentDetails) === 'Partial' || getPreviousMonthPaymentStatus(row.paymentDetails) === 'Not Paid');
        return (
          <div className="actions-container">
            <button onClick={() => onAddPayment(row)} className="add-payment-button">
              <FaPlus className="add-icon" />
            </button>
            {showAlert && (
              <FaExclamationTriangle className="alert-icon" title="Previous month payment status is Partial or Not Paid" />
            )}
          </div>
        );
      },
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#3f51b5',
        color: 'white',
        minHeight: window.innerWidth < 768 ? '35px' : '50px',
        fontSize: window.innerWidth < 768 ? '0.5rem' : '0.94rem',
        fontWeight: 'bold',
      },
    },
    rows: {
      style: {
        '&:nth-child(odd)': {
          backgroundColor: '#0d2136',
          color: 'white',
          fontSize: window.innerWidth < 768 ? '0.5rem' : '',
        },
        '&:nth-child(even)': {
          backgroundColor: '#162c46',
          color: 'white',
          fontSize: window.innerWidth < 768 ? '0.5rem' : '',
        },
      },
    },
    pagination: {
      style: {
        minHeight: window.innerWidth < 768 ? '' : '50px',
        backgroundColor: '#3f51b5',
        color: 'white',
        display: 'flex',
        justifyContent: 'center',
      },
    },
    button: {
      style: {
        backgroundColor: '#3498db',
        color: 'white',
      },
    },
  };

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="search-container">
            <input
              className="search-input"
              type="text"
              value={searchText}
              onChange={handleSearch}
              placeholder="Search..."
            />
          </div>
          <div className="table">
            <DataTable
              className="custom-data-table"
              columns={columns}
              data={filteredData}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30]}
              highlightOnHover
              pointerOnHover
              sortIcon={<FaArrowUp />}
              defaultSortField="guestID"
              customStyles={customStyles}
              noDataComponent={<CustomNoDataComponent />}
              onRowClicked={handleRowClicked}
            />
          </div>
          {selectedGuest && (
            <PaymentStatusDialog guest={selectedGuest} onClose={handleCloseDialog} />
          )}
        </>
      )}
    </div>
  );
};

export default PayingGuestTable;
