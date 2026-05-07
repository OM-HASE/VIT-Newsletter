import { Link, useLocation } from "react-router-dom";
import {
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

import { AuthContext } from "../context/AuthContext";

import vitLogo from "../assets/vit-logo.png";

/* AVATAR */
const Avatar = ({
  user,
  size = "w-10 h-10",
}) => {
  if (user?.image) {
    return (
      <img
        src={user.image}
        alt="profile"
        className={`${size} rounded-full object-cover border border-gray-200`}
      />
    );
  }

  return (
    <div
      className={`${size} bg-[#0a66c2] text-white rounded-full flex items-center justify-center font-semibold shadow-sm`}
    >
      {user?.name?.charAt(0).toUpperCase()}
    </div>
  );
};

function Navbar() {
  const location = useLocation();

  const { user, logout } =
    useContext(AuthContext);

  const [isOpen, setIsOpen] =
    useState(false);

  const [menuOpen, setMenuOpen] =
    useState(false);

  const dropdownRef = useRef();

  /* NAV LINK */
  const navLink = (
    path,
    label,
    mobile = false
  ) => {
    const isActive =
      location.pathname === path;

    return (
      <Link
        to={path}
        onClick={() =>
          mobile && setMenuOpen(false)
        }
        className={`${
          mobile
            ? "block px-5 py-4"
            : "px-3 py-2"
        } text-sm font-medium transition relative ${
          isActive
            ? "text-[#0a66c2]"
            : "text-gray-600 hover:text-black"
        }`}
      >
        {label}

        {isActive && !mobile && (
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0a66c2]" />
        )}
      </Link>
    );
  };

  /* CLOSE DROPDOWN */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          e.target
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">

      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">

        {/* LOGO */}
        <Link
          to="/newsletter"
          className="flex items-center gap-3"
        >
          <img
            src={vitLogo}
            alt="VIT"
            className="w-11 h-11 object-contain"
          />

          <div className="leading-tight">

            <h2 className="font-bold text-gray-900 text-lg">
              VIT Newsletter
            </h2>

            <p className="text-[11px] text-gray-500">
              Vishwakarma Institutes
            </p>
          </div>
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-5">

          {navLink(
            "/newsletter",
            "Home"
          )}

          {!user && (
            <>
              {navLink(
                "/student-login",
                "Student Login"
              )}

              {navLink(
                "/teacher-login",
                "Teacher Login"
              )}
            </>
          )} 

          {user?.role === "admin" && navLink("/admin-dashboard", "Admin")}

          {user?.role === "student" &&
            navLink(
              "/student-dashboard",
              "Dashboard"
            )}

          {(user?.role === "teacher" ||
            user?.role === "admin") &&
            navLink(
              "/teacher-dashboard",
              "Dashboard"
            )}
        </div>

        {/* RIGHT */}
        <div
          className="hidden md:flex items-center gap-4 relative"
          ref={dropdownRef}
        >

          {!user ? (
            <Link
              to="/register"
              className="px-5 py-2 bg-[#0a66c2] text-white text-sm rounded-full hover:bg-blue-700 transition shadow-sm"
            >
              Register
            </Link>
          ) : (
            <>
              {/* NOTIFICATION */}
              <button className="relative text-gray-600 hover:text-black transition">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

                <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] bg-red-500 text-white rounded-full flex items-center justify-center">
                  2
                </span>
              </button>

              {/* PROFILE */}
              <div
                onClick={() =>
                  setIsOpen(!isOpen)
                }
                className="cursor-pointer"
              >
                <Avatar user={user} />
              </div>

              {/* DROPDOWN */}
              {isOpen && (
                <div className="absolute right-0 top-14 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">

                  {/* TOP */}
                  <div className="px-5 py-4 border-b bg-gray-50">

                    <div className="flex items-center gap-3">

                      <Avatar
                        user={user}
                        size="w-14 h-14"
                      />

                      <div>

                        <div className="flex items-center gap-2">

                          <h2 className="font-semibold text-gray-900">
                            {user.name}
                          </h2>

                          {(user.role ===
                            "teacher" ||
                            user.role ===
                              "admin") && (
                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          {user.email}
                        </p>

                        <p className="text-xs text-[#0a66c2] mt-1 capitalize">
                          {user.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* LINKS */}
                  <div className="py-2">

                    <Link
                      to={
                        user.role ===
                        "student"
                          ? "/student-dashboard"
                          : "/teacher-dashboard"
                      }
                      onClick={() =>
                        setIsOpen(false)
                      }
                      className="block px-5 py-3 hover:bg-gray-100 transition text-sm"
                    >
                      Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() =>
                        setIsOpen(false)
                      }
                      className="block px-5 py-3 hover:bg-gray-100 transition text-sm"
                    >
                      Settings
                    </Link>

                    <Link
                      to="/saved-posts"
                      onClick={() =>
                        setIsOpen(false)
                      }
                      className="block px-5 py-3 hover:bg-gray-100 transition text-sm"
                    >
                      Saved Posts
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-5 py-3 text-red-500 hover:bg-gray-100 transition text-sm border-t"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <div className="md:hidden">
          <button
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            className="text-2xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="md:hidden fixed top-16 left-0 w-full bg-white border-t shadow-lg z-40 animate-slideDown">

          {user && (
            <div className="flex items-center gap-3 px-5 py-4 border-b bg-gray-50">

              <Avatar
                user={user}
                size="w-12 h-12"
              />

              <div>

                <div className="flex items-center gap-2">

                  <h2 className="font-semibold">
                    {user.name}
                  </h2>

                  {(user.role ===
                    "teacher" ||
                    user.role ===
                      "admin") && (
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                  )}
                </div>

                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col">

            {navLink(
              "/newsletter",
              "Home",
              true
            )}

            {!user && (
              <>
                {navLink(
                  "/student-login",
                  "Student Login",
                  true
                )}

                {navLink(
                  "/teacher-login",
                  "Teacher Login",
                  true
                )}

                {navLink(
                  "/register",
                  "Register",
                  true
                )}
              </>
            )}

            {user?.role === "student" &&
              navLink(
                "/student-dashboard",
                "Dashboard",
                true
              )}

            {user?.role === "admin" && navLink( "/admin-dashboard", "Admin", true )}  

            {(user?.role === "teacher" ||
              user?.role === "admin") &&
              navLink(
                "/teacher-dashboard",
                "Dashboard",
                true
              )}

            {user && (
              <>
                <Link
                  to="/profile"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="block px-5 py-4 hover:bg-gray-100 transition text-sm"
                >
                  Settings
                </Link>

                <Link
                  to="/saved-posts"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                  className="block px-5 py-4 hover:bg-gray-100 transition text-sm"
                >
                  Saved Posts
                </Link>

                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-5 py-4 text-red-500 hover:bg-gray-100 transition text-sm border-t"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;