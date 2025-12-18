/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGetUserDevices, apiGetDeviceMeasurements } from "../api/client";
import type { Device, Measurement, User } from "../types/api";

function safeNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pickCo2(m?: any) {
  return safeNum(m?.co2 ?? m?.CO2 ?? m?.cO2);
}
function pickTemp(m?: any) {
  return safeNum(m?.temperature ?? m?.Temperature);
}
function pickHum(m?: any) {
  return safeNum(m?.humidity ?? m?.Humidity);
}
function pickTs(m?: any) {
  const t = m?.timestamp ?? m?.Timestamp;
  if (!t) return null;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}

function co2Badge(co2: number | null) {
  if (co2 === null) return { label: "No data", cls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" };
  if (co2 <= 800) return { label: "Good", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" };
  if (co2 <= 1200) return { label: "OK", cls: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" };
  return { label: "Bad", cls: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" };
}

type DeviceLatest = {
  deviceId: string;
  latest: Measurement | null;
  loading: boolean;
};

export function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [latestMap, setLatestMap] = useState<Record<string, DeviceLatest>>({});
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
      } else {
        setDevices([]);
      }

      setLoading(false);
    }
    load();
  }, []);

  // Load latest measurement for each device (limit=1)
  useEffect(() => {
    let cancelled = false;

    async function loadLatestForAll() {
      if (devices.length === 0) {
        setLatestMap({});
        return;
      }

      // init loading map
      const init: Record<string, DeviceLatest> = {};
      for (const d of devices) {
        init[d.id] = { deviceId: d.id, latest: null, loading: true };
      }
      setLatestMap(init);

      // fetch in parallel (limit concurrency a bit would be nicer, но тут норм)
      await Promise.all(
        devices.map(async (d) => {
          const res = await apiGetDeviceMeasurements(d.id, 1);
          const latest = ("data" in res && res.data && res.data.length > 0) ? res.data[0] : null;

          if (cancelled) return;
          setLatestMap((prev) => ({
            ...prev,
            [d.id]: { deviceId: d.id, latest, loading: false },
          }));
        })
      );
    }

    loadLatestForAll();
    return () => {
      cancelled = true;
    };
  }, [devices]);

  const deviceCountLabel = useMemo(() => {
    const n = devices.length;
    return n === 1 ? "1 device" : `${n} devices`;
  }, [devices.length]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            My devices
          </h1>
          <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {deviceCountLabel}
          </span>
        </div>

        <Link
          to="/app/devices/connect"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white transition-colors shadow-sm"
        >
          + Connect device
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-slate-600 dark:text-slate-400">Loading...</p>
      ) : (
        <>
          {devices.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center bg-white dark:bg-slate-900">
              <p className="text-slate-900 dark:text-white font-semibold">No devices yet</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Click <b>Connect device</b> to add your first ESP32.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {devices.map((d) => {
                const entry = latestMap[d.id];
                const latest = entry?.latest ?? null;
                const isLoading = entry?.loading ?? false;

                const co2 = pickCo2(latest);
                const temp = pickTemp(latest);
                const hum = pickHum(latest);
                const ts = pickTs(latest);
                const badge = co2Badge(co2);

                return (
                  <Link
                    key={d.id}
                    to={`/app/devices/${encodeURIComponent(d.id)}`}
                    className={[
                      "group rounded-2xl border border-slate-200 dark:border-slate-800",
                      "bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all",
                      "p-4 flex flex-col gap-4",
                      "hover:-translate-y-[1px]",
                    ].join(" ")}
                  >
                    {/* top */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-slate-900 dark:text-white truncate">
                          {d.name || "Unnamed device"}
                        </p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 truncate">
                          MAC: <span className="font-mono">{d.id}</span>
                        </p>
                      </div>

                      <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${badge.cls}`}>
                        {isLoading ? "…" : badge.label}
                      </span>
                    </div>

                    {/* middle: metrics */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-500">
                          CO₂
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                          {isLoading ? "…" : co2 !== null ? co2.toFixed(0) : "—"}
                          <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-500">ppm</span>
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-500">
                          Temp
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                          {isLoading ? "…" : temp !== null ? temp.toFixed(1) : "—"}
                          <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-500">°C</span>
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-500">
                          Hum
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                          {isLoading ? "…" : hum !== null ? hum.toFixed(0) : "—"}
                          <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-500">%</span>
                        </p>
                      </div>
                    </div>

                    {/* bottom */}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {isLoading
                          ? "Loading latest…"
                          : ts
                          ? `Updated: ${ts.toLocaleString()}`
                          : "No measurements yet"}
                      </p>

                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        Open →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
