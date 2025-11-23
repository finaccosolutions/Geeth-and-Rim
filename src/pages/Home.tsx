import { useEffect, useState, useRef } from 'react';
import { Hero } from '../components/Hero';
import { supabase } from '../lib/supabase';
import { Service, ServiceCategory } from '../types';
import { ChevronLeft, ChevronRight, Sparkles, Clock, DollarSign } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export const Home = ({ onNavigate }: HomeProps) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
    const [categoriesResult, servicesResult] = await Promise.all([
      supabase.from('service_categories').select('*').order('display_order'),
      supabase.from('services').select('*').eq('is_active', true).order('display_order'),
    ]);

    if (categoriesResult.data) setCategories(categoriesResult.data);
    if (servicesResult.data) setServices(servicesResult.data);
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

  const categoryImages: Record<string, string> = {
    'Haircut & Styling': 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Face Care': 'https://images.pexels.com/photos/3997982/pexels-photo-3997982.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Wedding Packages': 'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Hair Treatments': 'https://images.pexels.com/photos/3738379/pexels-photo-3738379.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Body Care': 'https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Hair Removal': 'https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg?auto=compress&cs=tinysrgb&w=400',
    'Nails': 'https://images.pexels.com/photos/1582750/pexels-photo-1582750.jpeg?auto=compress&cs=tinysrgb&w=400',
  };

  const selectedServices = selectedCategory ? getServicesByCategory(selectedCategory) : [];

  return (
    <div className="min-h-screen bg-[#DDCBB7]">
      <Hero onBookNow={() => onNavigate('booking')} />

      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-[#DDCBB7]/30">
        <div className="w-full px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center space-x-2 mb-4">
                <Sparkles className="text-[#AD6B4B]" size={28} />
                <h2 className="text-3xl md:text-5xl font-bold text-[#264025]">
                  Discover Our Services
                </h2>
                <Sparkles className="text-[#AD6B4B]" size={28} />
              </div>
              <p className="text-sm md:text-base text-[#7B4B36] max-w-2xl mx-auto">
                Browse through our expertly curated categories and find the perfect treatment for you
              </p>
            </div>

            <div className="relative mb-12">
              <button
                onClick={() => scrollCategories('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-[#264025] text-white rounded-full shadow-xl hover:bg-[#7B4B36] transition-all duration-300 flex items-center justify-center"
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
                      className={`flex-shrink-0 w-64 cursor-pointer transition-all duration-300 ${
                        isSelected ? 'scale-105' : 'hover:scale-102'
                      }`}
                    >
                      <div className={`relative h-80 rounded-2xl overflow-hidden shadow-lg ${
                        isSelected ? 'ring-4 ring-[#AD6B4B]' : ''
                      }`}>
                        <img
                          src={categoryImages[category.name] || 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${
                          isSelected
                            ? 'from-[#AD6B4B] via-[#AD6B4B]/60 to-transparent'
                            : 'from-[#264025]/90 via-[#264025]/50 to-transparent'
                        } transition-all duration-300`} />
                        <div className="absolute inset-x-0 bottom-0 p-6">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {category.name}
                          </h3>
                          <p className="text-sm text-white/90">
                            {categoryServices.length} Services Available
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                            <div className="w-4 h-4 bg-[#AD6B4B] rounded-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => scrollCategories('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-[#264025] text-white rounded-full shadow-xl hover:bg-[#7B4B36] transition-all duration-300 flex items-center justify-center"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {selectedCategory && selectedServices.length > 0 && (
              <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-[#264025]">
                    {categories.find(c => c.id === selectedCategory)?.name} Services
                  </h3>
                  <button
                    onClick={() => onNavigate('booking')}
                    className="bg-[#AD6B4B] hover:bg-[#7B4B36] text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg text-sm"
                  >
                    Book Now
                  </button>
                </div>

                <div className="relative">
                  {selectedServices.length > 3 && (
                    <>
                      <button
                        onClick={() => scrollServices('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 bg-[#82896E] text-white rounded-full shadow-lg hover:bg-[#264025] transition-all duration-300 flex items-center justify-center"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => scrollServices('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 bg-[#82896E] text-white rounded-full shadow-lg hover:bg-[#264025] transition-all duration-300 flex items-center justify-center"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}

                  <div
                    ref={servicesScrollRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {selectedServices.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => onNavigate('booking', service)}
                        className="flex-shrink-0 w-72 bg-gradient-to-br from-[#DDCBB7]/20 to-white rounded-xl p-6 border-2 border-[#DDCBB7] hover:border-[#AD6B4B] hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      >
                        <h4 className="font-bold text-[#264025] text-lg mb-3 group-hover:text-[#AD6B4B] transition-colors min-h-[3.5rem] line-clamp-2">
                          {service.name}
                        </h4>
                        {service.description && (
                          <p className="text-sm text-[#82896E] mb-4 line-clamp-2 min-h-[2.5rem]">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between pt-4 border-t border-[#DDCBB7]">
                          <div className="flex items-center space-x-2 text-[#7B4B36]">
                            <Clock size={16} />
                            <span className="text-sm font-medium">{service.duration_minutes} min</span>
                          </div>
                          <div className="flex items-center space-x-1 text-[#AD6B4B] font-bold text-lg">
                            <span>₹</span>
                            <span>{service.price}</span>
                          </div>
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

      <section className="py-16 md:py-20 bg-[#82896E]">
        <div className="w-full px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Why Geetandrim Stands Out
              </h2>
              <p className="text-[#DDCBB7] text-sm md:text-base">
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
                  <div className="text-4xl font-bold text-[#AD6B4B] mb-2">{item.count}</div>
                  <h3 className="font-bold text-white text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-[#DDCBB7]">{item.desc}</p>
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
                <div className="absolute -inset-4 bg-gradient-to-br from-[#AD6B4B]/20 to-[#264025]/20 rounded-3xl -z-10" />
                <img
                  src="https://images.pexels.com/photos/3992868/pexels-photo-3992868.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Professional salon styling"
                  className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                />
              </div>

              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#264025] mb-6">
                  Your Journey to Beauty Begins Here
                </h2>
                <p className="text-base text-[#7B4B36] mb-6 leading-relaxed">
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
                      <div className="w-6 h-6 rounded-full bg-[#AD6B4B] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-[#264025] font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onNavigate('about')}
                  className="bg-[#264025] hover:bg-[#82896E] text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Learn More About Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-br from-[#DDCBB7] to-[#82896E]/30">
        <div className="w-full px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#264025] mb-4">
                Our Work Gallery
              </h2>
              <p className="text-[#7B4B36] text-sm md:text-base">
                Witness the transformations that make us proud
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                'https://images.pexels.com/photos/3992868/pexels-photo-3992868.jpeg?auto=compress&cs=tinysrgb&w=400',
                'https://images.pexels.com/photos/3738379/pexels-photo-3738379.jpeg?auto=compress&cs=tinysrgb&w=400',
                'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=400',
                'https://images.pexels.com/photos/3997982/pexels-photo-3997982.jpeg?auto=compress&cs=tinysrgb&w=400',
                'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=400',
                'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=400',
                'https://images.pexels.com/photos/1582750/pexels-photo-1582750.jpeg?auto=compress&cs=tinysrgb&w=400',
                'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=400',
              ].map((img, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 aspect-square group cursor-pointer"
                  onClick={() => onNavigate('gallery')}
                >
                  <img
                    src={img}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#264025]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <button
                onClick={() => onNavigate('gallery')}
                className="bg-[#264025] hover:bg-[#AD6B4B] text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                View Full Gallery
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-gradient-to-br from-[#264025] via-[#7B4B36] to-[#AD6B4B] text-white">
        <div className="w-full px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Look?
            </h2>
            <p className="text-lg text-[#DDCBB7] mb-10 max-w-2xl mx-auto">
              Book your appointment today and experience the Geetandrim difference. Our experts are ready to help you shine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => onNavigate('booking')}
                className="bg-white text-[#264025] hover:bg-[#DDCBB7] px-10 py-4 rounded-full text-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Book Appointment
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="border-2 border-white hover:bg-white hover:text-[#264025] text-white px-10 py-4 rounded-full text-lg font-bold transition-all duration-300"
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
