import React, { useState, useEffect, useRef } from 'react';
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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import axios from 'axios';

const Chat = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [openNewChatDialog, setOpenNewChatDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [newChatData, setNewChatData] = useState({
    type: 'private',
    name: '',
    participant_ids: [],
    class_id: '',
  });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchChatRooms();
    fetchUsers();
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id);
      markMessagesRead(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatRooms = async () => {
    try {
      const response = await axios.get('/api/communication/chat/rooms');
      setChatRooms(response.data);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const response = await axios.get(`/api/communication/chat/rooms/${roomId}/messages`);
      setMessages(response.data.messages.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedRoom) return;

    try {
      await axios.post(`/api/communication/chat/rooms/${selectedRoom.id}/messages`, {
        content: messageInput,
        message_type: 'text',
      });
      setMessageInput('');
      fetchMessages(selectedRoom.id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedRoom) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const uploadResponse = await axios.post('/api/upload', formData);
      await axios.post(`/api/communication/chat/rooms/${selectedRoom.id}/messages`, {
        content: file.name,
        message_type: file.type.startsWith('image/') ? 'image' : 'file',
        file_url: uploadResponse.data.url,
      });
      fetchMessages(selectedRoom.id);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleCreateChatRoom = async () => {
    try {
      await axios.post('/api/communication/chat/rooms', newChatData);
      setOpenNewChatDialog(false);
      resetNewChatForm();
      fetchChatRooms();
    } catch (error) {
      console.error('Error creating chat room:', error);
    }
  };

  const markMessagesRead = async (roomId) => {
    try {
      await axios.post(`/api/communication/chat/rooms/${roomId}/read`);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const resetNewChatForm = () => {
    setNewChatData({
      type: 'private',
      name: '',
      participant_ids: [],
      class_id: '',
    });
  };

  const getRoomIcon = (type) => {
    switch (type) {
      case 'private':
        return <PersonIcon />;
      case 'group':
        return <GroupIcon />;
      case 'class':
        return <SchoolIcon />;
      default:
        return <GroupIcon />;
    }
  };

  return (
    <Container>
      <Grid container spacing={2} sx={{ height: 'calc(100vh - 100px)' }}>
        {/* Chat Rooms List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: '100%', overflow: 'hidden' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Button
                fullWidth
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenNewChatDialog(true)}
              >
                New Chat
              </Button>
            </Box>
            <List sx={{ overflow: 'auto', height: 'calc(100% - 72px)' }}>
              {chatRooms.map((room) => (
                <ListItem
                  key={room.id}
                  button
                  selected={selectedRoom?.id === room.id}
                  onClick={() => setSelectedRoom(room)}
                >
                  <ListItemAvatar>
                    <Avatar>{getRoomIcon(room.type)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={room.name || room.participants.map(p => p.user_name).join(', ')}
                    secondary={room.last_message?.content || 'No messages yet'}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Chat Messages */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedRoom ? (
              <>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">
                    {selectedRoom.name || selectedRoom.participants.map(p => p.user_name).join(', ')}
                  </Typography>
                </Box>
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  {messages.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: message.sender_id === localStorage.getItem('user_id') ? 'flex-end' : 'flex-start',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          maxWidth: '70%',
                          bgcolor: message.sender_id === localStorage.getItem('user_id') ? 'primary.main' : 'grey.100',
                          color: message.sender_id === localStorage.getItem('user_id') ? 'white' : 'text.primary',
                          borderRadius: 2,
                          p: 1,
                        }}
                      >
                        {message.message_type === 'image' ? (
                          <img
                            src={message.file_url}
                            alt="Shared"
                            style={{ maxWidth: '100%', borderRadius: 4 }}
                          />
                        ) : message.message_type === 'file' ? (
                          <Button
                            startIcon={<AttachFileIcon />}
                            href={message.file_url}
                            target="_blank"
                            sx={{ color: 'inherit' }}
                          >
                            {message.content}
                          </Button>
                        ) : (
                          <Typography>{message.content}</Typography>
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ mt: 0.5 }}>
                        {message.sender_name} • {new Date(message.created_at).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>
                <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Grid container spacing={1}>
                    <Grid item>
                      <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                      />
                      <IconButton
                        onClick={() => fileInputRef.current.click()}
                        color="primary"
                      >
                        <AttachFileIcon />
                      </IconButton>
                    </Grid>
                    <Grid item xs>
                      <TextField
                        fullWidth
                        placeholder="Type a message"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      />
                    </Grid>
                    <Grid item>
                      <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                      >
                        <SendIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h6" color="text.secondary">
                  Select a chat to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* New Chat Dialog */}
      <Dialog open={openNewChatDialog} onClose={() => setOpenNewChatDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Chat</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Chat Type</InputLabel>
                <Select
                  value={newChatData.type}
                  label="Chat Type"
                  onChange={(e) =>
                    setNewChatData({ ...newChatData, type: e.target.value })
                  }
                >
                  <MenuItem value="private">Private Chat</MenuItem>
                  <MenuItem value="group">Group Chat</MenuItem>
                  <MenuItem value="class">Class Chat</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {newChatData.type !== 'private' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Chat Name"
                  value={newChatData.name}
                  onChange={(e) =>
                    setNewChatData({ ...newChatData, name: e.target.value })
                  }
                />
              </Grid>
            )}

            {newChatData.type === 'class' ? (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Class</InputLabel>
                  <Select
                    value={newChatData.class_id}
                    label="Class"
                    onChange={(e) =>
                      setNewChatData({ ...newChatData, class_id: e.target.value })
                    }
                  >
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ) : (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Participants</InputLabel>
                  <Select
                    multiple
                    value={newChatData.participant_ids}
                    label="Participants"
                    onChange={(e) =>
                      setNewChatData({
                        ...newChatData,
                        participant_ids: e.target.value,
                      })
                    }
                  >
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewChatDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateChatRoom} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Chat;
