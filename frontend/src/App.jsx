import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeManagement from "./pages/EmployeeManagement";
import Reports from "./pages/Reports";
import LeaveRequests from "./pages/LeaveRequests";
import AttendanceManagement from "./pages/AttendanceManagement";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import EmployeeLeaves from "./pages/EmployeeLeaves";
import ProtectedRoute from "./components/ProtectedRoute";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route
  path="/admin"
  element={
    <ProtectedRoute allowedRole="admin">
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/employees"
  element={
    <ProtectedRoute allowedRole="admin">
      <EmployeeManagement />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/leaves"
  element={
    <ProtectedRoute allowedRole="admin">
      <LeaveRequests />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/attendance"
  element={
    <ProtectedRoute allowedRole="admin">
      <AttendanceManagement />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/reports"
  element={
    <ProtectedRoute allowedRole="admin">
      <Reports />
    </ProtectedRoute>
  }
/>

<Route
  path="/employee"
  element={
    <ProtectedRoute allowedRole="employee">
      <EmployeeDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/employee/attendance"
  element={
    <ProtectedRoute allowedRole="employee">
      <EmployeeAttendance />
    </ProtectedRoute>
  }
/>

<Route
  path="/employee/leaves"
  element={
    <ProtectedRoute allowedRole="employee">
      <EmployeeLeaves />
    </ProtectedRoute>
  }
/>
 </Routes>
    </BrowserRouter>
  );
}