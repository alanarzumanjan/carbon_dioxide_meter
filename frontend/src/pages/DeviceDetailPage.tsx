import { useParams } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { apiGetDevice, apiGetDeviceMeasurementsRange } from "../api/client";
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

// ---------- helpers ----------
function safeNum(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function safeStr(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function getTs(m: Measurement): Date | null {
  const raw = (m as unknown as { timestamp?: unknown }).timestamp;
  const s = safeStr(raw);
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getCo2(m: Measurement): number | null {
  return safeNum((m as unknown as { co2?: unknown }).co2);
}
function getTemp(m: Measurement): number | null {
  return safeNum((m as unknown as { temperature?: unknown }).temperature);
}
function getHum(m: Measurement): number | null {
  return safeNum((m as unknown as { humidity?: unknown }).humidity);
}

// datetime-local expects "YYYY-MM-DDTHH:mm"
function toDateTimeLocalValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function parseDateTimeLocal(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

type PresetKey = "1h" | "24h" | "7d" | "30d" | "custom" | "all";

function presetMs(p: PresetKey): number | null {
  if (p === "1h") return 1 * 60 * 60 * 1000;
  if (p === "24h") return 24 * 60 * 60 * 1000;
  if (p === "7d") return 7 * 24 * 60 * 60 * 1000;
  if (p === "30d") return 30 * 24 * 60 * 60 * 1000;
  return null;
}

// ===== CO2 thresholds from ESP =====
const CO2_LEVELS = [400, 600, 700, 800, 1000, 1200, 1400, 2000] as const;

function ledCountForCo2(co2: number): number {
  // same as ESP: led i is ON if co2 >= co2_levels[i]
  let count = 0;
  for (const t of CO2_LEVELS) if (co2 >= t) count++;
  return Math.max(0, Math.min(8, count));
}

// 3 green, 3 orange, 2 red
function segmentColorClass(index: number): string {
  if (index <= 2) return "bg-emerald-500/90";
  if (index <= 5) return "bg-orange-500/90";
  return "bg-red-600/90";
}

type Quality = {
  title: string;
  badgeClass: string;
};
type Notice = {
  level: "green" | "orange" | "red";
  title: string;
  text: string;
};

function co2Notice(co2: number | null): Notice | null {
  if (co2 == null) return null;

  // ✅ green
  if (co2 <= 700) {
    return {
      level: "green",
      title: "Air looks good ✅",
      text: "Great conditions. Keep normal ventilation habits. No action needed.",
    };
  }

  // 🟧 orange
  if (co2 <= 1200) {
    return {
      level: "orange",
      title: "Air needs freshening 🟧",
      text: "Open a window for 5–10 minutes, or increase ventilation. You may feel drowsy soon.",
    };
  }

  // 🟥 red
  return {
    level: "red",
    title: "High CO₂ — ventilate now 🟥",
    text: "Ventilate immediately (10–15 minutes). Avoid long stays, especially for kids or during sleep.",
  };
}

function noticeClasses(level: Notice["level"]) {
  if (level === "green") {
    return {
      box: "border-emerald-500/25 bg-emerald-500/10",
      badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
      dot: "bg-emerald-400",
    };
  }
  if (level === "orange") {
    return {
      box: "border-orange-500/25 bg-orange-500/10",
      badge: "bg-orange-500/15 text-orange-300 border-orange-500/25",
      dot: "bg-orange-400",
    };
  }
  return {
    box: "border-red-500/25 bg-red-500/10",
    badge: "bg-red-500/15 text-red-300 border-red-500/25",
    dot: "bg-red-400",
  };
}

function co2Quality(co2: number): Quality {
  // Your rules:
  // 400 Ideal, 400-600 Excellent, 600-700 Normal, 700-1000 Not good,
  // 1000-1200 Bad, 1400 Very bad, 2000 Terrible
  if (co2 <= 400) {
    return { title: "Ideal", badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" };
  }
  if (co2 <= 600) {
    return { title: "Excellent", badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" };
  }
  if (co2 <= 700) {
    return { title: "Normal", badgeClass: "bg-lime-500/15 text-lime-300 border-lime-500/25" };
  }
  if (co2 <= 1000) {
    return { title: "Not good", badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/25" };
  }
  if (co2 <= 1200) {
    return { title: "Bad", badgeClass: "bg-orange-500/15 text-orange-300 border-orange-500/25" };
  }
  if (co2 <= 1400) {
    return { title: "Very bad", badgeClass: "bg-red-500/15 text-red-300 border-red-500/25" };
  }
  return { title: "Terrible", badgeClass: "bg-red-500/15 text-red-300 border-red-500/25" };
}

type ChartPoint = {
  timeLabel: string;
  ts: number;
  co2: number | null;
  temperature: number | null;
  humidity: number | null;
};

// ---- Tooltip typing (no any) ----
type TooltipPayloadItem = {
  dataKey?: string | number;
  name?: string;
  value?: number | string | null;
};

type TooltipContentProps = {
  active?: boolean;
  payload?: readonly TooltipPayloadItem[];
  label?: string | number;
};

function formatTimeLabel(d: Date, preset: PresetKey): string {
  if (preset === "1h" || preset === "24h") {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleString([], {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DeviceDetailPage() {
  const { deviceId } = useParams<{ deviceId: string }>();

  const [device, setDevice] = useState<Device | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);

  // table pagination
  const [visibleCount, setVisibleCount] = useState(10);

  // chart toggles
  const [showCo2, setShowCo2] = useState(true);
  const [showTemp, setShowTemp] = useState(true);
  const [showHum, setShowHum] = useState(true);
  
  // time filter
  const [preset, setPreset] = useState<PresetKey>("24h");
  const [fromValue, setFromValue] = useState<string>(() =>
    toDateTimeLocalValue(new Date(Date.now() - 24 * 60 * 60_000))
  );
  const [toValue, setToValue] = useState<string>(() =>
    toDateTimeLocalValue(new Date())
  );

  // live
  const [live, setLive] = useState(true);

  // sensor sends ~1/min
  const LIVE_POLL_MS = 15_000;
  const LIVE_WINDOW_TICK_MS = 10_000;

  const pollTimerRef = useRef<number | null>(null);
  const windowTimerRef = useRef<number | null>(null);
  const inFlightRef = useRef(false);

  const fromDate = useMemo(() => parseDateTimeLocal(fromValue), [fromValue]);
  const toDate = useMemo(() => parseDateTimeLocal(toValue), [toValue]);

  const latest = useMemo(
    () => (measurements.length > 0 ? measurements[0] : null),
    [measurements]
  );

  const latestTs = useMemo(() => (latest ? getTs(latest) : null), [latest]);
  const latestCo2 = useMemo(() => (latest ? getCo2(latest) : null), [latest]);
  const latestTemp = useMemo(() => (latest ? getTemp(latest) : null), [latest]);
  const latestHum = useMemo(() => (latest ? getHum(latest) : null), [latest]);

  const quality = useMemo(() => {
    if (latestCo2 == null) return null;
    return co2Quality(latestCo2);
  }, [latestCo2]);

  const ledCount = useMemo(() => {
    if (latestCo2 == null) return null;
    return ledCountForCo2(latestCo2);
  }, [latestCo2]);
    const notice = useMemo(() => {
    return co2Notice(latestCo2);
  }, [latestCo2]);

  const noticeUi = useMemo(() => {
    return notice ? noticeClasses(notice.level) : null;
  }, [notice]);

  const liveAvailable = presetMs(preset) !== null;
  const liveOn = live && liveAvailable;

  // ---------- load device ----------
  useEffect(() => {
    let cancelled = false;

    async function loadDevice() {
      if (!deviceId) return;
      setLoading(true);

      const devRes = await apiGetDevice(deviceId);
      if (cancelled) return;

      if ("data" in devRes && devRes.data) setDevice(devRes.data);
      else setDevice(null);

      setLoading(false);
    }

    loadDevice();
    return () => {
      cancelled = true;
    };
  }, [deviceId]);

  // ---------- preset -> update from/to ----------
  useEffect(() => {
    const dur = presetMs(preset);

    if (preset === "all") {
      setLive(false);
      return;
    }
    if (preset === "custom") return;
    if (!dur) return;

    const to = new Date();
    const from = new Date(to.getTime() - dur);
    setFromValue(toDateTimeLocalValue(from));
    setToValue(toDateTimeLocalValue(to));
    setLive(true);
  }, [preset]);

  // ---------- sliding window for live presets ----------
  useEffect(() => {
    if (windowTimerRef.current) {
      window.clearInterval(windowTimerRef.current);
      windowTimerRef.current = null;
    }

    const dur = presetMs(preset);
    if (!liveOn || !dur || loading) return;

    const tick = () => {
      const to = new Date();
      const from = new Date(to.getTime() - dur);
      setFromValue(toDateTimeLocalValue(from));
      setToValue(toDateTimeLocalValue(to));
    };

    tick();
    windowTimerRef.current = window.setInterval(tick, LIVE_WINDOW_TICK_MS);

    return () => {
      if (windowTimerRef.current) {
        window.clearInterval(windowTimerRef.current);
        windowTimerRef.current = null;
      }
    };
  }, [liveOn, preset, loading]);

  // ---------- data fetch ----------
  const fetchRange = async (f?: Date, t?: Date) => {
    if (!deviceId) return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    try {
      // limit=0 => "no limit" (server capped)
      const res = await apiGetDeviceMeasurementsRange(deviceId, f, t, 0, 0);
      if ("data" in res && res.data) setMeasurements(res.data);
      else setMeasurements([]);
    } finally {
      inFlightRef.current = false;
    }
  };

  // whenever from/to/preset changes -> refetch from server
  useEffect(() => {
    if (loading) return;
    if (!deviceId) return;

    // all time: omit from/to
    if (preset === "all") {
      fetchRange(undefined, undefined);
      setVisibleCount(10);
      return;
    }

    const f = fromDate ?? null;
    const t = toDate ?? null;
    if (!f || !t) return;

    const from = f.getTime() <= t.getTime() ? f : t;
    const to = f.getTime() <= t.getTime() ? t : f;

    fetchRange(from, to);
    setVisibleCount(10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, deviceId, preset, fromDate?.getTime(), toDate?.getTime()]);

  // ---------- polling for live mode ----------
  useEffect(() => {
    if (pollTimerRef.current) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }

    if (!loading && liveOn) {
      // immediate refresh
      if (preset === "all") {
        fetchRange(undefined, undefined);
      } else {
        const f = fromDate ?? null;
        const t = toDate ?? null;
        if (f && t) fetchRange(f, t);
      }

      pollTimerRef.current = window.setInterval(() => {
        if (preset === "all") {
          fetchRange(undefined, undefined);
        } else {
          const f = parseDateTimeLocal(fromValue);
          const t = parseDateTimeLocal(toValue);
          if (f && t) fetchRange(f, t);
        }
      }, LIVE_POLL_MS);
    }

    return () => {
      if (pollTimerRef.current) {
        window.clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveOn, loading, preset, deviceId, fromValue, toValue]);

  // ---------- chart data ----------
  const chartData = useMemo<ChartPoint[]>(() => {
    // API is DESC; chart wants ASC
    return measurements
      .slice()
      .reverse()
      .map((m) => {
        const ts = getTs(m) ?? new Date(0);
        return {
          ts: ts.getTime(),
          timeLabel: formatTimeLabel(ts, preset),
          co2: getCo2(m),
          temperature: getTemp(m),
          humidity: getHum(m),
        };
      });
  }, [measurements, preset]);

  // ---------- table ----------
  const visibleRows = useMemo(
    () => measurements.slice(0, visibleCount),
    [measurements, visibleCount]
  );

  const canShowMore = visibleCount < measurements.length;

  const setCustomFrom = (v: string) => {
    setLive(false);
    setPreset("custom");
    setFromValue(v);
  };

  const setCustomTo = (v: string) => {
    setLive(false);
    setPreset("custom");
    setToValue(v);
  };

  const clearRange = () => {
    setLive(false);
    setPreset("all");
  };

  const refreshNow = async () => {
    if (preset === "all") {
      await fetchRange(undefined, undefined);
      return;
    }
    const f = parseDateTimeLocal(fromValue);
    const t = parseDateTimeLocal(toValue);
    if (f && t) await fetchRange(f, t);
  };

  // ---------- tooltip ----------
  const TooltipContent = ({ active, payload, label }: TooltipContentProps) => {
    if (!active || !payload || payload.length === 0) return null;

    const rows = payload
      .filter((p) => p.value !== null && p.value !== undefined)
      .map((p) => {
        const key = String(p.dataKey ?? p.name ?? "");
        const num = typeof p.value === "number" ? p.value : Number(p.value);
        if (!Number.isFinite(num)) return null;

        if (key === "co2") return { k: "CO₂", v: `${num.toFixed(0)} ppm` };
        if (key === "temperature") return { k: "Temp", v: `${num.toFixed(1)} °C` };
        if (key === "humidity") return { k: "Hum", v: `${num.toFixed(1)} %` };
        return { k: key || "Value", v: String(p.value) };
      })
      .filter((x): x is { k: string; v: string } => x !== null);

    return (
      <div className="rounded-xl border border-slate-800 bg-slate-950/95 px-3 py-2 text-xs text-slate-100 shadow-lg">
        <div className="font-semibold mb-1">{String(label ?? "")}</div>
        <div className="space-y-1">
          {rows.map((r) => (
            <div key={r.k} className="flex justify-between gap-4">
              <span className="opacity-80">{r.k}</span>
              <span className="font-mono">{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {device?.name || device?.id || "Device"}
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Location: {device?.location || "Unknown"} · MAC:{" "}
              <span className="font-mono">{device?.id}</span>
              {latestTs ? (
                <span className="ml-2 text-xs">
                  · Updated: {latestTs.toLocaleString()}
                </span>
              ) : null}
            </p>
          </div>

          <button
            type="button"
            onClick={refreshNow}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            Refresh now
          </button>
        </div>

        {/* Quality badge + compact LED bar */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {quality ? (
              <span
                className={[
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border",
                  quality.badgeClass,
                ].join(" ")}
              >
                <span>Air quality:</span>
                <span className="uppercase tracking-wide">{quality.title}</span>
                {latestCo2 != null ? (
                  <span className="font-mono opacity-90">· {latestCo2.toFixed(0)} ppm</span>
                ) : null}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-slate-200 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                Air quality: —
              </span>
            )}

            {ledCount != null ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200">
                LED level: <span className="font-mono">{ledCount}/8</span>
              </span>
            ) : null}

            <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
              Sensor sends ~1 measurement / minute.
            </span>
          </div>
            {/* Notifications */}
{notice && noticeUi && (
  <div className={["rounded-2xl border p-4", noticeUi.box].join(" ")}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          Notifications
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Based on the latest CO₂ reading.
        </p>
      </div>

      <span
        className={[
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border",
          noticeUi.badge,
        ].join(" ")}
      >
        <span className={["h-2 w-2 rounded-full", noticeUi.dot].join(" ")} />
        <span className="uppercase tracking-wide">{notice.level}</span>
        {latestCo2 != null ? (
          <span className="font-mono opacity-90">· {latestCo2.toFixed(0)} ppm</span>
        ) : null}
      </span>
    </div>

    <div className="mt-3">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">
        {notice.title}
      </p>
      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
        {notice.text}
      </p>
    </div>
  </div>
)}

          {/* Compact LED BAR */}
          <div className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2">
            <div className="mt-1 flex gap-1.5">
              {Array.from({ length: 8 }).map((_, i) => {
                const on = ledCount != null ? i < ledCount : false;
                return (
                  <div
                    key={i}
                    className={[
                      "h-2 w-full flex-1 rounded-full border transition-all",
                      on
                        ? `${segmentColorClass(i)} border-transparent`
                        : "bg-slate-200/60 border-slate-300 dark:bg-slate-900/60 dark:border-slate-800",
                    ].join(" ")}
                    style={
                      on
                        ? {
                            boxShadow: "0 0 10px rgba(255,255,255,0.08), 0 0 16px rgba(255,255,255,0.06)",
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p>
      ) : (
        <>
          {/* Current cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-slate-100 border border-slate-200 p-4 dark:bg-slate-900 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current CO₂</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                {latestCo2 != null ? `${latestCo2.toFixed(0)} ppm` : "—"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 border border-slate-200 p-4 dark:bg-slate-900 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Temperature</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                {latestTemp != null ? `${latestTemp.toFixed(1)} °C` : "—"}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 border border-slate-200 p-4 dark:bg-slate-900 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Humidity</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                {latestHum != null ? `${latestHum.toFixed(1)} %` : "—"}
              </p>
            </div>
          </div>

          {/* Chart */}
          <div className="rounded-2xl bg-slate-100 border border-slate-200 p-4 dark:bg-slate-900 dark:border-slate-800">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">Air metrics over time</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Presets update range and reload chart from server (no point limit).
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Points: {chartData.length}</span>
                <span className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  {liveOn ? `Live: ON (${LIVE_POLL_MS / 1000}s)` : "Live: OFF"}
                </span>
              </div>
            </div>

            {/* Presets + Custom range + Live */}
            <div className="mt-4 grid gap-3 lg:grid-cols-[auto,1fr]">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["1h", "1 hour"],
                    ["24h", "1 day"],
                    ["7d", "1 week"],
                    ["30d", "1 month"],
                    ["all", "All time"],
                  ] as Array<[PresetKey, string]>
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPreset(key)}
                    className={[
                      "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                      preset === key
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900",
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-500">
                    From
                  </label>
                  <input
                    type="datetime-local"
                    value={fromValue}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-500">
                    To
                  </label>
                  <input
                    type="datetime-local"
                    value={toValue}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={clearRange}
                  className="px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                >
                  Clear
                </button>

                <button
                  type="button"
                  disabled={!liveAvailable}
                  onClick={() => setLive((v) => !v)}
                  className={[
                    "px-3 py-2 rounded-xl text-xs font-semibold border transition-colors",
                    !liveAvailable
                      ? "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed border-transparent"
                      : liveOn
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900",
                  ].join(" ")}
                  title={
                    !liveAvailable
                      ? "Live works only with preset ranges (1h/1d/1w/1m)"
                      : `Auto-refresh every ${Math.round(LIVE_POLL_MS / 1000)}s`
                  }
                >
                  {liveOn ? "Live: ON" : "Live: OFF"}
                </button>
              </div>
            </div>

            {/* line toggles */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCo2((v) => !v)}
                className={[
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                  showCo2
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900",
                ].join(" ")}
              >
                CO₂
              </button>

              <button
                type="button"
                onClick={() => setShowTemp((v) => !v)}
                className={[
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                  showTemp
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900",
                ].join(" ")}
              >
                Temp
              </button>

              <button
                type="button"
                onClick={() => setShowHum((v) => !v)}
                className={[
                  "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors",
                  showHum
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900",
                ].join(" ")}
              >
                Hum
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowCo2(true);
                  setShowTemp(true);
                  setShowHum(true);
                }}
                className="ml-auto px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                Reset lines
              </button>
            </div>

            <div className="h-64 mt-3">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                  No measurements in this time range.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="timeLabel" fontSize={10} tickMargin={6} />

                    {showCo2 && <YAxis yAxisId="co2" fontSize={10} tickMargin={6} />}
                    {(showTemp || showHum) && <YAxis yAxisId="env" orientation="right" fontSize={10} tickMargin={6} />}

                    <Tooltip content={(props: TooltipContentProps) => <TooltipContent {...props} />} />

                    {showCo2 && (
                      <Line
                        yAxisId="co2"
                        type="monotone"
                        dataKey="co2"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                      />
                    )}

                    {showTemp && (
                      <Line
                        yAxisId="env"
                        type="monotone"
                        dataKey="temperature"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                      />
                    )}

                    {showHum && (
                      <Line
                        yAxisId="env"
                        type="monotone"
                        dataKey="humidity"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Latest measurements
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {Math.min(visibleCount, measurements.length)} of {measurements.length}
              </p>
            </div>

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
                {visibleRows.map((m) => {
                  const ts = getTs(m);
                  const co2 = getCo2(m);
                  const t = getTemp(m);
                  const h = getHum(m);

                  return (
                    <tr key={m.id} className="border-t border-slate-200 dark:border-slate-800">
                      <td className="px-3 py-2">{ts ? ts.toLocaleString() : "—"}</td>
                      <td className="px-3 py-2 text-right">{co2 != null ? co2.toFixed(0) : "—"}</td>
                      <td className="px-3 py-2 text-right">{t != null ? t.toFixed(1) : "—"}</td>
                      <td className="px-3 py-2 text-right">{h != null ? h.toFixed(1) : "—"}</td>
                    </tr>
                  );
                })}

                {measurements.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-slate-500 dark:text-slate-400">
                      No measurements in this range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {measurements.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Newest first. “Show more” reveals +10 rows.
                </div>

                <div className="flex gap-2">
                  {visibleCount > 10 && (
                    <button
                      type="button"
                      onClick={() => setVisibleCount(10)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      Show less
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={!canShowMore}
                    onClick={() => setVisibleCount((v) => Math.min(v + 10, measurements.length))}
                    className={[
                      "px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors",
                      canShowMore
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                        : "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed",
                    ].join(" ")}
                  >
                    + Show more (10)
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
