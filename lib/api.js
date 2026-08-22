const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend.magnateshop.uz";

// Oddiy fetch wrapper. Token bo'lsa avtomatik qo'shadi,
// javobni { success, message, data } shaklida kutadi.
export async function apiRequest(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    // javob bo'sh bo'lishi mumkin
  }

  if (!res.ok || (json && json.success === false)) {
    const message = json?.message || "Ошибка соединения с сервером.";
    throw new Error(message);
  }

  return json?.data ?? json;
}

export const api = {
  get: (path, token) => apiRequest(path, { method: "GET", token }),
  post: (path, body, token) => apiRequest(path, { method: "POST", body, token }),
  put: (path, body, token) => apiRequest(path, { method: "PUT", body, token }),
  patch: (path, body, token) => apiRequest(path, { method: "PATCH", body, token }),
  del: (path, token) => apiRequest(path, { method: "DELETE", token }),
};

export { BASE_URL };
