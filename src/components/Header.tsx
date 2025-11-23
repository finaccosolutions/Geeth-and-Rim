import { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Header = ({ currentPage, onNavigate }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [branding, setBranding] = useState({ site_name: 'Geetandrim', logo_url: null as string | null });
  const { user, signOut } = useAuth();

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    const { data } = await supabase.from('site_branding').select('*').maybeSingle();
    if (data) {
      setBranding({ site_name: data.site_name, logo_url: data.logo_url });
    }
  };

  const handleAuthClick = () => {
    if (user) {
      signOut();
    } else {
      onNavigate('auth');
    }
  };

  const navItems = [
    { name: 'Home', path: 'home' },
    { name: 'Services', path: 'services' },
    { name: 'Gallery', path: 'gallery' },
    { name: 'About', path: 'about' },
    { name: 'Contact', path: 'contact' },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#F5E6D3]/95 to-transparent backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity duration-300"
              onClick={() => onNavigate('home')}
            >
              {branding.logo_url ? (
                <img
                  src={branding.logo_url}
                  alt={branding.site_name}
                  className="h-12 w-auto object-contain"
                />
              ) : null}
              <span className="text-2xl font-bold text-[#3D2E1F]">
                {branding.site_name}
              </span>
            </div>

            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => onNavigate(item.path)}
                  className={`text-sm font-medium transition-all duration-300 relative group ${
                    currentPage === item.path
                      ? 'text-[#C17B5C]'
                      : 'text-[#5A4A3A] hover:text-[#C17B5C]'
                  }`}
                >
                  {item.name}
                  <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#C17B5C] transform transition-transform duration-300 ${
                    currentPage === item.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </button>
              ))}
              <button
                onClick={handleAuthClick}
                className="flex items-center space-x-2 bg-[#C17B5C] text-white px-4 py-2 rounded-full hover:bg-[#A6684C] transition-all duration-300"
              >
                {user ? <LogOut size={18} /> : <User size={18} />}
                <span>{user ? 'Logout' : 'Login'}</span>
              </button>
            </nav>

            <div className="flex items-center space-x-4 lg:hidden">
              <button
                onClick={handleAuthClick}
                className="text-[#3D2E1F] hover:text-[#C17B5C] transition-colors duration-300"
              >
                {user ? <LogOut size={24} /> : <User size={24} />}
              </button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-[#3D2E1F] hover:text-[#C17B5C] transition-colors duration-300"
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`lg:hidden fixed top-20 left-0 right-0 bg-[#F5E6D3] shadow-2xl transition-all duration-300 ease-in-out ${
            isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
        >
          <nav className="container mx-auto px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  onNavigate(item.path);
                  setIsMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                  currentPage === item.path
                    ? 'bg-[#C17B5C] text-white'
                    : 'text-[#3D2E1F] hover:bg-[#E8D5C4]'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </header>

    </>
  );
};
