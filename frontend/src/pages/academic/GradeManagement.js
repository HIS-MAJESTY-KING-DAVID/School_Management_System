import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

const GradeManagement = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    assessment_type: '',
    score: '',
    max_score: '',
    remarks: '',
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
      fetchGrades();
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/academic/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`/api/academic/enrollment/course/${selectedCourse}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchGrades = async () => {
    const gradesMap = {};
    for (const student of students) {
      try {
        const response = await fetch(
          `/api/academic/grades/student/${student.id}/course/${selectedCourse}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        const data = await response.json();
        gradesMap[student.id] = data;
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    }
    setGrades(gradesMap);
  };

  const handleAddGrade = async () => {
    try {
      const response = await fetch('/api/academic/grades', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          course_id: selectedCourse,
          ...gradeForm,
        }),
      });
      if (response.ok) {
        fetchGrades();
        handleCloseDialog();
      }
    } catch (error) {
      console.error('Error adding grade:', error);
    }
  };

  const handleOpenDialog = (student) => {
    setSelectedStudent(student);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedStudent(null);
    setGradeForm({
      assessment_type: '',
      score: '',
      max_score: '',
      remarks: '',
    });
    setOpenDialog(false);
  };

  const calculateAverage = (studentGrades) => {
    if (!studentGrades || studentGrades.length === 0) return 'N/A';
    const total = studentGrades.reduce((sum, grade) => sum + (grade.score / grade.max_score) * 100, 0);
    return `${(total / studentGrades.length).toFixed(2)}%`;
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Grade Management
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Select Course</InputLabel>
          <Select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            label="Select Course"
          >
            {courses.map((course) => (
              <MenuItem key={course.id} value={course.id}>
                {course.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedCourse && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Registration Number</TableCell>
                <TableCell>Average Grade</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                  <TableCell>{student.registration_number}</TableCell>
                  <TableCell>{calculateAverage(grades[student.id])}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenDialog(student)}
                    >
                      Add Grade
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add Grade</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Assessment Type</InputLabel>
              <Select
                value={gradeForm.assessment_type}
                onChange={(e) =>
                  setGradeForm({ ...gradeForm, assessment_type: e.target.value })
                }
                label="Assessment Type"
              >
                <MenuItem value="exam">Exam</MenuItem>
                <MenuItem value="assignment">Assignment</MenuItem>
                <MenuItem value="project">Project</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Score"
              type="number"
              value={gradeForm.score}
              onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Maximum Score"
              type="number"
              value={gradeForm.max_score}
              onChange={(e) => setGradeForm({ ...gradeForm, max_score: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Remarks"
              multiline
              rows={4}
              value={gradeForm.remarks}
              onChange={(e) => setGradeForm({ ...gradeForm, remarks: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleAddGrade} variant="contained">
            Add Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GradeManagement;
