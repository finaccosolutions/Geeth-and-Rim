import { useState, useEffect } from 'react';
import { Check, X, Eye, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { sendBookingEmail } from '../../lib/emailService';
import { Booking, Service } from '../../types';

export const BookingsManager = () => {
  const [bookings, setBookings] = useState<(Booking & { service?: Service })[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*')
      .order('booking_date', { ascending: false })
      .order('start_time', { ascending: false });

    if (bookingsData) {
      const bookingsWithServices = await Promise.all(
        bookingsData.map(async (booking) => {
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

  const updateBookingStatus = async (bookingId: string, status: string) => {
    const booking = bookings.find(b => b.id === bookingId);

    await supabase
      .from('bookings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bookingId);

    if (booking && (status === 'confirmed' || status === 'cancelled')) {
      await sendBookingEmail({
        customerName: booking.customer_name,
        customerEmail: booking.customer_email,
        customerPhone: booking.customer_phone,
        serviceName: booking.service?.name || 'Service',
        bookingDate: booking.booking_date,
        startTime: booking.start_time,
        duration: booking.service?.duration_minutes || 0,
        price: booking.service?.price || 0,
        notes: booking.notes,
        status: status,
      });
    }

    loadBookings();
    setSelectedBooking(null);
  };

  const filteredBookings =
    filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#264025]">Manage Bookings</h2>
        <div className="flex space-x-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors duration-300 ${
                filter === status
                  ? 'bg-[#AD6B4B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-[#82896E]">Loading bookings...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="mx-auto text-[#82896E] mb-4" size={48} />
          <p className="text-[#82896E]">No bookings found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-[#DDCBB7]">
                <th className="text-left py-3 px-4 font-semibold text-[#264025]">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-[#264025]">Time</th>
                <th className="text-left py-3 px-4 font-semibold text-[#264025]">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-[#264025]">Service</th>
                <th className="text-left py-3 px-4 font-semibold text-[#264025]">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-[#264025]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {new Date(booking.booking_date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">{booking.start_time}</td>
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium">{booking.customer_name}</div>
                      <div className="text-sm text-gray-600">{booking.customer_phone}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">{booking.service?.name || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                        className="px-3 py-1 rounded-lg border-2 border-gray-300 focus:border-[#AD6B4B] outline-none text-sm font-medium"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setSelectedBooking(null)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-[#264025] mb-6">Booking Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Customer Name</label>
                <p className="text-[#264025]">{selectedBooking.customer_name}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-[#264025]">{selectedBooking.customer_email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Phone</label>
                <p className="text-[#264025]">{selectedBooking.customer_phone}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">Date & Time</label>
                <p className="text-[#264025]">
                  {new Date(selectedBooking.booking_date).toLocaleDateString()} at{' '}
                  {selectedBooking.start_time}
                </p>
              </div>
              {selectedBooking.notes && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Notes</label>
                  <p className="text-[#264025]">{selectedBooking.notes}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-semibold text-gray-600">Status</label>
                <p className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full mt-6 bg-[#264025] text-white px-6 py-3 rounded-lg hover:bg-[#AD6B4B] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
