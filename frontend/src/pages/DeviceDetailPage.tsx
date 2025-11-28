import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { apiGetDevice, apiGetDeviceMeasurements } from "../api/client";
import type { Device, Measurement } from "../types/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export function DeviceDetailPage() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!deviceId) return;
      setLoading(true);

      const [devRes, measRes] = await Promise.all([
        apiGetDevice(deviceId),
        apiGetDeviceMeasurements(deviceId, 200),
      ]);

      if ("data" in devRes && devRes.data) setDevice(devRes.data);
      if ("data" in measRes && measRes.data) setMeasurements(measRes.data);

      setLoading(false);
    }

    load();
  }, [deviceId]);

  const latest = measurements[0];

  const chartData = useMemo(
    () =>
      measurements
        .slice()
        .reverse()
        .map((m) => ({
          time: new Date(m.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          co2: m.co2,
        })),
    [measurements]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {device?.name || device?.id || "Device"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Location: {device?.location || "Unknown"} · MAC:{" "}
          <span className="font-mono">{device?.id}</span>
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      ) : (
        <>
          {/* Current status */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-xl bg-slate-100 border border-slate-200 p-4 dark:bg-slate-900 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Current CO₂
              </p>
              <p className="text-2xl font-semibold">
                {latest ? `${latest.co2.toFixed(0)} ppm` : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-100 border border-slate-200 p-4 dark:bg-slate-900 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Temperature
              </p>
              <p className="text-2xl font-semibold">
                {latest ? `${latest.temperature.toFixed(1)} °C` : "—"}
              </p>
            </div>
            <div className="rounded-xl bg-slate-100 border border-slate-200 p-4 dark:bg-slate-900 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Humidity
              </p>
              <p className="text-2xl font-semibold">
                {latest ? `${latest.humidity.toFixed(1)} %` : "—"}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-2xl bg-slate-100 border border-slate-200 p-4 dark:bg-slate-900 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              CO₂ over time
            </p>
            <div className="h-64">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                  No measurements yet to plot.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="time"
                      fontSize={10}
                      tickMargin={6}
                    />
                    <YAxis
                      fontSize={10}
                      tickMargin={6}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#020617",
                        borderColor: "#1e293b",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "#e5e7eb" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="co2"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            <table className="w-full text-xs">
              <thead className="bg-slate-200/60 text-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
                <tr>
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-right">CO₂ (ppm)</th>
                  <th className="px-3 py-2 text-right">Temp (°C)</th>
                  <th className="px-3 py-2 text-right">Humidity (%)</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m) => (
                  <tr key={m.id} className="border-t border-slate-200 dark:border-slate-800">
                    <td className="px-3 py-2">
                      {new Date(m.timestamp).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {m.co2.toFixed(0)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {m.temperature.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {m.humidity.toFixed(1)}
                    </td>
                  </tr>
                ))}
                {measurements.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-4 text-center text-slate-500 dark:text-slate-400"
                    >
                      No measurements yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
