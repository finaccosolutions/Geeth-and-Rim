import { useState, useEffect } from 'react';
import { User, Calendar, Settings, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CustomerProfile } from '../types';

interface AccountProps {
  onNavigate: (page: string) => void;
}

export const Account = ({ onNavigate }: AccountProps) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadBookingCount();
    }
  }, [user]);

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

  const loadBookingCount = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('bookings')
      .select('id', { count: 'exact' })
      .eq('customer_email', user.email);

    if (data) {
      setBookingCount(data.length);
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
    onNavigate('auth');
    return null;
  }

  const menuItems = [
    {
      icon: User,
      title: 'My Profile',
      description: 'View and edit your personal information',
      page: 'profile',
      color: 'from-[#C17B5C] to-[#AD6B4B]',
    },
    {
      icon: Calendar,
      title: 'My Bookings',
      description: `${bookingCount} booking${bookingCount !== 1 ? 's' : ''} in total`,
      page: 'mybookings',
      color: 'from-[#82896E] to-[#7B9B6F]',
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Manage your account and security',
      page: 'settings',
      color: 'from-[#264025] to-[#3D5E3D]',
    },
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-[#FAF6F1] to-[#E8D5C4]/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#264025] to-[#7B4B36] p-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <User className="text-white" size={48} />
                </div>
                <div className="text-white">
                  <h1 className="text-4xl font-bold mb-2">{profile.full_name}</h1>
                  <p className="text-white/80 text-lg">{profile.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 group"
              >
                <div className={`bg-gradient-to-br ${item.color} p-8 text-white h-32 flex items-center justify-center`}>
                  <IconComponent size={56} className="group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[#264025] mb-2 text-left">{item.title}</h3>
                  <p className="text-[#82896E] text-sm text-left mb-4">{item.description}</p>
                  <div className="flex items-center space-x-2 text-[#AD6B4B] font-semibold group-hover:space-x-4 transition-all duration-300">
                    <span>View</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8 border-2 border-[#DDCBB7]">
          <h2 className="text-2xl font-bold text-[#264025] mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => onNavigate('booking')}
              className="bg-gradient-to-r from-[#AD6B4B] to-[#C17B5C] text-white px-6 py-4 rounded-lg hover:from-[#7B4B36] hover:to-[#AD6B4B] transition-all duration-300 font-semibold text-lg"
            >
              Create New Booking
            </button>
            <button
              onClick={() => onNavigate('services')}
              className="bg-gradient-to-r from-[#264025] to-[#7B4B36] text-white px-6 py-4 rounded-lg hover:from-[#1a2118] hover:to-[#264025] transition-all duration-300 font-semibold text-lg"
            >
              Browse Services
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
