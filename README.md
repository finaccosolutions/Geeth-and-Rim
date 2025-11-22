# Geetandrim Salon Website

A modern, full-featured salon website with booking system and admin panel.

## Features

### Customer-Facing Features
- **Responsive Design**: Beautiful, mobile-optimized layout with smooth animations
- **Service Categories**: Organized services including:
  - Haircut & Styling
  - Face Care
  - Wedding Packages
  - Hair Treatments
  - Body Care
  - Hair Removal
  - Nails
- **Smart Booking System**:
  - Select service and date
  - View available time slots
  - Automatic conflict detection
  - Duration-based slot blocking
- **Gallery**: Image showcase with category filtering
- **About & Contact Pages**: Complete business information

### Admin Panel Features
- **Secure Authentication**: Email/password login
- **Booking Management**:
  - View all bookings
  - Filter by status (pending, confirmed, cancelled, completed)
  - Approve or reject bookings
  - Detailed booking information
- **Service Management**:
  - Add, edit, delete services
  - Set prices and duration
  - Manage categories
  - Upload service images
- **Image Management**:
  - Manage hero slider images
  - Organize gallery images
  - Category-based organization
- **Settings**:
  - Email configuration (SMTP settings)
  - Admin notification emails
  - Sender information

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React
- **Build Tool**: Vite

## Theme Colors

- Primary Green: `#264025`
- Sage Green: `#82896E`
- Cream: `#DDCBB7`
- Terracotta: `#AD6B4B`
- Brown: `#7B4B36`

## Setup Instructions

1. The database is already configured with:
   - All required tables
   - Sample services
   - Email settings
   - Row Level Security policies

2. Access the admin panel:
   - Navigate to `/admin`
   - Create an admin account via Supabase dashboard
   - Sign in with your credentials

3. Customize:
   - Add/edit services via Admin Panel
   - Upload hero and gallery images
   - Update business information in contact page
   - Configure email settings

## Project Structure

```
src/
├── components/         # Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   └── ServiceCard.tsx
├── pages/             # Main pages
│   ├── Home.tsx
│   ├── Services.tsx
│   ├── WeddingPackages.tsx
│   ├── Gallery.tsx
│   ├── About.tsx
│   ├── Contact.tsx
│   ├── Booking.tsx
│   └── admin/         # Admin panel pages
│       ├── AdminLogin.tsx
│       ├── AdminDashboard.tsx
│       ├── BookingsManager.tsx
│       ├── ServicesManager.tsx
│       ├── ImagesManager.tsx
│       └── SettingsManager.tsx
├── contexts/          # React contexts
│   └── AuthContext.tsx
├── lib/              # Utilities
│   └── supabase.ts
└── types/            # TypeScript types
    └── index.ts
```

## Database Schema

- `service_categories`: Service category definitions
- `services`: Available salon services
- `bookings`: Customer appointments
- `hero_images`: Homepage slider images
- `gallery_images`: Gallery showcase images
- `email_settings`: Email configuration
- `admin_users`: Admin panel users

## Key Features Implementation

### Booking System
- Validates slot availability in real-time
- Prevents double-booking
- Calculates end time based on service duration
- Shows booked vs available slots

### Admin Panel
- Role-based access control
- Real-time data updates
- Intuitive management interfaces
- Secure authentication

### Responsive Design
- Mobile-first approach
- Smooth transitions and animations
- Touch-friendly interfaces
- Optimized for all screen sizes

## Future Enhancements

- Email notifications via SMTP
- SMS reminders
- Customer account system
- Payment integration
- Staff management
- Analytics dashboard
- Online reviews system

## License

Proprietary - Geetandrim Salon
