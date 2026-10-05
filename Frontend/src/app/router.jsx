import { createBrowserRouter, Navigate } from 'react-router-dom'

import ProtectedRoute from '../guards/ProtectedRoute.jsx'
import GuestRoute from '../guards/GuestRoute.jsx'

import LoginPage from '../pages/LoginPage.jsx'
import RegisterPage from '../pages/RegisterPage.jsx'
import DashboardPage from '../pages/DashboardPage.jsx'
import ProjectsPage from '../pages/ProjectsPage.jsx'
import ProjectOverviewPage from '../pages/ProjectOverviewPage.jsx'
import ProjectIssuesPage from '../pages/ProjectIssuesPage.jsx'
import IssueDetailsPage from '../pages/IssueDetailsPage.jsx'
import ProjectMembersPage from '../pages/ProjectMembersPage.jsx'
import ProjectActivityPage from '../pages/ProjectActivityPage.jsx'
import ProjectSettingsPage from '../pages/ProjectSettingsPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import AppLayout from '../components/layout/AppLayout.jsx'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },

  // Guest-only routes
  {
    element: <GuestRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },

  // Authenticated routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/projects', element: <ProjectsPage /> },
          { path: '/projects/:projectId', element: <ProjectOverviewPage /> },
          { path: '/projects/:projectId/issues', element: <ProjectIssuesPage /> },
          { path: '/projects/:projectId/issues/:issueId', element: <IssueDetailsPage /> },
          { path: '/projects/:projectId/members', element: <ProjectMembersPage /> },
          { path: '/projects/:projectId/activity', element: <ProjectActivityPage /> },
          { path: '/projects/:projectId/settings', element: <ProjectSettingsPage /> },
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])

export default router
