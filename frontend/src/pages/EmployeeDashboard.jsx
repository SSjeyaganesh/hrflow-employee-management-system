export default function EmployeeDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Employee Dashboard
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Welcome to HRFlow
        </h2>
        <p className="text-gray-500">
          You can mark attendance and apply for leave from here.
        </p>
      </div>
    </div>
  );
}