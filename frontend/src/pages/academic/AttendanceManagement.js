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
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const AttendanceManagement = () => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents();
      fetchAttendance();
    }
  }, [selectedCourse, selectedDate]);

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

  const fetchAttendance = async () => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const response = await fetch(
        `/api/academic/attendance/course/${selectedCourse}/date/${formattedDate}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      const attendanceMap = {};
      data.forEach((record) => {
        attendanceMap[record.student_id] = record.status;
      });
      setAttendance(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleAttendanceChange = async (studentId, status) => {
    try {
      const response = await fetch('/api/academic/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          student_id: studentId,
          course_id: selectedCourse,
          date: selectedDate.toISOString().split('T')[0],
          status: status,
        }),
      });
      if (response.ok) {
        setAttendance({
          ...attendance,
          [studentId]: status,
        });
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  return (
    <Container>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Attendance Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Select Date"
              value={selectedDate}
              onChange={setSelectedDate}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </Box>
      </Box>

      {selectedCourse && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student Name</TableCell>
                <TableCell>Registration Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                  <TableCell>{student.registration_number}</TableCell>
                  <TableCell>{attendance[student.id] || 'Not marked'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      color="primary"
                      onClick={() => handleAttendanceChange(student.id, 'present')}
                      sx={{ mr: 1 }}
                    >
                      Present
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      onClick={() => handleAttendanceChange(student.id, 'absent')}
                      sx={{ mr: 1 }}
                    >
                      Absent
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="warning"
                      onClick={() => handleAttendanceChange(student.id, 'late')}
                    >
                      Late
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AttendanceManagement;
