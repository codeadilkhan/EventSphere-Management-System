import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { MainLayout } from './components/layout/MainLayout';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Protection Guards
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRoute } from './components/auth/RoleRoute';

// Pages
import { Home } from './pages/Home';
import { EventsList } from './pages/events/EventsList';
import { ExpoDetail } from './pages/events/ExpoDetail';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminExpos } from './pages/admin/AdminExpos';
import { AdminBooths } from './pages/admin/AdminBooths';
import { AdminApplications } from './pages/admin/AdminApplications';
import { AdminSchedule } from './pages/admin/AdminSchedule';
import { ExhibitorDashboard } from './pages/exhibitor/ExhibitorDashboard';
import { ExhibitorApplications } from './pages/exhibitor/ExhibitorApplications';
import { ExhibitorBooths } from './pages/exhibitor/ExhibitorBooths';
import { ExhibitorProfile } from './pages/exhibitor/ExhibitorProfile';
import { AttendeeDashboard } from './pages/attendee/AttendeeDashboard';
import { MySchedule } from './pages/attendee/MySchedule';
import { EventSchedule } from './pages/events/EventSchedule';
import { ExhibitorDirectory } from './pages/events/ExhibitorDirectory';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes with Main Navbar & Footer */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/events/:id" element={<ExpoDetail />} />
            <Route path="/schedule" element={<EventSchedule />} />
            <Route path="/exhibitors" element={<ExhibitorDirectory />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Protected Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['admin']}>
                  <DashboardLayout roleTitle="Organizer Console" />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="expos" element={<AdminExpos />} />
            <Route path="booths" element={<AdminBooths />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="schedule" element={<AdminSchedule />} />
            <Route path="analytics" element={<AdminDashboard />} />
            <Route path="feedback" element={<AdminDashboard />} />
          </Route>

          {/* Exhibitor Protected Dashboard Routes */}
          <Route
            path="/exhibitor"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['exhibitor']}>
                  <DashboardLayout roleTitle="Exhibitor Commercial Hub" />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<ExhibitorDashboard />} />
            <Route path="applications" element={<ExhibitorApplications />} />
            <Route path="booths" element={<ExhibitorBooths />} />
            <Route path="profile" element={<ExhibitorProfile />} />
            <Route path="messages" element={<ExhibitorDashboard />} />
          </Route>

          {/* Attendee / General Protected Portal Routes */}
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['attendee', 'admin', 'exhibitor']}>
                  <DashboardLayout roleTitle="Attendee Portal" />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AttendeeDashboard />} />
            <Route path="browse" element={<EventsList />} />
            <Route path="schedule" element={<EventSchedule />} />
            <Route path="my-schedule" element={<MySchedule />} />
            <Route path="exhibitors" element={<ExhibitorDirectory />} />
            <Route path="messages" element={<AttendeeDashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
