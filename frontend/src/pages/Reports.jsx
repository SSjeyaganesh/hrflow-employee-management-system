import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import StatCard from "../components/StatCard";
import api from "../services/api";

export default function Reports() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/reports/dashboard");
        setStats(response.data);
      } catch {
        setError("Unable to load report data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const downloadEmployeeReport = async () => {
    try {
      setDownloading(true);
      setError("");

      const response = await api.get("/reports/employees/pdf", {
        responseType: "blob",
      });

      const contentType =
        response.headers["content-type"] || "application/pdf";

      const blob = new Blob([response.data], { type: contentType });
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
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AdminLayout
      title="Reports"
      subtitle="Generate and download HR reports"
    >
      {loading && <p className="text-gray-500">Loading reports...</p>}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Employee Report
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Download a complete PDF report of all employees.
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                  📄
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">
                  This report includes employee ID, name, phone, department,
                  designation, joining date, and status.
                </p>
              </div>

              <button
                onClick={downloadEmployeeReport}
                disabled={downloading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {downloading ? "Generating PDF..." : "Download Employee PDF"}
              </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Attendance Summary
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Today’s attendance overview.
                  </p>
                </div>

                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl">
                  🕒
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Present Today</span>
                  <span className="font-semibold text-gray-800">
                    {stats.present_today}
                  </span>
                </div>

                <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Absent Today</span>
                  <span className="font-semibold text-gray-800">
                    {stats.absent_today}
                  </span>
                </div>

                <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">On Leave Today</span>
                  <span className="font-semibold text-gray-800">
                    {stats.leave_today}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}