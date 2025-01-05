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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Book as BookIcon,
  SwapHoriz as LendIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const LibraryManagement = () => {
  const [books, setBooks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openLendingDialog, setOpenLendingDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publication_year: '',
    category: '',
    subject: '',
    description: '',
    total_copies: 1,
    location: '',
  });
  const [lendingData, setLendingData] = useState({
    book_id: '',
    user_id: '',
    due_date: null,
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/resources/books', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(`/api/resources/books?search=${searchTerm}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error searching books:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/resources/books', {
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
        fetchBooks();
      }
    } catch (error) {
      console.error('Error creating book:', error);
    }
  };

  const handleLendBook = async () => {
    try {
      const response = await fetch('/api/resources/books/lending', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(lendingData),
      });
      if (response.ok) {
        setOpenLendingDialog(false);
        resetLendingForm();
        fetchBooks();
      }
    } catch (error) {
      console.error('Error lending book:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      publication_year: '',
      category: '',
      subject: '',
      description: '',
      total_copies: 1,
      location: '',
    });
    setSelectedBook(null);
  };

  const resetLendingForm = () => {
    setLendingData({
      book_id: '',
      user_id: '',
      due_date: null,
    });
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Library Management
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={8}>
            <TextField
              fullWidth
              label="Search books"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
              fullWidth
            >
              Add Book
            </Button>
          </Grid>
        </Grid>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>ISBN</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Available Copies</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.isbn}</TableCell>
                <TableCell>
                  <Chip label={book.category} size="small" />
                </TableCell>
                <TableCell>
                  {book.available_copies} / {book.total_copies}
                </TableCell>
                <TableCell>{book.location}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedBook(book);
                      setFormData(book);
                      setOpenDialog(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setLendingData({ ...lendingData, book_id: book.id });
                      setOpenLendingDialog(true);
                    }}
                    disabled={book.available_copies <= 0}
                  >
                    <LendIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Book Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedBook ? 'Edit Book' : 'Add Book'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Author"
                value={formData.author}
                onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ISBN"
                value={formData.isbn}
                onChange={(e) =>
                  setFormData({ ...formData, isbn: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Publisher"
                value={formData.publisher}
                onChange={(e) =>
                  setFormData({ ...formData, publisher: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Publication Year"
                type="number"
                value={formData.publication_year}
                onChange={(e) =>
                  setFormData({ ...formData, publication_year: e.target.value })
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
                  <MenuItem value="fiction">Fiction</MenuItem>
                  <MenuItem value="non-fiction">Non-Fiction</MenuItem>
                  <MenuItem value="textbook">Textbook</MenuItem>
                  <MenuItem value="reference">Reference</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Copies"
                type="number"
                value={formData.total_copies}
                onChange={(e) =>
                  setFormData({ ...formData, total_copies: e.target.value })
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
            {selectedBook ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lending Dialog */}
      <Dialog
        open={openLendingDialog}
        onClose={() => setOpenLendingDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Lend Book</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="User ID"
                value={lendingData.user_id}
                onChange={(e) =>
                  setLendingData({ ...lendingData, user_id: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                label="Due Date"
                value={lendingData.due_date}
                onChange={(date) =>
                  setLendingData({ ...lendingData, due_date: date })
                }
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLendingDialog(false)}>Cancel</Button>
          <Button onClick={handleLendBook} variant="contained">
            Lend Book
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default LibraryManagement;
