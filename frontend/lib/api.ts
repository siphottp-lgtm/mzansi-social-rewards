const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const SHARED_STORAGE_KEYS = {
  profile: 'mzansi_profile_details_v1',
  posts: 'mzansi_feed_posts_v1',
  messages: 'mzansi_messages_v1',
  members: 'mzansi_registered_members_v1',
} as const;

export interface SharedMember {
  id: string;
  name: string;
  handle: string;
  initials: string;
  role: string;
  color?: '' | 'green' | 'pink' | 'blue';
  avatarUrl?: string;
}

export function getApiBaseUrl(): string {
  return API_URL.replace(/\/+$/, '');
}

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

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const res = await fetch(`${getApiBaseUrl()}${normalizedPath}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}

export function makeInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'M';
  return parts
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function normalizeMembersList(raw: unknown): SharedMember[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { members?: unknown[] }).members)
    ? (raw as { members: unknown[] }).members
    : raw && typeof raw === 'object' && Array.isArray((raw as { friends?: unknown[] }).friends)
    ? (raw as { friends: unknown[] }).friends
    : raw && typeof raw === 'object' && Array.isArray((raw as { users?: unknown[] }).users)
    ? (raw as { users: unknown[] }).users
    : [];

  const colors: ('' | 'green' | 'pink' | 'blue')[] = ['green', 'pink', 'blue', ''];
  const seen = new Set<string>();
  const result: SharedMember[] = [];

  list.forEach((item, idx) => {
    if (!item || typeof item !== 'object') return;
    const obj = item as Record<string, unknown>;
    const rawName =
      (typeof obj.fullName === 'string' && obj.fullName) ||
      (typeof obj.name === 'string' && obj.name) ||
      (typeof obj.memberName === 'string' && obj.memberName) ||
      '';
    const name = rawName.trim();
    if (!name) return;

    const id = String(obj.id ?? obj._id ?? obj.handle ?? name.toLowerCase().replace(/\s+/g, '-'));
    if (seen.has(id)) return;
    seen.add(id);

    const handle =
      (typeof obj.handle === 'string' && obj.handle.trim()) ||
      `@${name.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'member'}`;
    const role =
      (typeof obj.role === 'string' && obj.role.trim()) ||
      (typeof obj.bio === 'string' && obj.bio.trim()) ||
      'Registered Member';
    const avatarUrl =
      (typeof obj.avatarUrl === 'string' && obj.avatarUrl) ||
      (typeof obj.avatar_url === 'string' && obj.avatar_url) ||
      '';
    const color =
      obj.color === 'green' || obj.color === 'pink' || obj.color === 'blue' || obj.color === ''
        ? obj.color
        : colors[idx % colors.length];

    result.push({
      id,
      name,
      handle,
      initials: makeInitials(name),
      role,
      color,
      avatarUrl,
    });
  });

  return result;
}

export async function fetchSharedMembers(): Promise<SharedMember[]> {
  if (typeof window !== 'undefined') {
    try {
      const cached = window.localStorage.getItem(SHARED_STORAGE_KEYS.members);
      if (cached) {
        const parsed = normalizeMembersList(JSON.parse(cached));
        if (parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore cache read error
    }
  }

  for (const endpoint of ['/users/directory', '/friends']) {
    try {
      const data = await api(endpoint);
      const members = normalizeMembersList(data);
      if (members.length > 0) {
        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(SHARED_STORAGE_KEYS.members, JSON.stringify(members));
          } catch {
            // Ignore cache write error
          }
        }
        return members;
      }
    } catch {
      // Try next endpoint
    }
  }

  return [];
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
