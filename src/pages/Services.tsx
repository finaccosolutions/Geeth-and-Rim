import { useEffect, useState } from 'react';
import { ServiceCard } from '../components/ServiceCard';
import { supabase } from '../lib/supabase';
import { Service, ServiceCategory } from '../types';

interface ServicesProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export const Services = ({ onNavigate }: ServicesProps) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [categoriesResult, servicesResult] = await Promise.all([
      supabase.from('service_categories').select('*').order('display_order'),
      supabase.from('services').select('*').eq('is_active', true).order('display_order'),
    ]);

    if (categoriesResult.data) setCategories(categoriesResult.data);
    if (servicesResult.data) setServices(servicesResult.data);
  };

  const handleBookService = (service: Service) => {
    onNavigate('booking', service);
  };

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter((s) => s.category_id === selectedCategory);

  const getServicesByCategory = (categoryId: string) => {
    return services.filter((s) => s.category_id === categoryId);
  };

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-[#264025] mb-4">
            Our Services
          </h1>
          <p className="text-xl text-[#82896E] max-w-2xl mx-auto">
            Explore our comprehensive range of beauty and wellness services
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === 'all'
                ? 'bg-[#AD6B4B] text-white shadow-lg'
                : 'bg-white text-[#264025] hover:bg-[#DDCBB7]'
            }`}
          >
            All Services
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-[#AD6B4B] text-white shadow-lg'
                  : 'bg-white text-[#264025] hover:bg-[#DDCBB7]'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {selectedCategory === 'all' ? (
          <div className="space-y-16">
            {categories.map((category) => {
              const categoryServices = getServicesByCategory(category.id);
              if (categoryServices.length === 0) return null;

              return (
                <div key={category.id}>
                  <div className="mb-8">
                    <h2 className="text-3xl font-bold text-[#264025] mb-2">{category.name}</h2>
                    {category.description && (
                      <p className="text-[#82896E]">{category.description}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categoryServices.map((service) => (
                      <ServiceCard key={service.id} service={service} onBook={handleBookService} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            {filteredServices.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredServices.map((service) => (
                  <ServiceCard key={service.id} service={service} onBook={handleBookService} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#82896E] text-lg">No services found in this category</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
