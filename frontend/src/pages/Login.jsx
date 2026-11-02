import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";


export default function Login() {
  const navigate = useNavigate();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);


    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);

      let response;
      try {
        response = await api.post("/auth/login", params);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.status === 401
            ? "Invalid email or password"
            : "Unable to sign in. Please try again."
        );
        return;
      }

      localStorage.setItem("access_token", response.data.access_token);

      let profile;
      try {
        profile = await api.get("/auth/me");
      } catch (err) {
        console.error(err);
        localStorage.removeItem("access_token");
        localStorage.removeItem("role");
        setError(
          "Sign-in succeeded, but your profile could not be loaded. Please try again or contact an administrator."
        );
        return;
      }

      localStorage.setItem("role", profile.data.role);

      if (profile.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/employee");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xl">
              H
            </div>
            <div>
              <h1 className="text-2xl font-bold">HRFlow</h1>
              <p className="text-slate-400 text-sm">
                Employee Management System
              </p>
            </div>
          </div>


          <div className="mt-20">
            <h2 className="text-4xl font-bold leading-tight">
              Manage your workforce
              <br />
              with clarity.
            </h2>


            <p className="text-slate-400 mt-5 max-w-md">
              Track attendance, manage leave requests, and keep employee
              records organized in one professional workspace.
            </p>
          </div>
        </div>


        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white/5 rounded-xl p-5">
            <p className="text-2xl font-bold">Attendance</p>
            <p className="text-slate-400 text-sm mt-1">
              Daily tracking
            </p>
          </div>


          <div className="bg-white/5 rounded-xl p-5">
            <p className="text-2xl font-bold">Leaves</p>
            <p className="text-slate-400 text-sm mt-1">
              Easy approvals
            </p>
          </div>


          <div className="bg-white/5 rounded-xl p-5">
            <p className="text-2xl font-bold">Reports</p>
            <p className="text-slate-400 text-sm mt-1">
              PDF exports
            </p>
          </div>
        </div>
      </div>


      {/* Right login panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              H
            </div>
            <h1 className="text-2xl font-bold text-slate-900">HRFlow</h1>
          </div>


          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900">
              Sign in
            </h2>


            <p className="text-sm text-gray-500 mt-2 mb-7">
              Welcome back. Please enter your details.
            </p>


            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}


            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>


                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>


                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />


                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>


              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>


            <div className="mt-7 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Authorized users only. All activity may be monitored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}