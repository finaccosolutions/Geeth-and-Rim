import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { WhatsAppButton } from './components/WhatsAppButton';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { WeddingPackages } from './pages/WeddingPackages';
import { Gallery } from './pages/Gallery';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Booking } from './pages/Booking';
import { Auth } from './pages/Auth';
import { Account } from './pages/Account';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Service } from './types';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [bookingData, setBookingData] = useState<Service | undefined>(undefined);
  const { user, loading } = useAuth();

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/admin') {
      setCurrentPage('admin');
    }
  }, []);

  const handleNavigate = (page: string, data?: unknown) => {
    setCurrentPage(page);
    if (page === 'booking' && data) {
      setBookingData(data as Service);
    } else {
      setBookingData(undefined);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#DDCBB7]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#AD6B4B] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#264025] font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'admin') {
    if (!user) {
      return <AdminLogin />;
    }
    return <AdminDashboard />;
  }

  if (currentPage === 'auth') {
    return <Auth onNavigate={handleNavigate} />;
  }

  if (currentPage === 'account') {
    return <Account onNavigate={handleNavigate} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="flex-grow">
        {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
        {currentPage === 'services' && <Services onNavigate={handleNavigate} />}
        {currentPage === 'wedding' && <WeddingPackages onNavigate={handleNavigate} />}
        {currentPage === 'gallery' && <Gallery />}
        {currentPage === 'about' && <About />}
        {currentPage === 'contact' && <Contact />}
        {currentPage === 'booking' && (
          <Booking preSelectedService={bookingData} onNavigate={handleNavigate} />
        )}
        {currentPage === 'account' && <Account onNavigate={handleNavigate} />}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
