import { useEffect, useState } from 'react';
import { ChevronRight, Clock, IndianRupee } from 'lucide-react';
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

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter((s) => s.category_id === selectedCategory);

  const getServicesByCategory = (categoryId: string) => {
    return services.filter((s) => s.category_id === categoryId);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-b from-white to-[#FAF6F1]">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-[#264025] mb-3">
            Our Services
          </h1>
          <p className="text-base text-[#82896E] max-w-2xl mx-auto mb-6">
            Explore our comprehensive range of beauty and wellness services
          </p>
          <button
            onClick={() => onNavigate('booking')}
            className="bg-[#AD6B4B] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#7B4B36] transition-all duration-300 shadow-lg"
          >
            Book Appointment
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-[#AD6B4B] text-white shadow-md'
                : 'bg-white text-[#264025] hover:bg-[#DDCBB7] shadow-sm'
            }`}
          >
            All Services
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-[#AD6B4B] text-white shadow-md'
                  : 'bg-white text-[#264025] hover:bg-[#DDCBB7] shadow-sm'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {selectedCategory === 'all' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
            {categories.map((category) => {
              const categoryServices = getServicesByCategory(category.id);
              if (categoryServices.length === 0) return null;

              return (
                <div
                  key={category.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-[#DDCBB7]"
                >
                  <div className="bg-gradient-to-r from-[#264025] to-[#7B4B36] px-5 py-3">
                    <h2 className="text-xl font-bold text-white">{category.name}</h2>
                    {category.description && (
                      <p className="text-[#DDCBB7] text-sm mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {categoryServices.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => onNavigate('booking', service)}
                          className="group flex items-center justify-between px-4 py-3 rounded-lg hover:bg-[#DDCBB7]/20 border border-transparent hover:border-[#AD6B4B] transition-all duration-300 cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-[#264025] group-hover:text-[#AD6B4B] transition-colors truncate">
                              {service.name}
                            </h3>
                            {service.description && (
                              <p className="text-xs text-[#82896E] line-clamp-1 mt-0.5">
                                {service.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 ml-4 flex-shrink-0">

                            <ChevronRight
                              className="text-[#82896E] group-hover:text-[#AD6B4B] group-hover:translate-x-1 transition-all duration-300"
                              size={18}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {filteredServices.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#DDCBB7]">
                <div className="bg-gradient-to-r from-[#264025] to-[#7B4B36] px-5 py-3">
                  <h2 className="text-xl font-bold text-white">
                    {categories.find((c) => c.id === selectedCategory)?.name} Services
                  </h2>
                </div>
                <div className="p-4">
                  <div className="space-y-2">
                    {filteredServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => onNavigate('booking', service)}
                        className="group flex items-center justify-between px-4 py-3 rounded-lg hover:bg-[#DDCBB7]/20 border border-transparent hover:border-[#AD6B4B] transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-[#264025] group-hover:text-[#AD6B4B] transition-colors truncate">
                            {service.name}
                          </h3>
                          {service.description && (
                            <p className="text-xs text-[#82896E] line-clamp-1 mt-0.5">
                              {service.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 ml-4 flex-shrink-0">

                          <ChevronRight
                            className="text-[#82896E] group-hover:text-[#AD6B4B] group-hover:translate-x-1 transition-all duration-300"
                            size={18}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <p className="text-[#82896E] text-base">No services found in this category</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-10">
          <button
            onClick={() => onNavigate('booking')}
            className="bg-[#264025] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#AD6B4B] transition-all duration-300 shadow-lg"
          >
            Book Your Appointment Now
          </button>
        </div>
      </div>
    </div>
  );
};