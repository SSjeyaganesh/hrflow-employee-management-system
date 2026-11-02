import { useEffect, useState } from "react";
import api from "../services/api";
import EmployeeLayout from "../components/EmployeeLayout";

export default function EmployeeAttendance() {
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [message, setMessage] = useState("");

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get("/attendance/me");
      const today = new Date().toISOString().split("T")[0];
      const record = response.data.find((item) => item.date === today);
      setTodayAttendance(record || null);
    } catch {
      setMessage("Unable to load today's attendance");
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
      setMessage("Attendance marked successfully");
      fetchTodayAttendance();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Unable to mark attendance");
    }
  };

  const markCheckout = async () => {
    try {
      await api.put("/attendance/checkout");
      setMessage("Checkout marked successfully");
      fetchTodayAttendance();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Unable to mark checkout");
    }
  };

  return (
    <EmployeeLayout
      title="Attendance"
      subtitle="Mark your daily attendance"
    >
      <div className="bg-white p-6 rounded-xl shadow">
        {message && (
          <p className="mb-4 text-sm text-blue-600">{message}</p>
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
    </EmployeeLayout>
  );
}