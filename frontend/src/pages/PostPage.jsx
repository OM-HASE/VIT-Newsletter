import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axiosInstance.get(`/achievements/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPost();
  }, [id]);

  if (!post) {
    return (
      <p className="text-center mt-20 text-gray-500">
        Loading post...
      </p>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-[#f3f2ef] px-4">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm p-5">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-[#0a66c2] text-white flex items-center justify-center rounded-full font-semibold">
            {post.createdBy?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          <div>
            <p className="font-semibold text-sm">
              {post.createdBy?.name}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(post.date).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          {post.title}
        </h2>

        {/* CONTENT */}
        <p className="text-sm text-gray-700 mb-4">
          {post.content}
        </p>

        {/* IMAGES */}
        {post.images?.length > 0 && (
          <div
            className={`grid gap-2 ${
              post.images.length === 1
                ? "grid-cols-1"
                : post.images.length === 2
                ? "grid-cols-2"
                : "grid-cols-3"
            }`}
          >
            {post.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt=""
                className="w-full h-48 object-cover rounded-md"
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default PostPage;