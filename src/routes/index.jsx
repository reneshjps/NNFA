import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import AdminLayout from '../layouts/AdminLayout';
import MemberLayout from '../layouts/MemberLayout';
import PublicLayout from '../layouts/PublicLayout';

// Route Guards
import { ProtectedRoute, GuestRoute } from './guards';

// Feature Page imports
import AdminLoginPage from '../features/auth/pages/AdminLoginPage';
import MemberLoginPage from '../features/auth/pages/MemberLoginPage';
import AdminManagementPage from '../features/auth/pages/AdminManagementPage';
import SettingsPage from '../features/auth/pages/SettingsPage';
import DashboardPage from '../features/dashboard/pages/DashboardPage';
import MembersListPage from '../features/members/pages/MembersListPage';
import MemberDetailPage from '../features/members/pages/MemberDetailPage';
import AddMemberPage from '../features/members/pages/AddMemberPage';
import EditMemberPage from '../features/members/pages/EditMemberPage';
import RenewalsPage from '../features/renewals/pages/RenewalsPage';
import IdCardsPage from '../features/id-cards/pages/IdCardsPage';
import VerificationPage from '../features/verification/pages/VerificationPage';
import QRLoginRedirect from '../features/auth/pages/QRLoginRedirect';
import ReportsPage from '../features/reports/pages/ReportsPage';
import ImportMembersPage from '../features/reports/pages/ImportMembersPage';
import EventsPage from '../features/content/pages/EventsPage';
import NotificationsPage from '../features/content/pages/NotificationsPage';
import ActivityLogsPage from '../features/activity/pages/ActivityLogsPage';
import MemberDashboardPage from '../features/member-portal/pages/MemberDashboardPage';
import MemberIdCardPage from '../features/member-portal/pages/MemberIdCardPage';
import NotFoundPage from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/login',
        element: (
          <GuestRoute>
            <AdminLoginPage />
          </GuestRoute>
        ),
      },
      {
        path: '/member-login',
        element: (
          <GuestRoute>
            <MemberLoginPage />
          </GuestRoute>
        ),
      },
      {
        path: '/verify/:memberId',
        element: <VerificationPage />,
      },
      {
        path: '/qr-login/:memberId',
        element: <QRLoginRedirect />,
      },
    ],
  },

  // Admin routes
  {
    element: (
      <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/admin/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/admin/members',
        element: <MembersListPage />,
      },
      {
        path: '/admin/members/add',
        element: <AddMemberPage />,
      },
      {
        path: '/admin/members/:id',
        element: <MemberDetailPage />,
      },
      {
        path: '/admin/members/:id/edit',
        element: <EditMemberPage />,
      },
      {
        path: '/admin/renewals',
        element: <RenewalsPage />,
      },
      {
        path: '/admin/reports',
        element: <ReportsPage />,
      },
      {
        path: '/admin/import-members',
        element: <ImportMembersPage />,
      },
      {
        path: '/admin/events',
        element: <EventsPage />,
      },
      {
        path: '/admin/notifications',
        element: <NotificationsPage />,
      },
      {
        path: '/admin/id-cards',
        element: <IdCardsPage />,
      },
      {
        path: '/admin/manage-admins',
        element: (
          <ProtectedRoute allowedRoles={['super_admin']}>
            <AdminManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/activity-logs',
        element: <ActivityLogsPage />,
      },
      {
        path: '/admin/settings',
        element: <SettingsPage />,
      },
    ],
  },

  // Member routes
  {
    element: (
      <ProtectedRoute allowedRoles={['member']}>
        <MemberLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '/member/dashboard',
        element: <MemberDashboardPage />,
      },
      {
        path: '/member/id-card',
        element: <MemberIdCardPage />,
      },
      {
        path: '/member/events',
        element: <EventsPage readOnly />,
      },
      {
        path: '/member/announcements',
        element: <NotificationsPage readOnly />,
      },
    ],
  },

  // Redirect root
  {
    path: '/',
    element: <Navigate to="/member-login" replace />,
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
