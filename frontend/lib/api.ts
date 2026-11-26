const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function api(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export async function uploadImage(category: 'avatars' | 'communities' | 'posts' | 'events', file: File) {
  const form = new FormData();
  form.append('file', file);
  return api(`/uploads/${category}`, {
    method: 'POST',
    body: form,
  });
}

export const auth = {
  register: (data: any) => api('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => api('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
};

export const users = {
  me: () => api('/users/me'),
  update: (data: any) => api('/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
  directory: () => api('/users/directory'),
};

export const friendsApi = {
  overview: () => api('/friends'),
  sendRequest: (targetUserId: string) =>
    api('/friends/request', { method: 'POST', body: JSON.stringify({ targetUserId }) }),
  accept: (id: string) => api(`/friends/${id}/accept`, { method: 'POST' }),
  decline: (id: string) => api(`/friends/${id}/decline`, { method: 'POST' }),
  remove: (id: string) => api(`/friends/${id}`, { method: 'DELETE' }),
};

export const communities = {
  list: () => api('/communities'),
  create: (data: any) => api('/communities', { method: 'POST', body: JSON.stringify(data) }),
  get: (slug: string) => api(`/communities/${slug}`),
  join: (id: string) => api(`/communities/${id}/join`, { method: 'POST' }),
};

export const posts = {
  list: (communityId?: string) =>
    api(communityId ? `/posts?communityId=${encodeURIComponent(communityId)}` : '/posts'),
  create: (data: any) => api('/posts', { method: 'POST', body: JSON.stringify(data) }),
};

export const events = {
  list: (communityId: string) => api(`/events?communityId=${communityId}`),
  create: (data: any) => api('/events', { method: 'POST', body: JSON.stringify(data) }),
  rsvp: (id: string, response: string) =>
    api(`/events/${id}/rsvp`, { method: 'POST', body: JSON.stringify({ response }) }),
};
