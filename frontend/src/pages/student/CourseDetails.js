import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  LinearProgress,
} from '@mui/material';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const CourseDetails = () => {
  const { courseId } = useParams();
  const [value, setValue] = useState(0);
  const [course, setCourse] = useState(null);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [materials, setMaterials] = useState([]);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const courseResponse = await fetch(`/api/academic/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const courseData = await courseResponse.json();
      setCourse(courseData);

      // TODO: Implement these endpoints
      // Fetch grades
      // Fetch attendance
      // Fetch course materials
    } catch (error) {
      console.error('Error fetching course data:', error);
    }
  };

  const calculateAttendancePercentage = () => {
    if (!attendance.length) return 0;
    const present = attendance.filter((record) => record.status === 'present').length;
    return (present / attendance.length) * 100;
  };

  const calculateGradeAverage = () => {
    if (!grades.length) return 0;
    const total = grades.reduce(
      (sum, grade) => sum + (grade.score / grade.max_score) * 100,
      0
    );
    return total / grades.length;
  };

  return (
    <Container>
      {course && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              {course.name}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
              Course Code: {course.code}
            </Typography>
            <Typography variant="body1">{course.description}</Typography>
          </Paper>

          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={(e, newValue) => setValue(newValue)}>
              <Tab label="Overview" />
              <Tab label="Grades" />
              <Tab label="Attendance" />
              <Tab label="Materials" />
            </Tabs>
          </Box>

          <TabPanel value={value} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Progress Overview
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">Attendance</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={calculateAttendancePercentage()}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {calculateAttendancePercentage().toFixed(1)}%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1">Average Grade</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={calculateGradeAverage()}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {calculateGradeAverage().toFixed(1)}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={value} index={1}>
            <List>
              {grades.map((grade) => (
                <React.Fragment key={grade.id}>
                  <ListItem>
                    <ListItemText
                      primary={grade.assessment_type}
                      secondary={`Score: ${grade.score}/${grade.max_score} (${(
                        (grade.score / grade.max_score) *
                        100
                      ).toFixed(1)}%)`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={value} index={2}>
            <List>
              {attendance.map((record) => (
                <React.Fragment key={record.id}>
                  <ListItem>
                    <ListItemText
                      primary={new Date(record.date).toLocaleDateString()}
                      secondary={`Status: ${record.status}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </TabPanel>

          <TabPanel value={value} index={3}>
            <List>
              {materials.map((material) => (
                <React.Fragment key={material.id}>
                  <ListItem>
                    <ListItemText
                      primary={material.title}
                      secondary={`Type: ${material.type} | Uploaded: ${new Date(
                        material.upload_date
                      ).toLocaleDateString()}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </TabPanel>
        </>
      )}
    </Container>
  );
};

export default CourseDetails;
