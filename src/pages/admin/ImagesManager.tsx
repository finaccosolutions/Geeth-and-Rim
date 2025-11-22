import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { HeroImage, GalleryImage } from '../../types';

export const ImagesManager = () => {
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [activeTab, setActiveTab] = useState<'hero' | 'gallery'>('hero');
  const [isAdding, setIsAdding] = useState(false);
  const [editingImage, setEditingImage] = useState<HeroImage | GalleryImage | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    category: 'General',
    is_active: true,
  });

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    const [heroResult, galleryResult] = await Promise.all([
      supabase.from('hero_images').select('*').order('display_order'),
      supabase.from('gallery_images').select('*').order('display_order'),
    ]);

    if (heroResult.data) setHeroImages(heroResult.data);
    if (galleryResult.data) setGalleryImages(galleryResult.data);
  };

  const handleSave = async () => {
    if (activeTab === 'hero') {
      if (editingImage) {
        await supabase
          .from('hero_images')
          .update({
            title: formData.title,
            image_url: formData.image_url,
            is_active: formData.is_active,
          })
          .eq('id', editingImage.id);
      } else {
        await supabase.from('hero_images').insert({
          title: formData.title,
          image_url: formData.image_url,
          is_active: formData.is_active,
          display_order: heroImages.length,
        });
      }
    } else {
      if (editingImage) {
        await supabase
          .from('gallery_images')
          .update({
            title: formData.title,
            image_url: formData.image_url,
            category: formData.category,
            is_active: formData.is_active,
          })
          .eq('id', editingImage.id);
      } else {
        await supabase.from('gallery_images').insert({
          title: formData.title,
          image_url: formData.image_url,
          category: formData.category,
          is_active: formData.is_active,
          display_order: galleryImages.length,
        });
      }
    }

    handleCancel();
    loadImages();
  };

  const handleEdit = (image: HeroImage | GalleryImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      image_url: image.image_url,
      category: 'category' in image ? image.category : 'General',
      is_active: image.is_active,
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      const table = activeTab === 'hero' ? 'hero_images' : 'gallery_images';
      await supabase.from(table).delete().eq('id', id);
      loadImages();
    }
  };

  const handleCancel = () => {
    setEditingImage(null);
    setIsAdding(false);
    setFormData({
      title: '',
      image_url: '',
      category: 'General',
      is_active: true,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('hero')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'hero'
                ? 'bg-[#AD6B4B] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hero Images
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'gallery'
                ? 'bg-[#AD6B4B] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Gallery Images
          </button>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 bg-[#AD6B4B] text-white px-4 py-2 rounded-lg hover:bg-[#7B4B36] transition-colors"
        >
          <Plus size={20} />
          <span>Add Image</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#DDCBB7]/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-[#264025] mb-4">
            {editingImage ? 'Edit Image' : 'Add New Image'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">Image URL</label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder="https://images.pexels.com/..."
              />
            </div>
            {activeTab === 'gallery' && (
              <div>
                <label className="block text-sm font-semibold text-[#264025] mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                  placeholder="e.g., Bridal, Hair, Nails"
                />
              </div>
            )}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="image_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 text-[#AD6B4B] border-gray-300 rounded focus:ring-[#AD6B4B]"
              />
              <label htmlFor="image_active" className="ml-2 text-[#264025] font-medium">
                Active
              </label>
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-[#AD6B4B] text-white px-6 py-2 rounded-lg hover:bg-[#7B4B36] transition-colors"
            >
              <Save size={18} />
              <span>Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'hero' ? heroImages : galleryImages).map((image) => (
          <div key={image.id} className="bg-white rounded-xl shadow-lg overflow-hidden group">
            <div className="relative h-48">
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(image)}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(image.id)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-[#264025] mb-1">{image.title}</h4>
              {'category' in image && (
                <p className="text-sm text-[#82896E] mb-2">{image.category}</p>
              )}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  image.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {image.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
