import { useState, useEffect, useCallback } from "react";
import {
  getTeacherAchievements,
  approveAchievement,
  rejectAchievement,
  createAchievement,
  deleteAchievement,
  hideAchievement,
} from "../../api/achievementApi";
import toast, { Toaster } from "react-hot-toast";

function TeacherDashboard() {
  const [achievements, setAchievements] = useState([]);
  const [filter, setFilter] = useState("all");
  const [activeId, setActiveId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  // 🔥 NEW: Create Post
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAchievements();
  }, [fetchAchievements]);

  /* 🔹 CREATE POST (AUTO APPROVED) */
  const handleCreate = async () => {
    if (!title || !content) {
      toast.error("Title & Content required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("date", new Date());

      images.forEach((img) => formData.append("images", img));

      await createAchievement(formData);

      toast.success("Post created");
      setTitle("");
      setContent("");
      setImages([]);

      fetchAchievements();
    } catch {
      toast.error("Failed to create");
    }
  };

  /* 🔹 ACTIONS */
  const handleApprove = async (id) => {
    try {
      setActiveId(id);
      await approveAchievement(id);
      toast.success("Approved");
      fetchAchievements();
    } catch {
      toast.error("Failed");
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

  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;

    await deleteAchievement(id);
    toast.success("Deleted");
    fetchAchievements();
  };

  const handleHide = async (id) => {
    await hideAchievement(id);
    toast.success("Hidden from public");
    fetchAchievements();
  };

  /* 🔹 FILTER */
  const filtered =
    filter === "all"
      ? achievements
      : filter === "my"
      ? achievements.filter((a) => a.isTeacherPost)
      : achievements.filter((a) => a.status === filter);

  return (
    <div className="min-h-screen pt-20 bg-[#f3f2ef] px-4">
      <Toaster position="top-center" />

      <div className="max-w-3xl mx-auto space-y-4">

        {/* 🔥 CREATE POST */}
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-3">Create Post</h2>

          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded mb-2"
          />

          <textarea
            placeholder="Share something..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border p-2 rounded mb-2"
          />

          <input
            type="file"
            multiple
            onChange={(e) => setImages([...e.target.files])}
          />

          <button
            onClick={handleCreate}
            className="mt-3 px-4 py-2 bg-[#0a66c2] text-white rounded hover:bg-blue-700"
          >
            Post
          </button>
        </div>

        {/* 🔥 FILTER */}
        <div className="bg-white border rounded-xl p-4 shadow-sm flex gap-2 flex-wrap">
          {["all", "pending", "approved", "rejected", "my"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-sm rounded-full border ${
                filter === f
                  ? "bg-[#0a66c2] text-white"
                  : "text-gray-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* 🔥 POSTS */}
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
              onDelete={handleDelete}
              onHide={handleHide}
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
  onApprove,
  onReject,
  onDelete,
  onHide,
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
    <div className="bg-white border rounded-xl shadow-sm p-4">

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
        <div className="grid grid-cols-2 gap-2">
          {data.images.map((img, i) => (
            <img
              key={i}
              src={img}
              onClick={() => setSelectedImage(img)}
              className="h-40 w-full object-cover rounded-md cursor-pointer"
            />
          ))}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-2 mt-4 text-sm">

        {data.status === "pending" && (
          <>
            <button onClick={() => onApprove(data._id)}>
              Approve
            </button>
            <button onClick={() => onReject(data._id)}>
              Reject
            </button>
          </>
        )}

        <button onClick={() => onDelete(data._id)}>
          Delete
        </button>

        <button onClick={() => onHide(data._id)}>
          Hide
        </button>

      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border rounded-xl p-6 text-center text-gray-500">
      No achievements to review
    </div>
  );
}

export default TeacherDashboard;