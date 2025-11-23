import { Service } from '../types';

interface ServiceCardProps {
  service: Service;
  onBook: (service: Service) => void;
}

export const ServiceCard = ({ service, onBook }: ServiceCardProps) => {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      <div className="relative h-48 overflow-hidden">
        <img
          src={service.image_url || 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={service.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#264025]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-[#264025] mb-2 group-hover:text-[#AD6B4B] transition-colors duration-300">
          {service.name}
        </h3>
        <p className="text-[#82896E] text-sm mb-4 line-clamp-3">
          {service.description || 'Professional service with premium care'}
        </p>
        <button
          onClick={() => onBook(service)}
          className="w-full bg-[#264025] text-white py-3 rounded-full font-semibold hover:bg-[#AD6B4B] transition-all duration-300 transform group-hover:scale-105"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};
