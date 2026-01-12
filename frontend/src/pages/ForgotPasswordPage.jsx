import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';

const deepBlue = "#0A2A43";

function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send reset link');
      }

      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-legal-gray-bg p-6" style={{ backgroundColor: '#F7F9FA' }}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="p-8 text-center" style={{ backgroundColor: deepBlue }}>
          <img src="/logo.png" alt="KanoonAI Logo" className="mx-auto h-16 w-16" />
          <h2 className="mt-4 text-2xl font-bold text-white">Reset Password</h2>
        </div>

        <div className="p-8">
          {message ? (
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                {message}
              </div>
              <p className="text-sm text-gray-500">Check your email (and spam folder) for the link.</p>
              <Link to="/login" className="inline-flex items-center text-sm font-medium text-legal-blue-primary hover:underline">
                <ArrowLeft size={16} className="mr-1" /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-600 text-center mb-4">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 shadow-sm focus:border-legal-blue-primary focus:ring-2 focus:ring-legal-blue-primary/50" required disabled={isLoading} placeholder="you@example.com" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 rounded-lg py-3 text-lg font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:bg-gray-400"
                style={isLoading ? {} : { backgroundColor: deepBlue }}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
              </button>

              <div className="text-center mt-4">
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-legal-blue-primary">
                  Back to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;