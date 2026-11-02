import { useEffect, useState } from "react";
import api from "../services/api";
import EmployeeLayout from "../components/EmployeeLayout";

export default function EmployeeLeaves() {
  const [leaveForm, setLeaveForm] = useState({
    leave_type: "casual",
    start_date: "",
    end_date: "",
    reason: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [myLeaves, setMyLeaves] = useState([]);

  const fetchMyLeaves = async () => {
    try {
      const response = await api.get("/leaves/me");
      setMyLeaves(response.data);
    } catch {
      setError("Unable to load your leave requests");
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const handleChange = (event) => {
    setLeaveForm({
      ...leaveForm,
      [event.target.name]: event.target.value,
    });
  };

  const submitLeaveRequest = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/leaves/", leaveForm);
      setMessage("Leave request submitted successfully");
      fetchMyLeaves();
      setLeaveForm({
        leave_type: "casual",
        start_date: "",
        end_date: "",
        reason: "",
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to submit leave request");
    }
  };

  return (
    <EmployeeLayout
      title="Leaves"
      subtitle="Apply for leave and track your requests"
    >
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form
          onSubmit={submitLeaveRequest}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <select
            name="leave_type"
            value={leaveForm.leave_type}
            onChange={handleChange}
            className="px-4 py-3 border rounded-lg"
          >
            <option value="casual">Casual Leave</option>
            <option value="sick">Sick Leave</option>
            <option value="earned">Earned Leave</option>
            <option value="unpaid">Unpaid Leave</option>
          </select>

          <input
            name="start_date"
            type="date"
            value={leaveForm.start_date}
            onChange={handleChange}
            className="px-4 py-3 border rounded-lg"
            required
          />

          <input
            name="end_date"
            type="date"
            value={leaveForm.end_date}
            onChange={handleChange}
            className="px-4 py-3 border rounded-lg"
            required
          />

          <textarea
            name="reason"
            placeholder="Reason for leave"
            value={leaveForm.reason}
            onChange={handleChange}
            className="px-4 py-3 border rounded-lg md:col-span-2"
            required
          />

          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
            >
              Submit Leave Request
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          My Leave Requests
        </h2>

        {myLeaves.length === 0 ? (
          <p className="text-gray-500">No leave requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">End Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((leave) => (
                  <tr key={leave.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 capitalize">{leave.leave_type}</td>
                    <td className="px-4 py-3">{leave.start_date}</td>
                    <td className="px-4 py-3">{leave.end_date}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          leave.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : leave.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
}