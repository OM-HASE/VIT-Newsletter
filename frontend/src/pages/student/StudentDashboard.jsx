import { useState, useEffect } from "react";
import { getMyAchievements, createAchievement } from "../../api/achievementApi";
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

      form.images.forEach((img) => fd.append("images", img));

      await createAchievement(fd);

      toast.success("Posted 🚀");
      setShowForm(false);

      setForm({
        title: "",
        content: "",
        date: "",
        images: [],
      });

      fetchData();
    } catch {
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

            <div className="flex-1 bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-500">
              Start a post...
            </div>
          </div>
        </div>

        {/* 🔥 FORM MODAL STYLE */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">

            <h2 className="font-semibold mb-3">Create Post</h2>

            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />

            <textarea
              placeholder="What did you achieve?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-3 resize-none h-24"
              value={form.content}
              onChange={(e) =>
                setForm({ ...form, content: e.target.value })
              }
            />

            <Input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
            />

            <input
              type="file"
              multiple
              className="mb-3"
              onChange={(e) =>
                setForm({
                  ...form,
                  images: Array.from(e.target.files).slice(0, 5),
                })
              }
            />

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="flex-1 py-2 bg-[#0a66c2] text-white rounded-md text-sm hover:bg-blue-700"
              >
                {loading ? "Posting..." : "Post"}
              </button>

              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-md text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* 🔥 FEED */}
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

      {/* IMAGE MODAL */}
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
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-md transition">

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

      <h3 className="font-semibold text-gray-900 mb-1">
        {data.title}
      </h3>

      <p className="text-sm text-gray-700 mb-3">
        {data.content}
      </p>

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
    </div>
  );
}

/* 🔥 EMPTY STATE */
function EmptyState() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-500">
      🚀 Start sharing your achievements!
    </div>
  );
}

/* INPUT */
const Input = ({ ...props }) => (
  <input
    {...props}
    className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
  />
);

export default StudentDashboard;