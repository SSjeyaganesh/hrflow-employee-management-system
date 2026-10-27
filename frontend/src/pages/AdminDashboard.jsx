import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import StatCard from "../components/StatCard";
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

  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Overview of employees, leaves, and attendance"
    >
      {loading && <p className="text-gray-500">Loading dashboard...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {stats && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard
              title="Total Employees"
              value={stats.total_employees}
              color="blue"
              icon="👥"
            />
            <StatCard
              title="Active Employees"
              value={stats.active_employees}
              color="green"
              icon="✅"
            />
            <StatCard
              title="Departments"
              value={stats.total_departments}
              color="purple"
              icon="🏢"
            />
            <StatCard
              title="Pending Leaves"
              value={stats.pending_leaves}
              color="yellow"
              icon="📝"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-6">
            <StatCard
              title="Approved Leaves"
              value={stats.approved_leaves}
              color="green"
              icon="✔️"
            />
            <StatCard
              title="Present Today"
              value={stats.present_today}
              color="blue"
              icon="🕒"
            />
            <StatCard
              title="Absent Today"
              value={stats.absent_today}
              color="red"
              icon="❌"
            />
            <StatCard
              title="On Leave Today"
              value={stats.leave_today}
              color="orange"
              icon="🌴"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">
                Quick Actions
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  to="/admin/employees"
                  className="p-4 border rounded-xl hover:bg-blue-50 transition"
                >
                  <p className="font-medium text-gray-800">Manage Employees</p>
                  <p className="text-sm text-gray-500">
                    Add, edit, search, and remove employees
                  </p>
                </Link>

                <Link
                  to="/admin/leaves"
                  className="p-4 border rounded-xl hover:bg-blue-50 transition"
                >
                  <p className="font-medium text-gray-800">Review Leaves</p>
                  <p className="text-sm text-gray-500">
                    Approve or reject pending requests
                  </p>
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">
                Employee Report
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Download a PDF containing all employee records.
              </p>

              <button
                onClick={downloadEmployeeReport}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Download PDF
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}