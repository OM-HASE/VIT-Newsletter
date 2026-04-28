import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { updateProfile, changePassword } from "../api/userApi";

function Profile() {
  const { user, login, logout } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || "");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(user?.image || null);

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // 🔹 Image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // 🔹 UPDATE PROFILE (REAL API)
  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);

      if (image) {
        formData.append("image", image);
      }

      const res = await updateProfile(formData);

      // ✅ Update global auth state
      login({
        ...res.data.user,
        token: localStorage.getItem("token"),
      });

      alert("Profile updated successfully");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 CHANGE PASSWORD (REAL API)
  const handlePasswordChange = async () => {
    try {
      if (!password || !newPassword) {
        return alert("Please fill both fields");
      }

      await changePassword({
        currentPassword: password,
        newPassword: newPassword,
      });

      alert("Password updated");

      setPassword("");
      setNewPassword("");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Password update failed");
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-[#f3f2ef]">
      <div className="max-w-4xl mx-auto px-4 space-y-6">

        {/* PROFILE CARD */}
        <div className="bg-white border rounded-xl shadow-sm p-6">

          <div className="flex items-center gap-5">

            {/* Avatar */}
            <div className="relative">
              <img
                src={
                  preview ||
                  "https://ui-avatars.com/api/?name=" + user?.name
                }
                alt="profile"
                className="w-20 h-20 rounded-full object-cover"
              />

              <input
                type="file"
                onChange={handleImageChange}
                className="mt-2 text-sm"
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                {user?.name}
              </h2>
              <p className="text-sm text-gray-500">
                {user?.email}
              </p>

              <span className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                {user?.role}
              </span>
            </div>
          </div>

          {/* FORM */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-gray-600">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md mt-1 focus:ring-2 focus:ring-[#0a66c2]"
              />
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={handleSave}
            disabled={loading}
            className={`mt-4 px-4 py-2 rounded-md text-white ${
              loading
                ? "bg-gray-400"
                : "bg-[#0a66c2] hover:bg-blue-700"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* PASSWORD CARD */}
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <h3 className="text-md font-semibold mb-4">
            Change Password
          </h3>

          <div className="space-y-3">
            <input
              type="password"
              placeholder="Current Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />

            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />

            <button
              onClick={handlePasswordChange}
              className="px-4 py-2 bg-[#0a66c2] text-white rounded-md"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* LOGOUT */}
        <div className="text-right">
          <button
            onClick={logout}
            className="text-red-500 text-sm hover:underline"
          >
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}

export default Profile;