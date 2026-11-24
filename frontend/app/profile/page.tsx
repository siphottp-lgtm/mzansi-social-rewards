'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>({
    fullName: '',
    email: '',
    avatarUrl: '',
    bio: '',
    location: '',
  });
  const [avatarInput, setAvatarInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Load failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        if (data) {
          const resolvedName =
            data.displayName ||
            data.fullName ||
            [data.firstName, data.lastName].filter(Boolean).join(' ') ||
            '';
          setProfile({
            ...data,
            fullName: resolvedName,
            bio: data.bio || '',
            location: data.location || '',
          });
          setAvatarInput(data.avatarUrl || '');
        }
      })
      .catch((err) => {
        console.error('Failed to load profile:', err);
        setStatusMsg('Could not load profile details yet.');
      });
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    setSaving(true);
    setStatusMsg('');

    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: profile.fullName,
          fullName: profile.fullName,
          bio: profile.bio,
          avatarUrl: avatarInput,
          location: profile.location,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile((prev: any) => ({ ...prev, ...updated }));
        setStatusMsg('Profile updated successfully!');
      } else {
        const errText = await res.text();
        setStatusMsg(`Failed to update profile (${res.status}): ${errText}`);
      }
    } catch (err: any) {
      console.error(err);
      setStatusMsg(`Network error: ${err?.message || 'Unable to save profile'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 pb-20">
      <header className="bg-white/95 shadow-sm sticky top-0 z-50 px-6 py-3 flex items-center justify-between border-b-2 border-[#007749]">
        <div className="flex flex-col">
          <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
            Jacinta Z M Zuma
          </span>
          <h1 className="text-xl font-extrabold flex items-center gap-1.5">
            <span className="bg-gradient-to-r from-[#007749] via-[#FFB81C] to-[#E03C31] bg-clip-text text-transparent">
              Mzansi
            </span>
          </h1>
        </div>
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="text-sm font-semibold text-[#007749]"
        >
          Back to Feed
        </button>
          <button type="button" onClick={() => router.push('/friends')} className="text-sm font-semibold text-[#007749]">Friends</button>
      </header>

      <div className="max-w-xl mx-auto p-4 mt-6">
        <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-[#007749] text-white rounded-full flex items-center justify-center font-bold text-2xl overflow-hidden shadow">
              {avatarInput ? (
                <img src={avatarInput} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (profile.fullName || 'M')[0]
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">{profile.fullName || 'Mzansi User'}</h2>
              <p className="text-sm text-gray-500">{profile.email}</p>
              {profile.location && (
                <p className="text-xs text-[#007749] font-medium mt-0.5">{profile.location}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Full / Display Name</label>
              <input
                type="text"
                value={profile.fullName || ''}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007749]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Location</label>
              <input
                type="text"
                value={profile.location || ''}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="e.g. Soshanguve, Pretoria"
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007749]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Profile Picture Image URL</label>
              <input
                type="text"
                value={avatarInput}
                onChange={(e) => setAvatarInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007749]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Bio</label>
              <textarea
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                placeholder="Tell Mzansi about yourself..."
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#007749]"
              />
            </div>

            {statusMsg && (
              <p className="text-sm font-medium text-[#007749] bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                {statusMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#007749] text-white py-2.5 rounded-lg font-semibold hover:bg-[#005f3a] transition"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>

          <hr />

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 text-white py-2.5 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Log Out of Mzansi
          </button>
        </div>
      </div>
    </div>
  );
}