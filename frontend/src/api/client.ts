/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    RegisterDTO,
    LoginDTO,
    User,
    Device,
    DeviceRegisterDTO,
    Measurement,
    ContactsDTO,
    ApiResponse,
} from "../types/api";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  return data as ApiResponse<T>;
}

// === Auth ===

export async function apiRegister(body: RegisterDTO) {
  return request<User>("/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiLogin(body: LoginDTO) {
  return request<User>("/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// === Devices ===

export async function apiGetUserDevices(userId: string) {
  return request<Device[]>(`/devices/user/${userId}`);
}

export async function apiGetDevice(deviceId: string) {
  return request<Device>(`/devices/id/${deviceId}`);
}

export async function apiRegisterDevice(body: DeviceRegisterDTO) {
  return request<Device>("/devices/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// === Measurements ===

export async function apiGetDeviceMeasurements(
  deviceId: string,
  limit = 200
) {
  return request<Measurement[]>(`/measurements/${deviceId}?limit=${limit}`);
}

export async function apiGetLatestMeasurement(deviceId: string) {
  return request<Measurement>(`/measurements/${deviceId}/latest`);
}

// === Contacts ===

export async function apiSendContact(body: ContactsDTO) {
  return request<unknown>("/Contacts", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
import type { MeasurementsResponse } from "../types/api";

export async function apiGetDeviceMeasurementsRange(
  deviceId: string,
  from?: Date,
  to?: Date,
  limit: number = 0,
  offset: number = 0
) {
  const params = new URLSearchParams();

  if (from) params.set("from", from.toISOString());
  if (to) params.set("to", to.toISOString());

  params.set("limit", String(limit));
  params.set("offset", String(offset));

  const qs = params.toString();
  const url = `/measurements/${encodeURIComponent(deviceId)}${qs ? `?${qs}` : ""}`;

  return fetchJson<MeasurementsResponse>(url);
}


async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  let res: Response;

  try {
    res = await fetch(`${API_URL}${url}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers ?? {}),
      },
      ...options,
    });
  } catch {
    throw new Error("Network error");
  }

  const text = await res.text();

  if (!text) {
    if (res.ok) {
      return {} as T;
    }
    throw new Error(`Empty response (HTTP ${res.status})`);
  }

  const ct = res.headers.get("content-type") ?? "";
  const isJson = ct.toLowerCase().includes("application/json");

  if (!isJson) {
    const preview = text.slice(0, 400).replace(/\s+/g, " ").trim();
    throw new Error(`Non-JSON response (HTTP ${res.status}): ${preview}`);
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON response (HTTP ${res.status})`);
  }

  if (!res.ok) {
    const msg =
      typeof json === "object" && json && "error" in json
        ? String((json as { error: unknown }).error)
        : `HTTP ${res.status}`;

    throw new Error(msg);
  }

  return json as T;
}

export async function apiUpdateDevice(
  deviceId: string,
  patch: { name?: string; location?: string }
) {
  return fetchJson<ApiResponse<Device>>(
    `/devices/${encodeURIComponent(deviceId)}`,
    {
      method: "PUT",
      body: JSON.stringify(patch),
    }
  );
}

