import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function LeaveRequests() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await api.get("/leaves/");
      setLeaves(response.data);
      setError("");
    } catch {
      setError("Unable to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const updateLeaveStatus = async (leaveId, status) => {
    try {
      setError("");
      setMessage("");

      await api.put(`/leaves/${leaveId}`, { status });

      setMessage(
        status === "approved"
          ? "Leave request approved successfully"
          : "Leave request rejected successfully"
      );

      fetchLeaves();
    } catch {
      setError("Unable to update leave request");
    }
  };

  const filteredLeaves =
    filter === "all"
      ? leaves
      : leaves.filter((leave) => leave.status === filter);

  return (
    <AdminLayout
      title="Leave Requests"
      subtitle="Review, approve, and reject employee leave requests"
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

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-wrap gap-2">
          {["all", "pending", "approved", "rejected"].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                filter === item
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading leave requests...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Leave Type</th>
                <th className="px-6 py-4">Start Date</th>
                <th className="px-6 py-4">End Date</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredLeaves.map((leave) => (
                <tr
                  key={leave.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {leave.employee_name || `Employee #${leave.employee_id}`}
                  </td>

                  <td className="px-6 py-4 capitalize">
                    {leave.leave_type || "N/A"}
                  </td>

                  <td className="px-6 py-4">{leave.start_date}</td>
                  <td className="px-6 py-4">{leave.end_date}</td>

                  <td className="px-6 py-4 max-w-xs">
                    <p className="truncate" title={leave.reason}>
                      {leave.reason || "N/A"}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        statusStyles[leave.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {leave.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            updateLeaveStatus(leave.id, "approved")
                          }
                          className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            updateLeaveStatus(leave.id, "rejected")
                          }
                          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        No action needed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLeaves.length === 0 && (
            <p className="p-6 text-gray-500">No leave requests found.</p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}