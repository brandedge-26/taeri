import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.taeri.online/api";

export const adminAxios = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let _token: string | null = null;

export function setAdminToken(token: string | null) {
  _token = token;
}

adminAxios.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`;
  return config;
});
