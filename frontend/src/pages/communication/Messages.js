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
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Mail as MailIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const Messages = () => {
  const [tab, setTab] = useState(0);
  const [messages, setMessages] = useState([]);
  const [openCompose, setOpenCompose] = useState(false);
  const [messageForm, setMessageForm] = useState({
    recipient_id: '',
    subject: '',
    content: '',
  });

  useEffect(() => {
    fetchMessages();
  }, [tab]);

  const fetchMessages = async () => {
    try {
      const endpoint = tab === 0 ? '/api/communication/messages/inbox' : '/api/communication/messages/sent';
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    try {
      const response = await fetch('/api/communication/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(messageForm),
      });
      if (response.ok) {
        setOpenCompose(false);
        setMessageForm({ recipient_id: '', subject: '', content: '' });
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await fetch(`/api/communication/messages/${messageId}/read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Messages
        </Typography>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Inbox" />
            <Tab label="Sent" />
          </Tabs>
        </Paper>
      </Box>

      <Paper>
        <List>
          {messages.map((message) => (
            <React.Fragment key={message.id}>
              <ListItem
                button
                onClick={() => !message.read && handleMarkAsRead(message.id)}
                sx={{
                  backgroundColor: message.read ? 'inherit' : 'action.hover',
                }}
              >
                <ListItemAvatar>
                  <Avatar>
                    <MailIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={message.subject || '(No Subject)'}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {tab === 0 ? message.sender_name : message.recipient_name}
                      </Typography>
                      {' — '}{message.content}
                    </>
                  }
                />
                <Typography variant="caption" color="text.secondary">
                  {new Date(message.created_at).toLocaleString()}
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
        <DialogTitle>Compose Message</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Recipient ID"
            type="text"
            fullWidth
            value={messageForm.recipient_id}
            onChange={(e) =>
              setMessageForm({ ...messageForm, recipient_id: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Subject"
            type="text"
            fullWidth
            value={messageForm.subject}
            onChange={(e) =>
              setMessageForm({ ...messageForm, subject: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Message"
            multiline
            rows={4}
            fullWidth
            value={messageForm.content}
            onChange={(e) =>
              setMessageForm({ ...messageForm, content: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompose(false)}>Cancel</Button>
          <Button onClick={handleSendMessage} variant="contained" startIcon={<SendIcon />}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Messages;
