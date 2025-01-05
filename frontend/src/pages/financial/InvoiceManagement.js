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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    student_id: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    items: [],
  });
  const [itemForm, setItemForm] = useState({
    description: '',
    amount: '',
    quantity: 1,
  });

  useEffect(() => {
    fetchInvoices();
    fetchStudents();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/financial/invoices', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/users/students', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          ...itemForm,
          amount: parseFloat(itemForm.amount),
          quantity: parseInt(itemForm.quantity),
        },
      ],
    });
    setItemForm({
      description: '',
      amount: '',
      quantity: 1,
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/financial/invoices', {
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
        fetchInvoices();
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: '',
      notes: '',
      items: [],
    });
    setItemForm({
      description: '',
      amount: '',
      quantity: 1,
    });
  };

  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.amount * item.quantity, 0);
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Invoice Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Create Invoice
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Invoice Number</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Issue Date</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell>{invoice.invoice_number}</TableCell>
                <TableCell>{invoice.student_name}</TableCell>
                <TableCell>
                  {new Date(invoice.issue_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(invoice.due_date).toLocaleDateString()}
                </TableCell>
                <TableCell>${invoice.total_amount}</TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell>
                  <IconButton>
                    <PrintIcon />
                  </IconButton>
                  <IconButton>
                    <EmailIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Student</InputLabel>
                <Select
                  value={formData.student_id}
                  label="Student"
                  onChange={(e) =>
                    setFormData({ ...formData, student_id: e.target.value })
                  }
                >
                  {students.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Issue Date"
                type="date"
                value={formData.issue_date}
                onChange={(e) =>
                  setFormData({ ...formData, issue_date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={formData.due_date}
                onChange={(e) =>
                  setFormData({ ...formData, due_date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Invoice Items
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={itemForm.description}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, description: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={itemForm.amount}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, amount: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    label="Quantity"
                    type="number"
                    value={itemForm.quantity}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, quantity: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
              <Button
                variant="outlined"
                onClick={handleAddItem}
                sx={{ mt: 2 }}
                startIcon={<AddIcon />}
              >
                Add Item
              </Button>
            </Grid>
            <Grid item xs={12}>
              <List>
                {formData.items.map((item, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={item.description}
                      secondary={`$${item.amount} x ${item.quantity} = $${
                        item.amount * item.quantity
                      }`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Typography variant="h6" align="right">
                Total: ${calculateTotal(formData.items)}
              </Typography>
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
          <Button onClick={handleSubmit} variant="contained">
            Create Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InvoiceManagement;
