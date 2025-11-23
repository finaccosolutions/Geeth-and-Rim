import { useState, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Booking, Service } from '../../types';

interface BookingWithService extends Booking {
  service?: Service;
}

export const ReportsManager = () => {
  const [bookings, setBookings] = useState<BookingWithService[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    setLoading(true);
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*')
      .gte('booking_date', dateRange.start)
      .lte('booking_date', dateRange.end)
      .neq('status', 'cancelled')
      .order('booking_date', { ascending: false });

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

  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.service?.price || 0), 0);
  const totalBookings = bookings.length;
  const totalHours = bookings.reduce(
    (sum, booking) => sum + (booking.service?.duration_minutes || 0),
    0
  ) / 60;

  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  const serviceRevenue: Record<string, { count: number; revenue: number; hours: number }> = {};
  bookings.forEach((booking) => {
    if (booking.service) {
      if (!serviceRevenue[booking.service.name]) {
        serviceRevenue[booking.service.name] = { count: 0, revenue: 0, hours: 0 };
      }
      serviceRevenue[booking.service.name].count += 1;
      serviceRevenue[booking.service.name].revenue += booking.service.price;
      serviceRevenue[booking.service.name].hours += booking.service.duration_minutes / 60;
    }
  });

  const sortedServices = Object.entries(serviceRevenue)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 10);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#264025]">Reports & Analytics</h2>
      </div>

      <div className="mb-6 bg-white p-4 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-[#264025] mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#264025] mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-[#82896E]">Loading reports...</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign size={32} />
                <span className="text-sm opacity-90">Total Revenue</span>
              </div>
              <div className="text-3xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Calendar size={32} />
                <span className="text-sm opacity-90">Total Bookings</span>
              </div>
              <div className="text-3xl font-bold">{totalBookings}</div>
              <div className="text-sm opacity-90 mt-2">
                {confirmedBookings} confirmed, {completedBookings} completed, {pendingBookings} pending
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#AD6B4B] to-[#7B4B36] rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Clock size={32} />
                <span className="text-sm opacity-90">Total Hours</span>
              </div>
              <div className="text-3xl font-bold">{totalHours.toFixed(1)}</div>
              <div className="text-sm opacity-90 mt-2">Service hours</div>
            </div>

            <div className="bg-gradient-to-br from-[#264025] to-[#82896E] rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={32} />
                <span className="text-sm opacity-90">Avg. per Booking</span>
              </div>
              <div className="text-3xl font-bold">
                ₹{totalBookings > 0 ? (totalRevenue / totalBookings).toFixed(0) : 0}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-[#264025] mb-4">Top Services by Revenue</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#DDCBB7]">
                    <th className="text-left py-3 px-4 font-semibold text-[#264025]">Service Name</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#264025]">Bookings</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#264025]">Total Hours</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#264025]">Total Revenue</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#264025]">Avg. per Booking</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedServices.map(([serviceName, data]) => (
                    <tr key={serviceName} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-[#264025]">{serviceName}</td>
                      <td className="py-3 px-4 text-right text-[#82896E]">{data.count}</td>
                      <td className="py-3 px-4 text-right text-[#82896E]">{data.hours.toFixed(1)}</td>
                      <td className="py-3 px-4 text-right font-bold text-green-600">
                        ₹{data.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-[#AD6B4B]">
                        ₹{(data.revenue / data.count).toFixed(0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="text-xl font-bold text-[#264025] mb-4">Recent Bookings</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#DDCBB7]">
                    <th className="text-left py-3 px-4 font-semibold text-[#264025]">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#264025]">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#264025]">Service</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#264025]">Duration</th>
                    <th className="text-right py-3 px-4 font-semibold text-[#264025]">Revenue</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#264025]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 20).map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">{booking.customer_name}</td>
                      <td className="py-3 px-4">{booking.service?.name || 'N/A'}</td>
                      <td className="py-3 px-4 text-right text-[#82896E]">
                        {booking.service?.duration_minutes} min
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-green-600">
                        ₹{booking.service?.price || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            booking.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
