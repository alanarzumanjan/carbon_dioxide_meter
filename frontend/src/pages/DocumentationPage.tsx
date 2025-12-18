import { useMemo } from "react";
import type { User } from "../types/api";

export function DocumentationPage() {
  const raw = localStorage.getItem("user");
  const user: User | null = raw ? JSON.parse(raw) : null;

  const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

  const username = user?.username ?? "YOUR_USERNAME";
  const userId = user?.id ?? "YOUR_USER_ID";

  const loginExample = useMemo(() => {
    return `POST ${apiUrl}/device-users/login
Content-Type: application/json

{
  "mac": "AA:BB:CC:DD:EE:FF",
  "username": "${username}",
  "password": "YOUR_PASSWORD"
}

-> Response example:
{
  "keyIssued": true,
  "deviceKey": "DEVICE_KEY_HERE"
}`;
  }, [apiUrl, username]);

  const measurementExample = useMemo(() => {
    return `POST ${apiUrl}/measurements
Content-Type: application/json
X-Api-Key: DEVICE_KEY_HERE

{
  "deviceId": "AA:BB:CC:DD:EE:FF",
  "co2": 750,
  "temperature": 23.5,
  "humidity": 45.0
}`;
  }, [apiUrl]);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Documentation
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Full guide: connect ESP32, obtain a deviceKey, and start sending measurements.
        </p>
      </div>

      {/* Quick status */}
      <section className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 text-sm space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-semibold text-slate-900 dark:text-white">
            Your account
          </p>
          <span className="text-xs px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
            API: <span className="font-mono">{apiUrl}</span>
          </span>
        </div>

        {user ? (
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Username
              </p>
              <p className="font-medium text-slate-900 dark:text-white">
                {user.username}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Email
              </p>
              <p className="font-medium text-slate-900 dark:text-white">
                {user.email}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                UserId (Guid)
              </p>
              <p className="font-mono text-xs break-all text-slate-900 dark:text-white">
                {user.id}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No user loaded. Please login first to see your username and userId here.
          </p>
        )}
      </section>

      {/* Step 0 */}
      <section className="rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          0) Prerequisites
        </h2>

        <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li>
            ESP32 flashed with your firmware (Setup AP:{" "}
            <span className="font-mono">CO2-SETUP</span>)
          </li>
          <li>2.4 GHz Wi-Fi network (ESP32 often cannot connect to 5 GHz)</li>
          <li>Account created on the website (username/password)</li>
          <li>Recommended: register the device (MAC) in the website first</li>
        </ul>
      </section>

      {/* Step 1 */}
      <section className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          1) Register device (Website)
        </h2>

        <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
          <p>
            First, add the device in the system using its MAC address. The MAC must match what
            the ESP32 uses as <span className="font-mono">deviceId</span> (usually the STA MAC).
          </p>

          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
            <p className="font-semibold text-slate-900 dark:text-white">
              Quick checklist
            </p>
            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 mt-1 space-y-1">
              <li>Open Devices → Add/Register</li>
              <li>
                Paste MAC: <span className="font-mono">AA:BB:CC:DD:EE:FF</span>
              </li>
              <li>Fill name/location (optional)</li>
              <li>Save</li>
            </ul>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            If your backend still requires userId in the DTO — that’s fine for now.
            Your current userId is: <span className="font-mono">{userId}</span>
          </p>
        </div>
      </section>

      {/* Step 2 */}
      <section className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          2) Connect ESP32 to Wi-Fi using Setup AP
        </h2>

        <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-300 space-y-1">
          <li>
            Connect your phone/laptop to Wi-Fi:{" "}
            <span className="font-mono">CO2-SETUP</span>
          </li>
          <li>
            Open: <span className="font-mono">http://192.168.4.1</span>
          </li>
          <li>Click “Scan networks” → pick your network (recommended)</li>
          <li>Enter password → click “Connect”</li>
          <li>Wait until Status shows <b>connected</b> and an IP address appears</li>
        </ol>

        <div className="rounded-xl bg-amber-950/20 border border-amber-800 p-3 text-sm text-amber-200">
          ⚠️ If it does not connect: the most common reasons are 5 GHz Wi-Fi, wrong password,
          hidden SSID, or router restrictions for new devices.
        </div>
      </section>

      {/* Step 3 */}
      <section className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          3) Device login → obtain deviceKey (one-time)
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          On the same setup page, enter your website username/password. The ESP32 will call:
          <span className="font-mono"> /device-users/login</span>. If successful, the server returns a
          <span className="font-mono"> deviceKey</span>. After that the device can send measurements.
        </p>

        <pre className="bg-slate-950 rounded-xl border border-slate-800 p-3 overflow-auto text-xs text-slate-100">
{loginExample}
        </pre>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            How to confirm it worked
          </p>
          <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-300 mt-1 space-y-1">
            <li>Status → <b>Enrolled: Yes</b></li>
            <li><b>Has key: Yes</b></li>
            <li>Serial Monitor: “DeviceKey received & saved”</li>
          </ul>
        </div>
      </section>

      {/* Step 4 */}
      <section className="rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          4) Send measurements (X-Api-Key)
        </h2>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          After a deviceKey exists, the firmware sends measurements to{" "}
          <span className="font-mono">/measurements</span> and includes the key in the{" "}
          <span className="font-mono">X-Api-Key</span> header.
        </p>

        <pre className="bg-slate-950 rounded-xl border border-slate-800 p-3 overflow-auto text-xs text-slate-100">
{measurementExample}
        </pre>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          It’s normal if the sensor sends about one measurement per minute. If you see one every 10 seconds,
          your send interval / timers are configured incorrectly.
        </p>
      </section>

      {/* Troubleshooting */}
      <section className="rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Troubleshooting (Common issues)
        </h2>

        <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3">
            <p className="font-semibold text-slate-900 dark:text-white">
              Wi-Fi reason: 201
            </p>
            <p className="text-sm">
              This typically means: “AP not found / SSID not visible / 5 GHz network / hidden SSID”.
              Check: 2.4 GHz, SSID visibility, exact SSID spelling, correct password, and router restrictions.
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3">
            <p className="font-semibold text-slate-900 dark:text-white">
              ESP32 auto-connects to an old Wi-Fi after reflashing
            </p>
            <p className="text-sm">
              ESP32 can keep Wi-Fi credentials in NVS even after reflashing. Fix: use{" "}
              <b>WiFi.persistent(false)</b> plus a clean disconnect{" "}
              <b>WiFi.disconnect(true, true)</b> (or perform a full NVS reset if you add it).
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3">
            <p className="font-semibold text-slate-900 dark:text-white">
              401 Unauthorized on /measurements
            </p>
            <p className="text-sm">
              The deviceKey is invalid / lost / revoked. Press “Clear device key” in the setup UI and login again.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
