import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-4">
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-sm text-slate-400 mb-4">
        The page you&apos;re looking for does not exist.
      </p>
      <div className="flex gap-3 text-sm">
        <Link
          to="/"
          className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-900"
        >
          Go to homepage
        </Link>
        <Link
          to="/app"
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
