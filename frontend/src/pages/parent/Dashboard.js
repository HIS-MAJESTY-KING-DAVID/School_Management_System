import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [recentGrades, setRecentGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [fees, setFees] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch children data
      const childrenResponse = await fetch('/api/users/children', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const childrenData = await childrenResponse.json();
      setChildren(childrenData);

      // TODO: Implement these endpoints
      // Fetch recent grades
      // Fetch attendance
      // Fetch fees
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Parent Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/parent/children')}
          >
            <PersonIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Children</Typography>
            <Typography variant="h4">{children.length}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/parent/academic')}
          >
            <SchoolIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Courses</Typography>
            <Typography variant="h4">
              {children.reduce((sum, child) => sum + (child.courses?.length || 0), 0)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/parent/assignments')}
          >
            <AssignmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Pending Tasks</Typography>
            <Typography variant="h4">
              {children.reduce((sum, child) => sum + (child.pending_tasks || 0), 0)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/parent/fees')}
          >
            <PaymentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Pending Fees</Typography>
            <Typography variant="h4">
              ${fees.reduce((sum, fee) => sum + (fee.amount_due || 0), 0)}
            </Typography>
          </Paper>
        </Grid>

        {/* Children Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">My Children</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/parent/children')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {children.map((child) => (
                  <React.Fragment key={child.id}>
                    <ListItem
                      button
                      onClick={() => navigate(`/parent/children/${child.id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${child.first_name} ${child.last_name}`}
                        secondary={`Grade: ${child.current_grade}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Grades */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Recent Grades</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/parent/grades')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {recentGrades.map((grade) => (
                  <React.Fragment key={grade.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${grade.student_name} - ${grade.course_name}`}
                        secondary={`Grade: ${grade.score}/${grade.max_score} (${(
                          (grade.score / grade.max_score) *
                          100
                        ).toFixed(1)}%)`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Overview */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Recent Attendance</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/parent/attendance')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {attendance.map((record) => (
                  <React.Fragment key={record.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${record.student_name} - ${record.course_name}`}
                        secondary={`Status: ${record.status} | Date: ${new Date(
                          record.date
                        ).toLocaleDateString()}`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ParentDashboard;
