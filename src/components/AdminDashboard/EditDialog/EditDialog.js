import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';
import './editDialog.css';

const EditDialog = ({ data, onClose, onSave }) => {
  const [formData, setFormData] = useState(data);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    onSave(formData);
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
          margin="dense"
          label="Mobile"
          name="mobile"
          value={formData.mobile}
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
