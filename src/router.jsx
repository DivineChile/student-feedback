import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "@/routes/guards/ProtectedRoute";
import AdminRoute from "@/routes/guards/AdminRoute";
import RedirectIfAuthed from "@/routes/guards/RedirectIfAuthed";

import HomePage from "@/routes/HomePage";
import LoginPage from "@/routes/LoginPage";
import RegisterPage from "@/routes/RegisterPage";
import AdminLoginPage from "@/routes/AdminLoginPage";

import DashboardLayout from "@/routes/dashboard/DashboardLayout";
import DashboardHome from "@/routes/dashboard/DashboardHome";
import SubmitFeedbackPage from "@/routes/dashboard/SubmitFeedbackPage";
import MyFeedbackPage from "@/routes/dashboard/MyFeedbackPage";
import ProfilePage from "@/routes/dashboard/ProfilePage";

import AdminLayout from "@/routes/admin/AdminLayout";
import AdminOverviewPage from "@/routes/admin/AdminOverviewPage";
import AdminFeedbackPage from "@/routes/admin/AdminFeedbackPage";
import AdminAnalyticsPage from "@/routes/admin/AdminAnalyticsPage";
import AdminReportsPage from "@/routes/admin/AdminReportsPage";
import AdminStudentsPage from "@/routes/admin/AdminStudentsPage";

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
          { index: true, element: <AdminOverviewPage /> },
          { path: "feedback", element: <AdminFeedbackPage /> },
          { path: "analytics", element: <AdminAnalyticsPage /> },
          { path: "reports", element: <AdminReportsPage /> },
          { path: "students", element: <AdminStudentsPage /> },
        ],
      },
    ],
  },
]);
