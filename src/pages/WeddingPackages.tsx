import { useEffect, useState } from 'react';
import { ServiceCard } from '../components/ServiceCard';
import { supabase } from '../lib/supabase';
import { Service, ServiceCategory } from '../types';

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

  const handleBookService = (service: Service) => {
    onNavigate('booking', service);
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-[#264025] mb-4">
            Wedding Packages
          </h1>
          <p className="text-xl text-[#82896E] max-w-3xl mx-auto">
            Make your special day even more memorable with our comprehensive bridal and groom packages
          </p>
        </div>

        <div className="bg-gradient-to-r from-[#AD6B4B] to-[#7B4B36] rounded-3xl p-8 md:p-12 mb-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">Complete</div>
              <div className="text-lg opacity-90">All-inclusive packages</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">Premium</div>
              <div className="text-lg opacity-90">High-quality products</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">Expert</div>
              <div className="text-lg opacity-90">Professional artists</div>
            </div>
          </div>
        </div>

        {weddingServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {weddingServices.map((service) => (
              <ServiceCard key={service.id} service={service} onBook={handleBookService} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <p className="text-[#82896E] text-lg mb-4">Loading wedding packages...</p>
            <p className="text-sm text-[#82896E]">
              Contact us for customized wedding packages tailored to your needs
            </p>
          </div>
        )}

        <div className="mt-16 bg-[#DDCBB7] rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-[#264025] mb-6 text-center">
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
              <div key={index} className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-[#AD6B4B] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[#264025] font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
