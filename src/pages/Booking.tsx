import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, ChevronLeft, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendBookingEmail } from '../lib/emailService';
import { Service, ServiceCategory } from '../types';

interface BookingProps {
  preSelectedService?: Service;
  onNavigate: (page: string) => void;
}

export const Booking = ({ preSelectedService, onNavigate }: BookingProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(preSelectedService || null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [existingBookings, setExistingBookings] = useState<{ start_time: string; end_time: string }[]>([]);
  const [timeError, setTimeError] = useState('');
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

  const step = !selectedService ? 1 : !selectedTime ? 2 : 3;

  useEffect(() => {
    if (!preSelectedService) {
      loadData();
    }
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadExistingBookings();
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

    const { data: bookings } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('booking_date', selectedDate)
      .neq('status', 'cancelled')
      .order('start_time', { ascending: true });

    if (bookings) {
      setExistingBookings(bookings);
    } else {
      setExistingBookings([]);
    }
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = startMinutes + durationMinutes;
    const hours = Math.floor(endMinutes / 60);
    const minutes = endMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const validateTimeSlot = (time: string): string | null => {
    if (!selectedService) return null;

    const selectedStartMinutes = timeToMinutes(time);
    const selectedEndMinutes = selectedStartMinutes + selectedService.duration_minutes;
    const shopOpenMinutes = timeToMinutes(shopOpenTime);
    const shopCloseMinutes = timeToMinutes(shopCloseTime);

    if (selectedStartMinutes < shopOpenMinutes) {
      return `Shop opens at ${shopOpenTime}. Please select a time after that.`;
    }

    if (selectedEndMinutes > shopCloseMinutes) {
      return `This appointment would end after closing time (${shopCloseTime}). Please select an earlier time.`;
    }

    const hasConflict = existingBookings.some((booking) => {
      const bookingStart = timeToMinutes(booking.start_time);
      const bookingEnd = timeToMinutes(booking.end_time);

      return (
        (selectedStartMinutes >= bookingStart && selectedStartMinutes < bookingEnd) ||
        (selectedEndMinutes > bookingStart && selectedEndMinutes <= bookingEnd) ||
        (selectedStartMinutes <= bookingStart && selectedEndMinutes >= bookingEnd)
      );
    });

    if (hasConflict) {
      return 'This time conflicts with an existing booking. Please choose a different time.';
    }

    return null;
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    setTimeError('');

    if (time && selectedService) {
      const error = validateTimeSlot(time);
      if (error) {
        setTimeError(error);
      }
    }
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    const validationError = validateTimeSlot(selectedTime);
    if (validationError) {
      setTimeError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const endTime = calculateEndTime(selectedTime, selectedService.duration_minutes);

      const { data: latestBookings } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('booking_date', selectedDate)
        .neq('status', 'cancelled');

      const isSlotAvailable = !latestBookings?.some((booking) => {
        const startMinutes = timeToMinutes(booking.start_time);
        const endMinutes = timeToMinutes(booking.end_time);
        const selectedStartMinutes = timeToMinutes(selectedTime);
        const selectedEndMinutes = selectedStartMinutes + selectedService.duration_minutes;

        return (
          (selectedStartMinutes >= startMinutes && selectedStartMinutes < endMinutes) ||
          (selectedEndMinutes > startMinutes && selectedEndMinutes <= endMinutes) ||
          (selectedStartMinutes <= startMinutes && selectedEndMinutes >= endMinutes)
        );
      });

      if (!isSlotAvailable) {
        setTimeError('Sorry, this time slot was just booked. Please select another time.');
        await loadExistingBookings();
        setIsSubmitting(false);
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
        setTimeError('Booking failed. Please try again.');
        setIsSubmitting(false);
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
      setTimeError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getServicesByCategory = (categoryId: string) => {
    return services.filter((s) => s.category_id === categoryId);
  };

  const filteredServices =
    selectedCategory === 'all' ? services : services.filter((s) => s.category_id === selectedCategory);

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

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
                  <div>
                    <div className="mb-6">
                      <label className="block text-[#264025] font-semibold mb-2">
                        Enter Your Preferred Time
                      </label>
                      <p className="text-sm text-[#82896E] mb-3">
                        Shop hours: {shopOpenTime} - {shopCloseTime}
                      </p>
                      <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => handleTimeChange(e.target.value)}
                        min={shopOpenTime}
                        max={shopCloseTime}
                        className="w-full px-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300 text-lg"
                      />
                      {timeError && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                          {timeError}
                        </div>
                      )}
                      {selectedTime && !timeError && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                          Time slot available! Your appointment will be from {selectedTime} to {calculateEndTime(selectedTime, selectedService.duration_minutes)}
                        </div>
                      )}
                    </div>

                    {existingBookings.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="font-semibold text-[#264025] mb-3">Already Booked Times Today:</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {existingBookings.map((booking, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center space-x-2">
                                <Clock size={16} className="text-[#82896E]" />
                                <span className="text-[#264025] font-medium">
                                  {booking.start_time} - {booking.end_time}
                                </span>
                              </div>
                              <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                BOOKED
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )})
              </div>
            )}

            {selectedService && selectedDate && selectedTime && (
              <div>
                <h2 className="text-2xl font-bold text-[#264025] mb-6">Your Details</h2>
                <div className="mb-6 p-4 bg-[#DDCBB7]/20 rounded-xl">
                  <p className="font-semibold text-[#264025]">{selectedService.name}</p>
                  <p className="text-sm text-[#82896E]">
                    {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
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
