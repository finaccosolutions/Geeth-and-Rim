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
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
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
    if (selectedDate && selectedService) {
      loadAvailableSlots();
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

  const loadAvailableSlots = async () => {
    if (!selectedService || !selectedDate) return;

    const slots: string[] = [];
    const startHour = 9;
    const endHour = 20;
    const slotInterval = selectedService.duration_minutes;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const totalMinutes = hour * 60 + minute;
        const endTimeMinutes = totalMinutes + selectedService.duration_minutes;

        if (endTimeMinutes <= endHour * 60) {
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push(timeString);
        }
      }
    }

    const { data: bookings } = await supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('booking_date', selectedDate)
      .neq('status', 'cancelled');

    const booked: string[] = [];
    if (bookings) {
      bookings.forEach((booking) => {
        const startMinutes = timeToMinutes(booking.start_time);
        const endMinutes = timeToMinutes(booking.end_time);

        slots.forEach((slot) => {
          const slotStartMinutes = timeToMinutes(slot);
          const slotEndMinutes = slotStartMinutes + selectedService.duration_minutes;

          if (
            (slotStartMinutes >= startMinutes && slotStartMinutes < endMinutes) ||
            (slotEndMinutes > startMinutes && slotEndMinutes <= endMinutes) ||
            (slotStartMinutes <= startMinutes && slotEndMinutes >= endMinutes)
          ) {
            booked.push(slot);
          }
        });
      });
    }

    setBookedSlots(booked);
    setAvailableSlots(slots);
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

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);

    const endTime = calculateEndTime(selectedTime, selectedService.duration_minutes);

    const { error } = await supabase.from('bookings').insert({
      service_id: selectedService.id,
      customer_name: formData.name,
      customer_email: formData.email,
      customer_phone: formData.phone,
      booking_date: selectedDate,
      start_time: selectedTime,
      end_time: endTime,
      status: 'pending',
      notes: formData.notes,
    });

    if (!error) {
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
        status: 'pending',
      });

      setBookingComplete(true);
    }

    setIsSubmitting(false);
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
              Your appointment request has been submitted. We'll send you a confirmation email shortly.
            </p>
            <div className="bg-[#DDCBB7] rounded-2xl p-6 mb-6 text-left">
              <h3 className="font-bold text-[#264025] mb-3">Booking Details</h3>
              <div className="space-y-2 text-sm text-[#7B4B36]">
                <p><strong>Service:</strong> {selectedService?.name}</p>
                <p><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedTime}</p>
                <p><strong>Duration:</strong> {selectedService?.duration_minutes} minutes</p>
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
                                <h4 className="font-bold text-[#264025] mb-2">{service.name}</h4>
                                <div className="flex items-center justify-between text-sm text-[#82896E]">
                                  <span>{service.duration_minutes} mins</span>
                                  <span className="font-bold text-[#AD6B4B]">₹{service.price}</span>
                                </div>
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
                        <h3 className="font-bold text-[#264025] mb-2">{service.name}</h3>
                        <div className="flex items-center justify-between text-sm text-[#82896E]">
                          <span>{service.duration_minutes} mins</span>
                          <span className="font-bold text-[#AD6B4B]">₹{service.price}</span>
                        </div>
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
                  <div>
                    <label className="block text-[#264025] font-semibold mb-2">Select Time</label>
                    <p className="text-sm text-[#82896E] mb-4">
                      Available time slots for {new Date(selectedDate).toLocaleDateString()}
                    </p>
                    {availableSlots.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <p className="text-[#82896E]">Loading available slots...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-h-[400px] overflow-y-auto p-4 bg-gray-50 rounded-lg">
                        {availableSlots.map((slot) => {
                          const isBooked = bookedSlots.includes(slot);
                          return (
                            <button
                              key={slot}
                              onClick={() => !isBooked && setSelectedTime(slot)}
                              disabled={isBooked}
                              className={`px-3 py-4 rounded-lg font-semibold transition-all duration-300 relative text-sm ${
                                isBooked
                                  ? 'bg-red-50 text-red-400 cursor-not-allowed border-2 border-red-200'
                                  : 'bg-white border-2 border-[#DDCBB7] hover:border-[#AD6B4B] text-[#264025] hover:bg-[#DDCBB7]/20 hover:shadow-md'
                              }`}
                            >
                              <div className="text-center">
                                <div className="font-bold">{slot}</div>
                                {isBooked && (
                                  <div className="text-xs mt-1 font-normal">BOOKED</div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {selectedService && selectedDate && selectedTime && (
              <div>
                <h2 className="text-2xl font-bold text-[#264025] mb-6">Your Details</h2>
                <div className="mb-6 p-4 bg-[#DDCBB7]/20 rounded-xl">
                  <p className="font-semibold text-[#264025]">{selectedService.name}</p>
                  <p className="text-sm text-[#82896E]">
                    {new Date(selectedDate).toLocaleDateString()} at {selectedTime} • {selectedService.duration_minutes} minutes • ₹{selectedService.price}
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
