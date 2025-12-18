import { useEffect, useState } from "react";
import { apiGetUserDevices, apiGetDeviceMeasurements } from "../api/client";
import type { Device, Measurement, User } from "../types/api";

export function HistoryPage() {
  const raw = localStorage.getItem("user");
  const user: User | null = raw ? JSON.parse(raw) : null;

  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [data, setData] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user devices
  useEffect(() => {
    if (!user) return;
    apiGetUserDevices(user.id).then((res) => {
      if ("data" in res && res.data) {
        setDevices(res.data);
      }
    });
  }, [user]);

  // Load measurements when device changes
  useEffect(() => {
    if (!deviceId) return;
    setLoading(true);
    apiGetDeviceMeasurements(deviceId).then((res) => {
      if ("data" in res && res.data) {
        setData(res.data);
      } else {
        setData([]);
      }
      setLoading(false);
    });
  }, [deviceId]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="text-sm text-slate-400">
          Full measurement history for a selected device.
        </p>
      </div>

      {/* Device select */}
      <div className="max-w-sm">
        <label className="text-sm text-slate-300">Select device</label>
        <select
          value={deviceId}
          onChange={(e) => setDeviceId(e.target.value)}
          className="w-full mt-1 rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
        >
          <option value="">— Choose device —</option>
          {devices.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name || d.id}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-sm text-slate-400">Loading measurements…</p>
      ) : data.length === 0 ? (
        <p className="text-sm text-slate-400">
          {deviceId ? "No data yet." : "Select a device to view history."}
        </p>
      ) : (
        <div className="overflow-auto rounded-xl border border-slate-800">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900 text-slate-400">
              <tr>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">CO₂ (ppm)</th>
                <th className="px-3 py-2 text-left">Temp (°C)</th>
                <th className="px-3 py-2 text-left">Humidity (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m) => (
                <tr
                  key={m.id}
                  className="border-t border-slate-800 hover:bg-slate-900/50"
                >
                  <td className="px-3 py-2 font-mono text-xs">
                    {new Date(m.timestamp).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{m.co2}</td>
                  <td className="px-3 py-2">{m.temperature?.toFixed(1)}</td>
                  <td className="px-3 py-2">{m.humidity?.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
