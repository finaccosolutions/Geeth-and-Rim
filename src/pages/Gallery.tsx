import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GalleryImage } from '../types';

export const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const loadGalleryImages = async () => {
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (data && data.length > 0) {
      setImages(data);
    } else {
      setImages([
        {
          id: '1',
          title: 'Bridal Makeup',
          image_url: 'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=800',
          category: 'Bridal',
          is_active: true,
          display_order: 1,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Hair Styling',
          image_url: 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800',
          category: 'Hair',
          is_active: true,
          display_order: 2,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Nail Art',
          image_url: 'https://images.pexels.com/photos/1582750/pexels-photo-1582750.jpeg?auto=compress&cs=tinysrgb&w=800',
          category: 'Nails',
          is_active: true,
          display_order: 3,
          created_at: new Date().toISOString()
        },
        {
          id: '4',
          title: 'Facial Treatment',
          image_url: 'https://images.pexels.com/photos/3997982/pexels-photo-3997982.jpeg?auto=compress&cs=tinysrgb&w=800',
          category: 'Facial',
          is_active: true,
          display_order: 4,
          created_at: new Date().toISOString()
        },
        {
          id: '5',
          title: 'Makeup',
          image_url: 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg?auto=compress&cs=tinysrgb&w=800',
          category: 'Makeup',
          is_active: true,
          display_order: 5,
          created_at: new Date().toISOString()
        },
        {
          id: '6',
          title: 'Salon Interior',
          image_url: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800',
          category: 'Salon',
          is_active: true,
          display_order: 6,
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  const categories = ['all', ...Array.from(new Set(images.map((img) => img.category)))];

  const filteredImages =
    selectedCategory === 'all'
      ? images
      : images.filter((img) => img.category === selectedCategory);

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-[#264025] mb-4">Gallery</h1>
          <p className="text-xl text-[#82896E] max-w-2xl mx-auto">
            Explore our portfolio of stunning transformations and happy clients
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 capitalize ${
                selectedCategory === category
                  ? 'bg-[#AD6B4B] text-white shadow-lg'
                  : 'bg-white text-[#264025] hover:bg-[#DDCBB7]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#264025]/90 via-[#264025]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                <div>
                  <h3 className="text-white text-xl font-bold mb-1">{image.title}</h3>
                  <p className="text-[#DDCBB7] text-sm capitalize">{image.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-[#AD6B4B] transition-colors duration-300"
            >
              <X size={32} />
            </button>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
            <div className="mt-4 text-center">
              <h3 className="text-white text-2xl font-bold mb-2">{selectedImage.title}</h3>
              <p className="text-[#DDCBB7] capitalize">{selectedImage.category}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
