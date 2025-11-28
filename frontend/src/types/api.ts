
// === Auth ===
export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface User {
  id: string;          // Guid
  username: string;
  email: string;
}

// === Devices ===

export interface DeviceRegisterDTO {
  id: string;          // MAC "AA:BB:CC:DD:EE:FF"
  name?: string | null;
  location?: string | null;
  userId: string;      // Guid
}

export interface Device {
  id: string;
  name?: string | null;
  location?: string | null;
  registered_at: string; // ISO
  user_Id: string;       // Guid
}

// === Measurements ===

export interface MeasurementInDTO {
  deviceId: string;
  co2: number;
  temperature: number;
  humidity: number;
  timestamp?: string;  // ISO, optional
  userId: string;
}

export interface Measurement {
  id: string;
  deviceId?: string | null;
  co2: number;
  temperature: number;
  humidity: number;
  timestamp: string;   // ISO
  userId: string;
}

// === Contacts ===

export interface ContactsDTO {
  name: string;
  email: string;
  message: string;
}

// === Generic API response ===

export interface ApiErrorResponse {
  error: string;
}

export interface ApiOkResponse<T> {
  message?: string;
  data?: T;
  count?: number;
}

export type ApiResponse<T> = ApiErrorResponse | ApiOkResponse<T>;

// helper type guard
export const isError = <T,>(
  r: ApiResponse<T>
): r is ApiErrorResponse => "error" in r;
