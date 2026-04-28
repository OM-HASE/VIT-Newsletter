import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { AuthContext } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

function TeacherLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      return toast.error("Please fill all fields");
    }

    try {
      setLoading(true);

      const res = await loginUser({ email, password });
      login(res.data);

      toast.success("Login successful");

      setTimeout(() => {
        navigate("/teacher-dashboard");
      }, 800);

    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-[#f3f2ef]">
      <Toaster position="top-center" />

      {/* Card */}
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-6">

        <h2 className="text-2xl font-semibold text-center mb-2">
          Teacher Login
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          Access teacher dashboard
        </p>

        {/* Email */}
        <Input
          type="email"
          placeholder="Email (@vit.edu)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Forgot Password */}
        <div className="text-right mb-4">
          <button className="text-sm text-[#0a66c2] hover:underline">
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-2 bg-[#0a66c2] text-white rounded-md text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Register */}
        <p className="text-sm text-center mt-4 text-gray-600">
          New here?{" "}
          <Link to="/register" className="text-[#0a66c2] hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

/* 🔹 INPUT */
const Input = ({ ...props }) => (
  <input
    {...props}
    className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
  />
);

export default TeacherLogin;