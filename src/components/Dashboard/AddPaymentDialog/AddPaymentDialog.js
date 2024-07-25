import React, { useState } from "react";
import { db, auth } from "../../shared/firebase";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { v4 as uuidv4 } from 'uuid'; 
import './addPaymentDialog.css'; 

const AddPaymentDialog = ({ isOpen, onRequestClose, selectedGuest, selectedPGId, onSnackbarOpen }) => {
    const [paymentDate, setPaymentDate] = useState('');
    const [paymentAmount, setPaymentAmount] = useState('');

    const handleSave = async () => {
        if (!paymentDate || !paymentAmount || !selectedGuest.id || !selectedPGId) {
            onSnackbarOpen("Please fill in all fields and make sure IDs are valid.", "error");
            return;
        }

        try {
            const paymentId = uuidv4(); // Generate a unique ID for the payment
            const guestRef = db.collection(`users/${auth.currentUser.uid}/PGs/${selectedPGId}/PayingGuestData`).doc(selectedGuest.id);

            // Retrieve the current payment details
            const guestDoc = await guestRef.get();
            const guestData = guestDoc.data();
            const currentPayments = guestData.paymentDetails || [];

            // Add new payment to the list
            currentPayments.push({
                paymentId,
                paymentDate,
                paymentAmount: parseFloat(paymentAmount),
            });

            // Update the document with the new payments list
            await guestRef.update({ paymentDetails: currentPayments });

            onSnackbarOpen("Payment added successfully!", "success");
            onRequestClose();
        } catch (error) {
            console.error("Error adding payment:", error);
            onSnackbarOpen("Error adding payment. Please try again.", "error");
        }
    };

    return (
        <Dialog open={isOpen} onClose={onRequestClose} classes={{ paper: 'dialog-paper' }}>
            <DialogTitle className="dialog-title">Add Payment</DialogTitle>
            <DialogContent className="dialog-content">
                <TextField
                    className="textfield-spacing"
                    label="Payment Date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Payment Amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    fullWidth
                    className="textfield-spacing"
                />
            </DialogContent>
            <DialogActions className="dialog-actions">
                <Button onClick={handleSave} variant="contained" color="primary" className="button-save">Save</Button>
                <Button onClick={onRequestClose} variant="outlined" className="button-cancel">Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddPaymentDialog;
