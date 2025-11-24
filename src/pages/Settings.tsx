import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Lock, Shield, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CustomerProfile } from '../types';

interface SettingsProps {
  onNavigate: (page: string) => void;
}

export const Settings = ({ onNavigate }: SettingsProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    } else if (!loading) {
      onNavigate('auth');
    }
  }, [user, loading, onNavigate]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setChangePasswordMode(false);

      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setPasswordError(err.message);
      } else {
        setPasswordError('Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'Are you sure you want to delete your account? This action cannot be undone and will delete all your data.'
      )
    ) {
      return;
    }

    if (!confirm('Type "DELETE" to confirm account deletion')) {
      return;
    }

    try {
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
      if (error) throw error;

      onNavigate('home');
    } catch (err: unknown) {
      alert('Failed to delete account. Please contact support.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#AD6B4B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !profile) {
    if (!loading) {
      onNavigate('auth');
    }
    return null;
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-[#FAF6F1] to-[#E8D5C4]/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#264025] to-[#7B4B36] p-12">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <SettingsIcon className="text-white" size={48} />
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">Account Settings</h1>
                <p className="text-white/80">Manage your account preferences and security</p>
              </div>
            </div>
          </div>

          <div className="p-12 space-y-8">
            <div className="bg-gradient-to-br from-[#DDCBB7]/20 to-[#E8D5C4]/10 rounded-2xl p-8 border-2 border-[#DDCBB7]/30">
              <div className="flex items-center space-x-3 mb-4">
                <Lock className="text-[#AD6B4B]" size={24} />
                <h2 className="text-2xl font-bold text-[#264025]">Security</h2>
              </div>

              {passwordError && (
                <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 text-sm">
                  {passwordSuccess}
                </div>
              )}

              {!changePasswordMode ? (
                <div>
                  <p className="text-[#82896E] mb-4">
                    Secure your account by changing your password regularly. We recommend using a strong password with a mix of letters, numbers, and symbols.
                  </p>
                  <button
                    onClick={() => setChangePasswordMode(true)}
                    className="bg-[#AD6B4B] text-white px-6 py-3 rounded-lg hover:bg-[#7B4B36] transition-colors font-semibold"
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#264025] mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#264025] mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#264025] mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <button
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                      className="bg-[#AD6B4B] text-white px-6 py-3 rounded-lg hover:bg-[#7B4B36] transition-colors font-semibold disabled:opacity-50"
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      onClick={() => {
                        setChangePasswordMode(false);
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setPasswordError('');
                      }}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-[#DDCBB7]/20 to-[#E8D5C4]/10 rounded-2xl p-8 border-2 border-[#DDCBB7]/30">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="text-[#AD6B4B]" size={24} />
                <h2 className="text-2xl font-bold text-[#264025]">Account Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-[#82896E] uppercase tracking-wide">
                    Email Address
                  </label>
                  <p className="text-lg text-[#264025] font-medium mt-1">{profile.email}</p>
                  <p className="text-xs text-[#82896E] mt-1">Your login email - contact support to change</p>
                </div>

                <div className="border-t-2 border-[#DDCBB7]/30 pt-4">
                  <label className="text-sm font-semibold text-[#82896E] uppercase tracking-wide">
                    Account Created
                  </label>
                  <p className="text-lg text-[#264025] font-medium mt-1">
                    {new Date(profile.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="border-t-2 border-[#DDCBB7]/30 pt-4">
                  <label className="text-sm font-semibold text-[#82896E] uppercase tracking-wide">
                    Last Updated
                  </label>
                  <p className="text-lg text-[#264025] font-medium mt-1">
                    {new Date(profile.updated_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
              <div className="flex items-center space-x-3 mb-4">
                <Trash2 className="text-red-600" size={24} />
                <h2 className="text-2xl font-bold text-red-800">Danger Zone</h2>
              </div>
              <p className="text-red-700 mb-6">
                Deleting your account will permanently remove all your personal information and booking history. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
