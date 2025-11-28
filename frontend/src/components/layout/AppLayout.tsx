import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) {
      setTheme(stored);
    } else {
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggle() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  return (
    <button
      onClick={toggle}
      className="text-xs border border-slate-700 rounded-md px-2 py-1 hover:bg-slate-900 dark:hover:bg-slate-800"
      type="button"
    >
      {theme === "dark" ? "Light mode" : "Dark mode"}
    </button>
  );
}

export function AppLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/80 hidden md:flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <Link to="/app" className="text-lg font-semibold">
            CO₂ Monitor
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ESP32 · Air Quality
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          <NavLink
            to="/app/dashboard"
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-slate-200 dark:hover:bg-slate-800"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/app/devices/connect"
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-slate-200 dark:hover:bg-slate-800"
              }`
            }
          >
            Connect device
          </NavLink>
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-slate-200 dark:hover:bg-slate-800"
              }`
            }
          >
            Profile & API
          </NavLink>
        </nav>

        <div className="px-3 pb-3 space-y-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-xs hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/80">
          <Link to="/app" className="font-semibold">
            CO₂ Monitor
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="text-xs border border-slate-300 dark:border-slate-700 rounded-md px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
