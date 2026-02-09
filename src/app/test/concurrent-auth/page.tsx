'use client';

import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function ConcurrentAuthTest() {
  const { user, isAuthenticated, isLoading, session, lastTokenRefresh } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginStatus, setLoginStatus] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStatus('Logging in...');
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        setLoginStatus(`Error: ${error.message}`);
      } else {
        setLoginStatus('Login successful!');
        setLoginForm({ email: '', password: '' });
      }
    } catch (error) {
      setLoginStatus(`Login failed: ${error}`);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();
      if (error) {
        setLoginStatus(`Logout error: ${error.message}`);
      } else {
        setLoginStatus('Logged out successfully');
      }
    } catch (error) {
      setLoginStatus(`Logout failed: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          🔐 Concurrent Authentication Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Session Status</h2>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Authenticated:</strong> 
              <span className={`ml-2 px-2 py-1 rounded ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isAuthenticated ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            <div>
              <strong>Loading:</strong> 
              <span className={`ml-2 px-2 py-1 rounded ${isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                {isLoading ? '⏳ Loading' : '✅ Ready'}
              </span>
            </div>
            <div>
              <strong>User:</strong> 
              <span className="ml-2">{user?.email || 'Not logged in'}</span>
            </div>
            <div>
              <strong>Role:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                user?.role === 'worker' ? 'bg-blue-100 text-blue-800' : 
                'bg-gray-100 text-gray-800'
              }`}>
                {user?.role || 'None'}
              </span>
            </div>
            <div>
              <strong>Session ID:</strong> 
              <span className="ml-2 text-xs font-mono">{session?.session_id?.slice(0, 8) || 'None'}</span>
            </div>
            <div>
              <strong>Last Refresh:</strong> 
              <span className="ml-2 text-xs">
                {lastTokenRefresh ? new Date(lastTokenRefresh).toLocaleTimeString() : 'Never'}
              </span>
            </div>
          </div>
        </div>

        {!isAuthenticated ? (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Login</h2>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="worker@goboclean.be or admin@goboclean.be"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="GoBo2026!Worker or GoBo2026!Admin"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
            
            {loginStatus && (
              <div className={`mt-4 p-3 rounded-md ${
                loginStatus.includes('Error') || loginStatus.includes('failed') 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {loginStatus}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            
            <div className="space-y-4">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
              
              <div className="text-sm text-gray-600 text-center">
                Open this page in multiple browser tabs to test concurrent authentication
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
          
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 text-xs">1</span>
              Open this page in multiple browser tabs
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 text-xs">2</span>
              Login with different users in each tab (worker@goboclean.be and admin@goboclean.be)
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 text-xs">3</span>
              Verify both sessions work simultaneously
            </li>
            <li className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 text-xs">4</span>
              Check browser console for auth event logs
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}