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
