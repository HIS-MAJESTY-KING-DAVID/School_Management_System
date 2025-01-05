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
  Class as ClassIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [pendingGrades, setPendingGrades] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch teacher's courses
      const coursesResponse = await fetch('/api/academic/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const coursesData = await coursesResponse.json();
      setCourses(coursesData);

      // TODO: Implement these endpoints
      // Fetch recent assignments
      // Fetch pending grades
      // Fetch notifications
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Teacher Dashboard
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
            onClick={() => navigate('/teacher/courses')}
          >
            <ClassIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Active Courses</Typography>
            <Typography variant="h4">{courses.length}</Typography>
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
            onClick={() => navigate('/teacher/students')}
          >
            <PeopleIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Total Students</Typography>
            <Typography variant="h4">
              {courses.reduce((sum, course) => sum + (course.students?.length || 0), 0)}
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
            onClick={() => navigate('/teacher/assignments')}
          >
            <AssignmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Pending Assignments</Typography>
            <Typography variant="h4">{pendingGrades.length}</Typography>
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
            onClick={() => navigate('/teacher/notifications')}
          >
            <NotificationsIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Notifications</Typography>
            <Typography variant="h4">{notifications.length}</Typography>
          </Paper>
        </Grid>

        {/* Courses Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">My Courses</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/teacher/courses')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {courses.slice(0, 5).map((course) => (
                  <React.Fragment key={course.id}>
                    <ListItem
                      button
                      onClick={() => navigate(`/teacher/courses/${course.id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <ClassIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={course.name}
                        secondary={`${course.students?.length || 0} students enrolled`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Assignments */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Recent Assignments</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/teacher/assignments')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {recentAssignments.slice(0, 5).map((assignment) => (
                  <React.Fragment key={assignment.id}>
                    <ListItem
                      button
                      onClick={() =>
                        navigate(`/teacher/assignments/${assignment.id}`)
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <AssignmentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={assignment.title}
                        secondary={`Due: ${new Date(
                          assignment.due_date
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

        {/* Pending Grades */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Pending Grades</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate('/teacher/grades')}
                >
                  View All
                </Button>
              </Box>
              <List>
                {pendingGrades.slice(0, 5).map((submission) => (
                  <React.Fragment key={submission.id}>
                    <ListItem
                      button
                      onClick={() =>
                        navigate(`/teacher/assignments/${submission.assignment_id}`)
                      }
                    >
                      <ListItemAvatar>
                        <Avatar>
                          <AssignmentIcon />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${submission.student_name} - ${submission.assignment_title}`}
                        secondary={`Submitted: ${new Date(
                          submission.submission_date
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

export default TeacherDashboard;
