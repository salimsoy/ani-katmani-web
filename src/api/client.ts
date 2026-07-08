const BASE_URL = "http://localhost:5059"; // backend portunu kendi ayarına göre güncelle

interface ApiFetchOptions extends RequestInit {
  isFormData?: boolean;
}

export async function apiFetch<T>(
  endpoint: string,
  options: ApiFetchOptions = {}
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

  // 204 No Content ya da boş body döndüren 200'ler (örn. register) olabilir
  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return await response.json();
  } catch {
    return undefined as T;
  }
}