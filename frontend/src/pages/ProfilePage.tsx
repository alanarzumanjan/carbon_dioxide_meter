import type { User } from "../types/api";

export function ProfilePage() {
  const raw = localStorage.getItem("user");
  const user: User | null = raw ? JSON.parse(raw) : null;

  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

  if (!user) {
    return <p className="text-sm text-slate-400">No user loaded.</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile & API</h1>
        <p className="text-sm text-slate-400">
          Your account details and integration info for firmware.
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
        </div>
      </section>

      <section className="rounded-2xl bg-slate-900 border border-slate-800 p-4 text-xs space-y-3">
        <p className="font-semibold">API endpoints</p>
        <p className="text-slate-300">
          Base URL: <span className="font-mono">{apiUrl}</span>
        </p>
        <pre className="bg-slate-950 rounded-lg border border-slate-800 p-3 overflow-auto">
{`POST ${apiUrl}/measurements
Content-Type: application/json

{
  "deviceId": "AA:BB:CC:DD:EE:FF",
  "userId": "${user.id}",
  "co2": 750,
  "temperature": 23.5,
  "humidity": 45.0
}`}
        </pre>
      </section>
    </div>
  );
}
