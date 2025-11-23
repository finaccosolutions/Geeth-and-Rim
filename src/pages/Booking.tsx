import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, MessageSquare, ChevronLeft, Check, ChevronRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { sendBookingEmail } from '../lib/emailService';
import { Service, ServiceCategory, BlockedTimeSlot } from '../types';

interface BookingProps {
  preSelectedService?: Service;
  onNavigate: (page: string) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export const Booking = ({ preSelectedService, onNavigate }: BookingProps) => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<Service | null>(preSelectedService || null);
  const [selectedDate, setSelectedDate] = useState('');
  const [showTimeSelection, setShowTimeSelection] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [existingBookings, setExistingBookings] = useState<{ start_time: string; end_time: string }[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedTimeSlot[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
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
    if (selectedDate && selectedService && showTimeSelection) {
      loadExistingBookings();
    }
  }, [selectedDate, selectedService, showTimeSelection]);

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
        .select('*')
        .eq('blocked_date', selectedDate)
        .eq('service_id', selectedService.id)
    ]);

    if (bookingsResult.data) {
      setExistingBookings(bookingsResult.data);
    } else {
      setExistingBookings([]);
    }

    if (blockedResult.data) {
      setBlockedSlots(blockedResult.data);
    } else {
      setBlockedSlots([]);
    }

    generateTimeSlots(bookingsResult.data || [], blockedResult.data || []);
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

  const generateTimeSlots = (bookings: { start_time: string; end_time: string }[], blocked: BlockedTimeSlot[]) => {
    if (!selectedService) return;

    const slots: TimeSlot[] = [];
    const openMinutes = timeToMinutes(shopOpenTime);
    const closeMinutes = timeToMinutes(shopCloseTime);
    const slotInterval = 30;

    for (let minutes = openMinutes; minutes < closeMinutes; minutes += slotInterval) {
      const slotTime = minutesToTime(minutes);
      const slotEndMinutes = minutes + selectedService.duration_minutes;

      if (slotEndMinutes > closeMinutes) {
        break;
      }

      const hasBookingConflict = bookings.some((booking) => {
        const bookingStart = timeToMinutes(booking.start_time);
        const bookingEnd = timeToMinutes(booking.end_time);
        return (
          (minutes >= bookingStart && minutes < bookingEnd) ||
          (slotEndMinutes > bookingStart && slotEndMinutes <= bookingEnd) ||
          (minutes <= bookingStart && slotEndMinutes >= bookingEnd)
        );
      });

      const blockedSlot = blocked.find((block) => {
        const blockStart = timeToMinutes(block.start_time);
        const blockEnd = timeToMinutes(block.end_time);
        return (
          (minutes >= blockStart && minutes < blockEnd) ||
          (slotEndMinutes > blockStart && slotEndMinutes <= blockEnd) ||
          (minutes <= blockStart && slotEndMinutes >= blockEnd)
        );
      });

      if (blockedSlot) {
        slots.push({
          time: slotTime,
          available: false,
          reason: blockedSlot.reason || 'Blocked by admin'
        });
      } else if (hasBookingConflict) {
        slots.push({
          time: slotTime,
          available: false,
          reason: 'Already booked'
        });
      } else {
        slots.push({
          time: slotTime,
          available: true
        });
      }
    }

    setTimeSlots(slots);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
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
              } else if (showTimeSelection) {
                setShowTimeSelection(false);
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

            {selectedService && !showTimeSelection && !selectedTime && (
              <div>
                <h2 className="text-2xl font-bold text-[#264025] mb-6">Select Date</h2>
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
                  <button
                    onClick={() => setShowTimeSelection(true)}
                    className="w-full bg-[#AD6B4B] text-white px-6 py-4 rounded-full font-semibold hover:bg-[#7B4B36] transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>Continue to Time Selection</span>
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            )}

            {selectedService && selectedDate && showTimeSelection && !selectedTime && (
              <div>
                <h2 className="text-2xl font-bold text-[#264025] mb-6">Select Time Slot</h2>
                <div className="mb-6 p-4 bg-[#DDCBB7]/20 rounded-xl">
                  <p className="font-semibold text-[#264025]">{selectedService.name}</p>
                  <p className="text-sm text-[#82896E]">
                    {new Date(selectedDate).toLocaleDateString()} • {selectedService.duration_minutes} minutes
                  </p>
                </div>

                <div className="mb-4 flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span>Booked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-400 rounded"></div>
                    <span>Blocked</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto p-1">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg font-medium transition-all duration-300 text-sm ${
                        slot.available
                          ? 'bg-green-50 border-2 border-green-500 text-green-700 hover:bg-green-100 cursor-pointer'
                          : slot.reason?.includes('admin') || slot.reason?.includes('Blocked')
                          ? 'bg-gray-100 border-2 border-gray-400 text-gray-500 cursor-not-allowed'
                          : 'bg-red-50 border-2 border-red-500 text-red-700 cursor-not-allowed'
                      }`}
                      title={slot.available ? 'Click to select' : slot.reason}
                    >
                      <div className="flex items-center justify-center">
                        <Clock size={14} className="mr-1" />
                        {slot.time}
                      </div>
                    </button>
                  ))}
                </div>

                {existingBookings.length > 0 && (
                  <div className="mt-6 bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                      <div>
                        <h4 className="font-semibold text-blue-900 mb-2">Today's Schedule</h4>
                        <div className="space-y-1 text-sm">
                          {existingBookings.map((booking, index) => (
                            <div key={index} className="text-blue-700">
                              {booking.start_time} - {booking.end_time}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedService && selectedDate && selectedTime && (
              <div>
                <h2 className="text-2xl font-bold text-[#264025] mb-6">Your Details</h2>
                <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-xl">
                  <div className="flex items-center space-x-2 text-green-700 mb-2">
                    <Check size={20} />
                    <span className="font-bold">Time Slot Selected</span>
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
