import { Link, useLocation } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

/* ✅ Avatar moved OUTSIDE (FIXES YOUR ERROR) */
const Avatar = ({ user, size = "w-9 h-9" }) => {
  if (user?.image) {
    return (
      <img
        src={user.image}
        alt="profile"
        className={`${size} rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${size} bg-[#0a66c2] text-white rounded-full flex items-center justify-center font-semibold`}
    >
      {user?.name?.charAt(0).toUpperCase()}
    </div>
  );
};

function Navbar() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const dropdownRef = useRef();

  const navLink = (path, label, mobile = false) => {
    const isActive = location.pathname === path;

    return (
      <Link
        to={path}
        onClick={() => mobile && setMenuOpen(false)}
        className={`${
          mobile ? "block px-4 py-3" : "px-3 py-2"
        } text-sm font-medium transition ${
          isActive
            ? "text-[#0a66c2] border-b-2 border-[#0a66c2]"
            : "text-gray-600 hover:text-black"
        }`}
      >
        {label}
      </Link>
    );
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2">

        {/* Logo */}
        <Link to="/newsletter" className="text-lg font-semibold text-black">
          VIT Newsletter
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLink("/newsletter", "Home")}

          {!user && (
            <>
              {navLink("/student-login", "Student Login")}
              {navLink("/teacher-login", "Teacher Login")}
            </>
          )}

          {user?.role === "student" &&
            navLink("/student-dashboard", "Dashboard")}

          {(user?.role === "teacher" || user?.role === "admin") &&
            navLink("/teacher-dashboard", "Dashboard")}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-4 relative" ref={dropdownRef}>
          {!user ? (
            <Link
              to="/register"
              className="px-4 py-1.5 bg-[#0a66c2] text-white text-sm rounded-md hover:bg-blue-700 transition"
            >
              Register
            </Link>
          ) : (
            <>
              <div
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer"
              >
                <Avatar user={user} />
              </div>

              {isOpen && (
                <div className="absolute right-0 top-12 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">

                  <div className="px-4 py-3 border-b flex items-center gap-3">
                    <Avatar user={user} size="w-10 h-10" />
                    <div>
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <Link
                    to={
                      user.role === "student"
                        ? "/student-dashboard"
                        : "/teacher-dashboard"
                    }
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 border-t"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-xl"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden fixed top-14 left-0 w-full bg-white border-t shadow-lg z-40 animate-slideDown">

          {user && (
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <Avatar user={user} size="w-10 h-10" />
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col">
            {navLink("/newsletter", "Home", true)}

            {!user && (
              <>
                {navLink("/student-login", "Student Login", true)}
                {navLink("/teacher-login", "Teacher Login", true)}
                {navLink("/register", "Register", true)}
              </>
            )}

            {user?.role === "student" &&
              navLink("/student-dashboard", "Dashboard", true)}

            {(user?.role === "teacher" || user?.role === "admin") &&
              navLink("/teacher-dashboard", "Dashboard", true)}
          </div>

          {user && (
            <Link
              to="/profile"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm border-t hover:bg-gray-100"
            >
              Settings
            </Link>
          )}

          {user && (
            <button
              onClick={() => {
                logout();
                setMenuOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm text-red-500 border-t hover:bg-gray-100"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;