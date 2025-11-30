import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiGetUserDevices, apiGetDeviceMeasurements } from "../api/client";
import type { Device, Measurement, User } from "../types/api";

export function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [latestMeasurements, setLatestMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  const user: User | null = (() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  })();

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);

      const res = await apiGetUserDevices(user.id);
      if ("data" in res && res.data) {
        setDevices(res.data);
        if (res.data.length > 0) {
          setSelectedDevice(res.data[0].id);
        }
      }

      setLoading(false);
    }

    load();
  }, []);

  useEffect(() => {
    async function loadMeasurements() {
      if (!selectedDevice) return;
      const res = await apiGetDeviceMeasurements(selectedDevice, 20);
      if ("data" in res && res.data) {
        setLatestMeasurements(res.data);
      }
    }

    loadMeasurements();
  }, [selectedDevice]);

  const latest = latestMeasurements[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-400">
            Overview of your devices and recent air quality.
          </p>
        </div>
        <Link
          to="/app/devices/connect"
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium"
        >
          + Connect device
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
              <p className="text-xs text-slate-400 mb-1">Devices</p>
              <p className="text-2xl font-semibold">{devices.length}</p>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
              <p className="text-xs text-slate-400 mb-1">Last CO₂</p>
              <p className="text-2xl font-semibold">
                {latest ? `${latest.co2.toFixed(0)} ppm` : "—"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
              <p className="text-xs text-slate-400 mb-1">Last temp</p>
              <p className="text-2xl font-semibold">
                {latest ? `${latest.temperature.toFixed(1)} °C` : "—"}
              </p>
            </div>
          </div>

          {/* Device list */}
          <div className="mt-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <p className="text-sm font-medium">My devices</p>
            </div>
            <div className="divide-y divide-slate-800 text-sm">
              {devices.length === 0 && (
                <p className="px-4 py-3 text-slate-400">
                  You don&apos;t have any devices yet.
                </p>
              )}

              {devices.map((d) => (
                <Link
                  key={d.id}
                  to={`/app/devices/${encodeURIComponent(d.id)}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/80"
                >
                  <div>
                    <p className="font-medium">
                      {d.name || d.id}
                    </p>
                    <p className="text-xs text-slate-400">
                      {d.location || "Unknown location"}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">
                    MAC: {d.id}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
