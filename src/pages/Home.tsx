import { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { supabase } from '../lib/supabase';
import { Service, ServiceCategory } from '../types';
import { Sparkles, Award, Users, Clock, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export const Home = ({ onNavigate }: HomeProps) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('service_categories')
      .select('*')
      .order('display_order')
      .limit(6);

    if (data) setCategories(data);
  };

  return (
    <div className="min-h-screen">
      <Hero onBookNow={() => onNavigate('booking')} />

      <section className="py-20 bg-gradient-to-b from-white to-[#DDCBB7]/20">
        <div className="w-full px-4 md:px-8 lg:px-12">
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
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#264025] mb-4">
              Our Service Categories
            </h2>
            <p className="text-xl text-[#82896E] max-w-2xl mx-auto">
              Discover our comprehensive range of professional beauty services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => onNavigate('services')}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#DDCBB7] to-[#AD6B4B] p-8 cursor-pointer transform hover:scale-105 transition-all duration-500 shadow-xl hover:shadow-2xl"
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold text-white mb-3">{category.name}</h3>
                  <p className="text-white/90 mb-4">{category.description}</p>
                  <div className="flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Explore Services</span>
                    <ArrowRight className="ml-2" size={20} />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#264025]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>

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
        <div className="w-full px-4 md:px-8 lg:px-12">
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
                  <li key={index} className="flex items-center space-x-3 group">
                    <div className="w-6 h-6 rounded-full bg-[#AD6B4B] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[#264025] font-medium group-hover:text-[#7B4B36] transition-colors duration-300">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onNavigate('booking')}
                className="mt-8 bg-[#AD6B4B] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#7B4B36] transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Book Appointment Now
              </button>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Salon interior"
                className="rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#AD6B4B] text-white p-8 rounded-2xl shadow-xl transform hover:scale-110 transition-transform duration-300">
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
