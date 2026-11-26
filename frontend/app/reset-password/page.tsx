'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const qToken = params.get('token');
    if (qToken) setToken(qToken);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'Password reset failed.');
      } else {
        setMessage(data.message || 'Password updated. You can now sign in.');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border">
        {error && <p className="text-red-600 text-sm break-words">{error}</p>}
        {message && (
          <div className="space-y-2">
            <p className="text-[#007749] text-sm font-medium break-words">{message}</p>
            <a href="/login/" className="inline-block text-sm text-[#007749] font-semibold underline">
              Go to Sign in
            </a>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Reset Token</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 font-mono text-xs"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">New Password (min 8 chars)</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            minLength={8}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? 'Updating password...' : 'Update Password'}
        </button>
      </form>
      <p className="mt-4 text-sm text-center text-gray-600">
        Need a token?{' '}
        <a href="/forgot-password/" className="text-[#007749] font-semibold">
          Forgot password
        </a>
      </p>
    </div>
  );
}