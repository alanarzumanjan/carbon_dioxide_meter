import { Link, NavLink, Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <>
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/80 hidden md:flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <Link to="/app" className="text-lg font-semibold text-slate-900 dark:text-white">
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
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="documentation"
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`
            }
          >
            Documentation
          </NavLink>
          <NavLink
            to="/app/profile"
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`
            }
          >
            Profile & API
          </NavLink>
          <NavLink
            to="/app/history"
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
              }`
            }
          >
            History
          </NavLink>

        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 md:px-8 bg-white dark:bg-slate-950">
        <Outlet />
      </main>
    </>
  );
}