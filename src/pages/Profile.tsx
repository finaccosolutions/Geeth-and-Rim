import { useState, useEffect } from 'react';
import { User, Mail, Phone, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CustomerProfile } from '../types';

interface ProfileProps {
  onNavigate: (page: string) => void;
}

export const Profile = ({ onNavigate }: ProfileProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      onNavigate('auth');
    }
  }, [loading, user, onNavigate]);

  const loadProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
      setFormData({
        full_name: data.full_name,
        phone: data.phone,
      });
    }
    setLoading(false);
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('customer_profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error) {
      setEditingProfile(false);
      loadProfile();
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
    return null;
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-[#FAF6F1] to-[#E8D5C4]/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#264025] to-[#7B4B36] p-12">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <User className="text-white" size={48} />
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold mb-2">{profile.full_name}</h1>
                <p className="text-white/80 text-lg">Member since {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="p-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-[#264025]">Profile Information</h2>
              {!editingProfile && (
                <button
                  onClick={() => setEditingProfile(true)}
                  className="flex items-center space-x-2 bg-[#AD6B4B] text-white px-6 py-3 rounded-lg hover:bg-[#7B4B36] transition-colors font-semibold"
                >
                  <Edit2 size={20} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {editingProfile ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[#264025] mb-3">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 text-[#82896E]" size={20} />
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#264025] mb-3">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 text-[#82896E]" size={20} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleProfileUpdate}
                    className="bg-[#AD6B4B] text-white px-8 py-3 rounded-lg hover:bg-[#7B4B36] transition-colors font-semibold"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingProfile(false);
                      setFormData({
                        full_name: profile.full_name,
                        phone: profile.phone,
                      });
                    }}
                    className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-[#DDCBB7]/20 to-[#E8D5C4]/10 rounded-2xl p-8 border-2 border-[#DDCBB7]/30">
                  <div className="flex items-start space-x-4">
                    <User className="text-[#AD6B4B] flex-shrink-0" size={24} />
                    <div>
                      <label className="text-sm font-semibold text-[#82896E] uppercase tracking-wide block mb-2">
                        Full Name
                      </label>
                      <p className="text-2xl text-[#264025] font-semibold">{profile.full_name}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#DDCBB7]/20 to-[#E8D5C4]/10 rounded-2xl p-8 border-2 border-[#DDCBB7]/30">
                  <div className="flex items-start space-x-4">
                    <Mail className="text-[#AD6B4B] flex-shrink-0" size={24} />
                    <div>
                      <label className="text-sm font-semibold text-[#82896E] uppercase tracking-wide block mb-2">
                        Email Address
                      </label>
                      <p className="text-lg text-[#264025] font-medium">{profile.email}</p>
                      <p className="text-xs text-[#82896E] mt-1">Used for login and booking confirmations</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#DDCBB7]/20 to-[#E8D5C4]/10 rounded-2xl p-8 border-2 border-[#DDCBB7]/30">
                  <div className="flex items-start space-x-4">
                    <Phone className="text-[#AD6B4B] flex-shrink-0" size={24} />
                    <div>
                      <label className="text-sm font-semibold text-[#82896E] uppercase tracking-wide block mb-2">
                        Phone Number
                      </label>
                      <p className="text-lg text-[#264025] font-medium">{profile.phone}</p>
                      <p className="text-xs text-[#82896E] mt-1">Used for booking notifications</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#DDCBB7]/20 to-[#E8D5C4]/10 rounded-2xl p-8 border-2 border-[#DDCBB7]/30 mt-8">
                  <label className="text-sm font-semibold text-[#82896E] uppercase tracking-wide block mb-3">
                    Account Details
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-[#82896E] mb-1">Account Created</p>
                      <p className="text-[#264025] font-semibold">
                        {new Date(profile.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-[#82896E] mb-1">Last Updated</p>
                      <p className="text-[#264025] font-semibold">
                        {new Date(profile.updated_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
