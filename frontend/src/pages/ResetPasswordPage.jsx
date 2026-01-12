import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Loader2, CheckCircle } from 'lucide-react';

const deepBlue = "#0A2A43";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to reset password');
      }

      setSuccess(true);
      // Optionally redirect after a few seconds
      setTimeout(() => navigate('/login'), 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <p className="text-red-600 font-semibold">Invalid Request</p>
          <p className="text-gray-600 mt-2">No reset token found. Please use the link from your email.</p>
          <Link to="/login" className="mt-4 inline-block text-blue-600 hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-legal-gray-bg p-6" style={{ backgroundColor: '#F7F9FA' }}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="p-8 text-center" style={{ backgroundColor: deepBlue }}>
          <img src="/logo.png" alt="KanoonAI Logo" className="mx-auto h-16 w-16" />
          <h2 className="mt-4 text-2xl font-bold text-white">Set New Password</h2>
        </div>

        <div className="p-8">
          {success ? (
             <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Password Updated!</h3>
              <p className="text-gray-600">Your password has been changed successfully.</p>
              <p className="text-sm text-gray-500">Redirecting to login...</p>
              <Link to="/login" className="inline-block px-6 py-2 bg-legal-blue-primary text-white rounded-lg">Login Now</Link>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="pass" className="mb-1 block text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input type="password" id="pass" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 shadow-sm focus:border-legal-blue-primary focus:ring-2 focus:ring-legal-blue-primary/50" required disabled={isLoading} placeholder="••••••••" />
                </div>
              </div>

              <div>
                <label htmlFor="conf" className="mb-1 block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input type="password" id="conf" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 shadow-sm focus:border-legal-blue-primary focus:ring-2 focus:ring-legal-blue-primary/50" required disabled={isLoading} placeholder="••••••••" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 rounded-lg py-3 text-lg font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:bg-gray-400"
                style={isLoading ? {} : { backgroundColor: deepBlue }}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Update Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;