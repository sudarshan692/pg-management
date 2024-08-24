import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import './editDialog.css';

const EditDialog = ({ data, onClose, onSave }) => {
  const [formData, setFormData] = useState(data);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Check if the field is numeric and convert to number if true
    if (['maxCustomers', 'mobile', 'totalFloors', 'totalRoomsPerFloor', 'singleBedsPerRoom', 'doubleSharingBedsPerRoom', 'tripleSharingBedsPerRoom'].includes(name)) {
      setFormData({ ...formData, [name]: value ? parseInt(value, 10) : '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = () => {
    // Convert necessary fields to numbers before saving
    const numericFields = [
      'maxCustomers',
      'mobile',
      'totalFloors',
      'totalRoomsPerFloor',
      'singleBedsPerRoom',
      'doubleSharingBedsPerRoom',
      'tripleSharingBedsPerRoom',
    ];

    // Create a copy of formData to modify
    const updatedFormData = { ...formData };

    // Convert string values to numbers for numeric fields
    numericFields.forEach((field) => {
      if (updatedFormData[field] !== '') {
        updatedFormData[field] = parseInt(updatedFormData[field], 10);
      }
    });

    // Call the onSave function with updatedFormData
    onSave(updatedFormData);
  };

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>Edit PG Data</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="PG Number"
          name="number"
          value={formData.number}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          type="number"
          margin="dense"
          label="Max Customers"
          name="maxCustomers"
          value={formData.maxCustomers}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Owner Name"
          name="ownerName"
          value={formData.ownerName}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Owner Email"
          name="ownerEmail"
          value={formData.ownerEmail}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="PG Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          type="number"
          margin="dense"
          label="Mobile"
          name="mobile"
          value={formData.mobile}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          type="number"
          margin="dense"
          label="Total Floors"
          name="totalFloors"
          value={formData.totalFloors}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          type="number"
          margin="dense"
          label="Total Rooms/Floor"
          name="totalRoomsPerFloor"
          value={formData.totalRoomsPerFloor}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          type="number"
          margin="dense"
          label="Single Bed/Room"
          name="singleBedsPerRoom"
          value={formData.singleBedsPerRoom}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          type="number"
          margin="dense"
          label="Double Sharing Beds/Room"
          name="doubleSharingBedsPerRoom"
          value={formData.doubleSharingBedsPerRoom}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          type="number"
          margin="dense"
          label="Triple Sharing Beds/Room"
          name="tripleSharingBedsPerRoom"
          value={formData.tripleSharingBedsPerRoom}
          onChange={handleChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDialog;
