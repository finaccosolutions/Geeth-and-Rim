import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { HeroImage } from '../types';

interface HeroProps {
  onBookNow: () => void;
}

export const Hero = ({ onBookNow }: HeroProps) => {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadHeroImages();
  }, []);

  const loadHeroImages = async () => {
    const { data, error } = await supabase
      .from('hero_images')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (!error && data && data.length > 0) {
      setImages(data);
    } else {
      setImages([{
        id: '1',
        title: 'Welcome',
        image_url: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1920',
        is_active: true,
        display_order: 1,
        created_at: new Date().toISOString()
      }]);
    }
  };

  useEffect(() => {
    if (images.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  if (images.length === 0) return null;

  return (
    <div className="relative h-screen overflow-hidden">
      {images.map((image, index) => (
        <div
          key={image.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-[5000ms]"
            style={{ backgroundImage: `url(${image.image_url})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#264025]/90 via-[#264025]/70 to-transparent" />
        </div>
      ))}

      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Your Beauty,
              <br />
              <span className="text-[#AD6B4B]">Our Passion</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#DDCBB7] mb-8 leading-relaxed">
              Experience premium salon services in a luxurious and relaxing environment.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onBookNow}
                className="bg-[#AD6B4B] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#7B4B36] transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                Book Appointment
              </button>
              <button className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300 border-2 border-white/30">
                View Services
              </button>
            </div>
          </div>
        </div>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-300 group"
          >
            <ChevronLeft className="text-white group-hover:scale-110 transition-transform" size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-300 group"
          >
            <ChevronRight className="text-white group-hover:scale-110 transition-transform" size={24} />
          </button>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-[#AD6B4B] w-8' : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
