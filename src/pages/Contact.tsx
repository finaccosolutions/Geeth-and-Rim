import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ContactSettings } from '../types';

export const Contact = () => {
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadContactSettings();
  }, []);

  const loadContactSettings = async () => {
    const { data } = await supabase.from('contact_settings').select('*').maybeSingle();
    if (data) {
      setContactSettings(data);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  const getOpeningHoursText = () => {
    if (!contactSettings) return null;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const workingDays = days.filter(day => !contactSettings.opening_hours[day].closed);

    if (workingDays.length === 0) return 'Closed';

    const weekdayPattern = workingDays.slice(0, 5).every((day, i) => {
      const hours = contactSettings.opening_hours[day];
      const firstHours = contactSettings.opening_hours[workingDays[0]];
      return hours.open === firstHours.open && hours.close === firstHours.close;
    });

    if (weekdayPattern && workingDays.length >= 5) {
      return [
        `Monday - Friday: ${contactSettings.opening_hours.monday.open} - ${contactSettings.opening_hours.monday.close}`,
        contactSettings.opening_hours.saturday.closed ? null : `Saturday: ${contactSettings.opening_hours.saturday.open} - ${contactSettings.opening_hours.saturday.close}`,
        contactSettings.opening_hours.sunday.closed ? null : `Sunday: ${contactSettings.opening_hours.sunday.open} - ${contactSettings.opening_hours.sunday.close}`,
      ].filter(Boolean);
    }

    return workingDays.map(day => {
      const hours = contactSettings.opening_hours[day];
      return `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours.open} - ${hours.close}`;
    });
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-[#264025] mb-4">Contact Us</h1>
          <p className="text-xl text-[#82896E] max-w-2xl mx-auto">
            Get in touch with us for bookings, inquiries, or just to say hello
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-[#264025] mb-8">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[#264025] font-semibold mb-2">Your Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-[#264025] font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-[#264025] font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-[#264025] font-semibold mb-2">Message</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none transition-colors duration-300 resize-none"
                  placeholder="Tell us how we can help you"
                />
              </div>
              <button
                type="submit"
                disabled={submitted}
                className="w-full bg-[#AD6B4B] text-white px-6 py-4 rounded-full font-semibold hover:bg-[#7B4B36] transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
                <span>{submitted ? 'Message Sent!' : 'Send Message'}</span>
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#264025] mb-8">Get in Touch</h2>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#AD6B4B] flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#264025] mb-2">Visit Us</h3>
                    <p className="text-[#82896E]">
                      {contactSettings?.address || 'Loading...'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#AD6B4B] flex items-center justify-center flex-shrink-0">
                    <Phone className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#264025] mb-2">Call Us</h3>
                    <a
                      href={`tel:${contactSettings?.phone_number || ''}`}
                      className="text-[#82896E] hover:text-[#AD6B4B] transition-colors duration-300"
                    >
                      {contactSettings?.phone_number || 'Loading...'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#AD6B4B] flex items-center justify-center flex-shrink-0">
                    <Mail className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#264025] mb-2">Email Us</h3>
                    <a
                      href={`mailto:${contactSettings?.email || ''}`}
                      className="text-[#82896E] hover:text-[#AD6B4B] transition-colors duration-300"
                    >
                      {contactSettings?.email || 'Loading...'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-full bg-[#AD6B4B] flex items-center justify-center flex-shrink-0">
                    <Clock className="text-white" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#264025] mb-2">Working Hours</h3>
                    <div className="text-[#82896E] space-y-1">
                      {contactSettings ? (
                        Array.isArray(getOpeningHoursText()) ? (
                          (getOpeningHoursText() as string[]).map((line, i) => (
                            <p key={i}>{line}</p>
                          ))
                        ) : (
                          <p>{getOpeningHoursText()}</p>
                        )
                      ) : (
                        <p>Loading...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl overflow-hidden shadow-xl">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2412648750455!2d-73.98823492346469!3d40.748817535473904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1709833692929!5m2!1sen!2sus"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
