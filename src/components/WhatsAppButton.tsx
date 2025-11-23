import { useEffect, useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const WhatsAppButton = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    loadWhatsAppNumber();
    setTimeout(() => setIsVisible(true), 1000);
  }, []);

  const loadWhatsAppNumber = async () => {
    const { data } = await supabase
      .from('contact_settings')
      .select('whatsapp_number')
      .maybeSingle();

    if (data) {
      setWhatsappNumber(data.whatsapp_number);
    }
  };

  const handleClick = () => {
    if (whatsappNumber) {
      const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');
      const message = encodeURIComponent('Hello! I would like to inquire about your services.');
      window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
    }
  };

  if (!whatsappNumber) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className={`relative transition-all duration-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {showTooltip && (
          <div className="absolute bottom-full right-0 mb-3 bg-[#264025] text-white px-4 py-2 rounded-lg whitespace-nowrap shadow-lg animate-fade-in">
            <div className="text-sm font-semibold">Chat with us on WhatsApp!</div>
            <div className="absolute bottom-0 right-6 transform translate-y-1/2 rotate-45 w-3 h-3 bg-[#264025]"></div>
          </div>
        )}

        <button
          onClick={handleClick}
          className="relative w-16 h-16 bg-[#25D366] rounded-full shadow-2xl hover:shadow-[0_0_30px_rgba(37,211,102,0.6)] transition-all duration-300 hover:scale-110 group animate-pulse hover:animate-none z-50"
          aria-label="Contact us on WhatsApp"
        >
          <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-75 pointer-events-none"></div>

          <div className="relative flex items-center justify-center w-full h-full z-10">
            <MessageCircle className="text-white" size={32} strokeWidth={2} />
          </div>
        </button>

        <div className="absolute inset-0 rounded-full border-4 border-[#25D366] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50 pointer-events-none"></div>
      </div>
    </div>
  );
};
