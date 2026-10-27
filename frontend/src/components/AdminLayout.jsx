import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: "📊" },
  { name: "Employees", path: "/admin/employees", icon: "👥" },
  { name: "Leave Requests", path: "/admin/leaves", icon: "📝" },
  { name: "Attendance", path: "/admin/attendance", icon: "🕒" },
  { name: "Reports", path: "/admin/reports", icon: "📄" },
];

export default function AdminLayout({ children, title, subtitle }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-slate-900 text-white">
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="text-2xl font-bold">HRFlow</h1>
          <p className="text-sm text-slate-400">HR Management</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-sm text-gray-500">
              Admin Panel
            </span>
            <button
              onClick={handleLogout}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}