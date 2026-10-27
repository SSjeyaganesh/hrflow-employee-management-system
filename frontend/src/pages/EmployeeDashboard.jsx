import { useEffect, useState } from "react";
import api from "../services/api";

export default function EmployeeDashboard() {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceMessage, setAttendanceMessage] = useState("");

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get("/attendance/me");
      const today = new Date().toISOString().split("T")[0];

      const record = response.data.find(
        (item) => item.date === today
      );

      setTodayAttendance(record || null);
    } catch {
      setAttendanceMessage("Unable to load today's attendance");
    }
  };

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const markAttendance = async () => {
    try {
      await api.post("/attendance/mark", {
        date: new Date().toISOString().split("T")[0],
        status: "present",
      });

      setAttendanceMessage("Attendance marked successfully");
      fetchTodayAttendance();
    } catch (err) {
      setAttendanceMessage(
        err.response?.data?.detail || "Unable to mark attendance"
      );
    }
  };

  const markCheckout = async () => {
    try {
      await api.put("/attendance/checkout");

      setAttendanceMessage("Checkout marked successfully");
      fetchTodayAttendance();
    } catch (err) {
      setAttendanceMessage(
        err.response?.data?.detail || "Unable to mark checkout"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Employee Dashboard
      </h1>

      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Welcome to HRFlow
        </h2>

        <p className="text-gray-500">
          You can mark attendance and apply for leave from here.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Today’s Attendance
        </h2>

        {attendanceMessage && (
          <p className="mb-4 text-sm text-blue-600">
            {attendanceMessage}
          </p>
        )}

        {todayAttendance ? (
          <div>
            <p className="text-gray-700">
              Status:{" "}
              <span className="font-semibold capitalize">
                {todayAttendance.status}
              </span>
            </p>

            <p className="text-gray-700">
              Check-in:{" "}
              <span className="font-semibold">
                {todayAttendance.check_in || "N/A"}
              </span>
            </p>

            <p className="text-gray-700">
              Check-out:{" "}
              <span className="font-semibold">
                {todayAttendance.check_out || "N/A"}
              </span>
            </p>

            {!todayAttendance.check_out && (
              <button
                onClick={markCheckout}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Check Out
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={markAttendance}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Mark Attendance
          </button>
        )}
      </div>
    </div>
  );
}