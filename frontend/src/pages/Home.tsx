import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <Link to="/" className="font-semibold">
          CO₂ Monitor
        </Link>
        <div className="space-x-3 text-sm">
          <Link
            to="/login"
            className="px-3 py-1.5 rounded-md border border-slate-700 hover:bg-slate-800"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white"
          >
            Sign up
          </Link>
        </div>
      </header>

      <main className="px-6 md:px-16 py-10">
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Monitor your CO₂ in real time
            </h1>
            <p className="text-slate-300 mb-6">
              ESP32 + CO₂ sensor + web dashboard. See air quality, history and
              alerts to know when to ventilate your room.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
              >
                Get started
              </Link>
              <Link
                to="/contacts"
                className="px-5 py-2.5 rounded-lg border border-slate-700 text-sm hover:bg-slate-900"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
              Example dashboard
            </p>
            <div className="h-40 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center text-slate-200 text-sm">
              CO₂ chart placeholder
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                <p className="text-slate-400">Current CO₂</p>
                <p className="text-lg font-semibold">742 ppm</p>
              </div>
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                <p className="text-slate-400">Temp</p>
                <p className="text-lg font-semibold">23.4 °C</p>
              </div>
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-3">
                <p className="text-slate-400">Humidity</p>
                <p className="text-lg font-semibold">41 %</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
