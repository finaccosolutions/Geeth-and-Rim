import { useState, useEffect } from 'react';
import { LogOut, Calendar, Package, Image, Settings, BarChart3, Ban, Phone, Palette } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { BookingsManager } from './BookingsManager';
import { ServicesManager } from './ServicesManager';
import { ImagesManager } from './ImagesManager';
import { SettingsManager } from './SettingsManager';
import { ReportsManager } from './ReportsManager';
import { TimeBlocker } from './TimeBlocker';
import { ContactSettingsManager } from './ContactSettingsManager';
import { BrandingManager } from './BrandingManager';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, signOut } = useAuth();

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (adminUser) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
      await signOut();
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#AD6B4B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#264025] font-semibold">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="text-red-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-[#264025] mb-2">Access Denied</h2>
          <p className="text-[#82896E] mb-6">
            You are not authorized to access the admin panel.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-[#AD6B4B] text-white px-6 py-3 rounded-lg hover:bg-[#7B4B36] transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'bookings', name: 'Bookings', icon: Calendar },
    { id: 'services', name: 'Services', icon: Package },
    { id: 'timeblocker', name: 'Block Times', icon: Ban },
    { id: 'reports', name: 'Reports', icon: BarChart3 },
    { id: 'images', name: 'Images', icon: Image },
    { id: 'branding', name: 'Branding', icon: Palette },
    { id: 'contact', name: 'Contact', icon: Phone },
    { id: 'settings', name: 'Email', icon: Settings },
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
          {activeTab === 'timeblocker' && <TimeBlocker />}
          {activeTab === 'reports' && <ReportsManager />}
          {activeTab === 'images' && <ImagesManager />}
          {activeTab === 'branding' && <BrandingManager />}
          {activeTab === 'contact' && <ContactSettingsManager />}
          {activeTab === 'settings' && <SettingsManager />}
        </div>
      </div>
    </div>
  );
};
