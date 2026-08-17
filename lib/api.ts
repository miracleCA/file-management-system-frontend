const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

interface ApiOptions extends RequestInit {
  token?: string | null;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, headers, ...requestOptions } = options;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...requestOptions,

    headers: {
      'Content-Type': 'application/json',
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('file_manager_token');

      window.location.href = '/login';
    }

    throw new Error('Your session has expired. Please sign in again.');
  }

  if (!response.ok) {
    const message = data?.message ?? data?.error ?? `Request failed with status ${response.status}`;

    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return data as T;
}
