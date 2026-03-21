import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Spinner from './components/common/Spinner';

// --- Auth pages (eagerly loaded — first thing users see) ---
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';

// --- Admin pages (lazy loaded) ---
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const ManageFaculty = lazy(() => import('./pages/admin/ManageFaculty'));
const ManageEvents = lazy(() => import('./pages/admin/ManageEvents'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminResults = lazy(() => import('./pages/admin/Results'));
const AdminFeedback = lazy(() => import('./pages/admin/Feedback'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));

// --- Faculty pages (lazy loaded) ---
const FacultyDashboard = lazy(() => import('./pages/faculty/Dashboard'));
const FacultyMyEvents = lazy(() => import('./pages/faculty/MyEvents'));
const CreateEvent = lazy(() => import('./pages/faculty/CreateEvent'));
const Participants = lazy(() => import('./pages/faculty/Participants'));
const FacultyResults = lazy(() => import('./pages/faculty/Results'));
const FacultyReports = lazy(() => import('./pages/faculty/Reports'));
const FacultySettings = lazy(() => import('./pages/faculty/Settings'));
const FacultyProfile = lazy(() => import('./pages/faculty/Profile'));

// --- Student pages (lazy loaded) ---
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const AvailableEvents = lazy(() => import('./pages/student/AvailableEvents'));
const StudentMyEvents = lazy(() => import('./pages/student/MyEvents'));
const StudentPayments = lazy(() => import('./pages/student/Payments'));
const MyResult = lazy(() => import('./pages/student/MyResult'));
const StudentFeedback = lazy(() => import('./pages/student/Feedback'));
const StudentSettings = lazy(() => import('./pages/student/Settings'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin panel — nested under /admin */}
          <Route path="/admin" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="faculty" element={<ManageFaculty />} />
            <Route path="events" element={<ManageEvents />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Faculty panel — nested under /faculty */}
          <Route path="/faculty" element={<DashboardLayout role="faculty" />}>
            <Route index element={<FacultyDashboard />} />
            <Route path="my-events" element={<FacultyMyEvents />} />
            <Route path="create-event" element={<CreateEvent />} />
            <Route path="participants" element={<Participants />} />
            <Route path="results" element={<FacultyResults />} />
            <Route path="reports" element={<FacultyReports />} />
            <Route path="settings" element={<FacultySettings />} />
            <Route path="profile" element={<FacultyProfile />} />
          </Route>

          {/* Student panel — nested under /student */}
          <Route path="/student" element={<DashboardLayout role="student" />}>
            <Route index element={<StudentDashboard />} />
            <Route path="available-events" element={<AvailableEvents />} />
            <Route path="my-events" element={<StudentMyEvents />} />
            <Route path="payments" element={<StudentPayments />} />
            <Route path="my-result" element={<MyResult />} />
            <Route path="feedback" element={<StudentFeedback />} />
            <Route path="settings" element={<StudentSettings />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
