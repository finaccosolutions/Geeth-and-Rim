import { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { supabase } from '../lib/supabase';
import { Service, ServiceCategory } from '../types';
import { Scissors, Sparkles, Heart, Flower2 } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string, data?: unknown) => void;
}

export const Home = ({ onNavigate }: HomeProps) => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [services, setServices] = useState<Service[]>([]);

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

  return (
    <div className="min-h-screen">
      <Hero onBookNow={() => onNavigate('booking')} />

      <section className="py-16 bg-white">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Salon ambiance"
                className="rounded-3xl shadow-2xl w-full h-[400px] object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl md:text-5xl font-bold text-[#264025] mb-6">
                Welcome to Geetandrim
              </h2>
              <p className="text-lg text-[#82896E] mb-6 leading-relaxed">
                Experience the perfect blend of traditional beauty care and modern styling techniques.
                Our expert team is dedicated to bringing out your natural beauty with premium services
                tailored just for you.
              </p>
              <button
                onClick={() => onNavigate('booking')}
                className="bg-[#AD6B4B] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#7B4B36] transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Book Your Appointment
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-[#DDCBB7]/10 to-white">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-[#264025] mb-4">
              Our Services
            </h2>
            <p className="text-xl text-[#82896E] max-w-2xl mx-auto">
              Comprehensive beauty and grooming solutions for every occasion
            </p>
          </div>

          <div className="space-y-12">
            {categories.map((category) => {
              const categoryServices = getServicesByCategory(category.id);
              if (categoryServices.length === 0) return null;

              return (
                <div key={category.id} className="bg-white rounded-3xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-[#264025] to-[#7B4B36] p-6 md:p-8">
                    <h3 className="text-3xl md:text-4xl font-bold text-white">{category.name}</h3>
                    {category.description && (
                      <p className="text-[#DDCBB7] text-lg mt-2">{category.description}</p>
                    )}
                  </div>
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {categoryServices.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => onNavigate('booking', service)}
                          className="group p-4 rounded-xl bg-gradient-to-br from-[#DDCBB7]/10 to-white border-2 border-[#DDCBB7] hover:border-[#AD6B4B] hover:shadow-lg transition-all duration-300 cursor-pointer"
                        >
                          <h4 className="font-bold text-[#264025] mb-2 group-hover:text-[#AD6B4B] transition-colors line-clamp-2">
                            {service.name}
                          </h4>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#82896E]">{service.duration_minutes} mins</span>
                            <span className="font-bold text-[#AD6B4B]">₹{service.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('booking')}
              className="bg-[#264025] text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-[#AD6B4B] transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Book Any Service Now
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-[#264025] mb-6">
                Why Geetandrim?
              </h2>
              <div className="space-y-6">
                {[
                  {
                    icon: Scissors,
                    title: 'Expert Stylists',
                    desc: 'Our certified professionals bring years of experience and creativity',
                  },
                  {
                    icon: Sparkles,
                    title: 'Premium Products',
                    desc: 'We use only the finest quality products for exceptional results',
                  },
                  {
                    icon: Heart,
                    title: 'Personalized Care',
                    desc: 'Every service is customized to match your unique style and needs',
                  },
                  {
                    icon: Flower2,
                    title: 'Luxurious Ambiance',
                    desc: 'Relax in our serene and hygienic environment',
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 group">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#AD6B4B] to-[#7B4B36] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[#264025] mb-1">{item.title}</h3>
                      <p className="text-[#82896E]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.pexels.com/photos/3992868/pexels-photo-3992868.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Salon service 1"
                className="rounded-2xl shadow-xl h-64 object-cover w-full"
              />
              <img
                src="https://images.pexels.com/photos/3738379/pexels-photo-3738379.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Salon service 2"
                className="rounded-2xl shadow-xl h-64 object-cover w-full mt-8"
              />
              <img
                src="https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Salon service 3"
                className="rounded-2xl shadow-xl h-64 object-cover w-full"
              />
              <img
                src="https://images.pexels.com/photos/3997982/pexels-photo-3997982.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Salon service 4"
                className="rounded-2xl shadow-xl h-64 object-cover w-full mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-[#264025] to-[#7B4B36] text-white">
        <div className="w-full px-4 md:px-8 lg:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready for Your Transformation?
            </h2>
            <p className="text-xl text-[#DDCBB7] mb-8">
              Book your appointment today and experience the Geetandrim difference
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => onNavigate('booking')}
                className="bg-[#AD6B4B] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#DDCBB7] hover:text-[#264025] transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Book Appointment
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
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
