import { useState } from "react";
import { sendOtp, verifyOtp, registerUser } from "../../api/authApi";
import toast, { Toaster } from "react-hot-toast";

function Register() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(null);

  const [form, setForm] = useState({
    email: "",
    otp: "",
    firstName: "",
    lastName: "",
    password: "",
    year: "",
    division: "",
  });

  /* 🔥 ADMIN EMAILS */
  const adminEmails =
    import.meta.env.VITE_ADMIN_EMAILS?.split(",") || [];

  const isAdmin = (email) => adminEmails.includes(email);

  /* 🔥 ROLE DETECTION */
  const detectRole = (email) => {
    if (isAdmin(email)) return "teacher";

    const username = email.split("@")[0];
    const digits = username.match(/\d/g)?.length || 0;

    return digits >= 2 ? "student" : "teacher";
  };

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });

    if (field === "email" && value.endsWith("@vit.edu")) {
      const detected = detectRole(value);
      setRole(detected);
    }
  };

  /* 🔹 STEP 1 */
  const handleSendOtp = async () => {
    if (!form.email.endsWith("@vit.edu")) {
      return toast.error("Use VIT email only");
    }

    const detected = detectRole(form.email);
    setRole(detected);

    try {
      setLoading(true);
      await sendOtp(form.email);
      toast.success("OTP sent 📩");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* 🔹 STEP 2 */
  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      await verifyOtp(form.email, form.otp);
      toast.success("OTP Verified ✅");
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  /* 🔹 STEP 3 */
  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.password) {
      return toast.error("Fill all fields");
    }

    try {
      setLoading(true);

      const payload =
        role === "student"
          ? {
              name: `${form.firstName} ${form.lastName}`,
              email: form.email,
              password: form.password,
              type: "student",
              studentClass: `${form.year}-${form.division}`,
            }
          : {
              name: `${form.firstName} ${form.lastName}`,
              email: form.email,
              password: form.password,
              type: "teacher",
              classAssigned: `${form.year}-${form.division}`,
            };

      await registerUser(payload);

      toast.success("Registered 🚀");

      /* 🔥 FIXED REDIRECT */
      setTimeout(() => {
        if (role === "teacher") {
          window.location.href = "/teacher-login";
        } else {
          window.location.href = "/student-login";
        }
      }, 1000);

    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f2ef] flex items-center justify-center px-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-xl shadow-sm p-6">

        <h2 className="text-2xl font-semibold text-center mb-2">
          Join VIT Network
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          Step {step} of 3
        </p>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <Input
              placeholder="Email (@vit.edu)"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <Button onClick={handleSendOtp} disabled={loading}>
              {loading ? <Spinner /> : "Send OTP"}
            </Button>
          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <Input
              placeholder="Enter OTP"
              value={form.otp}
              onChange={(e) => handleChange("otp", e.target.value)}
            />

            <Button onClick={handleVerifyOtp} disabled={loading}>
              {loading ? <Spinner /> : "Verify OTP"}
            </Button>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <div className="flex gap-2">
              <Input
                placeholder="First Name"
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
              <Input
                placeholder="Last Name"
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Select
                options={["FY", "SY", "TY", "BTech"]}
                value={form.year}
                onChange={(v) => handleChange("year", v)}
              />
              <Select
                options={["A", "B", "C", "D"]}
                value={form.division}
                onChange={(v) => handleChange("division", v)}
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                onChange={(e) => handleChange("password", e.target.value)}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 cursor-pointer text-gray-500"
              >
                👁️
              </span>
            </div>

            <Button onClick={handleRegister} disabled={loading}>
              {loading ? <Spinner /> : "Register"}
            </Button>
          </>
        )}
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

/* 🔹 BUTTON */
const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="w-full py-2 mt-2 bg-[#0a66c2] text-white rounded-md text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
  >
    {children}
  </button>
);

/* 🔹 SELECT */
function Select({ options, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md text-sm"
    >
      <option value="">Select</option>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

/* 🔹 SPINNER */
function Spinner() {
  return (
    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
  );
}

export default Register;