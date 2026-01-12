import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2 } from 'lucide-react';

const deepBlue = "#0A2A43";

function LoginPage() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      // Save user data to localStorage
      localStorage.setItem('user', JSON.stringify(data));
      
      // Navigate directly to chatbot
      navigate('/dashboard/chatbot'); 

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-legal-gray-bg p-6" style={{ backgroundColor: '#F7F9FA' }}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="p-8 text-center" style={{ backgroundColor: deepBlue }}>
          <img src="/logo.png" alt="KanoonAI Logo" className="mx-auto h-16 w-16" />
          <h2 className="mt-4 text-3xl font-bold text-white">KanoonAI</h2>
          <p className="mt-2 text-lg text-gray-200">Welcome Back</p>
        </div>

        {/* Form Area */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="email" id="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 shadow-sm focus:border-legal-blue-primary focus:ring-2 focus:ring-legal-blue-primary/50" required disabled={isLoading} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input type="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 shadow-sm focus:border-legal-blue-primary focus:ring-2 focus:ring-legal-blue-primary/50" required disabled={isLoading} />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm font-medium text-gray-600 hover:text-legal-blue-primary">
                Forgot Password?
              </Link>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 rounded-lg py-3 text-lg font-semibold text-white shadow-md transition-all hover:scale-105 hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
              style={isLoading ? {} : { backgroundColor: deepBlue }}
            >
              {isLoading ? <Loader2 className="animate-spin" /> : "Login"}
            </button>
          </form>

          {/* Link to Sign Up */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account? <Link to="/signup" className="font-semibold" style={{ color: deepBlue }}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;