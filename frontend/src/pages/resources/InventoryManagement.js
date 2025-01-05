import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SwapHoriz as TransactionIcon,
  Build as MaintenanceIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const InventoryManagement = () => {
  const [items, setItems] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openTransactionDialog, setOpenTransactionDialog] = useState(false);
  const [openMaintenanceDialog, setOpenMaintenanceDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    quantity: 0,
    unit: '',
    minimum_quantity: 0,
    location: '',
    supplier: '',
    unit_cost: '',
  });
  const [transactionData, setTransactionData] = useState({
    item_id: '',
    transaction_type: 'in',
    quantity: '',
    department: '',
    purpose: '',
    notes: '',
  });
  const [maintenanceData, setMaintenanceData] = useState({
    item_id: '',
    maintenance_type: '',
    description: '',
    cost: '',
    performed_by: '',
    next_maintenance_date: null,
    notes: '',
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await fetch('/api/resources/inventory', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/resources/inventory', {
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
        fetchInventory();
      }
    } catch (error) {
      console.error('Error creating inventory item:', error);
    }
  };

  const handleTransaction = async () => {
    try {
      const response = await fetch('/api/resources/inventory/transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(transactionData),
      });
      if (response.ok) {
        setOpenTransactionDialog(false);
        resetTransactionForm();
        fetchInventory();
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleMaintenance = async () => {
    try {
      const response = await fetch('/api/resources/inventory/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(maintenanceData),
      });
      if (response.ok) {
        setOpenMaintenanceDialog(false);
        resetMaintenanceForm();
        fetchInventory();
      }
    } catch (error) {
      console.error('Error creating maintenance record:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      quantity: 0,
      unit: '',
      minimum_quantity: 0,
      location: '',
      supplier: '',
      unit_cost: '',
    });
    setSelectedItem(null);
  };

  const resetTransactionForm = () => {
    setTransactionData({
      item_id: '',
      transaction_type: 'in',
      quantity: '',
      department: '',
      purpose: '',
      notes: '',
    });
  };

  const resetMaintenanceForm = () => {
    setMaintenanceData({
      item_id: '',
      maintenance_type: '',
      description: '',
      cost: '',
      performed_by: '',
      next_maintenance_date: null,
      notes: '',
    });
  };

  // Calculate summary statistics
  const totalItems = items.length;
  const lowStockItems = items.filter(
    (item) => item.quantity <= item.minimum_quantity
  ).length;
  const totalValue = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_cost,
    0
  );

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Inventory Management
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Items
                </Typography>
                <Typography variant="h4">{totalItems}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Low Stock Items
                </Typography>
                <Typography variant="h4" color="error">
                  {lowStockItems}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Value
                </Typography>
                <Typography variant="h4">${totalValue.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Item
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Chip label={item.category} size="small" />
                </TableCell>
                <TableCell>
                  {item.quantity} {item.unit}
                  {item.quantity <= item.minimum_quantity && (
                    <WarningIcon color="error" sx={{ ml: 1 }} />
                  )}
                </TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <Chip
                    label={item.status}
                    color={
                      item.status === 'active'
                        ? 'success'
                        : item.status === 'low_stock'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedItem(item);
                      setFormData(item);
                      setOpenDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setTransactionData({ ...transactionData, item_id: item.id });
                      setOpenTransactionDialog(true);
                    }}
                  >
                    <TransactionIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setMaintenanceData({ ...maintenanceData, item_id: item.id });
                      setOpenMaintenanceDialog(true);
                    }}
                  >
                    <MaintenanceIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Item Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit Item' : 'Add Item'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
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
                  <MenuItem value="equipment">Equipment</MenuItem>
                  <MenuItem value="supplies">Supplies</MenuItem>
                  <MenuItem value="furniture">Furniture</MenuItem>
                  <MenuItem value="electronics">Electronics</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Minimum Quantity"
                type="number"
                value={formData.minimum_quantity}
                onChange={(e) =>
                  setFormData({ ...formData, minimum_quantity: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Supplier"
                value={formData.supplier}
                onChange={(e) =>
                  setFormData({ ...formData, supplier: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit Cost"
                type="number"
                value={formData.unit_cost}
                onChange={(e) =>
                  setFormData({ ...formData, unit_cost: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog
        open={openTransactionDialog}
        onClose={() => setOpenTransactionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={transactionData.transaction_type}
                  label="Transaction Type"
                  onChange={(e) =>
                    setTransactionData({
                      ...transactionData,
                      transaction_type: e.target.value,
                    })
                  }
                >
                  <MenuItem value="in">Stock In</MenuItem>
                  <MenuItem value="out">Stock Out</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={transactionData.quantity}
                onChange={(e) =>
                  setTransactionData({
                    ...transactionData,
                    quantity: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Department"
                value={transactionData.department}
                onChange={(e) =>
                  setTransactionData({
                    ...transactionData,
                    department: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose"
                value={transactionData.purpose}
                onChange={(e) =>
                  setTransactionData({
                    ...transactionData,
                    purpose: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={transactionData.notes}
                onChange={(e) =>
                  setTransactionData({
                    ...transactionData,
                    notes: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransactionDialog(false)}>Cancel</Button>
          <Button onClick={handleTransaction} variant="contained">
            Record Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Maintenance Dialog */}
      <Dialog
        open={openMaintenanceDialog}
        onClose={() => setOpenMaintenanceDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Maintenance</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Maintenance Type</InputLabel>
                <Select
                  value={maintenanceData.maintenance_type}
                  label="Maintenance Type"
                  onChange={(e) =>
                    setMaintenanceData({
                      ...maintenanceData,
                      maintenance_type: e.target.value,
                    })
                  }
                >
                  <MenuItem value="repair">Repair</MenuItem>
                  <MenuItem value="inspection">Inspection</MenuItem>
                  <MenuItem value="cleaning">Cleaning</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={maintenanceData.description}
                onChange={(e) =>
                  setMaintenanceData({
                    ...maintenanceData,
                    description: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                value={maintenanceData.cost}
                onChange={(e) =>
                  setMaintenanceData({
                    ...maintenanceData,
                    cost: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Performed By"
                value={maintenanceData.performed_by}
                onChange={(e) =>
                  setMaintenanceData({
                    ...maintenanceData,
                    performed_by: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                label="Next Maintenance Date"
                value={maintenanceData.next_maintenance_date}
                onChange={(date) =>
                  setMaintenanceData({
                    ...maintenanceData,
                    next_maintenance_date: date,
                  })
                }
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={maintenanceData.notes}
                onChange={(e) =>
                  setMaintenanceData({
                    ...maintenanceData,
                    notes: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMaintenanceDialog(false)}>Cancel</Button>
          <Button onClick={handleMaintenance} variant="contained">
            Record Maintenance
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default InventoryManagement;
