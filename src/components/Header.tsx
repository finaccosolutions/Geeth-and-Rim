import { useState } from 'react';
import { Menu, X, Phone, Mail } from 'lucide-react';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Header = ({ currentPage, onNavigate }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: 'home' },
    { name: 'Services', path: 'services' },
    { name: 'Wedding Packages', path: 'wedding' },
    { name: 'Gallery', path: 'gallery' },
    { name: 'About', path: 'about' },
    { name: 'Contact', path: 'contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-[#264025] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div
            className="text-2xl font-bold text-[#DDCBB7] cursor-pointer hover:text-[#AD6B4B] transition-colors duration-300"
            onClick={() => onNavigate('home')}
          >
            Geetandrim
          </div>

          <nav className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => onNavigate(item.path)}
                className={`text-sm font-medium transition-all duration-300 relative group ${
                  currentPage === item.path
                    ? 'text-[#AD6B4B]'
                    : 'text-[#DDCBB7] hover:text-[#AD6B4B]'
                }`}
              >
                {item.name}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-[#AD6B4B] transform transition-transform duration-300 ${
                  currentPage === item.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}></span>
              </button>
            ))}
            <button
              onClick={() => onNavigate('booking')}
              className="bg-[#AD6B4B] text-white px-6 py-2.5 rounded-full hover:bg-[#7B4B36] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Book Now
            </button>
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-[#DDCBB7] hover:text-[#AD6B4B] transition-colors duration-300"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <div
        className={`lg:hidden fixed top-20 left-0 right-0 bg-[#264025] shadow-2xl transition-all duration-300 ease-in-out ${
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
                  ? 'bg-[#AD6B4B] text-white'
                  : 'text-[#DDCBB7] hover:bg-[#82896E] hover:text-white'
              }`}
            >
              {item.name}
            </button>
          ))}
          <button
            onClick={() => {
              onNavigate('booking');
              setIsMenuOpen(false);
            }}
            className="block w-full bg-[#AD6B4B] text-white px-4 py-3 rounded-lg hover:bg-[#7B4B36] transition-all duration-300"
          >
            Book Now
          </button>
        </nav>
      </div>

      <div className="hidden lg:block bg-[#82896E] py-2">
        <div className="container mx-auto px-4 flex items-center justify-end space-x-6 text-sm text-[#DDCBB7]">
          <a href="tel:+919876543210" className="flex items-center space-x-2 hover:text-white transition-colors duration-300">
            <Phone size={16} />
            <span>+91 98765 43210</span>
          </a>
          <a href="mailto:booking@geetandrim.com" className="flex items-center space-x-2 hover:text-white transition-colors duration-300">
            <Mail size={16} />
            <span>booking@geetandrim.com</span>
          </a>
        </div>
      </div>
    </header>
  );
};
