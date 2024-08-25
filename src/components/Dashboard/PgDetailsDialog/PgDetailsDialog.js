import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';
import './pgDetailsDialog.css';

const PgDetailsDialog = ({ onClose, onSave }) => {
  const [details, setDetails] = useState({
    totalFloors: '',
    totalRoomsPerFloor: '',
    singleBedsPerRoom: '',
    doubleSharingBedsPerRoom: '',
    tripleSharingBedsPerRoom: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Convert details to numbers before saving
    const convertedDetails = Object.keys(details).reduce((acc, key) => {
      acc[key] = details[key] === '' ? -1 : Number(details[key]);
      return acc;
    }, {});

    try {
      await onSave(convertedDetails);
    } catch (error) {
      console.error('Error saving details:', error);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <div className="pg-details-overlay">
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
          label="Single Beds Per Room"
          name="singleBedsPerRoom"
          type="number"
          value={details.singleBedsPerRoom}
          onChange={handleChange}
          fullWidth
          margin="normal"
          className='text-input-field'
        />
        <TextField
          label="Double Sharing Beds Per Room"
          name="doubleSharingBedsPerRoom"
          type="number"
          value={details.doubleSharingBedsPerRoom}
          onChange={handleChange}
          fullWidth
          margin="normal"
          className='text-input-field'
        />
        <TextField
          label="Triple Sharing Beds Per Room"
          name="tripleSharingBedsPerRoom"
          type="number"
          value={details.tripleSharingBedsPerRoom}
          onChange={handleChange}
          fullWidth
          margin="normal"
          className='text-input-field'
        />
        <div className="dialog-buttons">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave} 
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PgDetailsDialog;
