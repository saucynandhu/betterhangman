'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Check for success message in URL params
  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'check-email') {
      setSuccessMessage('Please check your email for a confirmation link to complete your registration.');
      toast.success('Check your email for the confirmation link!');
      
      // Clear the message from the URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('message');
      window.history.replaceState({}, '', newUrl.toString());
    } else if (searchParams.get('error') === 'unauthorized') {
      setError('Please verify your email before logging in.');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        // Check if email is not confirmed
        if (signInError.message.includes('Email not confirmed')) {
          // Resend confirmation email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email.trim(),
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (resendError) {
            throw resendError;
          }
          
          throw new Error('Please check your email to confirm your account. We\'ve sent you a new confirmation link.');
        }
        throw signInError;
      }

      // Check if email is verified
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.email_confirmed_at) {
        await supabase.auth.signOut();
        throw new Error('Please verify your email before logging in.');
      }

      // Show success message
      toast.success('Logged in successfully!');
      
      // Redirect to game page after successful login
      router.push('/game');
      router.refresh();
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'An error occurred during login. Please try again.');
      toast.error(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-2 rounded text-sm">
          {successMessage}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-semibold mb-2 text-gray-300">
          Email
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim())}
          required
          autoComplete="email"
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
          placeholder="your@email.com"
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="password" className="block text-sm font-semibold text-gray-300">
            Password
            <span className="text-red-500 ml-1">*</span>
          </label>
          <button
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            {isPasswordVisible ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="relative">
          <input
            id="password"
            type={isPasswordVisible ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition pr-12"
            placeholder="Enter your password"
          />
        </div>
        <div className="mt-2 text-right">
          <Link 
            href="/forgot-password" 
            className="text-xs text-purple-400 hover:underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>
      <div className="space-y-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
        
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-400">OR</span>
          </div>
        </div>
        
        <p className="text-sm text-gray-400 text-center">
          Don't have an account?{' '}
          <Link href="/signup" className="text-purple-400 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
}
