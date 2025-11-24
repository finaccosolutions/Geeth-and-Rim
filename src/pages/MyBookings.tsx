import { useState, useEffect } from 'react';
import { Calendar, Clock, X, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Booking, Service } from '../types';

interface BookingProps {
  onNavigate: (page: string) => void;
}

interface BookingWithService extends Booking {
  service?: Service;
}

export const MyBookings = ({ onNavigate }: BookingProps) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingWithService[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithService | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

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
    setLoading(false);
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

  const getFilteredBookings = () => {
    if (filter === 'all') return bookings;

    return bookings.filter((booking) => {
      const bookingDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
      const now = new Date();

      if (filter === 'upcoming') {
        return booking.status !== 'cancelled' && booking.status !== 'completed' && bookingDateTime > now;
      } else if (filter === 'completed') {
        return booking.status === 'completed' || bookingDateTime <= now;
      } else if (filter === 'cancelled') {
        return booking.status === 'cancelled';
      }
      return true;
    });
  };

  const filteredBookings = getFilteredBookings();

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
          <div className="bg-gradient-to-r from-[#264025] to-[#7B4B36] p-12">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Calendar className="text-white" size={40} />
              </div>
              <div className="text-white">
                <h1 className="text-4xl font-bold">My Bookings</h1>
                <p className="text-white/80">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          <div className="p-12">
            <div className="mb-8">
              <div className="flex flex-wrap gap-3">
                {(['all', 'upcoming', 'completed', 'cancelled'] as const).map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 capitalize ${
                      filter === filterOption
                        ? 'bg-[#AD6B4B] text-white shadow-lg'
                        : 'bg-[#DDCBB7]/30 text-[#264025] hover:bg-[#DDCBB7]/50'
                    }`}
                  >
                    {filterOption}
                  </button>
                ))}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="mx-auto text-[#82896E] mb-4" size={64} />
                <p className="text-[#82896E] text-lg mb-6">
                  {filter === 'all' ? 'No bookings yet' : `No ${filter} bookings`}
                </p>
                <button
                  onClick={() => onNavigate('booking')}
                  className="bg-[#AD6B4B] text-white px-8 py-3 rounded-lg hover:bg-[#7B4B36] transition-colors font-semibold"
                >
                  Create Your First Booking
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-gradient-to-br from-white to-[#FAF6F1] border-2 border-[#DDCBB7] rounded-2xl p-6 hover:border-[#AD6B4B] hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <h3 className="text-2xl font-bold text-[#264025]">
                            {booking.service?.name}
                          </h3>
                          <span
                            className={`px-4 py-1 rounded-full text-sm font-bold border-2 capitalize ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="flex items-center space-x-2 text-[#82896E]">
                            <Calendar size={18} className="text-[#AD6B4B]" />
                            <span className="font-medium">{formatDate(booking.booking_date)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[#82896E]">
                            <Clock size={18} className="text-[#AD6B4B]" />
                            <span className="font-medium">{formatTime(booking.start_time)}</span>
                          </div>
                        </div>

                        {booking.service?.description && (
                          <p className="text-[#82896E] text-sm mt-3">{booking.service.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
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
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold text-[#264025]">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#DDCBB7]/20 to-[#E8D5C4]/10 rounded-2xl p-6 border-2 border-[#DDCBB7]/30">
                <label className="text-sm font-semibold text-[#82896E] uppercase tracking-wide">Service</label>
                <p className="text-2xl text-[#264025] font-bold mt-2">{selectedBooking.service?.name}</p>
                {selectedBooking.service?.description && (
                  <p className="text-[#82896E] mt-3">{selectedBooking.service.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#DDCBB7]/20 to-[#E8D5C4]/10 rounded-2xl p-6 border-2 border-[#DDCBB7]/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="text-[#AD6B4B]" size={20} />
                    <label className="text-sm font-semibold text-[#82896E] uppercase">Date</label>
                  </div>
                  <p className="text-lg text-[#264025] font-semibold">
                    {formatDate(selectedBooking.booking_date)}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-[#DDCBB7]/20 to-[#E8D5C4]/10 rounded-2xl p-6 border-2 border-[#DDCBB7]/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="text-[#AD6B4B]" size={20} />
                    <label className="text-sm font-semibold text-[#82896E] uppercase">Time</label>
                  </div>
                  <p className="text-lg text-[#264025] font-semibold">
                    {formatTime(selectedBooking.start_time)}
                  </p>
                </div>
              </div>
 
              <div className="bg-gradient-to-br from-[#DDCBB7]/20 to-[#E8D5C4]/10 rounded-2xl p-6 border-2 border-[#DDCBB7]/30">
                <label className="text-sm font-semibold text-[#82896E] uppercase tracking-wide">Status</label>
                <div className="mt-3">
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-bold border-2 capitalize ${getStatusColor(
                      selectedBooking.status
                    )}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="bg-gradient-to-br from-[#DDCBB7]/20 to-[#E8D5C4]/10 rounded-2xl p-6 border-2 border-[#DDCBB7]/30">
                  <label className="text-sm font-semibold text-[#82896E] uppercase tracking-wide">Notes</label>
                  <p className="text-[#264025] mt-3">{selectedBooking.notes}</p>
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
                  <p className="text-xs text-[#82896E] text-center mt-3">
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
