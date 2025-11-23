import { useState, useEffect } from 'react';
import { User, Calendar, Settings, LogOut, ChevronRight, Clock, X, Edit2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Booking, Service, CustomerProfile } from '../types';

interface AccountProps {
  onNavigate: (page: string) => void;
}

interface BookingWithService extends Booking {
  service?: Service;
}

export const Account = ({ onNavigate }: AccountProps) => {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'settings'>('profile');
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [bookings, setBookings] = useState<BookingWithService[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithService | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadBookings();
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
      setFormData({
        full_name: data.full_name,
        phone: data.phone,
      });
    }
    setLoading(false);
  };

  const loadBookings = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('customer_email', user.email)
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: false });

    if (data) {
      const bookingsWithServices = await Promise.all(
        data.map(async (booking) => {
          const { data: service } = await supabase
            .from('services')
            .select('*')
            .eq('id', booking.service_id)
            .maybeSingle();
          return { ...booking, service };
        })
      );
      setBookings(bookingsWithServices);
    }
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

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    const { error } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (!error) {
      loadBookings();
      setSelectedBooking(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const canCancelBooking = (booking: Booking) => {
    const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
    const now = new Date();
    return booking.status !== 'cancelled' && booking.status !== 'completed' && bookingDateTime > now;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#AD6B4B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    onNavigate('auth');
    return null;
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-[#FAF6F1] to-[#E8D5C4]/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#264025] to-[#7B4B36] p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <User className="text-white" size={40} />
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{profile?.full_name}</h1>
                  <p className="text-white/80">{profile?.email}</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === 'profile'
                    ? 'border-[#AD6B4B] text-[#AD6B4B]'
                    : 'border-transparent text-gray-600 hover:text-[#AD6B4B]'
                }`}
              >
                <User size={20} />
                <span className="font-semibold">Profile</span>
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === 'bookings'
                    ? 'border-[#AD6B4B] text-[#AD6B4B]'
                    : 'border-transparent text-gray-600 hover:text-[#AD6B4B]'
                }`}
              >
                <Calendar size={20} />
                <span className="font-semibold">My Bookings</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-[#AD6B4B] text-[#AD6B4B]'
                    : 'border-transparent text-gray-600 hover:text-[#AD6B4B]'
                }`}
              >
                <Settings size={20} />
                <span className="font-semibold">Settings</span>
              </button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'profile' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#264025]">Profile Information</h2>
                  {!editingProfile && (
                    <button
                      onClick={() => setEditingProfile(true)}
                      className="flex items-center space-x-2 bg-[#AD6B4B] text-white px-4 py-2 rounded-lg hover:bg-[#7B4B36] transition-colors"
                    >
                      <Edit2 size={18} />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>

                {editingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#264025] mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#264025] mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={handleProfileUpdate}
                        className="bg-[#AD6B4B] text-white px-6 py-3 rounded-lg hover:bg-[#7B4B36] transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setEditingProfile(false);
                          setFormData({
                            full_name: profile?.full_name || '',
                            phone: profile?.phone || '',
                          });
                        }}
                        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-[#DDCBB7]/20 rounded-xl p-6">
                      <label className="text-sm font-semibold text-[#82896E] uppercase tracking-wide">
                        Full Name
                      </label>
                      <p className="text-lg text-[#264025] font-medium mt-1">{profile?.full_name}</p>
                    </div>
                    <div className="bg-[#DDCBB7]/20 rounded-xl p-6">
                      <label className="text-sm font-semibold text-[#82896E] uppercase tracking-wide">
                        Email Address
                      </label>
                      <p className="text-lg text-[#264025] font-medium mt-1">{profile?.email}</p>
                    </div>
                    <div className="bg-[#DDCBB7]/20 rounded-xl p-6">
                      <label className="text-sm font-semibold text-[#82896E] uppercase tracking-wide">
                        Phone Number
                      </label>
                      <p className="text-lg text-[#264025] font-medium mt-1">{profile?.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div>
                <h2 className="text-2xl font-bold text-[#264025] mb-6">My Bookings</h2>
                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="mx-auto text-[#82896E] mb-4" size={64} />
                    <p className="text-[#82896E] text-lg mb-4">No bookings yet</p>
                    <button
                      onClick={() => onNavigate('booking')}
                      className="bg-[#AD6B4B] text-white px-6 py-3 rounded-lg hover:bg-[#7B4B36] transition-colors"
                    >
                      Book Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="bg-white border-2 border-[#DDCBB7] rounded-xl p-6 hover:border-[#AD6B4B] transition-colors cursor-pointer"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="text-xl font-bold text-[#264025]">
                                {booking.service?.name}
                              </h3>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold border-2 capitalize ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                {booking.status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-6 text-[#82896E]">
                              <div className="flex items-center space-x-2">
                                <Calendar size={16} />
                                <span>{formatDate(booking.booking_date)}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock size={16} />
                                <span>{formatTime(booking.start_time)}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="text-[#82896E]" size={24} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold text-[#264025] mb-6">Account Settings</h2>
                <div className="space-y-4">
                  <div className="bg-[#DDCBB7]/20 rounded-xl p-6">
                    <h3 className="font-bold text-[#264025] mb-2">Account Created</h3>
                    <p className="text-[#82896E]">
                      {profile?.created_at
                        ? new Date(profile.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <h3 className="font-bold text-red-800 mb-2">Danger Zone</h3>
                    <p className="text-sm text-red-600 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            'Are you sure you want to delete your account? This action cannot be undone.'
                          )
                        ) {
                          alert('Account deletion feature coming soon. Please contact support.');
                        }
                      }}
                      className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[#264025]">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#DDCBB7]/20 rounded-xl p-4">
                <label className="text-sm font-semibold text-[#82896E]">Service</label>
                <p className="text-lg text-[#264025] font-bold">{selectedBooking.service?.name}</p>
                {selectedBooking.service?.description && (
                  <p className="text-sm text-[#82896E] mt-1">
                    {selectedBooking.service.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#DDCBB7]/20 rounded-xl p-4">
                  <label className="text-sm font-semibold text-[#82896E]">Date</label>
                  <p className="text-[#264025] font-medium">
                    {formatDate(selectedBooking.booking_date)}
                  </p>
                </div>
                <div className="bg-[#DDCBB7]/20 rounded-xl p-4">
                  <label className="text-sm font-semibold text-[#82896E]">Time</label>
                  <p className="text-[#264025] font-medium">
                    {formatTime(selectedBooking.start_time)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#DDCBB7]/20 rounded-xl p-4">
                  <label className="text-sm font-semibold text-[#82896E]">Duration</label>
                  <p className="text-[#264025] font-medium">
                    {selectedBooking.service?.duration_minutes} minutes
                  </p>
                </div>
                <div className="bg-[#DDCBB7]/20 rounded-xl p-4">
                  <label className="text-sm font-semibold text-[#82896E]">Price</label>
                  <p className="text-[#264025] font-bold">₹{selectedBooking.service?.price}</p>
                </div>
              </div>

              <div className="bg-[#DDCBB7]/20 rounded-xl p-4">
                <label className="text-sm font-semibold text-[#82896E]">Status</label>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold border-2 capitalize ${getStatusColor(
                    selectedBooking.status
                  )}`}
                >
                  {selectedBooking.status}
                </span>
              </div>

              {selectedBooking.notes && (
                <div className="bg-[#DDCBB7]/20 rounded-xl p-4">
                  <label className="text-sm font-semibold text-[#82896E]">Notes</label>
                  <p className="text-[#264025] mt-1">{selectedBooking.notes}</p>
                </div>
              )}

              {canCancelBooking(selectedBooking) && (
                <div className="pt-4 border-t-2 border-[#DDCBB7]">
                  <button
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Cancel This Booking
                  </button>
                  <p className="text-xs text-[#82896E] text-center mt-2">
                    You can cancel this booking before the scheduled time
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
