import { useContext, useState, useEffect } from "react";
import { getProfile, updateProfile, changePassword } from "../api/userApi";
import { AuthContext } from "../context/AuthContext";

function Profile() {
  const { login, logout } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data);
        setName(res.data.name);
        setPreview(res.data.image);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      if (image) formData.append("image", image);

      const res = await updateProfile(formData);

      login({
        user: res.data.user,
        token: localStorage.getItem("token"),
      });

      setProfile(res.data.user);
      alert("Profile updated");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      await changePassword({
        currentPassword: password,
        newPassword,
      });

      alert("Password updated");
      setPassword("");
      setNewPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  if (!profile) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen pt-20 bg-[#f3f2ef]">
      <div className="max-w-3xl mx-auto px-3 sm:px-4 space-y-6">

        {/* PROFILE CARD */}
        <div className="bg-white border rounded-xl shadow-sm p-6">

          <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start gap-6">

            {/* Avatar */}
            <div className="flex flex-col items-center">
              <img
                src={
                  preview ||
                  "https://ui-avatars.com/api/?name=" + profile.name
                }
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border"
              />

              <label className="mt-3 text-xs cursor-pointer text-[#0a66c2] hover:underline">
                Change Photo
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {profile.name}
              </h2>

              <p className="text-gray-500 text-sm">
                {profile.email}
              </p>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">

                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  {profile.role}
                </span>

                {profile.class && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    Class: {profile.class}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 mt-3">
                {profile.role === "student" && (
                  profile.assignedTeacher ? (
                    <p className="text-sm text-gray-600 mt-3">
                      Teacher: {profile.assignedTeacher.name}
                    </p>
                  ): (
                    <p className="text-sm text-gray-400 mt-3">
                      No teacher assigned
                    </p>
                  )
                )}
              </p>
            </div>
          </div>

          {/* EDIT NAME */}
          <div className="mt-6">
            <label className="text-sm text-gray-600">
              Full Name
            </label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md mt-1 focus:ring-2 focus:ring-[#0a66c2]"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="mt-4 w-full sm:w-auto px-5 py-2 bg-[#0a66c2] text-white rounded-md hover:bg-blue-700 transition"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* PASSWORD */}
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4 text-gray-800">
            Security
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
              className="w-full sm:w-auto px-4 py-2 bg-[#0a66c2] text-white rounded-md hover:bg-blue-700"
            >
              Update Password
            </button>
          </div>
        </div>

        {/* ACCOUNT */}
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <h3 className="font-semibold mb-4 text-gray-800">
            Account Settings
          </h3>

          <div className="flex flex-col sm:flex-row justify-between gap-3">

            <button
              onClick={logout}
              className="text-sm text-gray-600 hover:underline"
            >
              Logout
            </button>

            <button
              className="text-sm text-red-500 hover:underline"
              onClick={() => {
                if (confirm("Delete account permanently?")) {
                  alert("Delete API not implemented yet");
                }
              }}
            >
              Delete Account
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;