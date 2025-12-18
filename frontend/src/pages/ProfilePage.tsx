import type { User } from "../types/api";

export function ProfilePage() {
  const raw = localStorage.getItem("user");
  const user: User | null = raw ? JSON.parse(raw) : null;

  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

  const savedDeviceKey = localStorage.getItem("deviceKey") || "";

  if (!user) {
    return <p className="text-sm text-slate-400">No user loaded.</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile & Firmware API</h1>
        <p className="text-sm text-slate-400">
          Your account details + exact requests for ESP32 firmware (deviceKey auth).
        </p>
      </div>

      <section className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3 text-sm">
        <div>
          <p className="text-xs text-slate-400">Username</p>
          <p className="font-medium">{user.username}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Email</p>
          <p className="font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">UserId (Guid)</p>
          <p className="font-mono text-xs break-all">{user.id}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            (UserId is for your account only. Firmware should use deviceKey, not userId.)
          </p>
        </div>

        {savedDeviceKey ? (
          <div>
            <p className="text-xs text-slate-400">Saved deviceKey (optional)</p>
            <p className="font-mono text-xs break-all">{savedDeviceKey}</p>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-xs space-y-3">
        <p className="font-semibold">API endpoints</p>

        <p className="text-slate-300">
          Base URL: <span className="font-mono">{apiUrl}</span>
        </p>

        <div className="space-y-2">
          <p className="font-semibold text-slate-200">1) Device login (get deviceKey once)</p>
          <pre className="bg-slate-950 rounded-lg border border-slate-800 p-3 overflow-auto">
{`POST ${apiUrl}/device-users/login
Content-Type: application/json

{
  "mac": "AA:BB:CC:DD:EE:FF",
  "username": "${user.username}",
  "password": "YOUR_PASSWORD"
}

-> Response example:
{
  "keyIssued": true,
  "deviceKey": "DEVICE_KEY_HERE"
}`}
          </pre>

          <p className="font-semibold text-slate-200">2) Send measurements (use X-Api-Key)</p>
          <pre className="bg-slate-950 rounded-lg border border-slate-800 p-3 overflow-auto">
{`POST ${apiUrl}/measurements
Content-Type: application/json
X-Api-Key: DEVICE_KEY_HERE

{
  "deviceId": "AA:BB:CC:DD:EE:FF",
  "co2": 750,
  "temperature": 23.5,
  "humidity": 45.0
}`}
          </pre>
        </div>
      </section>
    </div>
  );
}
