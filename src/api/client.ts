const BASE_URL = "http://localhost:5059";

interface ApiFetchOptions extends RequestInit {
  isFormData?: boolean;
}

// Aynı anda birden fazla istek 401 alırsa, hepsi tek bir refresh isteğini paylaşsın diye
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    localStorage.setItem("token", data.accessToken);
    return data.accessToken as string;
  } catch {
    return null;
  }
}

function clearAuthAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("firstName");
  localStorage.removeItem("isAdmin");
  window.location.href = "/login";
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {},
  isRetry = false
): Promise<T> {
  const token = localStorage.getItem("token");
  const { isFormData, headers, ...rest } = options;

  const finalHeaders: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers: finalHeaders,
  });

  // Access token süresi dolmuş olabilir — bir kez yenilemeyi dene, sonra isteği tekrarla
  if (response.status === 401 && token && !isRetry) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }
    const newToken = await refreshPromise;

    if (newToken) {
      return apiFetch<T>(endpoint, options, true);
    }

    // Refresh de başarısız oldu — oturum gerçekten bitmiş, çıkışa yönlendir
    clearAuthAndRedirect();
    throw new Error("Oturum süresi doldu, lütfen tekrar giriş yapın.");
  }

  if (!response.ok) {
    let errorMessage = `İstek başarısız oldu: ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorBody.title || errorMessage;
    } catch {
      // JSON değilse varsayılan mesaj kalır
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}