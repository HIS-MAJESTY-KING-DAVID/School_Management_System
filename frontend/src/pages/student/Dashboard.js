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
  Divider,
} from '@mui/material';
import {
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  DateRange as DateRangeIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      // Fetch enrolled courses
      const coursesResponse = await fetch('/api/academic/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const coursesData = await coursesResponse.json();
      setCourses(coursesData);

      // TODO: Implement these endpoints
      // Fetch assignments
      // Fetch attendance
      // Fetch grades
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const calculateOverallAttendance = () => {
    if (!attendance) return 'N/A';
    const total = Object.values(attendance).length;
    const present = Object.values(attendance).filter(
      (status) => status === 'present'
    ).length;
    return `${((present / total) * 100).toFixed(2)}%`;
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Student Dashboard
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
            }}
          >
            <SchoolIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Enrolled Courses</Typography>
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
            }}
          >
            <AssignmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Pending Assignments</Typography>
            <Typography variant="h4">{assignments.length}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <DateRangeIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Attendance</Typography>
            <Typography variant="h4">{calculateOverallAttendance()}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <TimelineIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Average Grade</Typography>
            <Typography variant="h4">
              {grades.length > 0
                ? `${(
                    grades.reduce((sum, grade) => sum + grade.score, 0) /
                    grades.length
                  ).toFixed(2)}%`
                : 'N/A'}
            </Typography>
          </Paper>
        </Grid>

        {/* Courses */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                My Courses
              </Typography>
              <List>
                {courses.map((course) => (
                  <React.Fragment key={course.id}>
                    <ListItem>
                      <ListItemText
                        primary={course.name}
                        secondary={`Code: ${course.code}`}
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
              <Typography variant="h6" gutterBottom>
                Recent Grades
              </Typography>
              <List>
                {grades.slice(0, 5).map((grade) => (
                  <React.Fragment key={grade.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${grade.course_name} - ${grade.assessment_type}`}
                        secondary={`Score: ${grade.score}/${grade.max_score} (${(
                          (grade.score / grade.max_score) *
                          100
                        ).toFixed(2)}%)`}
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Assignments */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Assignments
              </Typography>
              <List>
                {assignments.map((assignment) => (
                  <React.Fragment key={assignment.id}>
                    <ListItem>
                      <ListItemText
                        primary={assignment.title}
                        secondary={`Due: ${new Date(
                          assignment.due_date
                        ).toLocaleDateString()} - ${assignment.course_name}`}
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

export default StudentDashboard;
