import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import Spinner from './components/common/Spinner';
import { EventProvider } from './context/EventContext';
import { SocketProvider } from './context/SocketContext';

// --- Auth pages (eagerly loaded — first thing users see) ---
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import SetPassword from './pages/Auth/SetPassword';

// --- Admin pages (lazy loaded) ---
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const ManageFaculty = lazy(() => import('./pages/admin/ManageFaculty'));
const ManageEvents = lazy(() => import('./pages/admin/ManageEvents'));
const AdminCreateEvent = lazy(() => import('./pages/admin/CreateEvent'));
const AdminPayments = lazy(() => import('./pages/admin/Payments'));
const AdminResults = lazy(() => import('./pages/admin/Results'));
const AdminFeedback = lazy(() => import('./pages/admin/Feedback'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminCommunication = lazy(() => import('./pages/admin/Communication'));
const AdminScheduling = lazy(() => import('./pages/admin/Scheduling'));

// --- Admin > Manage Faculty sub-pages (lazy loaded) ---
const MFFacultyManagement = lazy(() => import('./pages/admin/manage-faculty/FacultyManagement'));
const MFCommunication = lazy(() => import('./pages/admin/manage-faculty/Communication'));
const MFTaskManagement = lazy(() => import('./pages/admin/manage-faculty/TaskManagement'));
const MFResourceSharing = lazy(() => import('./pages/admin/manage-faculty/ResourceSharing'));
const MFScheduling = lazy(() => import('./pages/admin/manage-faculty/Scheduling'));

// --- Faculty pages (lazy loaded) ---
const FacultyDashboard = lazy(() => import('./pages/faculty/Dashboard'));
const FacultyMyEvents = lazy(() => import('./pages/faculty/MyEvents'));
const CreateEvent = lazy(() => import('./pages/faculty/CreateEvent'));
const Participants = lazy(() => import('./pages/faculty/Participants'));
const FacultyResults = lazy(() => import('./pages/faculty/Results'));
const FacultyReports = lazy(() => import('./pages/faculty/Reports'));
const FacultySettings = lazy(() => import('./pages/faculty/Settings'));
const FacultyProfile = lazy(() => import('./pages/faculty/Profile'));
const FacultyCommunication = lazy(() => import('./pages/faculty/Communication'));

// --- Student pages (lazy loaded) ---
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'));
const AvailableEvents = lazy(() => import('./pages/student/AvailableEvents'));
const StudentMyEvents = lazy(() => import('./pages/student/MyEvents'));
const StudentPayments = lazy(() => import('./pages/student/MyRegistrations'));
const MyResult = lazy(() => import('./pages/student/MyResult'));
const StudentFeedback = lazy(() => import('./pages/student/Feedback'));
const StudentSettings = lazy(() => import('./pages/student/Settings'));
const StudentProfile = lazy(() => import('./pages/student/Profile'));

function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Suspense fallback={<Spinner />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/set-password" element={<SetPassword />} />

          {/* Admin panel — nested under /admin */}
          <Route path="/admin" element={<DashboardLayout role="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="faculty" element={<ManageFaculty />}>
              <Route index element={<Navigate to="faculty-management" replace />} />
              <Route path="faculty-management" element={<MFFacultyManagement />} />
              <Route path="communication" element={<MFCommunication />} />
              <Route path="task-management" element={<MFTaskManagement />} />
              <Route path="resource-sharing" element={<MFResourceSharing />} />
              <Route path="scheduling" element={<MFScheduling />} />
            </Route>
            <Route path="events">
              <Route index element={<ManageEvents />} />
              <Route path="create" element={<AdminCreateEvent />} />
            </Route>
            <Route path="payments" element={<AdminPayments />} />
            <Route path="results" element={<AdminResults />} />
            <Route path="feedback" element={<AdminFeedback />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="communication" element={<AdminCommunication />} />
            <Route path="scheduling" element={<AdminScheduling />} />
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
            <Route path="communication" element={<FacultyCommunication />} />
            <Route path="settings" element={<FacultySettings />} />
            <Route path="profile" element={<FacultyProfile />} />
          </Route>


          {/* Student panel — nested under /student */}
          <Route path="/student" element={
            <EventProvider>
              <DashboardLayout role="student" />
            </EventProvider>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="available-events" element={<AvailableEvents />} />
            <Route path="my-events" element={<StudentMyEvents />} />
            <Route path="payments" element={<StudentPayments />} />
            <Route path="my-registrations" element={<StudentPayments />} />
            <Route path="my-result" element={<MyResult />} />
            <Route path="feedback" element={<StudentFeedback />} />
            <Route path="settings" element={<StudentSettings />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

        </Routes>
      </Suspense>
      </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
