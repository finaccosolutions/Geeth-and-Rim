import { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { ServiceCard } from '../components/ServiceCard';
import { supabase } from '../lib/supabase';
import { Service } from '../types';
import { Sparkles, Award, Users, Clock } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export const Home = ({ onNavigate }: HomeProps) => {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);

  useEffect(() => {
    loadFeaturedServices();
  }, []);

  const loadFeaturedServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .limit(6);

    if (data) setFeaturedServices(data);
  };

  const handleBookService = (service: Service) => {
    onNavigate('booking', service);
  };

  return (
    <div className="min-h-screen">
      <Hero onBookNow={() => onNavigate('booking')} />

      <section className="py-20 bg-gradient-to-b from-white to-[#DDCBB7]/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Sparkles, title: 'Premium Quality', desc: 'Top-notch products and services' },
              { icon: Award, title: 'Expert Team', desc: 'Certified professionals' },
              { icon: Users, title: '10,000+ Clients', desc: 'Trusted by thousands' },
              { icon: Clock, title: 'Flexible Hours', desc: 'Open 7 days a week' },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#AD6B4B] to-[#7B4B36] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-[#264025] mb-2">{item.title}</h3>
                <p className="text-[#82896E]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#264025] mb-4">
              Featured Services
            </h2>
            <p className="text-xl text-[#82896E] max-w-2xl mx-auto">
              Discover our most popular treatments designed to enhance your natural beauty
            </p>
          </div>

          {featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredServices.map((service) => (
                <ServiceCard key={service.id} service={service} onBook={handleBookService} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#82896E] text-lg">Loading services...</p>
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => onNavigate('services')}
              className="bg-[#264025] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#AD6B4B] transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              View All Services
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-[#DDCBB7]/20 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#264025] mb-6">
                Why Choose Geetandrim?
              </h2>
              <p className="text-lg text-[#82896E] mb-8 leading-relaxed">
                We are committed to providing exceptional beauty and wellness services in a luxurious environment.
                Our team of experienced professionals uses only premium products to ensure you look and feel your best.
              </p>
              <ul className="space-y-4">
                {[
                  'Experienced and certified professionals',
                  'Premium quality products',
                  'Hygienic and relaxing environment',
                  'Customized treatment plans',
                  'Competitive pricing',
                ].map((item, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-[#AD6B4B] flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[#264025] font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Salon interior"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#AD6B4B] text-white p-8 rounded-2xl shadow-xl">
                <div className="text-5xl font-bold mb-2">15+</div>
                <div className="text-lg">Years of Excellence</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
