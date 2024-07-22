import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import { FaArrowUp } from 'react-icons/fa';
import LoadingSpinner from '../../shared/LoadingSpinner'; // Adjust the path as needed
import './payingGuestTable.css';

const CustomNoDataComponent = () => (
  <div className="no-data">
    There are no records to display.
  </div>
);

const BoxedCell = ({ value, className, color, label, fullDeposit }) => {
  const isZeroDeposit = value.trim() === '0' || /^0+$/.test(value.trim());
  const isFullDeposit = fullDeposit; // Assumes fullDeposit is a boolean indicating if it's full

  let boxColor = color;

  // Determine the color based on deposit status
  if (isZeroDeposit) {
    boxColor = 'red'; // Red color for zero deposit
  } else if (isFullDeposit) {
    boxColor = 'green'; // Green color for full deposit
  } else {
    boxColor = 'yellow'; // Default color for partial or other deposits
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
  // Assuming fullDeposit and depositPaid are the keys to determine sorting
  const depositA = rowA.fullDeposit ? 1 : rowA.depositPaid ? 0.5 : 0;
  const depositB = rowB.fullDeposit ? 1 : rowB.depositPaid ? 0.5 : 0;
  
  return sortDirection === 'asc' ? depositA - depositB : depositB - depositA;
};

const PayingGuestTable = ({ payingGuests }) => {
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Simulate data fetching
    const fetchData = async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = payingGuests.filter((item) =>
    Object.values(item).some(
      (value) => value && value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const columns = [
    { name: 'Guest ID', selector: (row) => row.guestID, sortable: true },
    { name: 'Guest Name', selector: (row) => row.guestName || '-', sortable: true },
    { 
      name: 'Floor/Room/Type', 
      cell: (row) => <BoxContainer floorNo={row.floorNo} roomNo={row.roomNo} roomType={row.roomType} />, 
      sortable: true 
    },
    { name: 'Date Of Admission', selector: (row) => row.dateOfAdmission || '-', sortable: true },
    { 
      name: 'Deposit Amount', 
      cell: (row) => (
        <BoxedCell
          value={row.depositAmount || '-'}
          className="deposit"
          color={row.depositPaid ? 'green' : 'red'} // Temporary color assignment for testing
          fullDeposit={row.fullDeposit} // Pass fullDeposit value
        />
      ), 
      sortable: true,
      sortFunction: depositAmountSort // Custom sort function
    },
    { name: 'Monthly Rent', selector: (row) => row.monthlyRent || '-', sortable: true },
    { name: 'Payment Status', selector: (row) => row.paymentStatus || '-', sortable: true },
    {
      name: 'Actions',
      cell: (row) => (
        <div>
          {/* Add your action icons here */}
        </div>
      )
    }
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
              defaultSortField="id"
              customStyles={customStyles}
              noDataComponent={<CustomNoDataComponent />}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PayingGuestTable;
