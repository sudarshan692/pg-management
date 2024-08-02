import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import './pgDetailsDialog.css'; // Add styles for the dialog

const PgDetailsDialog = ({ onClose, onSave }) => {
  const [details, setDetails] = useState({
    totalFloors: '',
    totalRoomsPerFloor: '',
    totalSingleBeds: '',
    totalDoubleSharingBeds: '',
    totalTripleSharingBeds: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Convert details to numbers before saving
    const convertedDetails = Object.keys(details).reduce((acc, key) => {
      acc[key] = details[key] === '' ? 0 : Number(details[key]);
      return acc;
    }, {});
    onSave(convertedDetails);
  };

  return (
    <div className="pg-details-dialog">
      <h2 className='pg-details-heading'>PG Details</h2>
      <TextField
        label="Total Floors"
        name="totalFloors"
        type="number"
        value={details.totalFloors}
        onChange={handleChange}
        fullWidth
        margin="normal"
        className='text-input-field'
      />
      <TextField
        label="Total Rooms Per Floor"
        name="totalRoomsPerFloor"
        type="number"
        value={details.totalRoomsPerFloor}
        onChange={handleChange}
        fullWidth
        margin="normal"
        className='text-input-field'
      />
      <TextField
        label="Total Single Beds"
        name="totalSingleBeds"
        type="number"
        value={details.totalSingleBeds}
        onChange={handleChange}
        fullWidth
        margin="normal"
        className='text-input-field'
      />
      <TextField
        label="Total Double Sharing Beds"
        name="totalDoubleSharingBeds"
        type="number"
        value={details.totalDoubleSharingBeds}
        onChange={handleChange}
        fullWidth
        margin="normal"
        className='text-input-field'
      />
      <TextField
        label="Total Triple Sharing Beds"
        name="totalTripleSharingBeds"
        type="number"
        value={details.totalTripleSharingBeds}
        onChange={handleChange}
        fullWidth
        margin="normal"
        className='text-input-field'
      />
      <div className="dialog-buttons">
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PgDetailsDialog;
