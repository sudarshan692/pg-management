import React, { useState } from "react";
import { db, auth } from "../../shared/firebase";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { v4 as uuidv4 } from 'uuid'; 
import './addPaymentDialog.css'; 

const AddPaymentDialog = ({ isOpen, onRequestClose, selectedGuest, selectedPGId, onSnackbarOpen, onPaymentUpdate }) => {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('Complete');
    const [month, setMonth] = useState(new Date().getMonth()); // Set default to current month
    const [year, setYear] = useState(new Date().getFullYear()); // Set default to current year
    const [loading, setLoading] = useState(false); // State to track loading

    // List of months and years
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const years = Array.from({ length: 27 }, (_, i) => 2024 + i); // Years from 2024 to 2050

    const handleSave = async () => {
        if (!paymentAmount || !selectedGuest.id || !selectedPGId) {
            onSnackbarOpen("Please fill in all fields and make sure IDs are valid.", "error");
            return;
        }

        setLoading(true); // Set loading to true when starting to save

        try {
            const paymentId = uuidv4(); // Generate a unique ID for the payment
            const guestRef = db.collection(`users/${auth.currentUser.uid}/PGs/${selectedPGId}/PayingGuestData`).doc(selectedGuest.id);

            // Retrieve the current payment details
            const guestDoc = await guestRef.get();
            const guestData = guestDoc.data();
            const currentPayments = guestData.paymentDetails || [];

            // Get current date and time
            const currentDate = new Date();

            // Create a new payment detail
            const newPaymentDetail = {
                paymentId,
                paymentDate: currentDate.toISOString().split('T')[0], // Current date in yyyy-mm-dd format
                paymentAmount: parseFloat(paymentAmount),
                paymentStatus: paymentStatus === 'Complete' ? 'Done' : 'Pending',
                paymentForMonth: months[month], // Store selected month
                paymentForYear: year // Store selected year
            };

            // Check if a payment already exists for the selected month and year
            const existingPaymentIndex = currentPayments.findIndex(payment => {
                // Convert Firestore Timestamp to JavaScript Date if needed
                const createdAt = payment.createdAt instanceof Date ? payment.createdAt : payment.createdAt?.toDate();
                return createdAt &&
                    createdAt.getMonth() === month &&
                    createdAt.getFullYear() === year;
            });

            if (existingPaymentIndex !== -1) {
                // Update the existing entry
                currentPayments[existingPaymentIndex] = {
                    ...currentPayments[existingPaymentIndex],
                    ...newPaymentDetail,
                    createdAt: new Date(year, month) // Update createdAt to the selected month and year
                };
            } else {
                // Add a new payment detail
                currentPayments.push({
                    ...newPaymentDetail,
                    createdAt: new Date(year, month) // Set createdAt to the first day of the selected month and year
                });
            }

            // Update the document with the new payments list
            await guestRef.update({ paymentDetails: currentPayments });
            // Notify the parent component about the payment update
            onPaymentUpdate({
                ...selectedGuest,
                paymentDetails: currentPayments
            });
            onSnackbarOpen("Payment added successfully!", "success");
            onRequestClose();
        } catch (error) {
            console.error("Error adding payment:", error);
            onSnackbarOpen("Error adding payment. Please try again.", "error");
        } finally {
            setLoading(false); // Set loading to false after operation
        }
    };

    return (
        <Dialog open={isOpen} onClose={onRequestClose} classes={{ paper: 'dialog-paper' }}>
            <DialogTitle className="dialog-title">Add Payment</DialogTitle>
            <DialogContent className="dialog-content">
                <TextField
                    label="Payment Amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    fullWidth
                    className="textfield-spacing"
                />
                <TextField
                    select
                    label="Payment Status"
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    fullWidth
                    className="textfield-spacing"
                >
                    <MenuItem value="Complete">Complete</MenuItem>
                    <MenuItem value="Partial">Partial</MenuItem>
                </TextField>
                <TextField
                    select
                    label="Month"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    fullWidth
                    className="textfield-spacing"
                >
                    {months.map((monthName, index) => (
                        <MenuItem key={index} value={index}>
                            {monthName}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    select
                    label="Year"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    fullWidth
                    className="textfield-spacing"
                >
                    {years.map((yearOption) => (
                        <MenuItem key={yearOption} value={yearOption}>
                            {yearOption}
                        </MenuItem>
                    ))}
                </TextField>
            </DialogContent>
            <DialogActions className="dialog-actions">
                <Button 
                    onClick={handleSave} 
                    variant="contained" 
                    color="primary" 
                    className="button-save"
                    disabled={loading} // Disable the button if loading
                >
                    {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                    onClick={onRequestClose} 
                    variant="outlined" 
                    className="button-cancel"
                    disabled={loading} // Optionally disable cancel button if needed
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddPaymentDialog;
