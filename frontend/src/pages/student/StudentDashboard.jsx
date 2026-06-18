import { useState, useEffect } from "react";
import {
  getMyAchievements,
  createAchievement,
} from "../../api/achievementApi";
import toast, { Toaster } from "react-hot-toast";

function StudentDashboard() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    date: "",
    images: [],
  });

  const [showForm, setShowForm] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // 🔥 IMAGE PREVIEW STATE
  const [previewImages, setPreviewImages] = useState([]);

  const fetchData = async () => {
    try {
      const res = await getMyAchievements();
      setAchievements(res.data);
    } catch {
      toast.error("Failed to fetch");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!form.title || !form.content || !form.date) {
      return toast.error("Fill all fields");
    }

    try {
      setLoading(true);

      const fd = new FormData();

      fd.append("title", form.title);
      fd.append("content", form.content);
      fd.append("date", form.date);

      form.images.forEach((img) => {
        fd.append("images", img);
      });

      await createAchievement(fd);

      toast.success("Posted 🚀");

      setShowForm(false);

      setForm({
        title: "",
        content: "",
        date: "",
        images: [],
      });

      setPreviewImages([]);

      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-[#f3f2ef] px-4">
      <Toaster position="top-center" />

      <div className="max-w-2xl mx-auto space-y-4">

        {/* 🔥 START POST */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">

          <div
            onClick={() => setShowForm(true)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-10 h-10 bg-[#0a66c2] text-white flex items-center justify-center rounded-full font-semibold">
              U
            </div>

            <div className="flex-1 bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-500 hover:bg-gray-200 transition">
              Start a post...
            </div>
          </div>
        </div>

        {/* 🔥 CREATE POST */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">

            <h2 className="font-semibold text-lg mb-4">
              Create Post
            </h2>

            {/* TITLE */}
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

            {/* CONTENT */}
            <textarea
              placeholder="What did you achieve?"
              className="w-full px-3 py-3 border border-gray-300 rounded-xl text-sm mb-3 resize-none h-28 focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
              value={form.content}
              onChange={(e) =>
                setForm({
                  ...form,
                  content: e.target.value,
                })
              }
            />

            {/* DATE */}
            <Input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({
                  ...form,
                  date: e.target.value,
                })
              }
            />

            <div className="mb-4">

              <label className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl p-6 cursor-pointer hover:border-[#0a66c2] hover:bg-blue-50 transition">

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

                    const previews = files.map((file) => ({
                      file,
                      url: URL.createObjectURL(file),
                    }));

                    setPreviewImages(previews);
                  }}
                />
              </label>

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
                          URL.revokeObjectURL(img.url);

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

                          setPreviewImages(updatedPreviews);
                        }}
                        className="absolute top-2 right-2 bg-black/70 text-white w-7 h-7 rounded-full text-sm opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-2.5 bg-[#0a66c2] text-white rounded-xl text-sm hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Posting..." : "Post"}
              </button>

              <button
                onClick={() => {
                  setShowForm(false);

                  setForm({
                    title: "",
                    content: "",
                    date: "",
                    images: [],
                  });

                  setPreviewImages([]);
                }}
                className="px-5 py-2.5 border rounded-xl text-sm hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {achievements.length === 0 ? (
          <EmptyState />
        ) : (
          achievements.map((a) => (
            <PostCard
              key={a._id}
              data={a}
              setSelectedImage={setSelectedImage}
            />
          ))
        )}
      </div>

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

function PostCard({ data, setSelectedImage }) {
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
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 hover:shadow-md transition">

      {/* HEADER */}
      <div className="flex justify-between mb-3">

        <div className="flex gap-3 items-center">

          <img src={ data.createdBy?.image ||`https://ui-avatars.com/api/?name=${data.createdBy?.name}` } alt="" className="w-10 h-10 rounded-full object-cover border" />

          <div>
            <p className="text-sm font-semibold">
              {data.createdBy?.name || "User"}
            </p>

            <p className="text-xs text-gray-500">
              {new Date(data.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        <span
          className={`px-2 py-1 text-xs rounded-full ${statusStyle}`}
        >
          {data.status}
        </span>
      </div>

      {/* TITLE */}
      <h3 className="font-semibold text-gray-900 mb-1">
        {data.title}
      </h3>

      {/* CONTENT */}
      <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">
        {data.content}
      </p>

      {/* 🔥 IMAGES */}
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
              className="h-40 w-full object-cover rounded-xl cursor-pointer hover:scale-[1.02] transition"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500 shadow-sm">
      🚀 Start sharing your achievements!
    </div>
  );
}

const Input = ({ ...props }) => (
  <input
    {...props}
    className="w-full px-3 py-2.5 mb-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
  />
);

export default StudentDashboard;