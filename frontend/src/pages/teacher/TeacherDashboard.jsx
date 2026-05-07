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
  const [selectedImage, setSelectedImage] = useState(null);

  const [form, setForm] = useState({
    title: "",
    content: "",
    date: "",
    images: [],
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  /* FETCH */
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

  /* CREATE POST */
  const handleCreate = async () => {
    if (!form.title || !form.content) {
      return toast.error("Fill all fields");
    }

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("title", form.title);
      fd.append("content", form.content);
      fd.append("date", form.date || new Date());

      form.images.forEach((img) => {
        fd.append("images", img);
      });

      await createAchievement(fd);

      toast.success("Post created 🚀");

      setForm({
        title: "",
        content: "",
        date: "",
        images: [],
      });

      setPreviewImages([]);
      setShowForm(false);

      fetchAchievements();
    } catch {
      toast.error("Failed to create");
    } finally {
      setLoading(false);
    }
  };

  /* APPROVE */
  const handleApprove = async (id) => {
    try {
      await approveAchievement(id);

      setAchievements((prev) =>
        prev.map((post) =>
          post._id === id
            ? { ...post, status: "approved" }
            : post
        )
      );

      toast.success("Approved");
    } catch {
      toast.error("Failed");
    }
  };

  /* REJECT */
  const handleReject = async (id) => {
    try {
      await rejectAchievement(id);

      setAchievements((prev) =>
        prev.map((post) =>
          post._id === id
            ? { ...post, status: "rejected" }
            : post
        )
      );

      toast.success("Rejected");
    } catch {
      toast.error("Failed");
    }
  };

  /* DELETE */
  const handleDelete = async (id) => {
    if (!confirm("Delete this post?")) return;

    try {
      await deleteAchievement(id);

      setAchievements((prev) =>
        prev.filter((post) => post._id !== id)
      );

      toast.success("Deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  /* HIDE */
  const handleHide = async (id) => {
    try {
      await hideAchievement(id);

      setAchievements((prev) =>
        prev.map((post) =>
          post._id === id
            ? {
                ...post,
                isHidden: !post.isHidden,
              }
            : post
        )
      );

      toast.success("Updated");
    } catch {
      toast.error("Failed");
    }
  };

  /* FILTERS */
  const filtered =
    filter === "all"
      ? achievements
      : filter === "my"
      ? achievements.filter((a) => a.isTeacherPost)
      : achievements.filter((a) => a.status === filter);

  return (
    <div className="min-h-screen pt-20 bg-[#f3f2ef] px-4">
      <Toaster position="top-center" />

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">

        {/* LEFT PANEL */}
        <div className="hidden lg:block col-span-3">

          <div className="bg-white rounded-2xl shadow-sm border p-5 sticky top-24">

            <h2 className="font-bold text-xl text-gray-800">
              Teacher Panel
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Manage student achievements & posts
            </p>

            <div className="mt-6 space-y-3">

              <StatCard
                label="Total Posts"
                value={achievements.length}
              />

              <StatCard
                label="Pending"
                value={
                  achievements.filter(
                    (a) => a.status === "pending"
                  ).length
                }
              />

              <StatCard
                label="Approved"
                value={
                  achievements.filter(
                    (a) => a.status === "approved"
                  ).length
                }
              />
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="col-span-12 lg:col-span-6 space-y-4">

          {/* START POST */}
          <div className="bg-white border rounded-2xl shadow-sm p-4">

            <div
              onClick={() => setShowForm(true)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-[#0a66c2] flex items-center justify-center text-white font-semibold">
                T
              </div>

              <div className="flex-1 bg-gray-100 hover:bg-gray-200 transition px-4 py-3 rounded-full text-sm text-gray-500">
                Share an announcement...
              </div>
            </div>
          </div>

          {/* CREATE POST */}
          {showForm && (
            <div className="bg-white border rounded-2xl shadow-sm p-5">

              <h2 className="font-semibold text-lg mb-4">
                Create Announcement
              </h2>

              <Input
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
              />

              <textarea
                placeholder="Share something with students..."
                value={form.content}
                onChange={(e) =>
                  setForm({
                    ...form,
                    content: e.target.value,
                  })
                }
                className="w-full border rounded-xl px-4 py-3 h-28 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
              />
              <Input type="date" value={form.date} onChange={(e) => setForm({...form,date: e.target.value,})}/>

              {/* IMAGE UPLOAD */}
              <div className="mt-4">

                <label className="border-2 border-dashed border-gray-300 rounded-2xl p-6 flex items-center justify-center cursor-pointer hover:border-[#0a66c2] hover:bg-blue-50 transition">

                  <div className="text-center">
                    <p className="font-medium text-gray-700">
                      📷 Upload Photos
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Select up to 5 images
                    </p>
                  </div>

                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(
                        e.target.files
                      ).slice(0, 5);

                      setForm({
                        ...form,
                        images: files,
                      });

                      const previews = files.map(
                        (file) => ({
                          file,
                          url: URL.createObjectURL(file),
                        })
                      );

                      setPreviewImages(previews);
                    }}
                  />
                </label>

                {/* PREVIEW */}
                {previewImages.length > 0 && (
                  <div
                    className={`grid gap-2 mt-4 ${
                      previewImages.length === 1
                        ? "grid-cols-1"
                        : previewImages.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-3"
                    }`}
                  >
                    {previewImages.map((img, index) => (
                      <div
                        key={index}
                        className="relative group"
                      >
                        <img
                          src={img.url}
                          alt=""
                          className="h-36 w-full object-cover rounded-xl border"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            const updatedImages =
                              form.images.filter(
                                (_, i) => i !== index
                              );

                            const updatedPreviews =
                              previewImages.filter(
                                (_, i) => i !== index
                              );

                            setForm({
                              ...form,
                              images: updatedImages,
                            });

                            setPreviewImages(
                              updatedPreviews
                            );
                          }}
                          className="absolute top-2 right-2 bg-black/70 text-white w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex gap-2 mt-5">

                <button
                  onClick={handleCreate}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-[#0a66c2] text-white rounded-xl hover:bg-blue-700 transition"
                >
                  {loading ? "Posting..." : "Post"}
                </button>

                <button
                  onClick={() => {
                    setShowForm(false);

                    setForm({
                      title: "",
                      content: "",
                      images: [],
                    });

                    setPreviewImages([]);
                  }}
                  className="px-5 py-2.5 border rounded-xl hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* FILTERS */}
          <div className="bg-white border rounded-2xl shadow-sm p-4 flex flex-wrap gap-2">

            {[
              "all",
              "pending",
              "approved",
              "rejected",
              "my",
            ].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  filter === f
                    ? "bg-[#0a66c2] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* POSTS */}
          {filtered.length === 0 ? (
            <EmptyState />
          ) : (
            filtered.map((a) => (
              <PostCard
                key={a._id}
                data={a}
                onApprove={handleApprove}
                onReject={handleReject}
                onDelete={handleDelete}
                onHide={handleHide}
                setSelectedImage={setSelectedImage}
              />
            ))
          )}
        </div>

        {/* RIGHT */}
        <div className="hidden lg:block col-span-3">

          <div className="bg-white border rounded-2xl shadow-sm p-5 sticky top-24">

            <h2 className="font-semibold text-gray-800">
              Quick Tips
            </h2>

            <ul className="mt-4 text-sm text-gray-600 space-y-3">
              <li>✅ Review student posts daily</li>
              <li>📢 Share announcements regularly</li>
              <li>🚀 Highlight top achievements</li>
              <li>🎯 Encourage participation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        >
          <img
            src={selectedImage}
            className="max-h-[90%] max-w-[90%] rounded-2xl"
          />
        </div>
      )}
    </div>
  );
}

/* POST CARD */
function PostCard({
  data,
  onApprove,
  onReject,
  onDelete,
  onHide,
  setSelectedImage,
}) {
  const statusStyle =
    data.status === "approved"
      ? "bg-green-100 text-green-600"
      : data.status === "rejected"
      ? "bg-red-100 text-red-600"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition">

      {/* HEADER */}
      <div className="flex justify-between items-start">

        <div className="flex gap-3">
          <img
            src={
              data.createdBy?.image ||
              `https://ui-avatars.com/api/?name=${data.createdBy?.name}`
            }
            alt=""
            className="w-11 h-11 rounded-full object-cover border"
          />

          <div>
            <h3 className="font-semibold text-gray-900">
              {data.createdBy?.name}
            </h3>

            <p className="text-xs text-gray-500">
              {new Date(data.date).toLocaleDateString()}
            </p>

            {data.isHidden && (
              <p className="text-xs text-red-500 mt-1">
                Hidden from public
              </p>
            )}
          </div>
        </div>

        <span
          className={`px-3 py-1 text-xs rounded-full ${statusStyle}`}
        >
          {data.status}
        </span>
      </div>

      {/* CONTENT */}
      <div className="mt-4">

        <h2 className="font-semibold text-gray-900 text-lg">
          {data.title}
        </h2>

        <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">
          {data.content}
        </p>
      </div>

      {/* IMAGES */}
      {data.images?.length > 0 && (
        <div
          className={`grid gap-2 mt-4 ${
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
              className="h-44 w-full object-cover rounded-xl cursor-pointer hover:scale-[1.02] transition"
            />
          ))}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex flex-wrap gap-2 mt-5">

        {data.status === "pending" && (
          <>
            <button
              onClick={() => onApprove(data._id)}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition text-sm"
            >
              Approve
            </button>

            <button
              onClick={() => onReject(data._id)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition text-sm"
            >
              Reject
            </button>
          </>
        )}

        <button
          onClick={() => onHide(data._id)}
          className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-sm"
        >
          {data.isHidden ? "Unhide" : "Hide"}
        </button>

        <button
          onClick={() => onDelete(data._id)}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition text-sm"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* STATS */
function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <h2 className="text-2xl font-bold text-gray-800 mt-1">
        {value}
      </h2>
    </div>
  );
}

/* EMPTY */
function EmptyState() {
  return (
    <div className="bg-white border rounded-2xl p-10 text-center text-gray-500 shadow-sm">
      🚀 No achievements found
    </div>
  );
}

/* INPUT */
const Input = ({ ...props }) => (
  <input
    {...props}
    className="w-full px-4 py-3 mb-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
  />
);

export default TeacherDashboard;