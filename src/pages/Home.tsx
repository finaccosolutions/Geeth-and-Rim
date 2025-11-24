import { useEffect, useState, useRef } from 'react';
import { Hero } from '../components/Hero';
import { supabase } from '../lib/supabase';
import { Service, ServiceCategory } from '../types';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, data?: unknown) => void;
}

interface SiteImage {
  image_key: string;
  image_url: string;
  title: string;
  category: string;
}

export const Home = ({ onNavigate }: HomeProps) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [galleryImages, setGalleryImages] = useState<SiteImage[]>([]);
  const [aboutImage, setAboutImage] = useState<string>('');
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const servicesScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  const loadData = async () => {
    const [categoriesResult, servicesResult, imagesResult] = await Promise.all([
      supabase.from('service_categories').select('*').order('display_order'),
      supabase.from('services').select('*').eq('is_active', true).order('display_order'),
      supabase.from('site_images').select('*').eq('is_active', true),
    ]);

    if (categoriesResult.data) setCategories(categoriesResult.data);
    if (servicesResult.data) setServices(servicesResult.data);

    if (imagesResult.data) {
      const categoryImagesMap: Record<string, string> = {};
      const categoryImgs = imagesResult.data.filter((img) => img.category === 'category');
      categoryImgs.forEach((img) => {
        categoryImagesMap[img.title] = img.image_url;
      });
      setCategoryImages(categoryImagesMap);

      const homeGalleryImgs = imagesResult.data.filter(
        (img) => img.category === 'home_gallery'
      ).sort((a, b) => a.display_order - b.display_order);
      setGalleryImages(homeGalleryImgs);

      const aboutImg = imagesResult.data.find((img) => img.image_key === 'about_journey');
      if (aboutImg) setAboutImage(aboutImg.image_url);
    }
  };

  const getServicesByCategory = (categoryId: string) => {
    return services.filter((s) => s.category_id === categoryId);
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollAmount = 300;
      categoriesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const scrollServices = (direction: 'left' | 'right') => {
    if (servicesScrollRef.current) {
      const scrollAmount = 350;
      servicesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const selectedServices = selectedCategory ? getServicesByCategory(selectedCategory) : [];

  return (
    <div className="min-h-screen bg-[#FAF6F1]">
      <Hero onBookNow={() => onNavigate('booking')} />

      <section className="py-16 md:py-20 bg-gradient-to-b from-[#FAF6F1] to-[#E8D5C4]/30">
        <div className="w-full px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="text-[#C17B5C]" size={28} />
                <h2 className="text-3xl md:text-5xl font-bold text-[#3D2E1F]">
                  Discover Our Services
                </h2>
                <Sparkles className="text-[#C17B5C]" size={28} />
              </div>
              <p className="text-sm md:text-base text-[#6B5A4A] max-w-2xl mx-auto">
                Browse through our expertly curated categories and find the perfect treatment for you
              </p>
            </div>

            <div className="relative mb-8">
              <button
                onClick={() => scrollCategories('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-[#C17B5C] text-white rounded-full shadow-xl hover:bg-[#A6684C] transition-all duration-300 flex items-center justify-center"
              >
                <ChevronLeft size={24} />
              </button>
 
              <div
                ref={categoriesScrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-12"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.map((category) => {
                  const categoryServices = getServicesByCategory(category.id);
                  if (categoryServices.length === 0) return null;
                  const isSelected = selectedCategory === category.id;

                  return (
                    <div
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className="flex-shrink-0 w-60 cursor-pointer group"
                    >
                      <div className={`relative rounded-2xl overflow-hidden transition-all duration-500 ${
                        isSelected
                          ? 'shadow-2xl shadow-[#C17B5C]/40 ring-4 ring-[#C17B5C] ring-offset-2'
                          : 'shadow-lg hover:shadow-2xl hover:-translate-y-1'
                      }`}>
                        <div className="relative h-40 overflow-hidden">
                          <img
                            src={categoryImages[category.name] || 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=400'}
                            alt={category.name}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                          />
                          <div className={`absolute inset-0 transition-all duration-500 ${
                            isSelected
                              ? 'bg-gradient-to-t from-[#C17B5C]/90 via-[#C17B5C]/40 to-transparent'
                              : 'bg-gradient-to-t from-black/70 via-black/30 to-transparent group-hover:from-[#C17B5C]/80 group-hover:via-[#C17B5C]/30'
                          }`} />
                        </div>
                        <div className={`p-4 transition-all duration-500 ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#C17B5C] to-[#A6684C] text-white'
                            : 'bg-white text-[#3D2E1F] group-hover:bg-gradient-to-br group-hover:from-[#F5E6D3] group-hover:to-white'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <h3 className={`text-lg font-bold transition-all duration-300 ${
                              isSelected ? 'text-white' : 'text-[#3D2E1F] group-hover:text-[#C17B5C]'
                            }`}>
                              {category.name}
                            </h3>
                            <div className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
                              isSelected
                                ? 'bg-white/30 text-white'
                                : 'bg-[#C17B5C]/10 text-[#C17B5C] group-hover:bg-[#C17B5C] group-hover:text-white'
                            }`}>
                              {categoryServices.length}
                            </div>
                          </div>
                          <p className={`text-xs transition-all duration-300 ${
                            isSelected ? 'text-white/90' : 'text-[#6B5A4A] group-hover:text-[#5A4A3A]'
                          }`}>
                            {categoryServices.length === 1 ? 'Service' : 'Services'} Available
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => scrollCategories('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-[#C17B5C] text-white rounded-full shadow-xl hover:bg-[#A6684C] transition-all duration-300 flex items-center justify-center"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {selectedCategory && selectedServices.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl md:text-2xl font-bold text-[#3D2E1F]">
                    {categories.find(c => c.id === selectedCategory)?.name} Services
                  </h3>
                </div>

                <div className="relative">
                  {selectedServices.length > 3 && (
                    <>
                      <button
                        onClick={() => scrollServices('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 bg-[#8B9D7F] text-white rounded-full shadow-lg hover:bg-[#C17B5C] transition-all duration-300 flex items-center justify-center"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => scrollServices('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 bg-[#8B9D7F] text-white rounded-full shadow-lg hover:bg-[#C17B5C] transition-all duration-300 flex items-center justify-center"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  <div
                    ref={servicesScrollRef}
                    className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {selectedServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => onNavigate('booking', service)}
                        className="flex-shrink-0 w-52 bg-white rounded-xl overflow-hidden border-2 border-[#E8D5C4] hover:border-[#C17B5C] hover:shadow-xl transition-all duration-500 cursor-pointer group hover:-translate-y-1"
                      >
                        <div className="relative h-32 overflow-hidden">
                          <img
                            src={categoryImages[categories.find(c => c.id === selectedCategory)?.name || ''] || 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=400'}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-110 transition-all duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent group-hover:from-[#C17B5C]/60 transition-all duration-500" />
                          <div className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12">
                            <ChevronRight className="text-[#C17B5C]" size={16} />
                          </div>
                        </div>
                        <div className="p-3 group-hover:bg-gradient-to-br group-hover:from-[#F5E6D3] group-hover:to-white transition-all duration-500">
                          <h4 className="font-bold text-[#3D2E1F] text-sm mb-1 group-hover:text-[#C17B5C] transition-colors line-clamp-2 min-h-[2.5rem]">
                            {service.name}
                          </h4>
                          {service.description && (
                            <p className="text-xs text-[#6B5A4A] group-hover:text-[#5A4A3A] line-clamp-2 transition-colors duration-300">
                              {service.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
 
      <section className="py-16 md:py-20 bg-[#8B9D7F]">
        <div className="w-full px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Why Geetandrim Stands Out
              </h2>
              <p className="text-white/80 text-sm md:text-base">
                Experience the difference with our premium services
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Expert Professionals', desc: 'Certified & trained stylists', count: '15+' },
                { title: 'Premium Products', desc: 'International brand quality', count: '50+' },
                { title: 'Happy Clients', desc: 'Satisfied customers yearly', count: '5000+' },
                { title: 'Years Experience', desc: 'In beauty & wellness', count: '12+' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 border border-white/20"
                >
                  <div className="text-4xl font-bold text-[#C17B5C] mb-2">{item.count}</div>
                  <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-white/80">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="w-full px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-[#C17B5C]/20 to-[#8B9D7F]/20 rounded-3xl -z-10" />
                <img
                  src={aboutImage || 'https://images.pexels.com/photos/3992868/pexels-photo-3992868.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt="Professional salon styling"
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                />
              </div>

              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#3D2E1F] mb-6">
                  Your Journey to Beauty Begins Here
                </h2>
                <p className="text-base text-[#6B5A4A] mb-6 leading-relaxed">
                  At Geetandrim, we believe beauty is more than skin deep. Our holistic approach combines the finest techniques, premium products, and personalized care to bring out your natural radiance.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    'Personalized consultation for every client',
                    'Hygienic and luxurious salon environment',
                    'Latest techniques and trending styles',
                    'Transparent pricing with no hidden costs',
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#C17B5C] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-[#3D2E1F] font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onNavigate('about')}
                  className="bg-[#C17B5C] hover:bg-[#A6684C] text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Learn More About Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-br from-[#F5E6D3] to-[#E8D5C4]">
        <div className="w-full px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#3D2E1F] mb-4">
                Our Work Gallery
              </h2>
              <p className="text-[#6B5A4A] text-sm md:text-base">
                Witness the transformations that make us proud
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryImages.map((img, index) => (
                <div
                  key={img.image_key || index}
                  className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square group cursor-pointer"
                  onClick={() => onNavigate('gallery')}
                >
                  <img
                    src={img.image_url}
                    alt={img.title || `Gallery ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3D2E1F]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <button
                onClick={() => onNavigate('gallery')}
                className="bg-[#C17B5C] hover:bg-[#A6684C] text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                View Full Gallery
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-br from-[#3D2E1F] via-[#5A4A3A] to-[#6B5A4A] text-white">
        <div className="w-full px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Look?
            </h2>
            <p className="text-lg text-white/80 mb-10 max-w-2xl mx-auto">
              Book your appointment today and experience the Geetandrim difference. Our experts are ready to help you shine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('booking')}
                className="bg-white text-[#3D2E1F] hover:bg-[#F5E6D3] px-10 py-4 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Book Appointment
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="border-2 border-white hover:bg-white hover:text-[#3D2E1F] text-white px-10 py-4 rounded-full text-lg font-bold transition-all duration-300"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
