import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-md w-full relative z-10 animate-slide-in">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Login
          </h1>
          <p className="text-gray-400">
            Sign in to track your progress and compete on leaderboards
          </p>
        </div>
        <div className="glass rounded-3xl p-8 shadow-2xl border border-gray-700/50">
          <LoginForm />
          <p className="text-center text-gray-400 mt-6 text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-purple-400 hover:text-purple-300 font-semibold transition">
              Sign up
            </Link>
          </p>
        </div>
        <Link
          href="/"
          className="block text-center text-gray-400 hover:text-white mt-6 transition font-medium"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

