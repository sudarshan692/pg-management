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
import LoadingSpinner from "../../shared/LoadingSpinner";

const AddPaymentDialog = ({ isOpen, onRequestClose, selectedGuest, selectedPGId, onSnackbarOpen, onPaymentUpdate }) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const [paymentAmount, setPaymentAmount] = useState('');
    const [remainingAmount, setRemainingAmount] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('Complete');
    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [loading, setLoading] = useState(false);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsOptions = [currentMonth, previousMonth];
    const yearsOptions = [currentYear, previousYear];

    const handleSave = async () => {
        if (paymentStatus !== 'Not Paid' && !paymentAmount) {
            onSnackbarOpen("Please enter a payment amount.", "error");
            return;
        }
        if (!selectedGuest.id || !selectedPGId) {
            onSnackbarOpen("Please ensure IDs are valid.", "error");
            return;
        }
        setLoading(true);
        try {
            const paymentId = uuidv4(); // Generate a unique ID for the payment
            const guestRef = db.collection(`users/${auth.currentUser.uid}/PGs/${selectedPGId}/PayingGuestData`).doc(selectedGuest.id);
    
            // Retrieve the current payment details
            const guestDoc = await guestRef.get();
            const guestData = guestDoc.data();
            const currentPayments = guestData.paymentDetails || [];
    
            // Get current date and time
            const currentDate = paymentStatus === 'Not Paid' ? '' : new Date().toISOString().split('T')[0]; // Use '-' if status is Not Paid
    
            // Create a new payment detail
            const newPaymentDetail = {
                paymentId,
                paymentDate: currentDate, // Set to '-' if status is Not Paid
                paymentAmount: paymentStatus === 'Not Paid' ? '-' : parseFloat(paymentAmount), // Set to '-' if status is Not Paid
                paymentStatus: paymentStatus === 'Complete' ? 'Done' : paymentStatus === 'Partial' ? 'Partial' : 'Not Paid',
                paymentForMonth: months[month], // Store selected month
                paymentForYear: year, // Store selected year
                remainingAmount: paymentStatus !== 'Complete' ? parseFloat(remainingAmount) || 0 : 0 // Add remaining amount if not complete
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
    
            // Sort the payments by year and month
            currentPayments.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateA - dateB;
            });

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
         {loading && (<div className="overlay"> <LoadingSpinner /> </div>)}
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
                    onChange={(e) => {
                        const status = e.target.value;
                        setPaymentStatus(status);
                        if (status !== 'Complete') {
                            setRemainingAmount('');
                        }
                    }}
                    fullWidth
                    className="textfield-spacing"
                >
                    <MenuItem value="Complete">Complete</MenuItem>
                    <MenuItem value="Partial">Partial</MenuItem>
                    <MenuItem value="Not Paid">Not Paid</MenuItem>
                </TextField>
                {paymentStatus !== 'Complete' && (
                    <TextField
                        label="Remaining Amount"
                        type="number"
                        value={remainingAmount}
                        onChange={(e) => setRemainingAmount(e.target.value)}
                        fullWidth
                        className="textfield-spacing"
                    />
                )}
                <TextField
                    select
                    label="Month"
                    value={month}
                    onChange={(e) => setMonth(Number(e.target.value))}
                    fullWidth
                    className="textfield-spacing"
                >
                    {monthsOptions.map((m) => (
                        <MenuItem key={m} value={m}>
                            {months[m]}
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
                    {yearsOptions.map((y) => (
                        <MenuItem key={y} value={y}>
                            {y}
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
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button 
                    onClick={onRequestClose} 
                    variant="outlined" 
                    className="button-cancel"
                    disabled={loading}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddPaymentDialog;
