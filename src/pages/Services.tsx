import { useEffect, useState } from 'react';
import { Clock, IndianRupee, ChevronRight } from 'lucide-react';
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
    <div className="min-h-screen pt-32 pb-20">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-[#264025] mb-4">
            Our Services
          </h1>
          <p className="text-xl text-[#82896E] max-w-2xl mx-auto mb-8">
            Explore our comprehensive range of beauty and wellness services
          </p>
          <button
            onClick={() => onNavigate('booking')}
            className="bg-[#AD6B4B] text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-[#7B4B36] transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            Book Your Appointment
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === 'all'
                ? 'bg-[#AD6B4B] text-white shadow-lg'
                : 'bg-white text-[#264025] hover:bg-[#DDCBB7] shadow-md'
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
                  : 'bg-white text-[#264025] hover:bg-[#DDCBB7] shadow-md'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {selectedCategory === 'all' ? (
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryServices = getServicesByCategory(category.id);
              if (categoryServices.length === 0) return null;

              return (
                <div key={category.id} className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-500">
                  <div className="bg-gradient-to-r from-[#264025] to-[#7B4B36] p-6 md:p-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{category.name}</h2>
                    {category.description && (
                      <p className="text-[#DDCBB7] text-lg">{category.description}</p>
                    )}
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryServices.map((service) => (
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
              );
            })}
          </div>
        ) : (
          <div>
            {filteredServices.length > 0 ? (
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredServices.map((service) => (
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
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <p className="text-[#82896E] text-lg">No services found in this category</p>
              </div>
            )}
          </div>
        )}

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
