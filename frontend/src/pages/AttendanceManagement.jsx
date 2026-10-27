import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import StatCard from "../components/StatCard";
import api from "../services/api";

export default function AttendanceManagement() {
  const today = new Date().toISOString().split("T")[0];

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [selectedDate, setSelectedDate] = useState(today);
  const [search, setSearch] = useState("");

  const fetchAttendance = async () => {
  try {
    setLoading(true);

    const response = await api.get("/attendance/", {
      params: {
        date: selectedDate,
        search: search || undefined,
      },
    });

    setAttendance(response.data);
    setError("");
  } catch (err) {
    console.log("STATUS:", err.response?.status);
    console.log("ERROR DATA:", err.response?.data);
    console.log("REQUEST URL:", err.config?.url);

    setError(
      `Unable to load attendance records (${err.response?.status || "network error"})`
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate, search]);

  const markAttendance = async (employeeId, status) => {
    try {
      setError("");
      setMessage("");

      await api.post("/attendance/", {
        employee_id: employeeId,
        date: selectedDate,
        status,
      });

      setMessage(
        status === "present"
          ? "Employee marked present"
          : "Employee marked absent"
      );

      fetchAttendance();
    } catch {
      setError("Unable to update attendance");
    }
  };

  const presentCount = attendance.filter(
    (item) => item.status === "present"
  ).length;

  const absentCount = attendance.filter(
    (item) => item.status === "absent"
  ).length;

  const notMarkedCount = attendance.filter(
    (item) => !item.status || item.status === "not_marked"
  ).length;

  return (
    <AdminLayout
      title="Attendance"
      subtitle="Track and manage daily employee attendance"
    >
      {message && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <StatCard
          title="Present"
          value={presentCount}
          color="green"
          icon="✅"
        />
        <StatCard
          title="Absent"
          value={absentCount}
          color="red"
          icon="❌"
        />
        <StatCard
          title="Not Marked"
          value={notMarkedCount}
          color="yellow"
          icon="🕒"
        />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Attendance Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Search Employee
            </label>

            <input
              type="text"
              placeholder="Search by employee name..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading attendance...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((record) => (
                <tr
                  key={record.id || record.employee_id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {record.employee_name || `Employee #${record.employee_id}`}
                  </td>

                  <td className="px-6 py-4">
                    {record.date || selectedDate}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        record.status === "present"
                          ? "bg-green-100 text-green-700"
                          : record.status === "absent"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {record.status || "not marked"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => markAttendance(record.employee_id, "present")}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                      >
                        Present
                      </button>

                      <button
                        onClick={() => markAttendance(record.employee_id, "absent")}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {attendance.length === 0 && (
            <p className="p-6 text-gray-500">
              No attendance records found for this date.
            </p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}