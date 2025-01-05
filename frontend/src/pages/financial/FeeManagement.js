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
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const FeeManagement = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'yearly',
    category: 'tuition',
    grade_level: '',
    academic_year: '',
  });

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      const response = await fetch('/api/financial/fee-structure', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setFeeStructures(data);
    } catch (error) {
      console.error('Error fetching fee structures:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/financial/fee-structure', {
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
        fetchFeeStructures();
      }
    } catch (error) {
      console.error('Error creating fee structure:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      frequency: 'yearly',
      category: 'tuition',
      grade_level: '',
      academic_year: '',
    });
    setSelectedFee(null);
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Fee Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Fee Structure
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Frequency</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Grade Level</TableCell>
              <TableCell>Academic Year</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feeStructures.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell>{fee.name}</TableCell>
                <TableCell>${fee.amount}</TableCell>
                <TableCell>{fee.frequency}</TableCell>
                <TableCell>{fee.category}</TableCell>
                <TableCell>{fee.grade_level || 'All'}</TableCell>
                <TableCell>{fee.academic_year}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedFee(fee);
                      setFormData(fee);
                      setOpenDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedFee ? 'Edit Fee Structure' : 'Add Fee Structure'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
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
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={formData.frequency}
                  label="Frequency"
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                >
                  <MenuItem value="yearly">Yearly</MenuItem>
                  <MenuItem value="term">Term</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  <MenuItem value="tuition">Tuition</MenuItem>
                  <MenuItem value="transport">Transport</MenuItem>
                  <MenuItem value="library">Library</MenuItem>
                  <MenuItem value="laboratory">Laboratory</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Grade Level"
                value={formData.grade_level}
                onChange={(e) =>
                  setFormData({ ...formData, grade_level: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Academic Year"
                value={formData.academic_year}
                onChange={(e) =>
                  setFormData({ ...formData, academic_year: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedFee ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FeeManagement;
