import { useState, useEffect } from 'react';
import { Save, Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ContactSettings } from '../../types';

export const ContactSettingsManager = () => {
  const [settings, setSettings] = useState<ContactSettings | null>(null);
  const [formData, setFormData] = useState({
    whatsapp_number: '',
    phone_number: '',
    email: '',
    address: '',
    opening_hours: {
      monday: { open: '09:00', close: '20:00', closed: false },
      tuesday: { open: '09:00', close: '20:00', closed: false },
      wednesday: { open: '09:00', close: '20:00', closed: false },
      thursday: { open: '09:00', close: '20:00', closed: false },
      friday: { open: '09:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '20:00', closed: false },
      sunday: { open: '10:00', close: '18:00', closed: false },
    },
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from('contact_settings').select('*').maybeSingle();

    if (data) {
      setSettings(data);
      setFormData({
        whatsapp_number: data.whatsapp_number,
        phone_number: data.phone_number,
        email: data.email,
        address: data.address,
        opening_hours: data.opening_hours,
      });
    }
  };

  const handleSave = async () => {
    if (settings) {
      await supabase
        .from('contact_settings')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);
    } else {
      await supabase.from('contact_settings').insert(formData);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    loadSettings();
  };

  const updateOpeningHours = (day: string, field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      opening_hours: {
        ...formData.opening_hours,
        [day]: {
          ...formData.opening_hours[day],
          [field]: value,
        },
      },
    });
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#264025]">Contact Settings</h2>
          <p className="text-sm text-[#82896E] mt-1">
            Manage WhatsApp, contact details, and opening hours
          </p>
        </div>
        {saved && (
          <span className="text-green-600 font-semibold">Settings saved successfully!</span>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-gradient-to-br from-[#25D366]/10 to-[#25D366]/5 rounded-xl p-6 border-2 border-[#25D366]/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center">
              <MessageCircle className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#264025]">WhatsApp Contact</h3>
              <p className="text-sm text-[#82896E]">Floating button will appear on website</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#264025] mb-2">
              WhatsApp Number (with country code)
            </label>
            <input
              type="text"
              value={formData.whatsapp_number}
              onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#25D366] outline-none"
              placeholder="+919876543210"
            />
            <p className="text-xs text-[#82896E] mt-1">
              Example: +919876543210 (include + and country code)
            </p>
          </div>
        </div>

        <div className="bg-[#DDCBB7]/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Phone className="text-[#AD6B4B]" size={24} />
            <h3 className="text-lg font-bold text-[#264025]">Contact Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder="+919876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder="booking@geetandrim.com"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none resize-none"
                placeholder="123 Beauty Street, Salon District, City - 123456"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#DDCBB7]/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="text-[#AD6B4B]" size={24} />
            <h3 className="text-lg font-bold text-[#264025]">Opening Hours</h3>
          </div>
          <div className="space-y-3">
            {days.map((day) => (
              <div
                key={day}
                className="bg-white rounded-lg p-4 border-2 border-[#DDCBB7] hover:border-[#AD6B4B] transition-colors"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="font-semibold text-[#264025] capitalize flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={!formData.opening_hours[day].closed}
                      onChange={(e) => updateOpeningHours(day, 'closed', !e.target.checked)}
                      className="w-5 h-5 text-[#AD6B4B] border-gray-300 rounded focus:ring-[#AD6B4B]"
                    />
                    <span>{day}</span>
                  </div>
                  {!formData.opening_hours[day].closed ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-[#82896E] mb-1">
                          Opening Time
                        </label>
                        <input
                          type="time"
                          value={formData.opening_hours[day].open}
                          onChange={(e) => updateOpeningHours(day, 'open', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#82896E] mb-1">
                          Closing Time
                        </label>
                        <input
                          type="time"
                          value={formData.opening_hours[day].close}
                          onChange={(e) => updateOpeningHours(day, 'close', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                        />
                      </div>
                      <div className="text-sm text-[#82896E] md:text-right">
                        {formData.opening_hours[day].open} - {formData.opening_hours[day].close}
                      </div>
                    </>
                  ) : (
                    <div className="md:col-span-3 text-red-600 font-semibold">Closed</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-[#AD6B4B] text-white px-8 py-3 rounded-lg hover:bg-[#7B4B36] transition-colors shadow-lg"
        >
          <Save size={20} />
          <span>Save All Contact Settings</span>
        </button>
      </div>
    </div>
  );
};
