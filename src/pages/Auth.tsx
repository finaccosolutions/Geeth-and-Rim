import { useState } from 'react';
import { User, Mail, Phone, Lock, ChevronLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AuthProps {
  onNavigate: (page: string) => void;
}

export const Auth = ({ onNavigate }: AuthProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signIn } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        setSuccess('Login successful!');
        setTimeout(() => onNavigate('home'), 1000);
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              phone: formData.phone,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          setSuccess('Account created successfully! Logging you in...');

          setTimeout(async () => {
            try {
              await signIn(formData.email, formData.password);
              onNavigate('home');
            } catch (loginError) {
              setSuccess('Account created successfully! Please login.');
              setIsLogin(true);
              setFormData({ email: formData.email, password: '', full_name: '', phone: '' });
            }
          }, 1000);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-[#FAF6F1] to-[#E8D5C4]/30">
      <div className="container mx-auto px-4 max-w-md">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 text-[#AD6B4B] hover:text-[#7B4B36] transition-colors duration-300 mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back to Home</span>
        </button>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#C17B5C] to-[#A6684C] rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="text-white" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-[#264025] mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-[#82896E]">
              {isLogin
                ? 'Login to auto-fill your booking details'
                : 'Register for faster bookings'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[#264025] font-semibold mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 text-[#82896E]" size={20} />
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300 text-lg"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[#264025] font-semibold mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 text-[#82896E]" size={20} />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300 text-lg"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[#264025] font-semibold mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-[#82896E]" size={20} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300 text-lg"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#264025] font-semibold mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-[#82896E]" size={20} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300 text-lg"
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#AD6B4B] to-[#C17B5C] text-white px-8 py-4 rounded-full text-lg font-bold hover:from-[#7B4B36] hover:to-[#AD6B4B] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  Processing...
                </span>
              ) : isLogin ? (
                'Login'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="text-[#AD6B4B] hover:text-[#7B4B36] font-semibold transition-colors duration-300"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t-2 border-[#DDCBB7]">
            <button
              onClick={() => onNavigate('booking')}
              className="w-full text-center text-[#82896E] hover:text-[#264025] transition-colors duration-300"
            >
              Continue as guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
