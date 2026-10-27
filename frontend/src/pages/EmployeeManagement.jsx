import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import api from "../services/api";

const emptyForm = {
  full_name: "",
  phone: "",
  department_id: "",
  designation: "",
  joining_date: "",
  status: "active",
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.get("/employees/", {
        params: {
          search: search || undefined,
          page,
          limit,
        },
      });
      setEmployees(response.data);
      setError("");
    } catch {
      setError("Unable to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, search]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
    setMessage("");
  };

  const openEditForm = (employee) => {
    setEditingId(employee.id);
    setForm({
      full_name: employee.full_name || "",
      phone: employee.phone || "",
      department_id: employee.department_id || "",
      designation: employee.designation || "",
      joining_date: employee.joining_date || "",
      status: employee.status || "active",
    });
    setShowForm(true);
    setMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone || null,
        department_id: form.department_id ? Number(form.department_id) : null,
        designation: form.designation || null,
        joining_date: form.joining_date || null,
        status: form.status,
      };

      if (editingId) {
        await api.put(`/employees/${editingId}`, payload);
        setMessage("Employee updated successfully");
      } else {
        await api.post("/employees/", payload);
        setMessage("Employee created successfully");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchEmployees();
    } catch {
      setError("Unable to save employee");
    }
  };

  const handleDelete = async (employeeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/employees/${employeeId}`);
      setMessage("Employee deleted successfully");
      fetchEmployees();
    } catch {
      setError("Unable to delete employee");
    }
  };

  return (
    <AdminLayout
      title="Employee Management"
      subtitle="Manage employee records, departments, and status"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex gap-3">
          <button
            onClick={openAddForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Employee
          </button>

          <Link
            to="/admin"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

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

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <input
          type="text"
          placeholder="Search employee by name..."
          value={search}
          onChange={handleSearch}
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            {editingId ? "Edit Employee" : "Add Employee"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              name="full_name"
              placeholder="Full Name"
              value={form.full_name}
              onChange={handleChange}
              className="px-4 py-3 border rounded-lg"
              required
            />

            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className="px-4 py-3 border rounded-lg"
            />

            <input
              name="department_id"
              type="number"
              placeholder="Department ID"
              value={form.department_id}
              onChange={handleChange}
              className="px-4 py-3 border rounded-lg"
            />

            <input
              name="designation"
              placeholder="Designation"
              value={form.designation}
              onChange={handleChange}
              className="px-4 py-3 border rounded-lg"
            />

            <input
              name="joining_date"
              type="date"
              value={form.joining_date}
              onChange={handleChange}
              className="px-4 py-3 border rounded-lg"
            />

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="px-4 py-3 border rounded-lg"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
              >
                {editingId ? "Update Employee" : "Create Employee"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(emptyForm);
                }}
                className="bg-gray-500 text-white px-5 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-600">Loading employees...</p>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="min-w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">{employee.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {employee.full_name}
                  </td>
                  <td className="px-6 py-4">{employee.phone || "N/A"}</td>
                  <td className="px-6 py-4">
                    {employee.designation || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        employee.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditForm(employee)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {employees.length === 0 && (
            <p className="p-6 text-gray-500">No employees found.</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => setPage((oldPage) => Math.max(oldPage - 1, 1))}
          disabled={page === 1}
          className="bg-white border px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-gray-700">Page {page}</span>

        <button
          onClick={() => setPage((oldPage) => oldPage + 1)}
          disabled={employees.length < limit}
          className="bg-white border px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </AdminLayout>
  );
}