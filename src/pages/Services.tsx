import { useEffect, useState } from 'react';
import { Sparkles, ChevronRight, Award } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Service, ServiceCategory } from '../types';

interface ServicesProps {
  onNavigate: (page: string, data?: unknown) => void;
}

interface SiteImage {
  image_key: string;
  image_url: string;
  title: string;
  category: string;
}

const categoryColors = [
  {
    bg: 'from-[#C17B5C]/10 to-[#AD6B4B]/5',
    border: 'border-[#C17B5C]/30',
    hover: 'hover:border-[#C17B5C]',
    text: 'text-[#7B4B36]',
    badge: 'bg-[#C17B5C]',
    overlay: 'from-[#C17B5C]/80 to-[#AD6B4B]/60'
  },
  {
    bg: 'from-[#8B9D7F]/10 to-[#7B9B6F]/5',
    border: 'border-[#8B9D7F]/30',
    hover: 'hover:border-[#8B9D7F]',
    text: 'text-[#5A6B4F]',
    badge: 'bg-[#8B9D7F]',
    overlay: 'from-[#8B9D7F]/80 to-[#7B9B6F]/60'
  },
  {
    bg: 'from-[#B89968]/10 to-[#A8895E]/5',
    border: 'border-[#B89968]/30',
    hover: 'hover:border-[#B89968]',
    text: 'text-[#8A7350]',
    badge: 'bg-[#B89968]',
    overlay: 'from-[#B89968]/80 to-[#A8895E]/60'
  },
  {
    bg: 'from-[#DDCBB7]/20 to-[#E8D5C4]/10',
    border: 'border-[#DDCBB7]/50',
    hover: 'hover:border-[#AD6B4B]',
    text: 'text-[#7B4B36]',
    badge: 'bg-[#AD6B4B]',
    overlay: 'from-[#AD6B4B]/80 to-[#7B4B36]/60'
  },
  {
    bg: 'from-amber-50/50 to-amber-100/30',
    border: 'border-amber-300/40',
    hover: 'hover:border-amber-500',
    text: 'text-amber-800',
    badge: 'bg-amber-500',
    overlay: 'from-amber-500/80 to-amber-600/60'
  },
  {
    bg: 'from-emerald-50/50 to-emerald-100/30',
    border: 'border-emerald-300/40',
    hover: 'hover:border-emerald-500',
    text: 'text-emerald-800',
    badge: 'bg-emerald-500',
    overlay: 'from-emerald-500/80 to-emerald-600/60'
  },
  {
    bg: 'from-orange-50/50 to-orange-100/30',
    border: 'border-orange-300/40',
    hover: 'hover:border-orange-500',
    text: 'text-orange-800',
    badge: 'bg-orange-500',
    overlay: 'from-orange-500/80 to-orange-600/60'
  },
  {
    bg: 'from-teal-50/50 to-teal-100/30',
    border: 'border-teal-300/40',
    hover: 'hover:border-teal-500',
    text: 'text-teal-800',
    badge: 'bg-teal-500',
    overlay: 'from-teal-500/80 to-teal-600/60'
  },
];

