import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, ChevronLeft, Check, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendBookingEmail } from '../lib/emailService';
import { Service, ServiceCategory, BlockedTimeSlot } from '../types';

interface BookingProps {
  preSelectedService?: Service;
  onNavigate: (page: string) => void;
}

interface BookingTimeRange {
  start_time: string;
  end_time: string;
  type: 'booking' | 'blocked';
  reason?: string;
}

export const Booking = ({ preSelectedService, onNavigate }: BookingProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(preSelectedService || null);
  const [selectedDate, setSelectedDate] = useState('');
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

  useEffect(() => {
    if (selectedDate && selectedService) {
      loadExistingBookings();
    }
  }, [selectedDate, selectedService]);

  const loadData = async () => {
    const [servicesResult, categoriesResult] = await Promise.all([
      supabase.from('services').select('*').eq('is_active', true).order('display_order'),
      supabase.from('service_categories').select('*').order('display_order'),
    ]);

    if (servicesResult.data) setServices(servicesResult.data);
    if (categoriesResult.data) setCategories(categoriesResult.data);
  };

  const loadExistingBookings = async () => {
    if (!selectedDate || !selectedService) return;

    const [bookingsResult, blockedResult] = await Promise.all([
      supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('booking_date', selectedDate)
        .neq('status', 'cancelled')
        .order('start_time', { ascending: true }),
      supabase
        .from('blocked_time_slots')
        .select('start_time, end_time, reason')
        .eq('blocked_date', selectedDate)
        .eq('service_id', selectedService.id)
    ]);

    const allBookings: BookingTimeRange[] = [];

    if (bookingsResult.data) {
      bookingsResult.data.forEach(booking => {
        allBookings.push({
          start_time: booking.start_time,
          end_time: booking.end_time,
          type: 'booking'
        });
      });
    }

    if (blockedResult.data) {
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
        .neq('status', 'cancelled');

      const { data: latestBlocked } = await supabase
        .from('blocked_time_slots')
        .select('*')
        .eq('blocked_date', selectedDate)
        .eq('service_id', selectedService.id);

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

      const { error } = await supabase.from('bookings').insert({
        service_id: selectedService.id,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        booking_date: selectedDate,
        start_time: selectedTime,
        end_time: endTime,
        status: 'confirmed',
        notes: formData.notes,
      });

      if (error) {
        setIsSubmitting(false);
        alert('Booking failed. Please try again.');
        return;
      }

      await sendBookingEmail({
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

      setBookingComplete(true);
    } catch (error) {
      console.error('Booking error:', error);
      setIsSubmitting(false);
      alert('An error occurred. Please try again.');
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
    if (!selectedService) return null;

    const openMinutes = timeToMinutes(shopOpenTime);
    const closeMinutes = timeToMinutes(shopCloseTime);
    const totalMinutes = closeMinutes - openMinutes;
    const hours = [];

    for (let h = Math.floor(openMinutes / 60); h <= Math.floor(closeMinutes / 60); h++) {
      hours.push(h);
    }

    return (
      <div className="mb-6">
        <h3 className="text-lg font-bold text-[#264025] mb-4">Visual Timeline - Available Times</h3>

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

              return (
                <div
                  key={`${booking.type}-${index}`}
                  className={`absolute top-3 bottom-3 ${
                    booking.type === 'blocked' ? 'bg-gray-500' : 'bg-red-500'
                  } rounded shadow-lg border-2 border-white transition-all hover:scale-y-110 hover:z-10 cursor-pointer group`}
                  style={{
                    left: `${left}%`,
                    width: `${Math.max(width, 0.5)}%`,
                    minWidth: '2px',
                  }}
                  title={booking.type === 'blocked' ? `Blocked: ${booking.reason || 'No reason'}` : `Booked: ${booking.start_time.substring(0, 5)} - ${booking.end_time.substring(0, 5)}`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 rounded px-1">
                    <div>{booking.start_time.substring(0, 5)}</div>
                    <div>-</div>
                    <div>{booking.end_time.substring(0, 5)}</div>
                  </div>
                </div>
              );
            })}

            {manualTimeInput && isTimeAvailable(manualTimeInput) && selectedService && (
              <div
                className="absolute top-2 bottom-2 bg-blue-500 bg-opacity-70 border-2 border-blue-700 rounded shadow-lg animate-pulse z-20"
                style={{
                  left: `${((timeToMinutes(manualTimeInput) - openMinutes) / totalMinutes) * 100}%`,
                  width: `${(selectedService.duration_minutes / totalMinutes) * 100}%`,
                  minWidth: '3px',
                }}
              >
                <div className="flex items-center justify-center h-full text-white text-xs font-bold">
                  Your Slot
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
                  Already Booked Slots on {new Date(selectedDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {existingBookings.map((booking, index) => (
                    <div
                      key={`list-${index}`}
                      className={`text-sm px-3 py-2 rounded-lg font-semibold ${
                        booking.type === 'blocked'
                          ? 'bg-gray-200 text-gray-800 border-2 border-gray-400'
                          : 'bg-red-100 text-red-800 border-2 border-red-400'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <Clock size={14} className="flex-shrink-0" />
                        <span>{booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}</span>
                      </div>
                      {booking.type === 'blocked' && booking.reason && (
                        <div className="text-xs mt-1 opacity-75 italic">{booking.reason}</div>
                      )}
                    </div>
                  ))}
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
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-3xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-white" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-[#264025] mb-4">Booking Confirmed!</h2>
            <p className="text-[#82896E] mb-6">
              Your appointment has been confirmed. A confirmation email has been sent to your email address.
            </p>
            <div className="bg-[#DDCBB7] rounded-2xl p-6 mb-6 text-left">
              <h3 className="font-bold text-[#264025] mb-3">Booking Details</h3>
              <div className="space-y-2 text-sm text-[#7B4B36]">
                <p><strong>Service:</strong> {selectedService?.name}</p>
                <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('home')}
              className="w-full bg-[#AD6B4B] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#7B4B36] transition-all duration-300"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
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
            className="flex items-center space-x-2 text-[#AD6B4B] hover:text-[#7B4B36] transition-colors duration-300"
          >
            <ChevronLeft size={20} />
            <span>Back</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#264025] to-[#7B4B36] p-8 text-white">
            <h1 className="text-4xl font-bold mb-4">Book Your Appointment</h1>
            <div className="flex items-center space-x-4 overflow-x-auto pb-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step >= s ? 'bg-[#AD6B4B]' : 'bg-white/20'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-[#AD6B4B]' : 'bg-white/20'}`} />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8">
            {!selectedService && (
              <div>
                <h2 className="text-2xl font-bold text-[#264025] mb-6">Select a Service</h2>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-[#264025] mb-2">
                    Filter by Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300"
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
                  <div className="space-y-6 max-h-[500px] overflow-y-auto">
                    {categories.map((category) => {
                      const categoryServices = getServicesByCategory(category.id);
                      if (categoryServices.length === 0) return null;

                      return (
                        <div key={category.id} className="border-2 border-[#DDCBB7] rounded-xl overflow-hidden">
                          <div className="bg-[#DDCBB7] px-4 py-3">
                            <h3 className="font-bold text-[#264025]">{category.name}</h3>
                          </div>
                          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categoryServices.map((service) => (
                              <div
                                key={service.id}
                                onClick={() => setSelectedService(service)}
                                className="p-4 rounded-lg border-2 border-[#DDCBB7] hover:border-[#AD6B4B] cursor-pointer transition-all duration-300 hover:shadow-lg bg-white"
                              >
                                <h4 className="font-bold text-[#264025]">{service.name}</h4>
                                <p className="text-sm text-[#82896E] mt-1">
                                  {service.duration_minutes} min • ₹{service.price}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto">
                    {filteredServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service)}
                        className="p-4 rounded-xl border-2 border-[#DDCBB7] hover:border-[#AD6B4B] cursor-pointer transition-all duration-300 hover:shadow-lg"
                      >
                        <h3 className="font-bold text-[#264025]">{service.name}</h3>
                        <p className="text-sm text-[#82896E] mt-1">
                          {service.duration_minutes} min • ₹{service.price}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedService && !selectedTime && (
              <div>
                <h2 className="text-2xl font-bold text-[#264025] mb-6">Select Date & Time</h2>
                <div className="mb-6 p-4 bg-[#DDCBB7]/20 rounded-xl">
                  <p className="font-semibold text-[#264025]">Selected Service: {selectedService.name}</p>
                  <p className="text-sm text-[#82896E]">Duration: {selectedService.duration_minutes} minutes • Price: ₹{selectedService.price}</p>
                </div>

                <div className="mb-6">
                  <label className="block text-[#264025] font-semibold mb-2">Select Date</label>
                  <input
                    type="date"
                    min={minDate}
                    max={maxDate}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300 text-lg"
                  />
                </div>

                {selectedDate && (
                  <>
                    {renderTimeline()}

                    <div className="bg-gradient-to-r from-[#264025]/5 to-[#AD6B4B]/5 rounded-xl p-6 border-2 border-[#AD6B4B]">
                      <h3 className="text-lg font-bold text-[#264025] mb-4">Enter Your Preferred Time</h3>
                      <p className="text-sm text-[#82896E] mb-4">
                        Shop hours: {shopOpenTime} - {shopCloseTime}. Your service will take {selectedService.duration_minutes} minutes.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-[#264025] mb-2">
                            Start Time
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-3.5 text-[#82896E]" size={20} />
                            <input
                              type="time"
                              value={manualTimeInput}
                              onChange={(e) => handleTimeInputChange(e.target.value)}
                              className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300 text-lg"
                              min={shopOpenTime}
                              max={shopCloseTime}
                            />
                          </div>
                          {manualTimeInput && (
                            <p className="text-xs text-[#82896E] mt-2">
                              End time: {calculateEndTime(manualTimeInput, selectedService.duration_minutes)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={handleSetTime}
                            disabled={!manualTimeInput || !isTimeAvailable(manualTimeInput)}
                            className="w-full sm:w-auto bg-[#AD6B4B] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#7B4B36] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                          >
                            <span>Next</span>
                            <ChevronRight size={20} />
                          </button>
                        </div>
                      </div>
                      {timeError && (
                        <div className="mt-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm font-medium">
                          {timeError}
                        </div>
                      )}
                      {manualTimeInput && isTimeAvailable(manualTimeInput) && (
                        <div className="mt-4 p-3 bg-green-50 border-2 border-green-300 rounded-lg text-green-700 text-sm font-medium">
                          This time is available! Click Next to proceed.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedService && selectedDate && selectedTime && (
              <div>
                <h2 className="text-2xl font-bold text-[#264025] mb-6">Your Details</h2>
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-xl">
                  <div className="flex items-center space-x-2 text-green-700 mb-2">
                    <Check size={20} />
                    <span className="font-bold">Time Confirmed</span>
                  </div>
                  <p className="font-semibold text-[#264025]">{selectedService.name}</p>
                  <p className="text-sm text-[#82896E]">
                    {new Date(selectedDate).toLocaleDateString()} at {selectedTime} - {calculateEndTime(selectedTime, selectedService.duration_minutes)}
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#264025] font-semibold mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 text-[#82896E]" size={20} />
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300"
                        placeholder="Enter your name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#264025] font-semibold mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 text-[#82896E]" size={20} />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#264025] font-semibold mb-2">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3.5 text-[#82896E]" size={20} />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300"
                        placeholder="Enter your phone"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[#264025] font-semibold mb-2">Notes (Optional)</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-3 top-3.5 text-[#82896E]" size={20} />
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300 resize-none"
                        placeholder="Any special requests?"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.name || !formData.email || !formData.phone}
                  className="w-full mt-6 bg-[#AD6B4B] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#7B4B36] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
