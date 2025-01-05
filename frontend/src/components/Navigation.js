import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Message as MessageIcon,
  Announcement as AnnouncementIcon,
  Group as GroupIcon,
  Chat as ChatIcon,
  VideoCall as VideoCallIcon,
  ExpandLess,
  ExpandMore,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [communicationOpen, setCommunicationOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      text: 'Communication',
      icon: <MessageIcon />,
      subitems: [
        {
          text: 'Messages',
          icon: <MessageIcon />,
          path: '/communication/messages',
        },
        {
          text: 'Announcements',
          icon: <AnnouncementIcon />,
          path: '/communication/announcements',
        },
        {
          text: 'Conferences',
          icon: <VideoCallIcon />,
          path: '/communication/conferences',
        },
        {
          text: 'Chat',
          icon: <ChatIcon />,
          path: '/communication/chat',
        },
      ],
    },
    // Add other menu items based on user role
  ];

  const handleNavigate = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleCommunicationClick = () => {
    setCommunicationOpen(!communicationOpen);
  };

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            School Management System
          </Typography>
          <IconButton color="inherit">
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 250 }} role="presentation">
          <List>
            {menuItems.map((item) =>
              item.subitems ? (
                <React.Fragment key={item.text}>
                  <ListItem button onClick={handleCommunicationClick}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {communicationOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>
                  <Collapse in={communicationOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.subitems.map((subitem) => (
                        <ListItem
                          button
                          key={subitem.text}
                          onClick={() => handleNavigate(subitem.path)}
                          selected={location.pathname === subitem.path}
                          sx={{ pl: 4 }}
                        >
                          <ListItemIcon>{subitem.icon}</ListItemIcon>
                          <ListItemText primary={subitem.text} />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                </React.Fragment>
              ) : (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => handleNavigate(item.path)}
                  selected={location.pathname === item.path}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              )
            )}
          </List>
        </Box>
      </Drawer>
      <Toolbar /> {/* Add spacing below AppBar */}
    </>
  );
};

export default Navigation;
