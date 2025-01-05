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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Cancel as CancelIcon,
  VideoCall as VideoCallIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import axios from 'axios';

const ConferenceScheduling = () => {
  const [conferences, setConferences] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [formData, setFormData] = useState({
    teacher_id: '',
    parent_id: '',
    student_id: '',
    title: '',
    description: '',
    date: null,
    duration: 30,
    meeting_link: '',
    location: '',
  });

  useEffect(() => {
    fetchConferences();
    fetchUsers();
  }, []);

  const fetchConferences = async () => {
    try {
      const response = await axios.get('/api/communication/conferences');
      setConferences(response.data);
    } catch (error) {
      console.error('Error fetching conferences:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const teachersRes = await axios.get('/api/users?role=teacher');
      const studentsRes = await axios.get('/api/users?role=student');
      const parentsRes = await axios.get('/api/users?role=parent');
      
      setTeachers(teachersRes.data);
      setStudents(studentsRes.data);
      setParents(parentsRes.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      if (formData.id) {
        await axios.put(`/api/communication/conferences/${formData.id}`, formData);
      } else {
        await axios.post('/api/communication/conferences', formData);
      }
      setOpenDialog(false);
      resetForm();
      fetchConferences();
    } catch (error) {
      console.error('Error saving conference:', error);
    }
  };

  const handleCancel = async (conference) => {
    try {
      await axios.put(`/api/communication/conferences/${conference.id}`, {
        ...conference,
        status: 'cancelled',
      });
      fetchConferences();
    } catch (error) {
      console.error('Error cancelling conference:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      teacher_id: '',
      parent_id: '',
      student_id: '',
      title: '',
      description: '',
      date: null,
      duration: 30,
      meeting_link: '',
      location: '',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Parent-Teacher Conferences
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Schedule Conference
        </Button>
      </Box>

      <Grid container spacing={3}>
        {conferences.map((conference) => (
          <Grid item xs={12} md={6} key={conference.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{conference.title}</Typography>
                  <Chip
                    label={conference.status}
                    color={getStatusColor(conference.status)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {new Date(conference.date).toLocaleString()}
                  {' • '}
                  {conference.duration} minutes
                </Typography>

                <Typography variant="body2" gutterBottom>
                  Teacher: {conference.teacher_name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Parent: {conference.parent_name}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Student: {conference.student_name}
                </Typography>

                {conference.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {conference.description}
                  </Typography>
                )}

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  {conference.meeting_link && (
                    <Chip
                      icon={<VideoCallIcon />}
                      label="Virtual Meeting"
                      component="a"
                      href={conference.meeting_link}
                      target="_blank"
                      clickable
                    />
                  )}
                  {conference.location && (
                    <Chip
                      icon={<LocationIcon />}
                      label={conference.location}
                    />
                  )}
                </Box>

                {conference.status === 'scheduled' && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => {
                        setFormData(conference);
                        setOpenDialog(true);
                      }}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleCancel(conference)}
                      size="small"
                      color="error"
                    >
                      <CancelIcon />
                    </IconButton>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {formData.id ? 'Edit Conference' : 'Schedule Conference'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Teacher</InputLabel>
                <Select
                  value={formData.teacher_id}
                  label="Teacher"
                  onChange={(e) =>
                    setFormData({ ...formData, teacher_id: e.target.value })
                  }
                >
                  {teachers.map((teacher) => (
                    <MenuItem key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Parent</InputLabel>
                <Select
                  value={formData.parent_id}
                  label="Parent"
                  onChange={(e) =>
                    setFormData({ ...formData, parent_id: e.target.value })
                  }
                >
                  {parents.map((parent) => (
                    <MenuItem key={parent.id} value={parent.id}>
                      {parent.first_name} {parent.last_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
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
              <DateTimePicker
                label="Date & Time"
                value={formData.date}
                onChange={(date) => setFormData({ ...formData, date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Duration (minutes)"
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Meeting Link (for virtual meetings)"
                value={formData.meeting_link}
                onChange={(e) =>
                  setFormData({ ...formData, meeting_link: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location (for in-person meetings)"
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
            {formData.id ? 'Update' : 'Schedule'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConferenceScheduling;
