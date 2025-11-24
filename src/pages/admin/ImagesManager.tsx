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

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string;
  bio: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const ImagesManager = () => {
  const [images, setImages] = useState<SiteImage[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [activeTab, setActiveTab] = useState<string>('hero');
  const [isAdding, setIsAdding] = useState(false);
  const [editingImage, setEditingImage] = useState<SiteImage | null>(null);
  const [editingGalleryImage, setEditingGalleryImage] = useState<GalleryImage | null>(null);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  const [galleryCategory, setGalleryCategory] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    image_key: '',
    is_active: true,
  });
  const [teamFormData, setTeamFormData] = useState({
    name: '',
    role: '',
    image_url: '',
    bio: '',
    is_active: true,
  });

  const tabs = [
    { id: 'hero', name: 'Hero Section', description: 'Main homepage hero images (4 images max)', maxCount: 4 },
    { id: 'hero_grid', name: 'Hero Grid', description: 'Homepage hero grid images (4 images max)', maxCount: 4 },
    { id: 'category', name: 'Service Categories', description: 'Category thumbnail images' },
    { id: 'home_gallery', name: 'Home Gallery', description: 'Gallery showcase on homepage' },
    { id: 'about', name: 'About Section', description: 'About page journey image' },
    { id: 'team', name: 'Team Members', description: 'About page team section' },
    { id: 'gallery_page', name: 'Gallery Page', description: 'Manage gallery page images with categories' },
  ];

  const galleryCategories = ['Bridal', 'Hair', 'Nails', 'Facial', 'Makeup', 'Salon', 'Treatment', 'Other'];

  useEffect(() => {
    if (activeTab === 'gallery_page') {
      loadGalleryImages();
    } else if (activeTab === 'team') {
      loadTeamMembers();
    } else {
      loadImages();
    }
  }, [activeTab]);

  const loadImages = async () => {
    const { data } = await supabase
      .from('site_images')
      .select('*')
      .order('category, display_order');

    if (data) {
      // Remove duplicates based on image_key
      const uniqueImages = data.reduce((acc: SiteImage[], current) => {
        const exists = acc.find(item => item.image_key === current.image_key && item.category === current.category);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      setImages(uniqueImages);
    }
  };

  const loadGalleryImages = async () => {
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .order('category, display_order');

    if (data) setGalleryImages(data);
  };

  const loadTeamMembers = async () => {
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order');

    if (data) setTeamMembers(data);
  };

  const handleSaveTeamMember = async () => {
    if (editingTeamMember) {
      await supabase
        .from('team_members')
        .update({
          name: teamFormData.name,
          role: teamFormData.role,
          image_url: teamFormData.image_url,
          bio: teamFormData.bio,
          is_active: teamFormData.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingTeamMember.id);
    } else {
      const maxOrder = Math.max(...teamMembers.map(m => m.display_order), 0);
      await supabase.from('team_members').insert({
        name: teamFormData.name,
        role: teamFormData.role,
        image_url: teamFormData.image_url,
        bio: teamFormData.bio,
        is_active: teamFormData.is_active,
        display_order: maxOrder + 1,
      });
    }
    handleCancel();
    loadTeamMembers();
  };

  const handleEditTeamMember = (member: TeamMember) => {
    setEditingTeamMember(member);
    setTeamFormData({
      name: member.name,
      role: member.role,
      image_url: member.image_url,
      bio: member.bio || '',
      is_active: member.is_active,
    });
    setIsAdding(true);
  };

  const handleDeleteTeamMember = async (id: string) => {
    if (confirm('Are you sure you want to delete this team member?')) {
      await supabase.from('team_members').delete().eq('id', id);
      loadTeamMembers();
    }
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
        const currentTabInfo = tabs.find(t => t.id === activeTab);
        
        // Check max count
        if (currentTabInfo?.maxCount && categoryImages.length >= currentTabInfo.maxCount) {
          alert(`Maximum ${currentTabInfo.maxCount} images allowed for ${currentTabInfo.name}`);
          return;
        }

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
    setEditingTeamMember(null);
    setGalleryCategory('');
    setIsAdding(false);
    setFormData({
      title: '',
      image_url: '',
      image_key: '',
      is_active: true,
    });
    setTeamFormData({
      name: '',
      role: '',
      image_url: '',
      bio: '',
      is_active: true,
    });
  };

  const currentTabImages = activeTab === 'gallery_page' ? [] : activeTab === 'team' ? [] : images.filter((img) => img.category === activeTab);
  const currentTabInfo = tabs.find((tab) => tab.id === activeTab);
  const isGalleryTab = activeTab === 'gallery_page';
  const isTeamTab = activeTab === 'team';

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
          let count = 0;
          if (tab.id === 'gallery_page') {
            count = galleryImages.length;
          } else if (tab.id === 'team') {
            count = teamMembers.length;
          } else {
            count = images.filter((img) => img.category === tab.id).length;
          }
          
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
          {currentTabInfo.maxCount && (
            <p className="text-xs text-blue-700 mt-2 font-semibold">
              Maximum {currentTabInfo.maxCount} images allowed
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-[#264025]">
            {currentTabInfo?.name || 'Images'}
          </h3>
          <p className="text-sm text-[#82896E]">
            {isTeamTab ? teamMembers.length : isGalleryTab ? galleryImages.length : currentTabImages.length} 
            {' '}{isTeamTab ? 'team member' : 'image'}{(isTeamTab ? teamMembers.length : isGalleryTab ? galleryImages.length : currentTabImages.length) !== 1 ? 's' : ''} in this category
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 bg-[#AD6B4B] text-white px-4 py-2 rounded-lg hover:bg-[#7B4B36] transition-colors"
        >
          <Plus size={20} />
          <span>Add {isTeamTab ? 'Team Member' : 'Image'}</span>
        </button>
      </div>

      {isAdding && isTeamTab && (
        <div className="bg-[#DDCBB7]/20 rounded-xl p-6 mb-6 border-2 border-[#AD6B4B]">
          <h3 className="text-xl font-bold text-[#264025] mb-4">
            {editingTeamMember ? 'Edit Team Member' : 'Add New Team Member'}
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#264025] mb-2">Name</label>
                <input
                  type="text"
                  value={teamFormData.name}
                  onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                  placeholder="e.g., Geeta Sharma"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#264025] mb-2">Role/Position</label>
                <input
                  type="text"
                  value={teamFormData.role}
                  onChange={(e) => setTeamFormData({ ...teamFormData, role: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                  placeholder="e.g., Founder & Master Stylist"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">Image URL</label>
              <input
                type="text"
                value={teamFormData.image_url}
                onChange={(e) => setTeamFormData({ ...teamFormData, image_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder="https://images.pexels.com/..."
              />
              {teamFormData.image_url && (
                <div className="mt-3 p-3 bg-white rounded-lg border-2 border-[#DDCBB7]">
                  <p className="text-xs font-semibold text-[#264025] mb-2">Preview:</p>
                  <img
                    src={teamFormData.image_url}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">Bio (Optional)</label>
              <textarea
                value={teamFormData.bio}
                onChange={(e) => setTeamFormData({ ...teamFormData, bio: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none resize-none"
                rows={3}
                placeholder="Brief description about the team member..."
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="team_active"
                checked={teamFormData.is_active}
                onChange={(e) => setTeamFormData({ ...teamFormData, is_active: e.target.checked })}
                className="w-5 h-5 text-[#AD6B4B] border-gray-300 rounded focus:ring-[#AD6B4B]"
              />
              <label htmlFor="team_active" className="ml-2 text-[#264025] font-medium">
                Active (visible on website)
              </label>
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSaveTeamMember}
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

      {isAdding && !isTeamTab && (
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
                  placeholder={`e.g., ${activeTab}_${currentTabImages.length + 1}`}
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

      {isTeamTab ? (
        teamMembers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-[#DDCBB7]">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="text-gray-400" size={40} />
            </div>
            <p className="text-[#82896E] text-lg mb-2">No team members yet</p>
            <p className="text-sm text-[#82896E]">
              Click "Add Team Member" to add your first team member
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden group border-2 border-gray-100 hover:border-[#AD6B4B] transition-all duration-300"
              >
                <div className="relative h-64">
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditTeamMember(member)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-lg"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteTeamMember(member.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h4 className="font-bold text-white text-lg">{member.name}</h4>
                    <p className="text-white/90 text-sm">{member.role}</p>
                  </div>
                </div>
                {member.bio && (
                  <div className="p-4">
                    <p className="text-sm text-[#82896E]">{member.bio}</p>
                  </div>
                )}
                <div className="px-4 pb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      member.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : isGalleryTab ? (
        // Gallery images rendering (keep existing code)
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
    </div>
  );
};
