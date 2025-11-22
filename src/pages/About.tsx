import { Award, Heart, Star, Users } from 'lucide-react';

export const About = () => {
  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-[#264025] mb-4">About Us</h1>
          <p className="text-xl text-[#82896E] max-w-2xl mx-auto">
            Your trusted partner in beauty and wellness for over 15 years
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <img
              src="https://images.pexels.com/photos/3992868/pexels-photo-3992868.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="About Geetandrim"
              className="rounded-2xl shadow-2xl"
            />
          </div>
          <div>
            <h2 className="text-4xl font-bold text-[#264025] mb-6">Our Story</h2>
            <p className="text-lg text-[#82896E] mb-6 leading-relaxed">
              Geetandrim was founded with a vision to provide premium beauty and wellness services
              that enhance natural beauty while promoting self-care and confidence. What started as
              a small salon has grown into a trusted destination for thousands of clients.
            </p>
            <p className="text-lg text-[#82896E] mb-6 leading-relaxed">
              Our team of certified professionals is dedicated to staying updated with the latest
              trends and techniques in the beauty industry. We believe in using only the finest
              products and providing personalized service to each client.
            </p>
            <p className="text-lg text-[#82896E] leading-relaxed">
              Whether you're preparing for a special occasion or simply treating yourself, we're
              here to make you look and feel your absolute best.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#264025] to-[#7B4B36] rounded-3xl p-12 mb-20 text-white">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Award,
                title: 'Excellence',
                desc: 'We strive for perfection in every service we provide',
              },
              {
                icon: Heart,
                title: 'Care',
                desc: 'Your comfort and satisfaction are our top priorities',
              },
              {
                icon: Star,
                title: 'Quality',
                desc: 'Premium products and professional techniques always',
              },
              {
                icon: Users,
                title: 'Community',
                desc: 'Building lasting relationships with our clients',
              },
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <value.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-white/80">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-4xl font-bold text-[#264025] mb-12 text-center">
            Meet Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Geeta Sharma',
                role: 'Founder & Master Stylist',
                image: 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=600',
              },
              {
                name: 'Andrim Patel',
                role: 'Senior Makeup Artist',
                image: 'https://images.pexels.com/photos/3992868/pexels-photo-3992868.jpeg?auto=compress&cs=tinysrgb&w=600',
              },
              {
                name: 'Priya Reddy',
                role: 'Hair Treatment Specialist',
                image: 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=600',
              },
            ].map((member, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#264025]/90 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                    <p className="text-[#DDCBB7]">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#DDCBB7] rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-[#264025] mb-6">
            Ready to Experience the Difference?
          </h2>
          <p className="text-lg text-[#7B4B36] mb-8 max-w-2xl mx-auto">
            Book your appointment today and let us help you look and feel your best
          </p>
          <button className="bg-[#AD6B4B] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#7B4B36] transition-all duration-300 transform hover:scale-105 shadow-xl">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
