import { useEffect, useState, useRef } from 'react';
import { Hero } from '../components/Hero';
import { supabase } from '../lib/supabase';
import { Service, ServiceCategory } from '../types';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export const Home = ({ onNavigate }: HomeProps) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const getServicesByCategory = (categoryId: string) => {
    return services.filter((s) => s.category_id === categoryId);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Hero onBookNow={() => onNavigate('booking')} />

      <section className="py-12 md:py-16 bg-white">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#264025] mb-2">
              Explore Our Services
            </h2>
            <p className="text-xs md:text-sm text-[#82896E]">
              Click on any category to see all available services
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {categories.map((category) => {
              const categoryServices = getServicesByCategory(category.id);
              if (categoryServices.length === 0) return null;

              const isExpanded = expandedCategory === category.id;

              return (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-[#AD6B4B] transition-colors duration-300"
                >
                  <button
                    onClick={() =>
                      setExpandedCategory(isExpanded ? null : category.id)
                    }
                    className="w-full px-4 md:px-6 py-4 md:py-5 flex items-center justify-between bg-gradient-to-r from-[#264025] to-[#7B4B36] hover:from-[#7B4B36] hover:to-[#264025] transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-lg md:text-xl font-bold text-white">
                        {category.name}
                      </span>
                      <span className="text-xs md:text-sm text-[#DDCBB7]">
                        ({categoryServices.length} services)
                      </span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-white transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="bg-gray-50 p-4 md:p-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {categoryServices.map((service) => (
                          <div
                            key={service.id}
                            onClick={() => onNavigate('booking', service)}
                            className="group bg-white p-3 md:p-4 rounded-lg border border-gray-100 hover:border-[#AD6B4B] hover:shadow-md transition-all duration-300 cursor-pointer"
                          >
                            <h4 className="font-semibold text-[#264025] text-xs md:text-sm mb-2 group-hover:text-[#AD6B4B] transition-colors line-clamp-2 min-h-[2.5rem] md:min-h-[3rem]">
                              {service.name}
                            </h4>
                            <div className="flex items-center justify-between text-xs md:text-sm">
                              <span className="text-[#82896E]">
                                {service.duration_minutes}m
                              </span>
                              <span className="font-bold text-[#AD6B4B]">
                                ₹{service.price}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-8 md:mt-10">
            <button
              onClick={() => onNavigate('booking')}
              className="bg-[#264025] hover:bg-[#7B4B36] text-white px-8 md:px-10 py-3 md:py-4 rounded-full text-sm md:text-base font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gray-50">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 md:mb-14">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#264025] mb-2">
                Why Choose Geetandrim
              </h2>
              <p className="text-xs md:text-sm text-[#82896E]">
                Experience excellence in beauty care
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {[
                { title: 'Expert Stylists', desc: 'Certified professionals', icon: '👩‍💼' },
                { title: 'Premium Products', desc: 'Finest quality brands', icon: '✨' },
                { title: 'Personalized Care', desc: 'Customized treatments', icon: '💝' },
                { title: 'Luxury Ambiance', desc: 'Serene environment', icon: '🏛️' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-5 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 text-center"
                >
                  <div className="text-3xl md:text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-[#264025] text-sm md:text-base mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-sm text-[#82896E]">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-white">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#264025] mb-4 md:mb-6">
                  Experience True Beauty Care
                </h2>
                <p className="text-xs md:text-sm text-[#82896E] mb-4 md:mb-6 leading-relaxed">
                  At Geetandrim, we believe true beauty comes from feeling confident and cared for. Our expert team combines traditional beauty practices with modern techniques to deliver exceptional results.
                </p>
                <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                  {[
                    'Highly trained and certified stylists',
                    'Premium international and local brands',
                    'Hygienic and peaceful salon environment',
                    'Personalized beauty consultation',
                    'Competitive and transparent pricing',
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-xs md:text-sm">
                      <span className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[#AD6B4B] flex-shrink-0" />
                      <span className="text-[#264025]">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => onNavigate('booking')}
                  className="bg-[#AD6B4B] hover:bg-[#7B4B36] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Explore Our Services
                </button>
              </div>
              <div className="order-first lg:order-last">
                <img
                  src="https://images.pexels.com/photos/3992868/pexels-photo-3992868.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Professional salon styling"
                  className="rounded-2xl shadow-lg w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gray-50">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#264025] mb-2">
                Our Gallery
              </h2>
              <p className="text-xs md:text-sm text-[#82896E]">
                Beautiful transformations by our team
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {[
                'https://images.pexels.com/photos/3992868/pexels-photo-3992868.jpeg?auto=compress&cs=tinysrgb&w=600',
                'https://images.pexels.com/photos/3738379/pexels-photo-3738379.jpeg?auto=compress&cs=tinysrgb&w=600',
                'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=600',
                'https://images.pexels.com/photos/3997982/pexels-photo-3997982.jpeg?auto=compress&cs=tinysrgb&w=600',
              ].map((img, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 aspect-square group"
                >
                  <img
                    src={img}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-gradient-to-br from-[#264025] to-[#7B4B36] text-white">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              Ready to Transform?
            </h2>
            <p className="text-xs md:text-sm text-[#DDCBB7] mb-6 md:mb-8">
              Book your appointment and experience the Geetandrim difference
            </p>
            <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
              <button
                onClick={() => onNavigate('booking')}
                className="bg-[#AD6B4B] hover:bg-[#DDCBB7] hover:text-[#264025] text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Book Now
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="border border-white/50 hover:border-white text-white px-6 md:px-8 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-semibold transition-all duration-300"
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
