import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Snackbar, Alert} from '@mui/material';
import { auth } from '../../shared/firebase';
import firebase from 'firebase/compat/app';
import LoadingSpinner from '../../shared/LoadingSpinner';
import './changePasswordDialog.css'; // Import the CSS for styling

const ChangePasswordDialog = ({ open, onClose, handleLogout }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleChangePassword = async () => {
    if (currentPassword.trim() === '' || newPassword.trim() === '') {
      setSnackbarMessage('Please fill in both fields.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User is not authenticated.');
      }

      const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPassword);

      setSnackbarMessage('Password updated successfully.');
      setSnackbarSeverity('success');
      handleLogout();
      // You might want to refresh or update the UI accordingly
      onClose(); // Close the dialog
    } catch (error) {
      console.error('Error updating password:', error);
      let errorMessage = 'Error updating password: ' + error.message;

      if (error.code === 'auth/wrong-password') {
        errorMessage = 'The current password is incorrect.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'The new password is too weak.';
      }

      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Dialog open={open} onClose={onClose} className="change-password-dialog">
      <DialogTitle className='dialog-title'>Change Password</DialogTitle>
      <DialogContent>
        {loading && <div className="loading-overlay"><LoadingSpinner /></div>}
        <TextField
          margin="normal"
          fullWidth
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <TextField
          margin="normal"
          fullWidth
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Cancel</Button>
        <Button onClick={handleChangePassword} color="primary">Change Password</Button>
      </DialogActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        className="snackbar"
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default ChangePasswordDialog;
