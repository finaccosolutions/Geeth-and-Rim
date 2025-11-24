import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface SiteImage {
  id: string;
  image_key: string;
  title: string;
  image_url: string;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export const ImagesManager = () => {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [activeTab, setActiveTab] = useState<string>('hero');
  const [isAdding, setIsAdding] = useState(false);
  const [editingImage, setEditingImage] = useState<SiteImage | null>(null);
  const [editingGalleryImage, setEditingGalleryImage] = useState<GalleryImage | null>(null);
  const [galleryCategory, setGalleryCategory] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    image_key: '',
    is_active: true,
  });

  const tabs = [
    { id: 'hero', name: 'Hero Section', description: 'Main homepage hero images (4 images)' },
    { id: 'hero_grid', name: 'Hero Grid', description: 'Homepage hero grid images (4 images)' },
    { id: 'category', name: 'Service Categories', description: 'Category thumbnail images' },
    { id: 'home_gallery', name: 'Home Gallery', description: 'Gallery showcase on homepage' },
    { id: 'about', name: 'About Section', description: 'About page images' },
    { id: 'gallery_page', name: 'Gallery Page', description: 'Manage gallery page images with categories' },
  ];

  const galleryCategories = ['Bridal', 'Hair', 'Nails', 'Facial', 'Makeup', 'Salon', 'Treatment', 'Other'];

  useEffect(() => {
    if (activeTab === 'gallery_page') {
      loadGalleryImages();
    } else {
      loadImages();
    }
  }, [activeTab]);

  const loadImages = async () => {
    const { data } = await supabase
      .from('site_images')
      .select('*')
      .order('category, display_order');

    if (data) setImages(data);
  };

  const loadGalleryImages = async () => {
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .order('category, display_order');

    if (data) setGalleryImages(data);
  };

  const handleSave = async () => {
    if (activeTab === 'gallery_page') {
      if (editingGalleryImage) {
        await supabase
          .from('gallery_images')
          .update({
            title: formData.title,
            image_url: formData.image_url,
            category: galleryCategory,
            is_active: formData.is_active,
          })
          .eq('id', editingGalleryImage.id);
      } else {
        const categoryImages = galleryImages.filter((img) => img.category === galleryCategory);
        await supabase.from('gallery_images').insert({
          title: formData.title,
          image_url: formData.image_url,
          category: galleryCategory,
          is_active: formData.is_active,
          display_order: categoryImages.length,
        });
      }
      handleCancel();
      loadGalleryImages();
    } else {
      if (editingImage) {
        await supabase
          .from('site_images')
          .update({
            title: formData.title,
            image_url: formData.image_url,
            is_active: formData.is_active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingImage.id);
      } else {
        const categoryImages = images.filter((img) => img.category === activeTab);
        await supabase.from('site_images').insert({
          image_key: formData.image_key,
          title: formData.title,
          image_url: formData.image_url,
          category: activeTab,
          is_active: formData.is_active,
          display_order: categoryImages.length,
        });
      }
      handleCancel();
      loadImages();
    }
  };

  const handleEdit = (image: SiteImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title,
      image_url: image.image_url,
      image_key: image.image_key,
      is_active: image.is_active,
    });
    setIsAdding(true);
  };

  const handleEditGallery = (image: GalleryImage) => {
    setEditingGalleryImage(image);
    setGalleryCategory(image.category);
    setFormData({
      title: image.title,
      image_url: image.image_url,
      image_key: '',
      is_active: image.is_active,
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this image?')) {
      if (activeTab === 'gallery_page') {
        await supabase.from('gallery_images').delete().eq('id', id);
        loadGalleryImages();
      } else {
        await supabase.from('site_images').delete().eq('id', id);
        loadImages();
      }
    }
  };

  const handleCancel = () => {
    setEditingImage(null);
    setEditingGalleryImage(null);
    setGalleryCategory('');
    setIsAdding(false);
    setFormData({
      title: '',
      image_url: '',
      image_key: '',
      is_active: true,
    });
  };

  const currentTabImages = activeTab === 'gallery_page' ? [] : images.filter((img) => img.category === activeTab);
  const currentTabInfo = tabs.find((tab) => tab.id === activeTab);
  const isGalleryTab = activeTab === 'gallery_page';

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#264025] mb-2">Image Management</h2>
        <p className="text-sm text-[#82896E]">
          Organize and manage all website images by category
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {tabs.map((tab) => {
          const count = tab.id === 'gallery_page'
            ? galleryImages.length
            : images.filter((img) => img.category === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-[#AD6B4B] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{tab.name}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id
                      ? 'bg-white/30 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {currentTabInfo && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-1">{currentTabInfo.name}</h3>
          <p className="text-sm text-blue-800">{currentTabInfo.description}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#264025]">
            {currentTabInfo?.name || 'Images'}
          </h3>
          <p className="text-sm text-[#82896E]">
            {isGalleryTab ? galleryImages.length : currentTabImages.length} image{(isGalleryTab ? galleryImages.length : currentTabImages.length) !== 1 ? 's' : ''} in this
            category
          </p>
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
        <div className="bg-[#DDCBB7]/20 rounded-xl p-6 mb-6 border-2 border-[#AD6B4B]">
          <h3 className="text-xl font-bold text-[#264025] mb-4">
            {(editingImage || editingGalleryImage) ? 'Edit Image' : `Add New Image to ${currentTabInfo?.name}`}
          </h3>
          <div className="space-y-4">
            {isGalleryTab && (
              <div>
                <label className="block text-sm font-semibold text-[#264025] mb-2">
                  Gallery Category
                </label>
                <select
                  value={galleryCategory}
                  onChange={(e) => setGalleryCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                >
                  <option value="">Select Category</option>
                  {galleryCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <p className="text-xs text-[#82896E] mt-1">
                  Images will be grouped by this category on the Gallery page
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder={isGalleryTab ? "e.g., Bridal Makeup, Hair Styling" : "e.g., Haircut Service, Hero Banner"}
              />
            </div>
            {!isGalleryTab && !editingImage && (
              <div>
                <label className="block text-sm font-semibold text-[#264025] mb-2">
                  Image Key (unique identifier)
                </label>
                <input
                  type="text"
                  value={formData.image_key}
                  onChange={(e) => setFormData({ ...formData, image_key: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                  placeholder={`e.g., ${activeTab}_main_banner`}
                />
                <p className="text-xs text-[#82896E] mt-1">
                  Used to identify this image in the code. Must be unique.
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">Image URL</label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder="https://images.pexels.com/..."
              />
              {formData.image_url && (
                <div className="mt-3 p-3 bg-white rounded-lg border-2 border-[#DDCBB7]">
                  <p className="text-xs font-semibold text-[#264025] mb-2">Preview:</p>
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="image_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 text-[#AD6B4B] border-gray-300 rounded focus:ring-[#AD6B4B]"
              />
              <label htmlFor="image_active" className="ml-2 text-[#264025] font-medium">
                Active (visible on website)
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

      {isGalleryTab ? (
        galleryImages.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-[#DDCBB7]">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-gray-400" size={40} />
            </div>
            <p className="text-[#82896E] text-lg mb-2">No gallery images yet</p>
            <p className="text-sm text-[#82896E]">
              Click "Add Image" to upload your first gallery image
            </p>
          </div>
        ) : (
          <div>
            {galleryCategories.map((category) => {
              const categoryImages = galleryImages.filter((img) => img.category === category);
              if (categoryImages.length === 0) return null;

              return (
                <div key={category} className="mb-8">
                  <h4 className="text-xl font-bold text-[#264025] mb-4 flex items-center">
                    <span>{category}</span>
                    <span className="ml-3 px-3 py-1 bg-[#AD6B4B] text-white text-sm rounded-full">
                      {categoryImages.length}
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryImages.map((image) => (
                      <div
                        key={image.id}
                        className="bg-white rounded-xl shadow-lg overflow-hidden group border-2 border-gray-100 hover:border-[#AD6B4B] transition-all duration-300"
                      >
                        <div className="relative h-48">
                          <img
                            src={image.image_url}
                            alt={image.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditGallery(image)}
                              className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(image.id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-[#264025] mb-1 text-lg">{image.title}</h4>
                          <p className="text-xs text-gray-500 mb-3">Category: {image.category}</p>
                          <div className="flex items-center justify-between">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                image.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {image.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="text-xs text-gray-500">Order: {image.display_order}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : currentTabImages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-[#DDCBB7]">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="text-gray-400" size={40} />
          </div>
          <p className="text-[#82896E] text-lg mb-2">No images in this category yet</p>
          <p className="text-sm text-[#82896E]">
            Click "Add Image" to upload your first image to {currentTabInfo?.name}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTabImages.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden group border-2 border-gray-100 hover:border-[#AD6B4B] transition-all duration-300"
            >
              <div className="relative h-48">
                <img
                  src={image.image_url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(image)}
                    className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h4 className="font-bold text-[#264025] mb-1 text-lg">{image.title}</h4>
                <p className="text-xs text-gray-500 mb-3 font-mono bg-gray-50 px-2 py-1 rounded">
                  {image.image_key}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      image.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {image.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-xs text-gray-500">Order: {image.display_order}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
        <h4 className="font-bold text-amber-900 mb-3">Image Usage Guide</h4>
        <div className="space-y-2 text-sm text-amber-800">
          <p><strong>Hero Section:</strong> Large banner images for the homepage hero slider</p>
          <p><strong>Hero Grid:</strong> 4 images for homepage hero grid (exactly 4 recommended)</p>
          <p><strong>Service Categories:</strong> Thumbnail images for each service category</p>
          <p><strong>Home Gallery:</strong> Showcase images displayed on the homepage gallery section</p>
          <p><strong>About Section:</strong> Images used on the About page</p>
          <p><strong>Gallery Page:</strong> Full gallery images with categories (Bridal, Hair, Nails, etc.)</p>
        </div>
      </div>
    </div>
  );
};
