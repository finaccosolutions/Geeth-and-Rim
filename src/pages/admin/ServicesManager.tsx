import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Service, ServiceCategory } from '../../types';

export const ServicesManager = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    duration_minutes: 30,
    price: 0,
    image_url: '',
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [servicesResult, categoriesResult] = await Promise.all([
      supabase.from('services').select('*').order('display_order'),
      supabase.from('service_categories').select('*').order('display_order'),
    ]);

    if (servicesResult.data) setServices(servicesResult.data);
    if (categoriesResult.data) setCategories(categoriesResult.data);
  };

  const handleSave = async () => {
    if (editingService) {
      await supabase
        .from('services')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingService.id);
    } else {
      await supabase.from('services').insert(formData);
    }

    setEditingService(null);
    setIsAdding(false);
    setFormData({
      name: '',
      description: '',
      category_id: '',
      duration_minutes: 30,
      price: 0,
      image_url: '',
      is_active: true,
    });
    loadData();
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      category_id: service.category_id,
      duration_minutes: service.duration_minutes,
      price: service.price,
      image_url: service.image_url,
      is_active: service.is_active,
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      await supabase.from('services').delete().eq('id', id);
      loadData();
    }
  };

  const handleCancel = () => {
    setEditingService(null);
    setIsAdding(false);
    setFormData({
      name: '',
      description: '',
      category_id: '',
      duration_minutes: 30,
      price: 0,
      image_url: '',
      is_active: true,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#264025]">Manage Services</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 bg-[#AD6B4B] text-white px-4 py-2 rounded-lg hover:bg-[#7B4B36] transition-colors"
        >
          <Plus size={20} />
          <span>Add Service</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#DDCBB7]/20 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold text-[#264025] mb-4">
            {editingService ? 'Edit Service' : 'Add New Service'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                Service Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">Price (₹)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                Image URL
              </label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 text-[#AD6B4B] border-gray-300 rounded focus:ring-[#AD6B4B]"
              />
              <label htmlFor="is_active" className="ml-2 text-[#264025] font-medium">
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

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-[#DDCBB7]">
              <th className="text-left py-3 px-4 font-semibold text-[#264025]">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-[#264025]">Category</th>
              <th className="text-left py-3 px-4 font-semibold text-[#264025]">Duration</th>
              <th className="text-left py-3 px-4 font-semibold text-[#264025]">Price</th>
              <th className="text-left py-3 px-4 font-semibold text-[#264025]">Status</th>
              <th className="text-left py-3 px-4 font-semibold text-[#264025]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => {
              const category = categories.find((c) => c.id === service.category_id);
              return (
                <tr key={service.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{service.name}</td>
                  <td className="py-3 px-4">{category?.name || 'N/A'}</td>
                  <td className="py-3 px-4">{service.duration_minutes} mins</td>
                  <td className="py-3 px-4">₹{service.price}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        service.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
