import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { FaCopy, FaArrowUp, FaEdit, FaTrash } from 'react-icons/fa';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import './pgTable.css';
import EditDialog from '../AdminDashboard/EditDialog/EditDialog';
import DeleteDialog from '../AdminDashboard/DeleteDialog/DeleteDialog';
import { db } from '../shared/firebase'; // Import Firestore database

const CustomNoDataComponent = () => (
  <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#162c46', color: 'rgb(211, 227, 253)', width: '100%' }}>
    There are no records to display.
  </div>
);

const PgTable = ({ pgData, updatePgData }) => {
  const [searchText, setSearchText] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteData, setDeleteData] = useState(null);

  console.log("PG Data:", pgData);

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const handleCopy = (userId) => {
    navigator.clipboard.writeText(userId);
    setSnackbarMessage(`Copied User ID: ${userId}`);
    setSnackbarSeverity('success');
    setShowSnackbar(true);
  };

  const filteredData = pgData.filter((item) =>
    Object.values(item).some(
      (value) => value && value.toString().toLowerCase().includes(searchText.toLowerCase())
    )
  );

  const handleEdit = (row) => {
    setEditData(row);
  };

  const handleDelete = (row) => {
    setDeleteData(row);
  };

  const handleEditSave = async (updatedData) => {
    try {
      const { userId, ...pgDetails } = updatedData;
      const pgRef = db.collection(`users/${userId}/PGs`).doc(updatedData.id);
      await pgRef.update({ PGDetails: pgDetails });
  
      // Log the updated data
      console.log("Data updated successfully:", { id: updatedData.id, ...pgDetails });
  
      // Use the updatePgData function passed as a prop
      updatePgData({ id: updatedData.id, action: 'update', updatedData: pgDetails });
  
      setSnackbarMessage('Data updated successfully');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error updating data:', error.message);
      setSnackbarMessage('Error updating data');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setEditData(null);
    }
  };
  

  const deleteCollection = async (collectionRef) => {
    const snapshot = await collectionRef.get();
    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  };

  const handleDeleteConfirm = async () => {
    try {
      const pgRef = db.collection(`users/${deleteData.userId}/PGs`).doc(deleteData.id);
      const customerDataRef = pgRef.collection('CustomerData');
  
      await deleteCollection(customerDataRef); // Delete CustomerData collection first
      await pgRef.delete(); // Then delete the PG document itself
  
      console.log('Deleting Data:', deleteData);
  
      // Use the updatePgData function passed as a prop to remove the deleted item
      updatePgData({ id: deleteData.id, action: 'delete' });
  
      setSnackbarMessage('Data deleted successfully');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error deleting data:', error.message);
      setSnackbarMessage('Error deleting data');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    } finally {
      setDeleteData(null);
    }
  };
  

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
    {
      name: 'Actions',
      cell: (row) => (
        <div>
          <FaEdit
            style={{ cursor: 'pointer', marginRight: '15px', width: '15px', height: '15px' }}
            onClick={() => handleEdit(row)}
          />
          <FaTrash
            style={{ cursor: 'pointer', color: 'red', width: '15px', height: '15px' }}
            onClick={() => handleDelete(row)}
          />
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
          defaultSortField="userId"
          customStyles={customStyles}
          noDataComponent={<CustomNoDataComponent />}
        />
      </div>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowSnackbar(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      {editData && (
        <EditDialog
          data={editData}
          onClose={() => setEditData(null)}
          onSave={handleEditSave}
        />
      )}
      {deleteData && (
        <DeleteDialog
          data={deleteData}
          onClose={() => setDeleteData(null)}
          onDelete={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default PgTable;
