'use client';

import { useState } from 'react';
import { auth } from '@/lib/api';
import { MzansiBrandMark, SwipeUpTaskbar, WatermarkBackdrop } from '../../components/CommonUpgrade';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.register(form);
      localStorage.setItem('token', res.accessToken);
      localStorage.setItem('user', JSON.stringify(res.user));
      window.location.assign('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", paddingBottom: 68 }}>
      <WatermarkBackdrop imageKey="image2" />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ padding: "16px 24px" }}>
          <MzansiBrandMark compact />
        </div>
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6">Create Mzansi account</h1>
          <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border">
            {error && <p className="text-red-600 text-sm break-words">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">First name</label>
                <input
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last name</label>
                <input
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password (min 8)</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                minLength={8}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#007749] text-white py-2.5 rounded-lg font-semibold hover:bg-[#005f3a] disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-gray-600">
            Already have an account? <a href="/login" className="text-[#007749] font-semibold">Sign in</a>
          </p>
        </div>
      </div>
      <SwipeUpTaskbar />
    </div>
  );
}
