import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HeroProps {
  onBookNow: () => void;
}

export const Hero = ({ onBookNow }: HeroProps) => {
  const [heroImages, setHeroImages] = useState<string[]>([]);

  useEffect(() => {
    loadHeroImages();
  }, []);

  const loadHeroImages = async () => {
    const { data } = await supabase
      .from('site_images')
      .select('image_url, display_order')
      .eq('category', 'hero_grid')
      .eq('is_active', true)
      .order('display_order')
      .limit(4);

    if (data && data.length === 4) {
      setHeroImages(data.map(img => img.image_url));
    } else {
      setHeroImages([
        'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/3997982/pexels-photo-3997982.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/3738379/pexels-photo-3738379.jpeg?auto=compress&cs=tinysrgb&w=600',
      ]);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#F5E6D3] via-[#E8D5C4] to-[#D4C4B0] overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#C17B5C] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#8B9D7F] rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#B89968] rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-16 flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="flex-1 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="text-[#C17B5C]" size={20} />
            <span className="text-[#5A4A3A] font-medium">Premium Salon Experience</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-[#3D2E1F] mb-6 leading-tight">
            Discover Your
            <br />
            <span className="text-[#C17B5C]">Natural Beauty</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#6B5A4A] mb-8 leading-relaxed">
            Where elegance meets expertise. Experience transformative beauty treatments in a serene, luxurious environment.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={onBookNow}
              className="bg-[#C17B5C] text-white px-10 py-4 rounded-full text-lg font-semibold hover:bg-[#A6684C] transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              Book Your Appointment
            </button>
            <button
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              className="bg-white text-[#C17B5C] px-10 py-4 rounded-full text-lg font-semibold hover:bg-[#3D2E1F] hover:text-white transition-all duration-300 border-2 border-[#C17B5C]"
            >
              Explore Services
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-[#6B5A4A]/20">
            <div>
              <div className="text-3xl font-bold text-[#C17B5C] mb-1">15+</div>
              <div className="text-sm text-[#6B5A4A]">Expert Stylists</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#C17B5C] mb-1">5000+</div>
              <div className="text-sm text-[#6B5A4A]">Happy Clients</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#C17B5C] mb-1">12+</div>
              <div className="text-sm text-[#6B5A4A]">Years Experience</div>
            </div>
          </div>
        </div>

        <div className="flex-1 relative max-w-xl">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-[#C17B5C]/20 to-[#8B9D7F]/20 rounded-3xl blur-2xl"></div>
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img
                  src={heroImages[0] || 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt="Hair Styling"
                  className="rounded-2xl shadow-2xl w-full h-64 object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <img
                  src={heroImages[1] || 'https://images.pexels.com/photos/3997982/pexels-photo-3997982.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt="Facial Treatment"
                  className="rounded-2xl shadow-2xl w-full h-48 object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-4 mt-8">
                <img
                  src={heroImages[2] || 'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt="Bridal Makeup"
                  className="rounded-2xl shadow-2xl w-full h-48 object-cover transform hover:scale-105 transition-transform duration-500"
                />
                <img
                  src={heroImages[3] || 'https://images.pexels.com/photos/3738379/pexels-photo-3738379.jpeg?auto=compress&cs=tinysrgb&w=600'}
                  alt="Hair Treatment"
                  className="rounded-2xl shadow-2xl w-full h-64 object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
