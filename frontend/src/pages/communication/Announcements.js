import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Announcement as AnnouncementIcon,
} from '@mui/icons-material';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [openCompose, setOpenCompose] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    target_role: 'all',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/communication/announcements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      const response = await fetch('/api/communication/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(announcementForm),
      });
      if (response.ok) {
        setOpenCompose(false);
        setAnnouncementForm({
          title: '',
          content: '',
          target_role: 'all',
        });
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Announcements
        </Typography>
      </Box>

      <Paper>
        <List>
          {announcements.map((announcement) => (
            <React.Fragment key={announcement.id}>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <AnnouncementIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={announcement.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {announcement.sender_name}
                      </Typography>
                      {' — '}{announcement.content}
                      <br />
                      <Typography component="span" variant="caption" color="text.secondary">
                        Target: {announcement.target_role}
                      </Typography>
                    </>
                  }
                />
                <Typography variant="caption" color="text.secondary">
                  {new Date(announcement.created_at).toLocaleString()}
                </Typography>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
      </Paper>

      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setOpenCompose(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog open={openCompose} onClose={() => setOpenCompose(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Announcement</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            value={announcementForm.title}
            onChange={(e) =>
              setAnnouncementForm({ ...announcementForm, title: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Content"
            multiline
            rows={4}
            fullWidth
            value={announcementForm.content}
            onChange={(e) =>
              setAnnouncementForm({ ...announcementForm, content: e.target.value })
            }
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Target Audience</InputLabel>
            <Select
              value={announcementForm.target_role}
              onChange={(e) =>
                setAnnouncementForm({
                  ...announcementForm,
                  target_role: e.target.value,
                })
              }
              label="Target Audience"
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="teachers">Teachers</MenuItem>
              <MenuItem value="students">Students</MenuItem>
              <MenuItem value="parents">Parents</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompose(false)}>Cancel</Button>
          <Button onClick={handleCreateAnnouncement} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Announcements;
