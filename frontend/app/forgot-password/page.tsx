'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setResetToken('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'Could not request password reset.');
      } else {
        setMessage(data.message || 'Reset request submitted.');
        if (data.resetToken) setResetToken(data.resetToken);
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl border">
        {error && <p className="text-red-600 text-sm break-words">{error}</p>}
        {message && <p className="text-[#007749] text-sm font-medium break-words">{message}</p>}
        <div>
          <label className="block text-sm font-medium mb-1">Account Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#007749] text-white py-2.5 rounded-lg font-semibold hover:bg-[#005f3a] disabled:opacity-50"
        >
          {loading ? 'Generating token...' : 'Request Reset Token'}
        </button>

        {resetToken && (
          <div className="pt-3 border-t space-y-2 text-xs">
            <p className="font-semibold text-gray-700">Reset Token (valid 1 hour):</p>
            <div className="bg-gray-50 p-2.5 rounded-lg border break-all font-mono text-gray-800">
              {resetToken}
            </div>
            <a
              href={`/reset-password/?token=${encodeURIComponent(resetToken)}`}
              className="inline-block text-[#007749] font-semibold hover:underline"
            >
              Continue to Reset Password
            </a>
          </div>
        )}
      </form>
      <p className="mt-4 text-sm text-center text-gray-600">
        Remembered your password?{' '}
        <a href="/login/" className="text-[#007749] font-semibold">
          Sign in
        </a>
      </p>
    </div>
  );
}