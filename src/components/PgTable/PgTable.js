// PgTable.js
import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { FaCopy, FaArrowUp } from 'react-icons/fa';
import CustomSnackbar from '../shared/CustomSnackbar'; // Import CustomSnackbar component
import './pgTable.css';

const CustomNoDataComponent = () => (
  <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#162c46', color: 'rgb(211, 227, 253)', width: '100%' }}>
    There are no records to display.
  </div>
);

const PgTable = ({ pgData }) => {
  const [searchText, setSearchText] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleCopy = (userId) => {
    navigator.clipboard.writeText(userId);
    setSnackbarMessage(`Copied User ID: ${userId}`);
    setShowSnackbar(true);
  };

  const filteredData = pgData.filter((item) =>
    Object.values(item).some(
      (value) => value && value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const columns = [
    {
      name: 'User ID',
      selector: (row) => row.userId,
      sortable: true,
      cell: (row) => (
        <div>
          {row.userId}
          <FaCopy
            style={{ cursor: 'pointer', marginLeft: '10px' }}
            onClick={() => handleCopy(row.userId)}
          />
        </div>
      )
    },
    { name: 'PG Number', selector: (row) => row.number || '-', sortable: true },
    { name: 'Max Customers', selector: (row) => row.maxCustomers || '-', sortable: true },
    { name: 'Owner Name', selector: (row) => row.ownerName || '-', sortable: true },
    { name: 'Owner Email', selector: (row) => row.ownerEmail || '-', sortable: true },
    { name: 'PG Name', selector: (row) => row.name || '-', sortable: true },
    { name: 'Address', selector: (row) => row.address || '-', sortable: true },
    { name: 'Mobile', selector: (row) => row.mobile || '-', sortable: true },
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
          defaultSortField="userId"
          customStyles={customStyles}
          noDataComponent={<CustomNoDataComponent />}
        />
      </div>
      {showSnackbar && (
        <CustomSnackbar
          message={snackbarMessage}
          duration={3000}
          onClose={() => setShowSnackbar(false)}
        />
      )}
    </div>
  );
};

export default PgTable;
