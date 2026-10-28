import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "./routes/guards/ProtectedRoute";
import AdminRoute from "./routes/guards/AdminRoute";
import SuperAdminRoute from "./routes/guards/SuperAdminRoute";
import RedirectIfAuthed from "./routes/guards/RedirectIfAuthed";

import HomePage from "./routes/HomePage";
import LoginPage from "./routes/LoginPage";
import RegisterPage from "./routes/RegisterPage";
import AdminLoginPage from "./routes/AdminLoginPage";
import ChangePasswordPage from "./routes/ChangePasswordPage";
import AccountDisabledPage from "./routes/AccountDisabledPage";

import DashboardLayout from "./routes/dashboard/DashboardLayout";
import DashboardHome from "./routes/dashboard/DashboardHome";
import SubmitFeedbackPage from "./routes/dashboard/SubmitFeedbackPage";
import MyFeedbackPage from "./routes/dashboard/MyFeedbackPage";
import ProfilePage from "./routes/dashboard/ProfilePage";

import AdminLayout from "./routes/admin/AdminLayout";
import AdminOverviewPage from "./routes/admin/AdminOverviewPage";
import AdminFeedbackPage from "./routes/admin/AdminFeedbackPage";
import AdminAnalyticsPage from "./routes/admin/AdminAnalyticsPage";
import AdminReportsPage from "./routes/admin/AdminReportsPage";
import AdminStudentsPage from "./routes/admin/AdminStudentsPage";
import AdminSubAdminsPage from "./routes/admin/AdminSubAdminsPage";
import AdminNotificationsPage from "./routes/admin/AdminNotificationsPage";
import StudentNotificationsPage from "./routes/dashboard/NotificationPage";

export const router = createBrowserRouter([
  { path: "/", element: <HomePage /> },

  {
    element: <RedirectIfAuthed />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/admin-login", element: <AdminLoginPage /> },
    ],
  },

  { path: "/change-password", element: <ChangePasswordPage /> },
  { path: "/account-disabled", element: <AccountDisabledPage /> },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <DashboardHome /> },
          { path: "submit-feedback", element: <SubmitFeedbackPage /> },
          { path: "my-feedback", element: <MyFeedbackPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "notifications", element: <StudentNotificationsPage /> },
        ],
      },
    ],
  },

  {
    element: <AdminRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          // Only the super-admin can access these pages.
          {
            element: <SuperAdminRoute />,
            children: [
              { index: true, element: <AdminOverviewPage /> },
              { path: "analytics", element: <AdminAnalyticsPage /> },
              { path: "reports", element: <AdminReportsPage /> },
              { path: "students", element: <AdminStudentsPage /> },
              { path: "sub-admins", element: <AdminSubAdminsPage /> },
            ],
          },

          // Shared admin pages. Supabase RLS must restrict their data.
          { path: "feedback", element: <AdminFeedbackPage /> },
          { path: "notifications", element: <AdminNotificationsPage /> },
        ],
      },
    ],
  },
]);