export const Services = ({ onNavigate }: ServicesProps) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [categoriesResult, servicesResult, imagesResult] = await Promise.all([
      supabase.from('service_categories').select('*').order('display_order'),
      supabase.from('services').select('*').eq('is_active', true).order('display_order'),
      supabase.from('site_images').select('*').eq('is_active', true).eq('category', 'category'),
    ]);

    if (categoriesResult.data) setCategories(categoriesResult.data);
    if (servicesResult.data) setServices(servicesResult.data);

    if (imagesResult.data) {
      const categoryImagesMap: Record<string, string> = {};
      imagesResult.data.forEach((img) => {
        categoryImagesMap[img.title] = img.image_url;
      });
      setCategoryImages(categoryImagesMap);
    }
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
              const categoryImage = categoryImages[category.name];

              return (
                <div key={category.id} className="mb-16">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-[#DDCBB7]">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${colors.badge} rounded-full flex items-center justify-center shadow-lg`}>
                        <Award className="text-white" size={20} />
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

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {categoryServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => onNavigate('booking', service)}
                        className={`group relative bg-white rounded-2xl overflow-hidden border-2 ${colors.border} ${colors.hover} cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}
                      >
                        {categoryImage && (
                          <div className="relative h-32 overflow-hidden">
                            <img
                              src={categoryImage}
                              alt={service.name}
                              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t ${colors.overlay} opacity-0 group-hover:opacity-100 transition-all duration-500`} />
                            <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12">
                              <ChevronRight className={colors.text} size={16} />
                            </div>
                          </div>
                        )}

                        <div className={`p-3 bg-gradient-to-br ${colors.bg} group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-[#FAF6F1] transition-all duration-500`}>
                          <h3 className={`font-bold ${colors.text} text-sm leading-tight mb-1.5 group-hover:text-[#264025] transition-all duration-300 line-clamp-2 ${categoryImage ? 'min-h-[2.5rem]' : 'min-h-[3rem]'}`}>
                            {service.name}
                          </h3>

                          {service.description && (
                            <p className="text-xs text-gray-600 line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                              {service.description}
                            </p>
                          )}

                          <div className={`absolute bottom-2 right-2 w-6 h-6 ${colors.badge} rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md transform scale-0 group-hover:scale-100`}>
                            <Sparkles className="text-white" size={12} />
                          </div>
                        </div>
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
                    <div className={`w-12 h-12 ${getCategoryColor(categories.findIndex(c => c.id === selectedCategory)).badge} rounded-full flex items-center justify-center shadow-lg`}>
                      <Award className="text-white" size={24} />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-[#264025]">
                      {categories.find((c) => c.id === selectedCategory)?.name} Services
                    </h2>
                  </div>
                  <span className="px-5 py-2.5 bg-gradient-to-br from-[#DDCBB7] to-[#E8D5C4] rounded-full text-[#264025] font-bold">
                    {filteredServices.length} {filteredServices.length === 1 ? 'Service' : 'Services'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredServices.map((service) => {
                    const colors = getCategoryColor(categories.findIndex(c => c.id === selectedCategory));
                    const categoryName = categories.find(c => c.id === selectedCategory)?.name;
                    const categoryImage = categoryName ? categoryImages[categoryName] : undefined;

                    return (
                      <div
                        key={service.id}
                        onClick={() => onNavigate('booking', service)}
                        className={`group relative bg-white rounded-2xl overflow-hidden border-2 ${colors.border} ${colors.hover} cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}
                      >
                        {categoryImage && (
                          <div className="relative h-32 overflow-hidden">
                            <img
                              src={categoryImage}
                              alt={service.name}
                              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t ${colors.overlay} opacity-0 group-hover:opacity-100 transition-all duration-500`} />
                            <div className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12">
                              <ChevronRight className={colors.text} size={16} />
                            </div>
                          </div>
                        )}

                        <div className={`p-3 bg-gradient-to-br ${colors.bg} group-hover:bg-gradient-to-br group-hover:from-white group-hover:to-[#FAF6F1] transition-all duration-500`}>
                          <h3 className={`font-bold ${colors.text} text-sm leading-tight mb-1.5 group-hover:text-[#264025] transition-all duration-300 line-clamp-2 ${categoryImage ? 'min-h-[2.5rem]' : 'min-h-[3rem]'}`}>
                            {service.name}
                          </h3>

                          {service.description && (
                            <p className="text-xs text-gray-600 line-clamp-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                              {service.description}
                            </p>
                          )}

                          <div className={`absolute bottom-2 right-2 w-6 h-6 ${colors.badge} rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md transform scale-0 group-hover:scale-100`}>
                            <Sparkles className="text-white" size={12} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <Award className="mx-auto text-[#82896E] mb-4" size={64} />
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
