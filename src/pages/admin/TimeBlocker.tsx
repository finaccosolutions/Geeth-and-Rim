import { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BlockedTimeSlot, Service } from '../../types';

export const TimeBlocker = () => {
  const [blockedSlots, setBlockedSlots] = useState<BlockedTimeSlot[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    service_id: '',
    blocked_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '10:00',
    reason: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [slotsResult, servicesResult] = await Promise.all([
      supabase
        .from('blocked_time_slots')
        .select('*')
        .gte('blocked_date', new Date().toISOString().split('T')[0])
        .order('blocked_date', { ascending: true })
        .order('start_time', { ascending: true }),
      supabase.from('services').select('*').eq('is_active', true).order('name'),
    ]);

    if (slotsResult.data) setBlockedSlots(slotsResult.data);
    if (servicesResult.data) setServices(servicesResult.data);
  };

  const handleSave = async () => {
    if (!formData.service_id || !formData.blocked_date || !formData.start_time || !formData.end_time) {
      alert('Please fill in all required fields');
      return;
    }

    const { data: user } = await supabase.auth.getUser();

    const { error } = await supabase.from('blocked_time_slots').insert({
      service_id: formData.service_id,
      blocked_date: formData.blocked_date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      reason: formData.reason,
      created_by: user?.user?.id,
    });

    if (error) {
      alert('Failed to block time slot');
      return;
    }

    setIsAdding(false);
    setFormData({
      service_id: '',
      blocked_date: new Date().toISOString().split('T')[0],
      start_time: '09:00',
      end_time: '10:00',
      reason: '',
    });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this blocked time slot?')) {
      await supabase.from('blocked_time_slots').delete().eq('id', id);
      loadData();
    }
  };

  const groupedSlots = blockedSlots.reduce((acc, slot) => {
    if (!acc[slot.blocked_date]) acc[slot.blocked_date] = [];
    acc[slot.blocked_date].push(slot);
    return acc;
  }, {} as Record<string, BlockedTimeSlot[]>);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#264025]">Block Time Slots</h2>
          <p className="text-sm text-[#82896E] mt-1">
            Manually block time slots for services when they're unavailable
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 bg-[#AD6B4B] text-white px-4 py-2 rounded-lg hover:bg-[#7B4B36] transition-colors"
        >
          <Plus size={20} />
          <span>Block Time</span>
        </button>
      </div>

      {isAdding && (
        <div className="bg-[#DDCBB7]/20 rounded-xl p-6 mb-6 border-2 border-[#AD6B4B]">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="text-[#AD6B4B]" size={24} />
            <h3 className="text-xl font-bold text-[#264025]">Block New Time Slot</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                Service
              </label>
              <select
                value={formData.service_id}
                onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
              >
                <option value="">Select Service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-[#82896E]" size={18} />
                <input
                  type="date"
                  value={formData.blocked_date}
                  onChange={(e) => setFormData({ ...formData, blocked_date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                Start Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 text-[#82896E]" size={18} />
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                End Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 text-[#82896E]" size={18} />
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                Reason (Optional)
              </label>
              <input
                type="text"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder="e.g., Equipment maintenance, Staff unavailable"
              />
            </div>
          </div>
          <div className="flex space-x-4 mt-6">
            <button
              onClick={handleSave}
              className="bg-[#AD6B4B] text-white px-6 py-2 rounded-lg hover:bg-[#7B4B36] transition-colors"
            >
              Block Time Slot
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setFormData({
                  service_id: '',
                  blocked_date: new Date().toISOString().split('T')[0],
                  start_time: '09:00',
                  end_time: '10:00',
                  reason: '',
                });
              }}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {Object.keys(groupedSlots).length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          <Calendar className="mx-auto text-[#82896E] mb-4" size={48} />
          <p className="text-[#82896E]">No blocked time slots</p>
          <p className="text-sm text-[#82896E] mt-2">
            Block time slots when services are unavailable
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSlots).map(([date, slots]) => (
            <div key={date} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#264025] to-[#7B4B36] p-4">
                <h3 className="text-lg font-bold text-white">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {slots.map((slot) => {
                    const service = services.find((s) => s.id === slot.service_id);
                    return (
                      <div
                        key={slot.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-2 border-gray-200 hover:border-[#AD6B4B] transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-bold text-[#264025]">
                              {service?.name || 'Unknown Service'}
                            </span>
                            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                              BLOCKED
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-[#82896E]">
                            <div className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>
                                {slot.start_time} - {slot.end_time}
                              </span>
                            </div>
                            {slot.reason && (
                              <span className="italic">Reason: {slot.reason}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(slot.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="Remove block"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
