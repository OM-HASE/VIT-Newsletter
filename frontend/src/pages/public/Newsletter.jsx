import { useState, useEffect, useCallback, useContext } from "react";
import {
  getPublicAchievements,
  likeAchievement,
  commentAchievement,
} from "../../api/achievementApi";

import { AuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

function PublicPage() {
  const [achievements, setAchievements] = useState([]);
  const [filters, setFilters] = useState({
    class: "",
    date: "",
  });

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
        <div className="hidden lg:block col-span-3">

          <div className="bg-white rounded-2xl border shadow-sm p-5 sticky top-24">

            <h2 className="font-bold text-xl text-gray-800">
              VIT Newsletter
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Explore achievements, announcements &
              updates 🚀
            </p>

            <div className="mt-6 space-y-3">

              <StatCard
                label="Total Posts"
                value={achievements.length}
              />

              <StatCard
                label="Latest Posts"
                value={
                  achievements.filter(
                    (a) =>
                      new Date(a.date).getMonth() ===
                      new Date().getMonth()
                  ).length
                }
              />
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="col-span-12 lg:col-span-6 space-y-4">

          {/* SEARCH */}
          <div className="bg-white rounded-2xl border shadow-sm p-4">

            <div className="flex gap-2">

              <input
                placeholder="Search achievements..."
                className="flex-1 px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                onChange={(e) =>
                  setSort(e.target.value)
                }
                className="px-3 border rounded-xl text-sm"
              >
                <option value="latest">
                  Latest
                </option>

                <option value="oldest">
                  Oldest
                </option>
              </select>
            </div>
          </div>

          {/* POSTS */}
          {loading ? (
            <p className="text-center text-gray-500">
              Loading...
            </p>
          ) : achievements.length === 0 ? (
            <EmptyState />
          ) : (
            achievements.map((a) => (
              <PostCard
                key={a._id}
                data={a}
                setAchievements={setAchievements}
              />
            ))
          )}
        </div>

        {/* RIGHT */}
        <div className="hidden lg:block col-span-3">

          <div className="bg-white rounded-2xl border shadow-sm p-5 sticky top-24">

            <h2 className="font-semibold text-gray-800">
              Filters
            </h2>

            <div className="mt-4 space-y-3">

              <Input
                placeholder="Class"
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    class: e.target.value,
                  })
                }
              />

              <Input
                type="date"
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    date: e.target.value,
                  })
                }
              />

              <button
                onClick={fetchAchievements}
                className="w-full py-2.5 bg-[#0a66c2] text-white rounded-xl hover:bg-blue-700 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* POST CARD */
