import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const ReportGenerator = () => {
  const [reportType, setReportType] = useState('academic_performance');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      let endpoint = `/api/reports/${reportType}`;
      const params = new URLSearchParams();
      
      if (startDate) params.append('start_date', startDate.toISOString().split('T')[0]);
      if (endDate) params.append('end_date', endDate.toISOString().split('T')[0]);
      if (studentId) params.append('student_id', studentId);
      
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const params = new URLSearchParams({
        type: reportType,
        format: format,
      });
      if (startDate) params.append('start_date', startDate.toISOString().split('T')[0]);
      if (endDate) params.append('end_date', endDate.toISOString().split('T')[0]);
      
      const response = await fetch(`/api/reports/export/${reportType}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const renderReportContent = () => {
    if (!reportData) return null;

    switch (reportType) {
      case 'academic_performance':
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Average Score</TableCell>
                  <TableCell>Total Assessments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.student_name}</TableCell>
                    <TableCell>{row.course_name}</TableCell>
                    <TableCell>{row.average_score.toFixed(2)}%</TableCell>
                    <TableCell>{row.total_assessments}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'attendance':
        return (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Course</TableCell>
                  <TableCell>Present</TableCell>
                  <TableCell>Absent</TableCell>
                  <TableCell>Late</TableCell>
                  <TableCell>Attendance Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reportData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.student_name}</TableCell>
                    <TableCell>{row.course_name}</TableCell>
                    <TableCell>{row.present_count}</TableCell>
                    <TableCell>{row.absent_count}</TableCell>
                    <TableCell>{row.late_count}</TableCell>
                    <TableCell>{row.attendance_rate.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 'financial_summary':
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Collections</Typography>
                  <Typography variant="h4" color="primary">
                    ${reportData.total_collected.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Payments: {reportData.total_payments}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Outstanding Fees</Typography>
                  <Typography variant="h4" color="error">
                    ${reportData.total_outstanding.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Fees: {reportData.total_pending_fees}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Report Generator
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="academic_performance">Academic Performance</MenuItem>
                <MenuItem value="attendance">Attendance Report</MenuItem>
                <MenuItem value="financial_summary">Financial Summary</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          {reportType !== 'financial_summary' && (
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Student ID (Optional)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              />
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleGenerateReport}
            startIcon={<AssessmentIcon />}
            disabled={loading}
          >
            Generate Report
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleExport('csv')}
            startIcon={<DownloadIcon />}
            disabled={!reportData}
          >
            Export CSV
          </Button>
          <Button
            variant="outlined"
            onClick={() => handleExport('excel')}
            startIcon={<DownloadIcon />}
            disabled={!reportData}
          >
            Export Excel
          </Button>
          <Button
            variant="outlined"
            onClick={() => window.print()}
            startIcon={<PrintIcon />}
            disabled={!reportData}
          >
            Print
          </Button>
        </Box>
      </Paper>

      {reportData && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Report Results
          </Typography>
          {renderReportContent()}
        </Box>
      )}
    </Container>
  );
};

export default ReportGenerator;
