import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Payment as PaymentIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentFees, setStudentFees] = useState([]);
  const [formData, setFormData] = useState({
    student_fee_id: '',
    amount: '',
    payment_method: 'card',
    notes: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchStudentFees();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/financial/payments', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchStudentFees = async () => {
    try {
      const response = await fetch('/api/financial/student-fees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setStudentFees(data);
    } catch (error) {
      console.error('Error fetching student fees:', error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/financial/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setOpenDialog(false);
        resetForm();
        fetchPayments();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      student_fee_id: '',
      amount: '',
      payment_method: 'card',
      notes: '',
    });
  };

  // Calculate total payments and pending amount
  const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalPending = studentFees.reduce(
    (sum, fee) => sum + (fee.amount_due - fee.amount_paid),
    0
  );

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Payment Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<PaymentIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Process Payment
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Payments Received
              </Typography>
              <Typography variant="h4" color="primary">
                ${totalPayments.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Pending Amount
              </Typography>
              <Typography variant="h4" color="error">
                ${totalPending.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Payment Date</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment Method</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Transaction ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {new Date(payment.payment_date).toLocaleDateString()}
                </TableCell>
                <TableCell>{payment.student_name}</TableCell>
                <TableCell>${payment.amount}</TableCell>
                <TableCell>{payment.payment_method}</TableCell>
                <TableCell>{payment.status}</TableCell>
                <TableCell>{payment.transaction_id}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Student Fee</InputLabel>
                <Select
                  value={formData.student_fee_id}
                  label="Student Fee"
                  onChange={(e) =>
                    setFormData({ ...formData, student_fee_id: e.target.value })
                  }
                >
                  {studentFees.map((fee) => (
                    <MenuItem key={fee.id} value={fee.id}>
                      {fee.student_name} - ${fee.amount_due} ({fee.status})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={formData.payment_method}
                  label="Payment Method"
                  onChange={(e) =>
                    setFormData({ ...formData, payment_method: e.target.value })
                  }
                >
                  <MenuItem value="card">Card</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <LoadingButton
            loading={loading}
            onClick={handleSubmit}
            variant="contained"
            startIcon={<PaymentIcon />}
          >
            Process Payment
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentManagement;
