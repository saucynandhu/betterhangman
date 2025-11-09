'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  
  // Function to validate username
  const isValidUsername = (username: string) => {
    // Only allow alphanumeric, underscores, and hyphens
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
  };
  
  // Function to validate password
  const isValidPassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Input validation
    if (!isValidUsername(username)) {
      setError('Username must be 3-20 characters long and can only contain letters, numbers, underscores, or hyphens.');
      setLoading(false);
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    try {
      // 1. First, check if email is already in use
      const { data: existingEmail, error: emailCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', trimmedEmail)
        .maybeSingle();

      if (emailCheckError) {
        console.error('Error checking email:', emailCheckError);
        throw new Error('Error checking email availability');
      }

      if (existingEmail) {
        setError('This email is already registered. Please use a different email or log in.');
        setLoading(false);
        return;
      }

      // 2. Check if username is available
      const { data: existingUser, error: usernameCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', trimmedUsername)
        .maybeSingle();

      if (usernameCheckError) {
        console.error('Error checking username:', usernameCheckError);
        throw new Error('Error checking username availability');
      }

      if (existingUser) {
        setError('Username is already taken. Please choose another one.');
        setLoading(false);
        return;
      }
      
      // 3. Sign up the user with username in user_metadata
      const { error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            username: trimmedUsername,
            full_name: trimmedUsername,
            name: trimmedUsername,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error('Auth signup error:', signUpError);
        
        // Handle specific error cases
        if (signUpError.message.includes('already registered')) {
          throw new Error('This email is already registered. Please log in instead.');
        } else if (signUpError.message.includes('password')) {
          throw new Error('Invalid password. Please choose a stronger password.');
        } else if (signUpError.message.includes('email')) {
          throw new Error('Invalid email address. Please check and try again.');
        } else {
          throw signUpError;
        }
      }

      // Show success message
      toast.success('Account created! Please check your email to verify your account.');
      router.push('/login?message=check-email');
    } catch (error: any) {
      console.error('Signup error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // More user-friendly error messages
      let errorMessage = 'An error occurred during signup. Please try again.';
      
      if (error.message.includes('already registered')) {
        errorMessage = 'This email is already registered. Please log in instead.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="username" className="block text-sm font-semibold mb-2 text-gray-300">
          Username
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.trim())}
          required
          minLength={3}
          maxLength={20}
          pattern="[a-zA-Z0-9_-]+"
          title="Username can only contain letters, numbers, underscores, and hyphens"
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
          placeholder="your_username"
        />
        <p className="mt-1 text-xs text-gray-400">3-20 characters, letters, numbers, _ or -</p>
      </div>
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
          autoComplete="username"
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
          placeholder="your@email.com"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-semibold mb-2 text-gray-300">
          Password
          <span className="text-red-500 ml-1">*</span>
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
          placeholder="Minimum 6 characters"
        />
        <p className="mt-1 text-xs text-gray-400">At least 6 characters</p>
      </div>
      <div className="space-y-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
        
        <p className="text-xs text-gray-400 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-purple-400 hover:underline font-medium">
            Log in
          </Link>
        </p>
        
        <p className="text-xs text-gray-500 text-center">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-purple-400 hover:underline">Terms</Link> and{' '}
          <Link href="/privacy" className="text-purple-400 hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </form>
  );
}
