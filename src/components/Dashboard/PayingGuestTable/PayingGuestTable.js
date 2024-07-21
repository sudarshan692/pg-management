import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { FaArrowUp } from 'react-icons/fa';
import './payingGuestTable.css';

const CustomNoDataComponent = () => (
  <div className="no-data">
    There are no records to display.
  </div>
);

const BoxedCell = ({ value, className, color }) => (
  <div className={`box ${className} ${color}`}>
    {value}
  </div>
);

const BoxContainer = ({ floorNo, roomNo, roomType }) => (
  <div className="box-container">
    <BoxedCell value={floorNo || '-'} className="floor" />
    <BoxedCell value={roomNo || '-'} className="room" />
    <BoxedCell value={roomType || '-'} className="type" />
  </div>
);

const PayingGuestTable = ({ payingGuests }) => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredData = payingGuests.filter((item) =>
    Object.values(item).some(
      (value) => value && value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const columns = [
    { name: 'Guest ID', selector: (row, index) => index + 1, sortable: true },
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
          color={row.depositPaid ? 'green' : 'red'}
        />
      ), 
      sortable: true 
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
    </div>
  );
};

export default PayingGuestTable;
