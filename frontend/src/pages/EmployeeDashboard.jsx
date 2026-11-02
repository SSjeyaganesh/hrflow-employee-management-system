import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import EmployeeLayout from "../components/EmployeeLayout";

export default function EmployeeDashboard() {
  const [profile, setProfile] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [pendingLeaves, setPendingLeaves] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, attendanceRes, leavesRes] = await Promise.all([
          api.get("/employees/me"),
          api.get("/attendance/me"),
          api.get("/leaves/me"),
        ]);

        setProfile(profileRes.data);

        const today = new Date().toISOString().split("T")[0];
        const record = attendanceRes.data.find((item) => item.date === today);
        setTodayAttendance(record || null);

        const pending = leavesRes.data.filter(
          (leave) => leave.status === "pending"
        ).length;
        setPendingLeaves(pending);
      } catch {
        // silent fail — dashboard still renders
      }
    };
    loadData();
  }, []);

  return (
    <EmployeeLayout
      title="Dashboard"
      subtitle="Overview of your profile, attendance, and leaves"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Welcome</p>
          <p className="text-xl font-semibold text-gray-800">
            {profile?.full_name || "Employee"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Today’s Attendance</p>
          <p className="text-xl font-semibold text-gray-800">
            {todayAttendance ? todayAttendance.status : "Not marked"}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Pending Leaves</p>
          <p className="text-xl font-semibold text-gray-800">
            {pendingLeaves}
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Quick Actions
        </h2>
        <div className="flex gap-4">
          <Link
            to="/employee/attendance"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Mark Attendance
          </Link>
          <Link
            to="/employee/leaves"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Apply for Leave
          </Link>
        </div>
      </div>
    </EmployeeLayout>
  );
}