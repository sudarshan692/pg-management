import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import './confirmDeleteDialog.css';

const ConfirmDeleteDialog = ({ open, onClose, onConfirm, loading }) => {
  return (
    <>
      {open && <div className="confirm-delete-overlay"></div>}
      <Dialog className='delete-dialog' open={open} onClose={onClose} classes={{ paper: 'dialog-paper' }}>
        <DialogTitle className="dialog-title">Confirm Delete</DialogTitle>
        <DialogContent className="dialog-content">
          <p>Are you sure you want to delete the payment details?</p>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button
            onClick={onConfirm}
            variant="contained"
            color="error"
            className="button-confirm"
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Yes'}
          </Button>
          <Button
            onClick={onClose}
            variant="outlined"
            className="button-cancel"
            disabled={loading}
          >
            No
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConfirmDeleteDialog;
