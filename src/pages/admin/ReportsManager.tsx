import { useState, useEffect } from 'react';
import { DollarSign, Calendar, TrendingUp, Clock, Users, BarChart3, Download, PieChart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Booking, Service } from '../../types';

interface BookingWithService extends Booking {
  service?: Service;
}

const formatDateDDMMYYYY = (dateStr: string) => {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const ReportsManager = () => {
  const [bookings, setBookings] = useState<BookingWithService[]>([]);
  const [allBookings, setAllBookings] = useState<BookingWithService[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<'overview' | 'revenue' | 'customers' | 'bookings'>('overview');
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

    const { data: allBookingsData } = await supabase
      .from('bookings')
      .select('*')
      .gte('booking_date', dateRange.start)
      .lte('booking_date', dateRange.end)
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

    if (allBookingsData) {
      const allBookingsWithServices = await Promise.all(
        allBookingsData.map(async (booking) => {
          const { data: service } = await supabase
            .from('services')
            .select('*')
            .eq('id', booking.service_id)
            .maybeSingle();
          return { ...booking, service };
        })
      );
      setAllBookings(allBookingsWithServices);
    }
    setLoading(false);
  };

  const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.service?.price || 0), 0);
  const totalBookings = bookings.length;
  const totalHours = bookings.reduce(
    (sum, booking) => sum + (booking.service?.duration_minutes || 0),
    0
  ) / 60;

  const confirmedBookings = allBookings.filter((b) => b.status === 'confirmed').length;
  const completedBookings = allBookings.filter((b) => b.status === 'completed').length;
  const pendingBookings = allBookings.filter((b) => b.status === 'pending').length;
  const cancelledBookings = allBookings.filter((b) => b.status === 'cancelled').length;

  const uniqueCustomers = new Set(bookings.map(b => b.customer_email)).size;
  const repeatCustomers = bookings.reduce((acc, booking) => {
    const customerBookings = bookings.filter(b => b.customer_email === booking.customer_email);
    if (customerBookings.length > 1 && !acc.includes(booking.customer_email)) {
      acc.push(booking.customer_email);
    }
    return acc;
  }, [] as string[]).length;

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

  const customerReport = bookings.reduce((acc, booking) => {
    const email = booking.customer_email;
    if (!acc[email]) {
      acc[email] = {
        name: booking.customer_name,
        email: email,
        phone: booking.customer_phone,
        bookings: 0,
        totalSpent: 0,
        lastVisit: booking.booking_date,
      };
    }
    acc[email].bookings += 1;
    acc[email].totalSpent += booking.service?.price || 0;
    if (new Date(booking.booking_date) > new Date(acc[email].lastVisit)) {
      acc[email].lastVisit = booking.booking_date;
    }
    return acc;
  }, {} as Record<string, { name: string; email: string; phone: string; bookings: number; totalSpent: number; lastVisit: string }>);

  const sortedCustomers = Object.values(customerReport)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 20);

  const dailyRevenue = bookings.reduce((acc, booking) => {
    const date = booking.booking_date;
    if (!acc[date]) {
      acc[date] = { revenue: 0, bookings: 0 };
    }
    acc[date].revenue += booking.service?.price || 0;
    acc[date].bookings += 1;
    return acc;
  }, {} as Record<string, { revenue: number; bookings: number }>);

  const sortedDailyRevenue = Object.entries(dailyRevenue)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 15);

  const exportToCSV = (reportType: string) => {
    let csvContent = '';
    let filename = '';

    if (reportType === 'revenue') {
      csvContent = 'Date,Revenue,Bookings\n';
      sortedDailyRevenue.forEach(([date, data]) => {
        csvContent += `${formatDateDDMMYYYY(date)},${data.revenue},${data.bookings}\n`;
      });
      filename = 'revenue-report.csv';
    } else if (reportType === 'customers') {
      csvContent = 'Name,Email,Phone,Bookings,Total Spent,Last Visit\n';
      sortedCustomers.forEach((customer) => {
        csvContent += `${customer.name},${customer.email},${customer.phone},${customer.bookings},${customer.totalSpent},${formatDateDDMMYYYY(customer.lastVisit)}\n`;
      });
      filename = 'customers-report.csv';
    } else if (reportType === 'bookings') {
      csvContent = 'Date,Time,Customer,Email,Phone,Service,Duration,Price,Status\n';
      allBookings.forEach((booking) => {
        csvContent += `${formatDateDDMMYYYY(booking.booking_date)},${booking.start_time},${booking.customer_name},${booking.customer_email},${booking.customer_phone},${booking.service?.name || 'N/A'},${booking.service?.duration_minutes || 0},${booking.service?.price || 0},${booking.status}\n`;
      });
      filename = 'bookings-report.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#264025]">Reports & Analytics</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveReport('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeReport === 'overview' ? 'bg-[#AD6B4B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveReport('revenue')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeReport === 'revenue' ? 'bg-[#AD6B4B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Revenue
          </button>
          <button
            onClick={() => setActiveReport('customers')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeReport === 'customers' ? 'bg-[#AD6B4B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveReport('bookings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeReport === 'bookings' ? 'bg-[#AD6B4B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Bookings
          </button>
        </div>
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
          {activeReport === 'overview' && (
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Users size={32} />
                <span className="text-sm opacity-90">Unique Customers</span>
              </div>
              <div className="text-3xl font-bold">{uniqueCustomers}</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Users size={32} />
                <span className="text-sm opacity-90">Repeat Customers</span>
              </div>
              <div className="text-3xl font-bold">{repeatCustomers}</div>
              <div className="text-sm opacity-90 mt-2">
                {uniqueCustomers > 0 ? ((repeatCustomers / uniqueCustomers) * 100).toFixed(0) : 0}% retention
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Calendar size={32} />
                <span className="text-sm opacity-90">Cancelled</span>
              </div>
              <div className="text-3xl font-bold">{cancelledBookings}</div>
              <div className="text-sm opacity-90 mt-2">
                {allBookings.length > 0 ? ((cancelledBookings / allBookings.length) * 100).toFixed(0) : 0}% cancel rate
              </div>
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <PieChart size={32} />
                <span className="text-sm opacity-90">Completion Rate</span>
              </div>
              <div className="text-3xl font-bold">
                {allBookings.length > 0 ? ((completedBookings / allBookings.length) * 100).toFixed(0) : 0}%
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
                        {formatDateDDMMYYYY(booking.booking_date)}
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

          {activeReport === 'revenue' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#264025]">Revenue Report</h3>
                <button
                  onClick={() => exportToCSV('revenue')}
                  className="flex items-center space-x-2 bg-[#AD6B4B] text-white px-4 py-2 rounded-lg hover:bg-[#7B4B36] transition-colors"
                >
                  <Download size={18} />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
                  <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
                  <div className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
                  <div className="text-sm text-gray-600 mb-2">Average Daily Revenue</div>
                  <div className="text-3xl font-bold text-blue-600">
                    ₹{Object.keys(dailyRevenue).length > 0 ? (totalRevenue / Object.keys(dailyRevenue).length).toFixed(0) : 0}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#AD6B4B]">
                  <div className="text-sm text-gray-600 mb-2">Highest Daily Revenue</div>
                  <div className="text-3xl font-bold text-[#AD6B4B]">
                    ₹{Math.max(...Object.values(dailyRevenue).map(d => d.revenue), 0)}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-[#264025] mb-4">Daily Revenue Breakdown</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#DDCBB7]">
                        <th className="text-left py-3 px-4 font-semibold text-[#264025]">Date</th>
                        <th className="text-right py-3 px-4 font-semibold text-[#264025]">Bookings</th>
                        <th className="text-right py-3 px-4 font-semibold text-[#264025]">Revenue</th>
                        <th className="text-right py-3 px-4 font-semibold text-[#264025]">Avg. per Booking</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDailyRevenue.map(([date, data]) => (
                        <tr key={date} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-[#264025]">{formatDateDDMMYYYY(date)}</td>
                          <td className="py-3 px-4 text-right text-[#82896E]">{data.bookings}</td>
                          <td className="py-3 px-4 text-right font-bold text-green-600">₹{data.revenue.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right text-[#AD6B4B]">₹{(data.revenue / data.bookings).toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'customers' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#264025]">Customer Report</h3>
                <button
                  onClick={() => exportToCSV('customers')}
                  className="flex items-center space-x-2 bg-[#AD6B4B] text-white px-4 py-2 rounded-lg hover:bg-[#7B4B36] transition-colors"
                >
                  <Download size={18} />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
                  <div className="text-sm text-gray-600 mb-2">Total Customers</div>
                  <div className="text-3xl font-bold text-purple-600">{uniqueCustomers}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
                  <div className="text-sm text-gray-600 mb-2">Repeat Customers</div>
                  <div className="text-3xl font-bold text-orange-600">{repeatCustomers}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {uniqueCustomers > 0 ? ((repeatCustomers / uniqueCustomers) * 100).toFixed(0) : 0}% of total
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
                  <div className="text-sm text-gray-600 mb-2">Avg. Spend per Customer</div>
                  <div className="text-3xl font-bold text-green-600">
                    ₹{uniqueCustomers > 0 ? (totalRevenue / uniqueCustomers).toFixed(0) : 0}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-[#264025] mb-4">Top Customers by Revenue</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#DDCBB7]">
                        <th className="text-left py-3 px-4 font-semibold text-[#264025]">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#264025]">Contact</th>
                        <th className="text-right py-3 px-4 font-semibold text-[#264025]">Bookings</th>
                        <th className="text-right py-3 px-4 font-semibold text-[#264025]">Total Spent</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#264025]">Last Visit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedCustomers.map((customer) => (
                        <tr key={customer.email} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium text-[#264025]">{customer.name}</div>
                            <div className="text-sm text-gray-500">{customer.email}</div>
                          </td>
                          <td className="py-3 px-4 text-[#82896E]">{customer.phone}</td>
                          <td className="py-3 px-4 text-right font-semibold text-blue-600">{customer.bookings}</td>
                          <td className="py-3 px-4 text-right font-bold text-green-600">₹{customer.totalSpent.toLocaleString()}</td>
                          <td className="py-3 px-4 text-[#82896E]">{formatDateDDMMYYYY(customer.lastVisit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeReport === 'bookings' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#264025]">Bookings Report</h3>
                <button
                  onClick={() => exportToCSV('bookings')}
                  className="flex items-center space-x-2 bg-[#AD6B4B] text-white px-4 py-2 rounded-lg hover:bg-[#7B4B36] transition-colors"
                >
                  <Download size={18} />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
                  <div className="text-sm text-gray-600 mb-2">Total Bookings</div>
                  <div className="text-3xl font-bold text-blue-600">{allBookings.length}</div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
                  <div className="text-sm text-gray-600 mb-2">Confirmed</div>
                  <div className="text-3xl font-bold text-green-600">{confirmedBookings}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {allBookings.length > 0 ? ((confirmedBookings / allBookings.length) * 100).toFixed(0) : 0}%
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-400">
                  <div className="text-sm text-gray-600 mb-2">Completed</div>
                  <div className="text-3xl font-bold text-blue-500">{completedBookings}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {allBookings.length > 0 ? ((completedBookings / allBookings.length) * 100).toFixed(0) : 0}%
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500">
                  <div className="text-sm text-gray-600 mb-2">Cancelled</div>
                  <div className="text-3xl font-bold text-red-600">{cancelledBookings}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {allBookings.length > 0 ? ((cancelledBookings / allBookings.length) * 100).toFixed(0) : 0}%
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h4 className="text-lg font-bold text-[#264025] mb-4">All Bookings</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-[#DDCBB7]">
                        <th className="text-left py-3 px-4 font-semibold text-[#264025]">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#264025]">Time</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#264025]">Customer</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#264025]">Service</th>
                        <th className="text-right py-3 px-4 font-semibold text-[#264025]">Duration</th>
                        <th className="text-right py-3 px-4 font-semibold text-[#264025]">Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-[#264025]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allBookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4">{formatDateDDMMYYYY(booking.booking_date)}</td>
                          <td className="py-3 px-4">{booking.start_time}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-[#264025]">{booking.customer_name}</div>
                            <div className="text-sm text-gray-500">{booking.customer_phone}</div>
                          </td>
                          <td className="py-3 px-4">{booking.service?.name || 'N/A'}</td>
                          <td className="py-3 px-4 text-right text-[#82896E]">{booking.service?.duration_minutes} min</td>
                          <td className="py-3 px-4 text-right font-bold text-green-600">₹{booking.service?.price || 0}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                                booking.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : booking.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
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
      )}
    </div>
  );
};
