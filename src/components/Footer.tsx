import { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Clock, Facebook, Instagram } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ContactSettings } from '../types';

export const Footer = () => {
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(null);

  useEffect(() => {
    loadContactSettings();
  }, []);

  const loadContactSettings = async () => {
    const { data } = await supabase.from('contact_settings').select('*').maybeSingle();
    if (data) {
      setContactSettings(data);
    }
  };

  return (
    <footer className="bg-[#264025] text-[#DDCBB7]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-[#AD6B4B] mb-4">Geet & Rim Salon</h3>
            <p className="text-sm leading-relaxed mb-4">
              Premium salon services for your beauty and wellness needs. Experience luxury and professionalism.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#82896E] flex items-center justify-center hover:bg-[#AD6B4B] transition-all duration-300 transform hover:scale-110"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-[#82896E] flex items-center justify-center hover:bg-[#AD6B4B] transition-all duration-300 transform hover:scale-110"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#AD6B4B]">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-[#AD6B4B] transition-colors duration-300">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#AD6B4B] transition-colors duration-300">
                  Services
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#AD6B4B] transition-colors duration-300">
                  Gallery
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#AD6B4B] transition-colors duration-300">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#AD6B4B]">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-[#AD6B4B] flex-shrink-0 mt-1" />
                <span>{contactSettings?.address || 'Loading...'}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-[#AD6B4B] flex-shrink-0" />
                <a href={`tel:${contactSettings?.phone_number || ''}`} className="hover:text-[#AD6B4B] transition-colors duration-300">
                  {contactSettings?.phone_number || 'Loading...'}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-[#AD6B4B] flex-shrink-0" />
                <a href={`mailto:${contactSettings?.email || ''}`} className="hover:text-[#AD6B4B] transition-colors duration-300">
                  {contactSettings?.email || 'Loading...'}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-[#AD6B4B]">Opening Hours</h4>
            <ul className="space-y-2 text-sm">
              {contactSettings && (
                <>
                  {!contactSettings.opening_hours.monday?.closed && (
                    <li className="flex items-center space-x-3">
                      <Clock size={18} className="text-[#AD6B4B] flex-shrink-0" />
                      <div>
                        <div className="font-medium">Monday - Saturday</div>
                        <div className="text-[#82896E]">
                          {contactSettings.opening_hours.monday?.open || '09:00'} - {contactSettings.opening_hours.monday?.close || '20:00'}
                        </div>
                      </div>
                    </li>
                  )}
                  {!contactSettings.opening_hours.sunday?.closed && (
                    <li className="flex items-center space-x-3">
                      <Clock size={18} className="text-[#AD6B4B] flex-shrink-0" />
                      <div>
                        <div className="font-medium">Sunday</div>
                        <div className="text-[#82896E]">
                          {contactSettings.opening_hours.sunday?.open || '10:00'} - {contactSettings.opening_hours.sunday?.close || '18:00'}
                        </div>
                      </div>
                    </li>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#82896E] mt-8 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} Geet & Rim Salon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
