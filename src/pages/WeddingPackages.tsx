import { useEffect, useState } from 'react';
import { Clock, IndianRupee, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Service } from '../types';

interface WeddingPackagesProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export const WeddingPackages = ({ onNavigate }: WeddingPackagesProps) => {
  const [weddingServices, setWeddingServices] = useState<Service[]>([]);

  useEffect(() => {
    loadWeddingServices();
  }, []);

  const loadWeddingServices = async () => {
    const { data: category } = await supabase
      .from('service_categories')
      .select('id')
      .eq('name', 'Wedding Packages')
      .maybeSingle();

    if (category) {
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('category_id', category.id)
        .eq('is_active', true)
        .order('display_order');

      if (services) setWeddingServices(services);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-[#264025] mb-4">
            Wedding Packages
          </h1>
          <p className="text-xl text-[#82896E] max-w-3xl mx-auto mb-8">
            Make your special day even more memorable with our comprehensive bridal and groom packages
          </p>
          <button
            onClick={() => onNavigate('booking')}
            className="bg-[#AD6B4B] text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-[#7B4B36] transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            Book Your Wedding Package
          </button>
        </div>

        <div className="bg-gradient-to-r from-[#AD6B4B] to-[#7B4B36] rounded-3xl p-8 md:p-12 mb-12 text-white shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2">Complete</div>
              <div className="text-lg opacity-90">All-inclusive packages</div>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2">Premium</div>
              <div className="text-lg opacity-90">High-quality products</div>
            </div>
            <div className="text-center transform hover:scale-110 transition-transform duration-300">
              <div className="text-4xl font-bold mb-2">Expert</div>
              <div className="text-lg opacity-90">Professional artists</div>
            </div>
          </div>
        </div>

        {weddingServices.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-500 mb-12">
            <div className="bg-gradient-to-r from-[#264025] to-[#7B4B36] p-6 md:p-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white">Available Packages</h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weddingServices.map((service) => (
                  <div
                    key={service.id}
                    className="group flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-[#DDCBB7]/10 to-transparent border-2 border-[#DDCBB7] hover:border-[#AD6B4B] hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#264025] mb-2 group-hover:text-[#AD6B4B] transition-colors duration-300">
                        {service.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1 text-[#82896E]">
                          <Clock size={16} />
                          <span>{service.duration_minutes} mins</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[#AD6B4B] font-bold">
                          <IndianRupee size={16} />
                          <span>{service.price.toFixed(0)}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="text-[#82896E] group-hover:text-[#AD6B4B] group-hover:translate-x-1 transition-all duration-300" size={24} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg mb-12">
            <p className="text-[#82896E] text-lg mb-4">Loading wedding packages...</p>
            <p className="text-sm text-[#82896E]">
              Contact us for customized wedding packages tailored to your needs
            </p>
          </div>
        )}

        <div className="bg-[#DDCBB7] rounded-3xl p-8 md:p-12 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-[#264025] mb-8 text-center">
            What's Included in Our Packages?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              'Pre-bridal treatments and consultations',
              'Hair styling and design',
              'Professional makeup application',
              'Saree draping and styling',
              'Skin preparation and care',
              'Touch-up kit for the day',
              'Trial sessions available',
              'Customizable packages',
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3 group">
                <div className="w-6 h-6 rounded-full bg-[#AD6B4B] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[#264025] font-medium group-hover:text-[#7B4B36] transition-colors duration-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <button
            onClick={() => onNavigate('booking')}
            className="bg-[#264025] text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-[#AD6B4B] transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            Book Your Appointment Now
          </button>
        </div>
      </div>
    </div>
  );
};
