import { Link } from "react-router-dom";
import { useAuth } from "../../context/OAuthContext";
import TaskStatusIndicator from "../TaskStatusIndicator";
import { FiMoon, FiSun, FiMenu, FiX, FiLogOut, FiUser } from "react-icons/fi";
import { useEffect, useState } from "react";

const Header = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const html = document.documentElement;
    const newTheme = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  return (
    <header className="sticky top-0 z-10 bg-base-100/90 backdrop-blur border-b border-base-200">
      <nav className="navbar mx-auto px-4">
        {/* Левая часть с лого и Courses */}
        <div className="flex-1 flex items-center gap-4">
          <Link to="/" className="btn btn-ghost px-2 hover:bg-transparent">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              LearnOps
            </span>
          </Link>

          {user && (
            <div className="hidden sm:flex">
              <Link to="/courses" className="btn btn-ghost">
                Courses
              </Link>
            </div>
          )}
        </div>

        {/* Правая часть */}
        <div className="flex-none gap-2">
          <div className="max-sm:mr-2">
            <TaskStatusIndicator />
          </div>

          {/* Переключатель темы */}
          <label className="swap swap-rotate btn btn-ghost btn-circle">
            <input type="checkbox" onChange={toggleTheme} />
            <FiSun className="swap-on text-xl" />
            <FiMoon className="swap-off text-xl" />
          </label>

          {/* Мобильное меню и профиль */}
          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </label>

            {/* Выпадающее меню */}
            {isMobileMenuOpen && (
              <div className="dropdown-content mt-3 p-2 shadow-xl bg-base-100 rounded-box w-52 absolute right-0">
                {user && (
                  <>
                    <div className="px-4 py-2 flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="w-8 rounded-full bg-gradient-to-r from-primary to-blue-500 text-white">
                          <span>{user.profile.preferred_username[0].toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="font-semibold truncate">
                        {user.profile.preferred_username}
                      </div>
                    </div>
                    <div className="divider my-0" />

                    <Link
                      to="/courses"
                      className="btn btn-ghost justify-start w-full"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Courses
                    </Link>

                    <button
                      onClick={logout}
                      className="btn btn-ghost text-error justify-start w-full gap-2"
                    >
                      <FiLogOut className="text-lg" />
                      Sign Out
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;