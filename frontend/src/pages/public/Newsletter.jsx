import { useState, useEffect, useCallback } from "react";
import {
  getPublicAchievements,
  likeAchievement,
  commentAchievement,
} from "../../api/achievementApi";
import toast from "react-hot-toast";

function PublicPage() {
  const [achievements, setAchievements] = useState([]);
  const [filters, setFilters] = useState({ class: "", date: "" });
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("latest");
  const [loading, setLoading] = useState(false);

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getPublicAchievements(filters);

      let data = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

      /* SEARCH */
      if (search) {
        data = data.filter((a) =>
          (a.title + a.content)
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      }

      /* SORT */
      data.sort((a, b) =>
        sort === "latest"
          ? new Date(b.date) - new Date(a.date)
          : new Date(a.date) - new Date(b.date)
      );

      setAchievements(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load");
    } finally {
      setLoading(false);
    }
  }, [filters, search, sort]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return (
    <div className="min-h-screen pt-20 bg-[#f3f2ef] px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">

        {/* LEFT */}
        <div className="col-span-3 hidden md:block">
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-sm">VIT Newsletter</h3>
            <p className="text-xs text-gray-500">
              Explore achievements 🚀
            </p>
          </div>
        </div>

        {/* FEED */}
        <div className="col-span-12 md:col-span-6 space-y-4">

          {/* SEARCH */}
          <div className="bg-white p-3 rounded-xl shadow-sm flex gap-2">
            <input
              placeholder="Search..."
              className="flex-1 px-3 py-2 border rounded-md text-sm"
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              onChange={(e) => setSort(e.target.value)}
              className="px-2 border rounded-md text-sm"
            >
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          {/* POSTS */}
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : achievements.length === 0 ? (
            <p className="text-center text-gray-500">No posts</p>
          ) : (
            achievements.map((a) => (
              <PostCard
                key={a._id}
                data={a}
                refresh={fetchAchievements}
              />
            ))
          )}
        </div>

        {/* FILTER */}
        <div className="col-span-3 hidden md:block">
          <div className="bg-white p-4 rounded-xl shadow-sm space-y-3">
            <Input
              placeholder="Class"
              onChange={(e) =>
                setFilters({ ...filters, class: e.target.value })
              }
            />
            <Input
              type="date"
              onChange={(e) =>
                setFilters({ ...filters, date: e.target.value })
              }
            />
            <button
              onClick={fetchAchievements}
              className="w-full py-2 bg-[#0a66c2] text-white rounded-md"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostCard({ data, refresh }) {
  const [comment, setComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const initials = data.createdBy?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("");

  /* LIKE */
  const handleLike = async () => {
    try {
      await likeAchievement(data._id);
      refresh();
    } catch {
      toast.error("Like failed");
    }
  };

  /* COMMENT */
  const handleComment = async () => {
    if (!comment) return;

    try {
      await commentAchievement(data._id, comment);
      setComment("");
      refresh();
    } catch {
      toast.error("Comment failed");
    }
  };
   const handleShare = async (id) => {
      const url = `${window.location.origin}/post/${id}`;
      try{
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
      }catch (e){
        console.error(e);
      }
    };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
          {initials}
        </div>

        <div>
          <p className="font-semibold">{data.createdBy?.name}</p>
          <p className="text-xs text-gray-500">{data.date}</p>
        </div>
      </div>

      {/* CONTENT */}
      <h2 className="font-semibold">{data.title}</h2>
      <p className="text-sm text-gray-600">{data.content}</p>

      {/* IMAGE */}
      {data.images?.length > 0 && (
        <img
          src={data.images[0]}
          className="mt-2 rounded-md w-full h-40 object-cover"
        />
      )}

      {/* ACTIONS */}
      <div className="flex justify-between mt-3 border-t pt-2 text-sm">

        <button onClick={handleLike}>
          👍 {data.likes?.length || 0}
        </button>

        <button onClick={() => setShowComments(!showComments)}>
          💬 {data.comments?.length || 0}
        </button>

        <button onClick={() => handleShare(data._id)}        >
          ↗ Share
        </button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="mt-3">
          <input
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write comment..."
            className="w-full px-3 py-2 border rounded-md text-sm"
          />

          <button
            onClick={handleComment}
            className="mt-2 bg-blue-600 text-white px-3 py-1 rounded"
          >
            Post
          </button>

          <div className="mt-2 space-y-2">
            {data.comments?.map((c, i) => (
              <div key={i} className="bg-gray-100 p-2 rounded text-sm">
                {c.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
 
const Input = (props) => (
  <input
    {...props}
    className="w-full px-3 py-2 border rounded-md text-sm"
  />
);

export default PublicPage;