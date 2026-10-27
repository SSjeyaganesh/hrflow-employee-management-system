import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import EmployeeManagement from "./pages/EmployeeManagement";
import Reports from "./pages/Reports";
import LeaveRequests from "./pages/LeaveRequests";
import AttendanceManagement from "./pages/AttendanceManagement";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<EmployeeManagement />} />
        <Route path="/admin/leaves" element={<LeaveRequests />} />
        <Route path="/admin/attendance" element={<AttendanceManagement />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
 </Routes>
    </BrowserRouter>
  );
}