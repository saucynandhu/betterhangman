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
  
  // Function to validate email
  const isValidEmail = (email: string) => {
    // Simple email validation that works with most common cases
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email.trim());
  };

  // Function to validate username
  const isValidUsername = (username: string) => {
    // First trim the username
    const trimmed = username.trim();
    
    // Check length
    if (trimmed.length < 3 || trimmed.length > 20) return false;
    
    // Check for invalid characters
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return false;
    
    // Cannot start or end with special characters
    if (/^[_-]|[-_]$/.test(trimmed)) return false;
    
    // No consecutive special characters
    if (/--|__|_-|-_/.test(trimmed)) return false;
    
    return true;
  };
  
  // Function to validate password
  const isValidPassword = (password: string) => {
    if (password.length < 6) return false;
    // Require at least one letter and one number
    return /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Input validation
    if (!username) {
      setError('Username is required');
      setLoading(false);
      return;
    }
    
    if (!isValidUsername(username)) {
      setError('Username must be 3-20 characters long, can only contain letters, numbers, underscores, or hyphens, and cannot start/end with special characters.');
      setLoading(false);
      return;
    }
    
    if (!email) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters long and include both letters and numbers');
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
      const { error: signUpError, data: signUpData } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            username: trimmedUsername,
            full_name: trimmedUsername,
            name: trimmedUsername,
            email_confirmed_at: new Date().toISOString()  // Mark email as confirmed
          },
          // Skip email confirmation
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      console.log('Signup response:', { signUpError, signUpData });

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

      // Sign in the user immediately after signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: password,
      });

      if (signInError) {
        console.error('Auto sign-in error:', signInError);
        // If auto sign-in fails, just redirect to login page
        toast.success('Account created! Please sign in with your credentials.');
        router.push('/login');
        return;
      }

      // If we get here, the user is signed in
      toast.success('Welcome! Your account has been created successfully.');
      router.push('/profile');
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
          pattern="[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]"
          title="3-20 characters, letters/numbers/_- only, no special chars at start/end"
          className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
          placeholder="your_username"
        />
        <p className="mt-1 text-xs text-gray-400">3-20 characters, letters, numbers, _ or - (no special characters, cannot start/end with _ or -)</p>
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
          placeholder="At least 6 characters with letters & numbers"
        />
        <p className="mt-1 text-xs text-gray-400">At least 6 characters with both letters and numbers</p>
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
