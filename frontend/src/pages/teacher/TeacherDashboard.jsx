import { useState, useEffect, useCallback } from "react";
import {
  getTeacherAchievements,
  approveAchievement,
  rejectAchievement,
} from "../../api/achievementApi";
import toast, { Toaster } from "react-hot-toast";

function TeacherDashboard() {
  const [achievements, setAchievements] = useState([]);
  const [filter, setFilter] = useState("all");
  const [activeId, setActiveId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const token = localStorage.getItem("token");

  /* 🔹 FETCH */
  const fetchAchievements = useCallback(async () => {
    try {
      const res = await getTeacherAchievements();
      setAchievements(res.data);
    } catch {
      toast.error("Failed to fetch");
    }
    
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  /* 🔹 ACTIONS */
  const handleApprove = async (id) => {
    try {
      setActiveId(id);

      await approveAchievement(id);

      toast.success("Approved");
      fetchAchievements();
    } catch(err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setActiveId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActiveId(id);

      await rejectAchievement(id);

      toast.success("Rejected");
      fetchAchievements();
    } catch {
      toast.error("Failed");
    } finally {
      setActiveId(null);
    }
  };

  /* 🔹 FILTERED DATA */
  const filtered =
    filter === "all"
      ? achievements
      : achievements.filter((a) => a.status === filter);

  return (
    <div className="min-h-screen pt-20 bg-[#f3f2ef] px-4">
      <Toaster position="top-center" />

      <div className="max-w-3xl mx-auto space-y-4">

        {/* 🔥 HEADER */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">

          <h1 className="text-lg font-semibold mb-3">
            Review Achievements
          </h1>

          <div className="flex gap-2">
            {["all", "pending", "approved", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-sm rounded-full border ${
                  filter === f
                    ? "bg-[#0a66c2] text-white"
                    : "text-gray-600"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* 🔥 FEED */}
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((a) => (
            <PostCard
              key={a._id}
              data={a}
              activeId={activeId}
              onApprove={handleApprove}
              onReject={handleReject}
              setSelectedImage={setSelectedImage}
            />
          ))
        )}
      </div>

      {/* 🔥 IMAGE MODAL */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <img
            src={selectedImage}
            className="max-h-[80%] max-w-[80%] rounded-xl"
          />
        </div>
      )}
    </div>
  );
}

/* 🔥 POST CARD */
function PostCard({
  data,
  activeId,
  onApprove,
  onReject,
  setSelectedImage,
}) {
  const initials = data.createdBy?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const statusStyle =
    data.status === "approved"
      ? "bg-green-100 text-green-600"
      : data.status === "rejected"
      ? "bg-red-100 text-red-600"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">

      {/* HEADER */}
      <div className="flex justify-between mb-3">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 bg-[#0a66c2] text-white rounded-full flex items-center justify-center font-semibold">
            {initials || "U"}
          </div>

          <div>
            <p className="text-sm font-semibold">
              {data.createdBy?.name}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(data.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <span className={`px-2 py-1 text-xs rounded ${statusStyle}`}>
          {data.status}
        </span>
      </div>

      {/* TITLE */}
      <h3 className="font-semibold text-gray-900 mb-1">
        {data.title}
      </h3>

      {/* CONTENT */}
      <p className="text-sm text-gray-700 mb-3">
        {data.content}
      </p>

      {/* IMAGES */}
      {data.images?.length > 0 && (
        <div
          className={`grid gap-2 ${
            data.images.length === 1
              ? "grid-cols-1"
              : data.images.length === 2
              ? "grid-cols-2"
              : "grid-cols-3"
          }`}
        >
          {data.images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setSelectedImage(img)}
              className="h-40 w-full object-cover rounded-md cursor-pointer hover:scale-[1.02] transition"
            />
          ))}
        </div>
      )}

      {/* ACTIONS */}
      {data.status === "pending" && (
        <div className="flex gap-3 mt-4">
          <button
            disabled={activeId === data._id}
            onClick={() => onApprove(data._id)}
            className="flex-1 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 disabled:opacity-50"
          >
            {activeId === data._id ? "Processing..." : "Approve"}
          </button>

          <button
            disabled={activeId === data._id}
            onClick={() => onReject(data._id)}
            className="flex-1 py-2 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 disabled:opacity-50"
          >
            {activeId === data._id ? "Processing..." : "Reject"}
          </button>
        </div>
      )}
    </div>
  );
}

/* 🔥 EMPTY */
function EmptyState() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
      No achievements to review
    </div>
  );
}

export default TeacherDashboard;