function PostCard({ data, setAchievements }) {
  const { user } = useContext(AuthContext);

  const [comment, setComment] = useState("");
  const [showComments, setShowComments] =
    useState(false);

  /* FORMAT DATE */
  const formattedDate = new Date(
    data.date
  ).toLocaleDateString("en-GB");

  /* LIKE */
  const handleLike = async () => {
  if (!user) {
    return toast.error(
      "Login required to like"
    );
  }

  try {
    await likeAchievement(data._id);

    setAchievements((prev) =>
      prev.map((post) =>
        post._id === data._id
          ? {
              ...post,
              likes: post.likes?.includes(user._id)
                ? post.likes.filter(
                    (id) => id !== user._id
                  )
                : [...post.likes, user._id],
            }
          : post
      )
    );
  } catch {
    toast.error("Like failed");
  }
};

  const handleComment = async () => {
  if (!user) {
    return toast.error(
      "Login required to comment"
    );
  }

  if (!comment) return;

  try {
    await commentAchievement(
      data._id,
      comment
    );

    const newComment = {
      text: comment,
      createdAt: new Date(),
      user: {
        name: user.name,
        image: user.image,
      },
    };

    setAchievements((prev) =>
      prev.map((post) =>
        post._id === data._id
          ? {
              ...post,
              comments: [
                ...post.comments,
                newComment,
              ],
            }
          : post
      )
    );

    setComment("");

    toast.success("Comment added");
  } catch {
    toast.error("Comment failed");
  }
};

  /* SHARE */
  const handleShare = async (id) => {
  const shareUrl = window.location.href;;

  try {
    if (navigator.share) {
      await navigator.share({
        title: data.title,
        text: data.content,
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(
        shareUrl
      );

      toast.success("Link copied");
    }
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition">

      {/* HEADER */}
      <div className="flex justify-between items-start">

        <div className="flex gap-3">

          {/* PROFILE IMAGE */}
          <img
            src={
              data.createdBy?.image ||
              `https://ui-avatars.com/api/?name=${data.createdBy?.name}`
            }
            alt=""
            className="w-12 h-12 rounded-full object-cover border"
          />

          {/* INFO */}
          <div>

            <h2 className="font-semibold text-gray-900">
              {data.createdBy?.name}
            </h2>

            <p className="text-xs text-gray-500">
              {formattedDate}
              {data.createdBy?.class &&
                ` • ${data.createdBy.class}`}
            </p>
          </div>
        </div>

        {/* MORE */}
        <button className="text-gray-500 hover:text-black text-xl">
          ⋯
        </button>
      </div>

      {/* CONTENT */}
      <div className="mt-4">

        <h3 className="font-semibold text-lg text-gray-900">
          {data.title}
        </h3>

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
              alt=""
              className="w-full h-56 object-cover rounded-2xl hover:scale-[1.01] transition cursor-pointer"
            />
          ))}
        </div>
      )}

      {/* STATS */}
      <div className="flex justify-between text-xs text-gray-500 mt-4 border-b pb-3">

        <span>
          👍 {data.likes?.length || 0} likes
        </span>

        <span>
          💬 {data.comments?.length || 0} comments
        </span>
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-4 text-sm mt-2">

        <button
          onClick={handleLike}
          className="py-2 rounded-lg hover:bg-gray-100 transition"
        >
          👍 Like
        </button>

        <button
          onClick={() =>
            setShowComments(!showComments)
          }
          className="py-2 rounded-lg hover:bg-gray-100 transition"
        >
          💬 Comment
        </button>

        <button
          onClick={() => toast.success(  "Save feature coming soon 🚀")}
          className="py-2 rounded-lg hover:bg-gray-100 transition"
        >
          🔖 Save
        </button>

        <button
          onClick={() =>
            handleShare(data._id)
          }
          className="py-2 rounded-lg hover:bg-gray-100 transition"
        >
          ↗ Share
        </button>
      </div>

      {/* COMMENTS */}
      {showComments && (
        <div className="mt-4 border-t pt-4">

          {/* COMMENT INPUT */}
          {user ? (
            <div className="flex gap-2">

              <img
                src={
                  user?.image ||
                  `https://ui-avatars.com/api/?name=${user?.name}`
                }
                alt=""
                className="w-10 h-10 rounded-full object-cover border"
              />

              <div className="flex-1">

                <input
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  placeholder="Add a comment..."
                  className="w-full px-4 py-3 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
                />

                <button
                  onClick={handleComment}
                  className="mt-2 px-4 py-2 bg-[#0a66c2] text-white rounded-full text-sm hover:bg-blue-700 transition"
                >
                  Comment
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              Login required to comment
            </div>
          )}

          {/* COMMENTS LIST */}
          <div className="space-y-4 mt-5">

            {data.comments?.map((c, i) => (
              <div
                key={i}
                className="flex gap-3"
              >

                <img
                  src={`https://ui-avatars.com/api/?name=${c.user?.name || "User"}`}
                  alt=""
                  className="w-9 h-9 rounded-full"
                />

                <div className="bg-gray-100 rounded-2xl px-4 py-3 flex-1">

                  <div className="flex items-center justify-between">

                    <h4 className="font-semibold text-sm">
                      {c.user?.name || "User"}
                    </h4>

                    <p className="text-xs text-gray-500">
                      {new Date(
                        c.createdAt
                      ).toLocaleDateString(
                        "en-GB"
                      )}
                    </p>
                  </div>

                  <p className="text-sm text-gray-700 mt-1">
                    {c.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* STAT */
function StatCard({ label, value }) {
  return (
    <div className="bg-gray-50 border rounded-xl p-4">
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
    <div className="bg-white rounded-2xl border shadow-sm p-10 text-center text-gray-500">
      🚀 No achievements found
    </div>
  );
}

/* INPUT */
const Input = (props) => (
  <input
    {...props}
    className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
  />
);

export default PublicPage;