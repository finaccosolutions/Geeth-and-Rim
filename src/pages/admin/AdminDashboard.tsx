import { useState, useEffect } from 'react';
import { LogOut, Calendar, Package, Image, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BookingsManager } from './BookingsManager';
import { ServicesManager } from './ServicesManager';
import { ImagesManager } from './ImagesManager';
import { SettingsManager } from './SettingsManager';
import { ReportsManager } from './ReportsManager';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const { user, signOut } = useAuth();

  const tabs = [
    { id: 'bookings', name: 'Bookings', icon: Calendar },
    { id: 'services', name: 'Services', icon: Package },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'images', name: 'Images', icon: Image },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#264025] text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Geetandrim Admin</h1>
              <p className="text-sm text-[#DDCBB7]">Manage your salon</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 bg-[#AD6B4B] px-4 py-2 rounded-lg hover:bg-[#7B4B36] transition-colors duration-300"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-[#AD6B4B] text-white shadow-lg'
                    : 'bg-white text-[#264025] hover:bg-[#DDCBB7]'
                }`}
              >
                <Icon size={20} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          {activeTab === 'bookings' && <BookingsManager />}
          {activeTab === 'services' && <ServicesManager />}
          {activeTab === 'reports' && <ReportsManager />}
          {activeTab === 'images' && <ImagesManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </div>
      </div>
    </div>
  );
};
