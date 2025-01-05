import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';

// Layout components
import Layout from './components/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import ParentDashboard from './pages/dashboard/ParentDashboard';

// Communication pages
import Messages from './pages/communication/Messages';
import Announcements from './pages/communication/Announcements';
import ConferenceScheduling from './pages/communication/ConferenceScheduling';
import Chat from './pages/communication/Chat';

// Protected route wrapper
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route element={<Layout />}>
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/*"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/*"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/*"
              element={
                <ProtectedRoute role="parent">
                  <ParentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Communication Routes */}
            <Route path="/communication/messages" element={<Messages />} />
            <Route path="/communication/announcements" element={<Announcements />} />
            <Route path="/communication/conferences" element={<ConferenceScheduling />} />
            <Route path="/communication/chat" element={<Chat />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
