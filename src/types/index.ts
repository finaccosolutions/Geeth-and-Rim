export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  display_order: number;
  created_at: string;
}

export interface Service {
  id: string;
  category_id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface HeroImage {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  image_url: string;
  category: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface EmailSettings {
  id: string;
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_password: string;
  admin_emails: string[];
  from_email: string;
  from_name: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface BlockedTimeSlot {
  id: string;
  service_id: string;
  blocked_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContactSettings {
  id: string;
  whatsapp_number: string;
  phone_number: string;
  email: string;
  address: string;
  opening_hours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  updated_at: string;
}

export interface SiteBranding {
  id: string;
  site_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  updated_at: string;
}

export interface CustomerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string;
  bio: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

