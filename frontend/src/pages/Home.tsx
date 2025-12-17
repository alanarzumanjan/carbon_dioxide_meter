import { Link } from "react-router-dom";

export function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block">
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                <svg
                  className="mr-1.5 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                    clipRule="evenodd"
                  />
                </svg>
                ESP32 Powered
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white">
              Monitor your{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                CO₂
              </span>{" "}
              in real time
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl">
              Track air quality with precision. Our ESP32-powered sensor monitors
              CO₂ levels, temperature, and humidity, helping you maintain a
              healthy indoor environment.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-base font-medium text-white hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/50"
              >
                Get started
                <svg
                  className="ml-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link
                to="/contacts"
                className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-700 px-6 py-3 text-base font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Contact us
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200 dark:border-slate-800">
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">24/7</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Monitoring</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">Real-time</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Updates</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">Cloud</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Storage</p>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-3xl opacity-20"></div>
            <div className="relative rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-6 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-4">
                Live Dashboard Preview
              </p>
              
              {/* Chart placeholder */}
              <div className="h-48 rounded-xl bg-gradient-to-br from-slate-200 via-indigo-100 to-slate-100 dark:from-slate-900 dark:via-indigo-900/30 dark:to-slate-800 flex items-center justify-center mb-4 border border-slate-300 dark:border-slate-700">
                <div className="text-center text-slate-600 dark:text-slate-400">
                  <svg
                    className="h-12 w-12 mx-auto mb-2 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="text-sm">CO₂ Levels Over Time</p>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                  <p className="text-slate-600 dark:text-slate-400 mb-1">CO₂</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">742</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">ppm</p>
                </div>
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Temp</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">23.4</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">°C</p>
                </div>
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
                  <p className="text-slate-600 dark:text-slate-400 mb-1">Humidity</p>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-white">41</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
              Everything you need
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Comprehensive air quality monitoring with powerful features
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Real-time Data</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Get instant updates on CO₂ levels, temperature, and humidity with
                our live dashboard.
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Historical Charts</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Visualize trends over time with beautiful, interactive charts and
                detailed analytics.
              </p>
            </div>

            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4">
                <svg
                  className="h-6 w-6 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">Multiple Devices</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Connect and monitor multiple ESP32 devices from a single,
                centralized dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}