const defaultBase = import.meta.env.BASE_URL.replace(/\/$/, '')
export const API_BASE = import.meta.env.VITE_SERVER_URL || defaultBase

