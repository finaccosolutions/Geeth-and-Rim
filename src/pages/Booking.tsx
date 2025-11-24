import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, ChevronLeft, Check, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendBookingEmail } from '../lib/emailService';
import { useAuth } from '../contexts/AuthContext';
import { Service, ServiceCategory } from '../types';

interface BookingProps {
  preSelectedService?: Service;
  onNavigate: (page: string) => void;
}

interface BookingTimeRange {
  start_time: string;
  end_time: string;
  type: 'booking' | 'blocked' | 'completed';
  reason?: string;
  status?: string;
}

export const Booking = ({ preSelectedService, onNavigate }: BookingProps) => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(preSelectedService || null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('');
  const [manualTimeInput, setManualTimeInput] = useState('');
  const [existingBookings, setExistingBookings] = useState<BookingTimeRange[]>([]);
  const shopOpenTime = '09:00';
  const shopCloseTime = '20:00';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [timeError, setTimeError] = useState('');

  const step = !selectedService ? 1 : !selectedTime ? 2 : 3;

  useEffect(() => {
    if (!preSelectedService) {
      loadData();
    }
  }, []);

  // Removed auto-fill on mount - will auto-fill when clicking Continue after selecting time

  const loadUserProfile = async () => {
    if (user) {
      const { data } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setFormData({
          name: data.full_name,
          email: data.email,
          phone: data.phone,
          notes: '',
        });
      }
    }
  };

  useEffect(() => {
    if (selectedDate) {
      console.log('Date changed, loading bookings...');
      loadExistingBookings();
    } else {
      setExistingBookings([]);
    }
  }, [selectedDate]);

  const loadData = async () => {
    const [servicesResult, categoriesResult] = await Promise.all([
      supabase.from('services').select('*').eq('is_active', true).order('display_order'),
      supabase.from('service_categories').select('*').order('display_order'),
    ]);

    if (servicesResult.data) setServices(servicesResult.data);
    if (categoriesResult.data) setCategories(categoriesResult.data);
  };

  const loadExistingBookings = async () => {
    if (!selectedDate) return;

    console.log('Loading bookings for date:', selectedDate);

    const [bookingsResult, completedResult, blockedResult] = await Promise.all([
      supabase
        .from('bookings')
        .select('start_time, end_time, service_id, status')
        .eq('booking_date', selectedDate)
        .in('status', ['confirmed', 'pending'])
        .order('start_time', { ascending: true }),
      supabase
        .from('bookings')
        .select('start_time, end_time, service_id, status')
        .eq('booking_date', selectedDate)
        .eq('status', 'completed')
        .order('start_time', { ascending: true }),
      supabase
        .from('blocked_time_slots')
        .select('start_time, end_time, reason, service_id')
        .eq('blocked_date', selectedDate)
    ]);

    console.log('Bookings result:', bookingsResult);
    console.log('Completed result:', completedResult);
    console.log('Blocked result:', blockedResult);

    const allBookings: BookingTimeRange[] = [];

    if (bookingsResult.data && bookingsResult.data.length > 0) {
      console.log(`Found ${bookingsResult.data.length} active bookings for ${selectedDate}`);
      bookingsResult.data.forEach(booking => {
        allBookings.push({
          start_time: booking.start_time,
          end_time: booking.end_time,
          type: 'booking',
          status: booking.status
        });
      });
    }

    if (completedResult.data && completedResult.data.length > 0) {
      console.log(`Found ${completedResult.data.length} completed bookings for ${selectedDate}`);
      completedResult.data.forEach(booking => {
        allBookings.push({
          start_time: booking.start_time,
          end_time: booking.end_time,
          type: 'completed',
          status: 'completed'
        });
      });
    }

    if (blockedResult.data && blockedResult.data.length > 0) {
      console.log(`Found ${blockedResult.data.length} blocked slots for ${selectedDate}`);
      blockedResult.data.forEach(blocked => {
        allBookings.push({
          start_time: blocked.start_time,
          end_time: blocked.end_time,
          type: 'blocked',
          reason: blocked.reason
        });
      });
    }

    allBookings.sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time));
    console.log('Total bookings loaded:', allBookings.length);
    setExistingBookings(allBookings);
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + durationMinutes;
    return minutesToTime(endMinutes);
  };

  const isTimeAvailable = (startTime: string) => {
    if (!selectedService) return false;

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + selectedService.duration_minutes;
    const openMinutes = timeToMinutes(shopOpenTime);
    const closeMinutes = timeToMinutes(shopCloseTime);

    if (startMinutes < openMinutes || endMinutes > closeMinutes) {
      return false;
    }

    return !existingBookings.some((booking) => {
      const bookingStart = timeToMinutes(booking.start_time);
      const bookingEnd = timeToMinutes(booking.end_time);
      return (
        (startMinutes >= bookingStart && startMinutes < bookingEnd) ||
        (endMinutes > bookingStart && endMinutes <= bookingEnd) ||
        (startMinutes <= bookingStart && endMinutes >= bookingEnd)
      );
    });
  };

  const handleTimeInputChange = (time: string) => {
    setManualTimeInput(time);
    setTimeError('');

    if (time && time.match(/^\d{2}:\d{2}$/)) {
      if (isTimeAvailable(time)) {
        setTimeError('');
      } else {
        setTimeError('This time is not available. Please choose another time.');
      }
    }
  };

  const handleSetTime = () => {
    if (manualTimeInput && isTimeAvailable(manualTimeInput)) {
      setSelectedTime(manualTimeInput);
      setTimeError('');
      if (user) {
        loadUserProfile();
      }
    } else {
      setTimeError('Please select an available time slot.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);

    try {
      const endTime = calculateEndTime(selectedTime, selectedService.duration_minutes);

      const { data: latestBookings } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('booking_date', selectedDate)
        .in('status', ['confirmed', 'pending']);

      const { data: latestBlocked } = await supabase
        .from('blocked_time_slots')
        .select('*')
        .eq('blocked_date', selectedDate);

      const selectedStartMinutes = timeToMinutes(selectedTime);
      const selectedEndMinutes = selectedStartMinutes + selectedService.duration_minutes;

      const hasBookingConflict = latestBookings?.some((booking) => {
        const startMinutes = timeToMinutes(booking.start_time);
        const endMinutes = timeToMinutes(booking.end_time);
        return (
          (selectedStartMinutes >= startMinutes && selectedStartMinutes < endMinutes) ||
          (selectedEndMinutes > startMinutes && selectedEndMinutes <= endMinutes) ||
          (selectedStartMinutes <= startMinutes && selectedEndMinutes >= endMinutes)
        );
      });

      const hasBlockedConflict = latestBlocked?.some((block) => {
        const blockStart = timeToMinutes(block.start_time);
        const blockEnd = timeToMinutes(block.end_time);
        return (
          (selectedStartMinutes >= blockStart && selectedStartMinutes < blockEnd) ||
          (selectedEndMinutes > blockStart && selectedEndMinutes <= blockEnd) ||
          (selectedStartMinutes <= blockStart && selectedEndMinutes >= blockEnd)
        );
      });

      if (hasBookingConflict || hasBlockedConflict) {
        await loadExistingBookings();
        setIsSubmitting(false);
        alert('Sorry, this time slot is no longer available. Please select another time.');
        return;
      }

      console.log('Creating booking in database...');
      const { error, data: bookingData } = await supabase.from('bookings').insert({
        service_id: selectedService.id,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        booking_date: selectedDate,
        start_time: selectedTime,
        end_time: endTime,
        status: 'confirmed',
        notes: formData.notes,
      }).select();

      if (error) {
        console.error('Booking insertion error:', error);
        setIsSubmitting(false);
        alert('Booking failed: ' + error.message);
        return;
      }

      console.log('Booking created successfully:', bookingData);

      console.log('Sending confirmation emails to customer and admin...');
      const emailSent = await sendBookingEmail({
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        serviceName: selectedService.name,
        bookingDate: selectedDate,
        startTime: selectedTime,
        duration: selectedService.duration_minutes,
        price: selectedService.price,
        notes: formData.notes,
        status: 'confirmed',
      });

      if (emailSent) {
        console.log('Confirmation emails sent successfully to customer and admin');
      } else {
        console.warn('Email sending failed, but booking was saved successfully');
      }

      setBookingComplete(true);
    } catch (error) {
      console.error('Booking error:', error);
      setIsSubmitting(false);
      alert('An error occurred: ' + String(error));
    }
  };

  const getServicesByCategory = (categoryId: string) => {
    return services.filter((s) => s.category_id === categoryId);
  };

  const filteredServices =
    selectedCategory === 'all' ? services : services.filter((s) => s.category_id === selectedCategory);

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const renderTimeline = () => {
    if (!selectedService || !selectedDate) return null;

    const openMinutes = timeToMinutes(shopOpenTime);
    const closeMinutes = timeToMinutes(shopCloseTime);
    const totalMinutes = closeMinutes - openMinutes;
    const hours = [];

    for (let h = Math.floor(openMinutes / 60); h <= Math.floor(closeMinutes / 60); h++) {
      hours.push(h);
    }

    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#264025]">Available Time Slots</h3>
          <span className="text-sm text-[#82896E]">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="bg-white border-2 border-[#DDCBB7] rounded-xl p-6 pb-4">
          <div className="relative h-32 bg-gradient-to-r from-green-50 to-green-100 rounded-lg overflow-visible mb-8">
            <div className="absolute inset-0 flex">
              {hours.map((hour) => {
                const hourMinutes = hour * 60;
                const left = ((hourMinutes - openMinutes) / totalMinutes) * 100;

                return (
                  <div
                    key={hour}
                    className="absolute top-0 bottom-0 border-l-2 border-gray-300"
                    style={{ left: `${left}%` }}
                  >
                    <div className="absolute -bottom-8 left-0 text-sm font-semibold text-gray-700 transform -translate-x-1/2 whitespace-nowrap">
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                  </div>
                );
              })}
              <div
                className="absolute top-0 bottom-0 border-l-2 border-gray-300"
                style={{ left: '100%' }}
              >
                <div className="absolute -bottom-8 left-0 text-sm font-semibold text-gray-700 transform -translate-x-1/2 whitespace-nowrap">
                  {Math.floor(closeMinutes / 60).toString().padStart(2, '0')}:00
                </div>
              </div>
            </div>

            {existingBookings.map((booking, index) => {
              const startMinutes = timeToMinutes(booking.start_time);
              const endMinutes = timeToMinutes(booking.end_time);
              const left = ((startMinutes - openMinutes) / totalMinutes) * 100;
              const width = ((endMinutes - startMinutes) / totalMinutes) * 100;

              const getBookingColor = () => {
                if (booking.type === 'blocked') return 'bg-gray-500';
                if (booking.type === 'completed') return 'bg-blue-500';
                return 'bg-red-500';
              };

              const getBookingLabel = () => {
                if (booking.type === 'blocked') return `Blocked: ${booking.reason || 'No reason'}`;
                if (booking.type === 'completed') return `Completed: ${booking.start_time.substring(0, 5)} - ${booking.end_time.substring(0, 5)}`;
                return `Booked: ${booking.start_time.substring(0, 5)} - ${booking.end_time.substring(0, 5)}`;
              };

              return (
                <div
                  key={`${booking.type}-${index}`}
                  className={`absolute top-3 bottom-3 ${getBookingColor()} rounded shadow-lg border-2 border-white transition-all hover:scale-y-110 hover:z-10 cursor-pointer group`}
                  style={{
                    left: `${left}%`,
                    width: `${Math.max(width, 0.5)}%`,
                    minWidth: '2px',
                  }}
                  title={getBookingLabel()}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded px-1">
                    <div>{booking.start_time.substring(0, 5)}</div>
                    <div>-</div>
                    <div>{booking.end_time.substring(0, 5)}</div>
                    {booking.type === 'completed' && <div className="text-[10px] mt-0.5">DONE</div>}
                  </div>
                </div>
              );
            })}

            {manualTimeInput && selectedService && (
              <div
                className={`absolute top-2 bottom-2 ${isTimeAvailable(manualTimeInput) ? 'bg-blue-500 bg-opacity-70 border-2 border-blue-700' : 'bg-orange-500 bg-opacity-70 border-2 border-orange-700'} rounded shadow-lg animate-pulse z-20`}
                style={{
                  left: `${((timeToMinutes(manualTimeInput) - openMinutes) / totalMinutes) * 100}%`,
                  width: `${(selectedService.duration_minutes / totalMinutes) * 100}%`,
                  minWidth: '3px',
                }}
              >
                <div className="flex items-center justify-center h-full text-white text-xs font-bold">
                  {isTimeAvailable(manualTimeInput) ? 'Your Slot' : 'Unavailable'}
                </div>
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-100 border-2 border-green-500 rounded"></div>
              <span className="text-gray-700 font-medium">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <span className="text-gray-700 font-medium">Booked</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 rounded"></div>
              <span className="text-gray-700 font-medium">Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gray-500 rounded"></div>
              <span className="text-gray-700 font-medium">Blocked</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-500 bg-opacity-70 border-2 border-blue-700 rounded"></div>
              <span className="text-gray-700 font-medium">Your Selection</span>
            </div>
          </div>
        </div>

        {existingBookings.length > 0 && (
          <div className="mt-4 bg-amber-50 rounded-xl p-4 border-2 border-amber-300">
            <div className="flex items-start space-x-2">
              <AlertCircle className="text-amber-700 flex-shrink-0 mt-0.5" size={22} />
              <div className="flex-1">
                <h4 className="font-bold text-amber-900 mb-3">
                  Already Booked Slots
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {existingBookings.map((booking, index) => {
                    const getListItemStyle = () => {
                      if (booking.type === 'blocked') return 'bg-gray-200 text-gray-800 border-2 border-gray-400';
                      if (booking.type === 'completed') return 'bg-blue-100 text-blue-800 border-2 border-blue-400';
                      return 'bg-red-100 text-red-800 border-2 border-red-400';
                    };

                    return (
                      <div
                        key={`list-${index}`}
                        className={`text-sm px-3 py-2 rounded-lg font-semibold ${getListItemStyle()}`}
                      >
                        <div className="flex items-center space-x-1">
                          <Clock size={14} className="flex-shrink-0" />
                          <span>{booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}</span>
                          {booking.type === 'completed' && (
                            <span className="text-xs ml-2 opacity-75">(Done)</span>
                          )}
                        </div>
                        {booking.type === 'blocked' && booking.reason && (
                          <div className="text-xs mt-1 opacity-75 italic">{booking.reason}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4]">
        <div className="max-w-lg w-full mx-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <Check className="text-white" size={48} />
            </div>
            <h2 className="text-4xl font-bold text-[#264025] mb-4">Booking Confirmed!</h2>
            <p className="text-[#82896E] mb-8 text-lg">
              Your appointment has been successfully confirmed. Check your email for the confirmation details.
            </p>
            <div className="bg-gradient-to-br from-[#DDCBB7]/30 to-[#E8D5C4]/30 rounded-2xl p-6 mb-8 text-left">
              <h3 className="font-bold text-[#264025] mb-4 flex items-center">
                <Sparkles className="mr-2 text-[#AD6B4B]" size={20} />
                Booking Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-[#DDCBB7] pb-2">
                  <span className="text-[#82896E]">Service</span>
                  <span className="font-semibold text-[#264025]">{selectedService?.name}</span>
                </div>
                <div className="flex justify-between border-b border-[#DDCBB7] pb-2">
                  <span className="text-[#82896E]">Date</span>
                  <span className="font-semibold text-[#264025]">
                    {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#82896E]">Time</span>
                  <span className="font-semibold text-[#264025]">{formatTime12Hour(selectedTime)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="w-full bg-gradient-to-r from-[#AD6B4B] to-[#C17B5C] text-white px-6 py-4 rounded-full font-semibold hover:from-[#7B4B36] hover:to-[#AD6B4B] transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-[#FAF6F1] to-[#E8D5C4]/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <button
          onClick={() => {
            if (selectedTime) {
              setSelectedTime('');
              setManualTimeInput('');
            } else if (selectedDate) {
              setSelectedDate('');
            } else if (selectedService) {
              setSelectedService(null);
            } else {
              onNavigate('home');
            }
          }}
          className="flex items-center space-x-2 text-[#AD6B4B] hover:text-[#7B4B36] transition-colors duration-300 mb-8 group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold">Back</span>
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#264025] mb-4">Book Your Appointment</h1>
          <p className="text-lg text-[#82896E] max-w-2xl mx-auto">
            {step === 1 && 'Choose the service you would like to book'}
            {step === 2 && 'Select your preferred date and time'}
            {step === 3 && 'Enter your contact details to confirm'}
          </p>
        </div>

        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                    step >= s
                      ? 'bg-gradient-to-br from-[#AD6B4B] to-[#C17B5C] text-white shadow-lg scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all duration-300 ${
                      step > s ? 'bg-[#AD6B4B]' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {!selectedService && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
              <div className="mb-8">
                <label className="block text-lg font-bold text-[#264025] mb-3">
                  Filter by Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300 text-lg font-medium bg-gradient-to-r from-white to-[#FAF6F1]"
                >
                  <option value="all">All Services</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategory === 'all' ? (
                <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2">
                  {categories.map((category) => {
                    const categoryServices = getServicesByCategory(category.id);
                    if (categoryServices.length === 0) return null;

                    return (
                      <div key={category.id} className="border-2 border-[#DDCBB7] rounded-2xl overflow-hidden hover:border-[#AD6B4B] transition-all duration-300">
                        <div className="bg-gradient-to-r from-[#DDCBB7] to-[#E8D5C4] px-6 py-4">
                          <h3 className="text-xl font-bold text-[#264025]">{category.name}</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {categoryServices.map((service) => (
                            <div
                              key={service.id}
                              onClick={() => setSelectedService(service)}
                              className="group relative p-6 rounded-xl border-2 border-[#DDCBB7] hover:border-[#AD6B4B] cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-[#FAF6F1]"
                            >
                              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Sparkles className="text-[#AD6B4B]" size={20} />
                              </div>
                              <h4 className="font-bold text-[#264025] text-lg mb-2 pr-6">{service.name}</h4>
                              {service.description && (
                                <p className="text-sm text-[#82896E] line-clamp-2">{service.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[600px] overflow-y-auto pr-2">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className="group relative p-6 rounded-xl border-2 border-[#DDCBB7] hover:border-[#AD6B4B] cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-white to-[#FAF6F1]"
                    >
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles className="text-[#AD6B4B]" size={20} />
                      </div>
                      <h3 className="font-bold text-[#264025] text-lg mb-2 pr-6">{service.name}</h3>
                      {service.description && (
                        <p className="text-sm text-[#82896E] line-clamp-2">{service.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {selectedService && !selectedTime && (
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
              <div className="mb-8 p-6 bg-gradient-to-r from-[#DDCBB7]/30 to-[#E8D5C4]/30 rounded-2xl border-2 border-[#AD6B4B]">
                <div className="flex items-center space-x-3 mb-2">
                  <Sparkles className="text-[#AD6B4B]" size={24} />
                  <span className="text-sm font-semibold text-[#82896E] uppercase tracking-wide">Selected Service</span>
                </div>
                <h2 className="text-2xl font-bold text-[#264025]">{selectedService.name}</h2>
              </div>

              <div className="mb-8">
                <label className="block text-lg font-bold text-[#264025] mb-3 flex items-center">
                  <Calendar className="mr-2 text-[#AD6B4B]" size={24} />
                  Select Your Preferred Date
                </label>
                <input
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-6 py-4 rounded-xl border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300 text-lg font-medium bg-gradient-to-r from-white to-[#FAF6F1]"
                />
              </div>

              {selectedDate && (
                <>
                  {renderTimeline()}

                  <div className="bg-gradient-to-br from-[#264025]/5 to-[#AD6B4B]/5 rounded-2xl p-8 border-2 border-[#AD6B4B]">
                    <h3 className="text-xl font-bold text-[#264025] mb-6 flex items-center">
                      <Clock className="mr-2 text-[#AD6B4B]" size={24} />
                      Enter Your Preferred Time
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <input
                          type="time"
                          value={manualTimeInput}
                          onChange={(e) => handleTimeInputChange(e.target.value)}
                          className="w-full px-6 py-4 rounded-xl border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300 text-lg font-medium"
                          min={shopOpenTime}
                          max={shopCloseTime}
                        />
                        {manualTimeInput && (
                          <p className="text-sm text-[#82896E] mt-2">
                            Session ends at: {formatTime12Hour(calculateEndTime(manualTimeInput, selectedService.duration_minutes))}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleSetTime}
                        disabled={!manualTimeInput || !isTimeAvailable(manualTimeInput)}
                        className="
                          sm:w-auto 
                          bg-gradient-to-r from-[#AD6B4B] to-[#C17B5C]
                          text-white px-6
                          h-14
                          rounded-lg font-semibold
                          hover:from-[#7B4B36] hover:to-[#AD6B4B]
                          transition-all duration-300
                          disabled:opacity-50 disabled:cursor-not-allowed
                          shadow-lg
                        "
                      >
                        Continue
                      </button>

                    </div>
                    {timeError && (
                      <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 font-medium">
                        {timeError}
                      </div>
                    )}
                    {manualTimeInput && isTimeAvailable(manualTimeInput) && (
                      <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-xl text-green-700 font-medium flex items-center">
                        <Check className="mr-2" size={20} />
                        This time is available! Click Continue to proceed.
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {selectedService && selectedDate && selectedTime && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
              <div className="mb-8 p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 rounded-2xl">
                <div className="flex items-center space-x-2 text-green-700 mb-3">
                  <Check size={24} />
                  <span className="text-lg font-bold">Time Slot Confirmed</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[#264025]">
                  <div>
                    <div className="text-sm text-[#82896E] mb-1">Service</div>
                    <div className="font-bold">{selectedService.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#82896E] mb-1">Date</div>
                    <div className="font-bold">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#82896E] mb-1">Time</div>
                    <div className="font-bold">{formatTime12Hour(selectedTime)} - {formatTime12Hour(calculateEndTime(selectedTime, selectedService.duration_minutes))}</div>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-[#264025] mb-6">Your Contact Details</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-[#264025] font-semibold mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 text-[#82896E]" size={20} />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300 text-lg"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
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
                <div>
                  <label className="block text-[#264025] font-semibold mb-2">Special Requests (Optional)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-[#82896E]" size={20} />
                    <textarea
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300 resize-none text-lg"
                      placeholder="Any special requests or preferences?"
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.name || !formData.email || !formData.phone}
                className="w-full mt-8 bg-gradient-to-r from-[#AD6B4B] to-[#C17B5C] text-white px-8 py-5 rounded-full text-xl font-bold hover:from-[#7B4B36] hover:to-[#AD6B4B] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-2xl disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Confirming Your Booking...
                  </span>
                ) : (
                  'Confirm Booking'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
