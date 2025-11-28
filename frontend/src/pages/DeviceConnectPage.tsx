import { useState, type FormEvent } from "react";
import { apiRegisterDevice } from "../api/client";
import type { DeviceRegisterDTO, User } from "../types/api";

export function DeviceConnectPage() {
  const raw = localStorage.getItem("user");
  const user: User | null = raw ? JSON.parse(raw) : null;

  const [form, setForm] = useState<DeviceRegisterDTO>({
    id: "",
    name: "",
    location: "",
    userId: user?.id ?? "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    const res = await apiRegisterDevice({ ...form, userId: user.id });

    setLoading(false);

    if ("error" in res) {
      setError(res.error);
    } else {
      setMessage(res.message ?? "Device registered!");
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Connect new device</h1>
        <p className="text-sm text-slate-400">
          Register your ESP32 CO₂ monitor by its MAC address, then use the
          generated User ID in your firmware.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <div className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {message && (
          <div className="text-sm text-emerald-300 bg-emerald-950/40 border border-emerald-800 rounded-lg px-3 py-2">
            {message}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm text-slate-200">Device MAC (Id)</label>
          <input
            type="text"
            placeholder="AA:BB:CC:DD:EE:FF"
            value={form.id}
            onChange={(e) =>
              setForm((f) => ({ ...f, id: e.target.value }))
            }
            required
            className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm text-slate-200">Name</label>
            <input
              type="text"
              placeholder="Bedroom"
              value={form.name ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-200">Location</label>
            <input
              type="text"
              placeholder="Home office"
              value={form.location ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              className="w-full rounded-lg bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !user}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-4 py-2 text-sm font-medium"
        >
          {loading ? "Registering..." : "Register device"}
        </button>
      </form>

      {/* Firmware helper */}
      {user && (
        <section className="mt-6 rounded-2xl bg-slate-900 border border-slate-800 p-4 text-xs">
          <p className="font-semibold mb-2">Firmware helper</p>
          <p className="text-slate-300 mb-1">
            Use this data in your ESP32 code when sending measurements:
          </p>
          <ul className="list-disc list-inside text-slate-400 mb-3">
            <li>UserId: <span className="font-mono">{user.id}</span></li>
            <li>API URL: <span className="font-mono">POST {`{API_URL}/measurements`}</span></li>
          </ul>
          <pre className="bg-slate-950 rounded-lg border border-slate-800 p-3 overflow-auto">
{`{
  "deviceId": "AA:BB:CC:DD:EE:FF",
  "userId": "${user.id}",
  "co2": 750,
  "temperature": 23.5,
  "humidity": 45.0
}`}
          </pre>
        </section>
      )}
    </div>
  );
}
