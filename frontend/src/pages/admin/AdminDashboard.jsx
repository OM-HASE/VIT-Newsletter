import {
  useEffect,
  useState,
} from "react";

import {
  getAnalytics,
  getAllUsers,
  getAllPosts,
  deleteUser,
  banUser,
  deletePost,
  hidePost,
  pinPost,
  featurePost,
} from "../../api/adminApi";

import toast from "react-hot-toast";

function AdminDashboard() {
  const [tab, setTab] =
    useState("dashboard");

  const [analytics, setAnalytics] =
    useState({});

  const [users, setUsers] =
    useState([]);

  const [posts, setPosts] =
    useState([]);

  const [selectedPost, setSelectedPost] =
    useState(null);

  const [userSearch, setUserSearch] =
    useState("");

  const [postSearch, setPostSearch] =
    useState("");

  /* FETCH */
  const fetchData = async () => {
    try {
      const [
        analyticsRes,
        usersRes,
        postsRes,
      ] = await Promise.all([
        getAnalytics(),
        getAllUsers(),
        getAllPosts(),
      ]);

      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setPosts(postsRes.data);

    } catch {
      toast.error("Failed to fetch");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* GROUP USERS */
  const groupedUsers = users.reduce(
    (acc, user) => {
      const group =
        user.class ||
        user.classAssigned ||
        "Unassigned";

      if (!acc[group]) {
        acc[group] = {
          teachers: [],
          students: [],
          admins: [],
        };
      }

      if (user.role === "teacher") {
        acc[group].teachers.push(user);
      } else if (
        user.role === "admin"
      ) {
        acc[group].admins.push(user);
      } else {
        acc[group].students.push(user);
      }

      return acc;
    },
    {}
  );

  /* BAN USER */
  const handleBan = async (id) => {
    try {
      await banUser(id);

      setUsers((prev) =>
        prev.map((u) =>
          u._id === id
            ? {
                ...u,
                isBanned: !u.isBanned,
              }
            : u
        )
      );

      toast.success("Updated");
    } catch {
      toast.error("Failed");
    }
  };

  /* DELETE USER */
  const handleDeleteUser = async (
    id
  ) => {
    if (!confirm("Delete user?"))
      return;

    try {
      await deleteUser(id);

      setUsers((prev) =>
        prev.filter(
          (u) => u._id !== id
        )
      );

      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  };

  /* DELETE POST */
  const handleDeletePost = async (
    id
  ) => {
    try {
      await deletePost(id);

      setPosts((prev) =>
        prev.filter(
          (p) => p._id !== id
        )
      );

      toast.success("Deleted");
    } catch {
      toast.error("Failed");
    }
  };

  /* HIDE POST */
  const handleHide = async (id) => {
    try {
      await hidePost(id);

      setPosts((prev) =>
        prev.map((p) =>
          p._id === id
            ? {
                ...p,
                isHidden: !p.isHidden,
              }
            : p
        )
      );

      toast.success("Updated");
    } catch {
      toast.error("Failed");
    }
  };

  /* PIN POST */
  const handlePin = async (id) => {
    try {
      await pinPost(id);

      setPosts((prev) =>
        prev.map((p) =>
          p._id === id
            ? {
                ...p,
                isPinned: !p.isPinned,
              }
            : p
        )
      );

      toast.success("Pinned");
    } catch {
      toast.error("Failed");
    }
  };

  /* FEATURE POST */
  const handleFeature = async (
    id
  ) => {
    try {
      await featurePost(id);

      setPosts((prev) =>
        prev.map((p) =>
          p._id === id
            ? {
                ...p,
                isFeatured:
                  !p.isFeatured,
              }
            : p
        )
      );

      toast.success("Updated");
    } catch {
      toast.error("Failed");
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-[#f3f2ef]">

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 px-4">

        {/* SIDEBAR */}
        <div className="col-span-3">

          <div className="bg-white rounded-2xl border shadow-sm p-5 sticky top-24">

            <h2 className="text-2xl font-bold text-gray-900">
              Admin Panel
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Manage users, posts &
              moderation
            </p>

            <div className="mt-6 space-y-2">

              {[
                "dashboard",
                "users",
                "posts",
              ].map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    setTab(item)
                  }
                  className={`w-full text-left px-4 py-3 rounded-xl transition capitalize ${
                    tab === item
                      ? "bg-[#0a66c2] text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="col-span-9 space-y-5">

          {/* DASHBOARD */}
          {tab === "dashboard" && (
            <div className="grid grid-cols-3 gap-4">

              <Card
                label="Total Users"
                value={
                  analytics.totalUsers
                }
              />

              <Card
                label="Students"
                value={
                  analytics.totalStudents
                }
              />

              <Card
                label="Teachers"
                value={
                  analytics.totalTeachers
                }
              />

              <Card
                label="Posts"
                value={
                  analytics.totalPosts
                }
              />

              <Card
                label="Approved"
                value={
                  analytics.approvedPosts
                }
              />

              <Card
                label="Hidden Posts"
                value={
                  posts.filter(
                    (p) => p.isHidden
                  ).length
                }
              />
            </div>
          )}

          {/* USERS */}
          {tab === "users" && (
            <div className="space-y-6">

              {/* SEARCH */}
              <div className="bg-white rounded-2xl border shadow-sm p-4">

                <input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) =>
                    setUserSearch(
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
                />
              </div>

              {Object.entries(
                groupedUsers
              ).map(([group, data]) => (
                <div
                  key={group}
                  className="bg-white rounded-2xl border shadow-sm overflow-hidden"
                >

                  {/* HEADER */}
                  <div className="px-5 py-4 border-b bg-gray-50 flex items-center justify-between">

                    <div>

                      <h2 className="font-bold text-lg text-gray-900">
                        {group}
                      </h2>

                      <p className="text-xs text-gray-500 mt-1">
                        {
                          data.students
                            .length
                        }{" "}
                        Students •{" "}
                        {
                          data.teachers
                            .length
                        }{" "}
                        Teachers
                      </p>
                    </div>
                  </div>

                  {/* ADMINS */}
                  {data.admins.length >
                    0 && (
                    <UserSection
                      title="Admins"
                      users={data.admins}
                      handleBan={
                        handleBan
                      }
                      handleDeleteUser={
                        handleDeleteUser
                      }
                    />
                  )}

                  {/* TEACHERS */}
                  <UserSection
                    title="Teachers"
                    users={data.teachers.filter(
                      (u) =>
                        u.name
                          .toLowerCase()
                          .includes(
                            userSearch.toLowerCase()
                          )
                    )}
                    handleBan={
                      handleBan
                    }
                    handleDeleteUser={
                      handleDeleteUser
                    }
                  />

                  {/* STUDENTS */}
                  <UserSection
                    title="Students"
                    users={data.students.filter(
                      (u) =>
                        u.name
                          .toLowerCase()
                          .includes(
                            userSearch.toLowerCase()
                          )
                    )}
                    handleBan={
                      handleBan
                    }
                    handleDeleteUser={
                      handleDeleteUser
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {/* POSTS */}
          {tab === "posts" && (
            <div className="space-y-4">

              {/* SEARCH */}
              <div className="bg-white rounded-2xl border shadow-sm p-4">

                <input
                  placeholder="Search posts..."
                  value={postSearch}
                  onChange={(e) =>
                    setPostSearch(
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0a66c2]"
                />
              </div>

              {posts
                .filter((p) =>
                  (
                    p.title +
                    p.content
                  )
                    .toLowerCase()
                    .includes(
                      postSearch.toLowerCase()
                    )
                )
                .map((p) => (
                  <div
                    key={p._id}
                    onClick={() =>
                      setSelectedPost(p)
                    }
                    className="bg-white rounded-2xl border shadow-sm p-5 cursor-pointer hover:shadow-md transition"
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-3">

                        <img
                          src={
                            p.createdBy
                              ?.image ||
                            `https://ui-avatars.com/api/?name=${p.createdBy?.name}`
                          }
                          alt=""
                          className="w-12 h-12 rounded-full object-cover border"
                        />

                        <div>

                          <div className="flex items-center gap-2">

                            <h3 className="font-semibold">
                              {
                                p
                                  .createdBy
                                  ?.name
                              }
                            </h3>

                            {p.isPinned && (
                              <span className="text-[11px] px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                Pinned
                              </span>
                            )}

                            {p.isFeatured && (
                              <span className="text-[11px] px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                Featured
                              </span>
                            )}

                            {p.isHidden && (
                              <span className="text-[11px] px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                Hidden
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-gray-500 mt-1">
                            {p.title}
                          </p>
                        </div>
                      </div>

                      <div
                        className="flex gap-2"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >

                        <button
                          onClick={() =>
                            handleHide(
                              p._id
                            )
                          }
                          className="px-4 py-2 bg-gray-100 rounded-xl text-sm"
                        >
                          {p.isHidden
                            ? "Unhide"
                            : "Hide"}
                        </button>

                        <button
                          onClick={() =>
                            handlePin(
                              p._id
                            )
                          }
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm"
                        >
                          {p.isPinned
                            ? "Unpin"
                            : "Pin"}
                        </button>

                        <button
                          onClick={() =>
                            handleFeature(
                              p._id
                            )
                          }
                          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl text-sm"
                        >
                          {p.isFeatured
                            ? "Remove"
                            : "Feature"}
                        </button>

                        <button
                          onClick={() =>
                            handleDeletePost(
                              p._id
                            )
                          }
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-gray-700 line-clamp-2">
                      {p.content}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* POST MODAL */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6">

          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">

            <button
              onClick={() =>
                setSelectedPost(
                  null
                )
              }
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
            >
              ×
            </button>

            {/* HEADER */}
            <div className="flex items-center gap-4">

              <img
                src={
                  selectedPost
                    .createdBy
                    ?.image ||
                  `https://ui-avatars.com/api/?name=${selectedPost.createdBy?.name}`
                }
                alt=""
                className="w-14 h-14 rounded-full object-cover border"
              />

              <div>

                <h2 className="font-bold text-xl">
                  {
                    selectedPost
                      .createdBy?.name
                  }
                </h2>

                <p className="text-sm text-gray-500">
                  {
                    selectedPost
                      .createdBy
                      ?.class
                  }
                </p>
              </div>
            </div>

            {/* TITLE */}
            <h1 className="text-2xl font-bold mt-6">
              {selectedPost.title}
            </h1>

            {/* CONTENT */}
            <p className="mt-4 text-gray-700 whitespace-pre-line">
              {selectedPost.content}
            </p>

            {/* IMAGES */}
            {selectedPost.images
              ?.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-6">

                {selectedPost.images.map(
                  (img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="rounded-2xl object-cover w-full h-64"
                    />
                  )
                )}
              </div>
            )}

            {/* STATS */}
            <div className="flex flex-wrap gap-4 mt-6 text-sm text-gray-600">

              <span>
                Likes:{" "}
                {
                  selectedPost.likes
                    ?.length
                }
              </span>

              <span>
                Comments:{" "}
                {
                  selectedPost
                    .comments?.length
                }
              </span>

              <span>
                Status:{" "}
                {
                  selectedPost.status
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* USER SECTION */
function UserSection({
  title,
  users,
  handleBan,
  handleDeleteUser,
}) {
  if (users.length === 0)
    return null;

  return (
    <div className="border-t">

      <div className="px-5 py-3 bg-gray-50 text-sm font-semibold text-gray-700">
        {title}
      </div>

      <div className="divide-y">

        {users.map((u) => (
          <div
            key={u._id}
            className="flex items-center justify-between p-5"
          >

            <div className="flex items-center gap-4">

              <img
                src={
                  u.image ||
                  `https://ui-avatars.com/api/?name=${u.name}`
                }
                alt=""
                className="w-12 h-12 rounded-full object-cover border"
              />

              <div>

                <h3 className="font-semibold">
                  {u.name}
                </h3>

                <p className="text-sm text-gray-500">
                  {u.email}
                </p>

                <div className="flex items-center gap-2 mt-2">

                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                      u.role ===
                      "admin"
                        ? "bg-red-100 text-red-700"
                        : u.role ===
                          "teacher"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {u.role}
                  </span>

                  {u.isBanned && (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                      Suspended
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">

              <button
                onClick={() =>
                  handleBan(u._id)
                }
                className={`px-4 py-2 rounded-xl text-sm ${
                  u.isBanned
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {u.isBanned
                  ? "Unban"
                  : "Ban"}
              </button>

              <button
                onClick={() =>
                  handleDeleteUser(
                    u._id
                  )
                }
                className="px-4 py-2 rounded-xl bg-red-100 text-red-700 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* CARD */
function Card({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5">

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <h2 className="text-3xl font-bold text-gray-900 mt-2">
        {value || 0}
      </h2>
    </div>
  );
}

export default AdminDashboard;