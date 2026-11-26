import { MzansiBrandMark, SwipeUpTaskbar, WatermarkBackdrop } from '../../components/CommonUpgrade';
'use client';

import { useState } from 'react';
import { auth } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.login({ email, password });
      localStorage.setItem('token', res.accessToken);
      localStorage.setItem('user', JSON.stringify(res.user));
      window.location.assign('/dashboard/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (`n    <div style={{ position: "relative", minHeight: "100vh", paddingBottom: 68 }}>`n      <WatermarkBackdrop imageKey="image3" />`n      <div style={{ position: "relative", zIndex: 1 }}>`n        <div style={{ padding: "16px 24px" }}><MzansiBrandMark compact /></div>`n        <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Sign in to Mzansi</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border">
        {error && <p className="text-red-600 text-sm break-words">{error}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
          <div className="mt-1 text-right">
            <a href="/forgot-password/" className="text-xs text-[#007749] font-semibold hover:underline">
              Forgot password?
            </a>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#007749] text-white py-2.5 rounded-lg font-semibold hover:bg-[#005f3a] disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-sm text-center text-gray-600">
        No account? <a href="/register/" className="text-[#007749] font-semibold">Register</a>
      </p>
    </div>
        </div>`n      <SwipeUpTaskbar />`n    </div>`n  );`n}
