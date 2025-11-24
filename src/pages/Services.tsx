import { useEffect, useState } from 'react';
import { Sparkles, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Service, ServiceCategory } from '../types';

interface ServicesProps {
  onNavigate: (page: string, data?: unknown) => void;
}

const categoryColors = [
  { bg: 'from-rose-50 to-rose-100', border: 'border-rose-300', hover: 'hover:border-rose-500', text: 'text-rose-700', icon: 'bg-rose-500' },
  { bg: 'from-blue-50 to-blue-100', border: 'border-blue-300', hover: 'hover:border-blue-500', text: 'text-blue-700', icon: 'bg-blue-500' },
  { bg: 'from-emerald-50 to-emerald-100', border: 'border-emerald-300', hover: 'hover:border-emerald-500', text: 'text-emerald-700', icon: 'bg-emerald-500' },
  { bg: 'from-amber-50 to-amber-100', border: 'border-amber-300', hover: 'hover:border-amber-500', text: 'text-amber-700', icon: 'bg-amber-500' },
  { bg: 'from-violet-50 to-violet-100', border: 'border-violet-300', hover: 'hover:border-violet-500', text: 'text-violet-700', icon: 'bg-violet-500' },
  { bg: 'from-teal-50 to-teal-100', border: 'border-teal-300', hover: 'hover:border-teal-500', text: 'text-teal-700', icon: 'bg-teal-500' },
  { bg: 'from-orange-50 to-orange-100', border: 'border-orange-300', hover: 'hover:border-orange-500', text: 'text-orange-700', icon: 'bg-orange-500' },
  { bg: 'from-pink-50 to-pink-100', border: 'border-pink-300', hover: 'hover:border-pink-500', text: 'text-pink-700', icon: 'bg-pink-500' },
];

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

  const getCategoryColor = (index: number) => {
    return categoryColors[index % categoryColors.length];
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-gradient-to-br from-[#FAF6F1] via-white to-[#E8D5C4]/20">
      <div className="w-full px-4 md:px-8 lg:px-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="text-[#C17B5C]" size={32} />
            <h1 className="text-4xl md:text-6xl font-bold text-[#264025]">
              Our Services
            </h1>
            <Sparkles className="text-[#C17B5C]" size={32} />
          </div>
          <p className="text-base md:text-lg text-[#82896E] max-w-2xl mx-auto mb-8">
            Explore our comprehensive range of beauty and wellness services
          </p>
          <button
            onClick={() => onNavigate('booking')}
            className="bg-gradient-to-r from-[#AD6B4B] to-[#C17B5C] text-white px-10 py-4 rounded-full font-bold hover:from-[#7B4B36] hover:to-[#AD6B4B] transition-all duration-300 shadow-xl transform hover:scale-105"
          >
            Book Appointment Now
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-[#AD6B4B] to-[#C17B5C] text-white shadow-lg'
                : 'bg-white text-[#264025] hover:bg-[#DDCBB7] shadow-md border-2 border-[#DDCBB7]'
            }`}
          >
            All Services
          </button>
          {categories.map((category) => {
            const count = getServicesByCategory(category.id).length;
            if (count === 0) return null;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-[#AD6B4B] to-[#C17B5C] text-white shadow-lg'
                    : 'bg-white text-[#264025] hover:bg-[#DDCBB7] shadow-md border-2 border-[#DDCBB7]'
                }`}
              >
                <span>{category.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  selectedCategory === category.id
                    ? 'bg-white/30 text-white'
                    : 'bg-[#C17B5C]/20 text-[#C17B5C]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {selectedCategory === 'all' ? (
          <div className="max-w-7xl mx-auto">
            {categories.map((category, categoryIndex) => {
              const categoryServices = getServicesByCategory(category.id);
              if (categoryServices.length === 0) return null;
              
              const colors = getCategoryColor(categoryIndex);

              return (
                <div key={category.id} className="mb-16">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#DDCBB7]">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${colors.icon} rounded-full flex items-center justify-center shadow-lg`}>
                        <Star className="text-white" size={20} />
                      </div>
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#264025]">
                          {category.name}
                        </h2>
                        {category.description && (
                          <p className="text-sm text-[#82896E]">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-gradient-to-br from-[#DDCBB7] to-[#E8D5C4] rounded-full text-[#264025] font-bold text-sm">
                      {categoryServices.length} {categoryServices.length === 1 ? 'Service' : 'Services'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {categoryServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => onNavigate('booking', service)}
                        className={`group relative bg-gradient-to-br ${colors.bg} rounded-xl p-3 border-2 ${colors.border} ${colors.hover} cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                      >
                        <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
                          <Sparkles className={colors.text} size={12} />
                        </div>
                        
                        <h3 className={`font-bold ${colors.text} text-sm mb-1.5 pr-6 group-hover:scale-105 transition-transform duration-300 line-clamp-2 min-h-[2.5rem]`}>
                          {service.name}
                        </h3>
                        
                        {service.description && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {service.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {filteredServices.length > 0 ? (
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[#DDCBB7]">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${getCategoryColor(categories.findIndex(c => c.id === selectedCategory)).icon} rounded-full flex items-center justify-center shadow-lg`}>
                      <Star className="text-white" size={24} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#264025]">
                      {categories.find((c) => c.id === selectedCategory)?.name} Services
                    </h2>
                  </div>
                  <span className="px-5 py-2.5 bg-gradient-to-br from-[#DDCBB7] to-[#E8D5C4] rounded-full text-[#264025] font-bold">
                    {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredServices.map((service) => {
                    const colors = getCategoryColor(categories.findIndex(c => c.id === selectedCategory));
                    return (
                      <div
                        key={service.id}
                        onClick={() => onNavigate('booking', service)}
                        className={`group relative bg-gradient-to-br ${colors.bg} rounded-xl p-3 border-2 ${colors.border} ${colors.hover} cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                      >
                        <div className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md">
                          <Sparkles className={colors.text} size={12} />
                        </div>
                        
                        <h3 className={`font-bold ${colors.text} text-sm mb-1.5 pr-6 group-hover:scale-105 transition-transform duration-300 line-clamp-2 min-h-[2.5rem]`}>
                          {service.name}
                        </h3>
                        
                        {service.description && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {service.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <Star className="mx-auto text-[#82896E] mb-4" size={64} />
                <p className="text-[#82896E] text-lg">No services found in this category</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-[#264025] to-[#7B4B36] rounded-3xl p-12 shadow-2xl">
            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready for Your Transformation?
            </h3>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Book your appointment now and experience the Geetandrim difference
            </p>
            <button
              onClick={() => onNavigate('booking')}
              className="bg-white text-[#264025] px-12 py-4 rounded-full font-bold hover:bg-[#F5E6D3] transition-all duration-300 shadow-xl transform hover:scale-105 text-lg"
            >
              Book Your Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
