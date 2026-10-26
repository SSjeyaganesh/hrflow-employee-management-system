import { useState, useEffect } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/reports/dashboard");
        setStats(response.data);
      } catch {
        setError("Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);
const downloadEmployeeReport = async () => {
  try {
    const response = await api.get("/reports/employees/pdf", {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "application/pdf",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "employee_report.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch {
    setError("Unable to download employee report");
  }
};
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Employees</h2>
          <p className="text-3xl font-bold text-blue-600">
            {stats.total_employees}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Active Employees</h2>
          <p className="text-3xl font-bold text-green-600">
            {stats.active_employees}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Departments</h2>
          <p className="text-3xl font-bold text-purple-600">
            {stats.total_departments}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Pending Leaves</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {stats.pending_leaves}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Approved Leaves</h2>
          <p className="text-3xl font-bold text-green-600">
            {stats.approved_leaves}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Present Today</h2>
          <p className="text-3xl font-bold text-blue-600">
            {stats.present_today}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Absent Today</h2>
          <p className="text-3xl font-bold text-red-600">
            {stats.absent_today}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">On Leave Today</h2>
          <p className="text-3xl font-bold text-orange-600">
            {stats.leave_today}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
  <h2 className="text-gray-500">Employee Report</h2>
  <button
    onClick={downloadEmployeeReport}
    className="inline-block mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
  >
    Download PDF
  </button>
</div>
      </div>
    </div>
  );
}