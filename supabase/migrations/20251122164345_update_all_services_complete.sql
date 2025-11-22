/*
  # Update All Salon Services

  This migration updates the services with the complete list of salon offerings.

  1. Services Updated
    - Removes all existing services
    - Adds complete list of services under proper categories:
      - Haircut & Styling (4 services)
      - Face Care (5 services)
      - Wedding Packages (9 services)
      - Hair Treatments (14 services)
      - Body Care (8 services)
      - Hair Removal (2 services)
      - Nails (7 services)

  2. Changes
    - Each service has proper pricing, duration, and descriptions
    - Services are ordered within categories for better display
*/

DELETE FROM services;

DO $$
DECLARE
  v_haircut_id uuid;
  v_facecare_id uuid;
  v_wedding_id uuid;
  v_hairtreatment_id uuid;
  v_bodycare_id uuid;
  v_hairremoval_id uuid;
  v_nails_id uuid;
BEGIN
  SELECT id INTO v_haircut_id FROM service_categories WHERE name = 'Haircut & Styling';
  SELECT id INTO v_facecare_id FROM service_categories WHERE name = 'Face Care';
  SELECT id INTO v_wedding_id FROM service_categories WHERE name = 'Wedding Packages';
  SELECT id INTO v_hairtreatment_id FROM service_categories WHERE name = 'Hair Treatments';
  SELECT id INTO v_bodycare_id FROM service_categories WHERE name = 'Body Care';
  SELECT id INTO v_hairremoval_id FROM service_categories WHERE name = 'Hair Removal';
  SELECT id INTO v_nails_id FROM service_categories WHERE name = 'Nails';

  INSERT INTO services (category_id, name, description, duration_minutes, price, is_active, display_order, image_url) VALUES
  (v_haircut_id, 'Haircut & Blow Dry', 'Professional haircut with styling blow dry', 45, 500, true, 1, 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_haircut_id, 'Shave', 'Traditional shaving with hot towel treatment', 30, 300, true, 2, 'https://images.pexels.com/photos/897271/pexels-photo-897271.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_haircut_id, 'Moustache & Beard Design', 'Expert beard trimming and styling', 30, 250, true, 3, 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_haircut_id, 'Kids Haircut', 'Friendly haircut service for children', 30, 350, true, 4, 'https://images.pexels.com/photos/1570806/pexels-photo-1570806.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  (v_facecare_id, 'Clean Up', 'Quick facial cleansing and toning', 45, 600, true, 1, 'https://images.pexels.com/photos/3997982/pexels-photo-3997982.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_facecare_id, 'Facials', 'Deep cleansing facial treatment', 60, 1200, true, 2, 'https://images.pexels.com/photos/3738379/pexels-photo-3738379.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_facecare_id, 'Add-on Masks', 'Specialized face masks for various skin types', 20, 400, true, 3, 'https://images.pexels.com/photos/3997993/pexels-photo-3997993.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_facecare_id, 'Bleach', 'Skin brightening bleach treatment', 40, 500, true, 4, 'https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_facecare_id, 'Under Eye Treatment', 'Reduce dark circles and puffiness', 30, 800, true, 5, 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  (v_wedding_id, 'Bridal Makeup & Styling', 'Complete bridal makeover with hair and makeup', 180, 15000, true, 1, 'https://images.pexels.com/photos/1697214/pexels-photo-1697214.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_wedding_id, 'Grooms Makeup & Styling', 'Grooming and styling for grooms', 90, 5000, true, 2, 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_wedding_id, 'Pre-Bridal & Bridal Packages', 'Complete pre-wedding beauty package', 240, 25000, true, 3, 'https://images.pexels.com/photos/3992868/pexels-photo-3992868.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_wedding_id, 'Groom''s Pre-Wedding Packages', 'Complete grooming package for grooms', 180, 12000, true, 4, 'https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_wedding_id, 'Bridesmaids Makeup & Styling', 'Beautiful styling for bridesmaids', 120, 6000, true, 5, 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_wedding_id, 'Engagement Makeup', 'Elegant look for engagement ceremonies', 120, 8000, true, 6, 'https://images.pexels.com/photos/1266011/pexels-photo-1266011.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_wedding_id, 'Saree Draping', 'Professional saree draping service', 30, 1500, true, 7, 'https://images.pexels.com/photos/3224206/pexels-photo-3224206.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_wedding_id, 'Party Makeup', 'Glamorous makeup for parties and events', 90, 4000, true, 8, 'https://images.pexels.com/photos/1689731/pexels-photo-1689731.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_wedding_id, 'HD Makeup', 'High-definition makeup for flawless look', 120, 7000, true, 9, 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  (v_hairtreatment_id, 'Hair Spa', 'Relaxing hair spa treatment', 60, 1500, true, 1, 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_hairtreatment_id, 'Hair Colouring', 'Full hair color treatment', 120, 3000, true, 2, 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_hairtreatment_id, 'Streaks', 'Stylish hair streaks', 90, 2500, true, 3, 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_hairtreatment_id, 'Balayage', 'Hand-painted hair coloring technique', 150, 4500, true, 4, 'https://images.pexels.com/photos/3992868/pexels-photo-3992868.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_hairtreatment_id, 'Highlights', 'Professional hair highlights', 120, 3500, true, 5, 'https://images.pexels.com/photos/3738379/pexels-photo-3738379.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_hairtreatment_id, 'Ombre', 'Gradient hair color effect', 150, 4000, true, 6, 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_hairtreatment_id, 'Straightening', 'Permanent hair straightening', 180, 5000, true, 7, 'https://images.pexels.com/photos/3992868/pexels-photo-3992868.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_hairtreatment_id, 'Smoothening', 'Hair smoothening treatment', 150, 4500, true, 8, 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_hairtreatment_id, 'Keratin Treatment', 'Keratin hair therapy', 180, 6000, true, 9, 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_hairtreatment_id, 'Botox Treatment', 'Hair botox for damaged hair', 120, 5500, true, 10, 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_hairtreatment_id, 'Wellaplex Treatment', 'Bond-building hair treatment', 90, 4000, true, 11, 'https://images.pexels.com/photos/3992868/pexels-photo-3992868.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_hairtreatment_id, 'Permanent Blow Dry', 'Long-lasting blow dry treatment', 120, 4500, true, 12, 'https://images.pexels.com/photos/3065209/pexels-photo-3065209.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_hairtreatment_id, 'Anti-hair fall Treatment', 'Treatment to reduce hair fall', 60, 2500, true, 13, 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_hairtreatment_id, 'Anti-dandruff Treatment', 'Treatment for dandruff control', 60, 2000, true, 14, 'https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  (v_bodycare_id, 'De-tan', 'Remove tan and brighten skin', 60, 1500, true, 1, 'https://images.pexels.com/photos/3997982/pexels-photo-3997982.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_bodycare_id, 'Depigmentation', 'Reduce pigmentation and dark spots', 75, 2500, true, 2, 'https://images.pexels.com/photos/3738379/pexels-photo-3738379.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_bodycare_id, 'Underarms Lightening', 'Brighten underarm area', 45, 1200, true, 3, 'https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_bodycare_id, 'Body Polishing', 'Full body exfoliation and polishing', 90, 3500, true, 4, 'https://images.pexels.com/photos/3997982/pexels-photo-3997982.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_bodycare_id, 'Body Wrap', 'Detoxifying body wrap treatment', 90, 3000, true, 5, 'https://images.pexels.com/photos/3738379/pexels-photo-3738379.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_bodycare_id, 'Steam Bath', 'Relaxing steam bath session', 30, 800, true, 6, 'https://images.pexels.com/photos/3997982/pexels-photo-3997982.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_bodycare_id, 'Reflexology', 'Therapeutic foot reflexology', 60, 1800, true, 7, 'https://images.pexels.com/photos/3738379/pexels-photo-3738379.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_bodycare_id, 'Footlogix Treatment', 'Professional foot care treatment', 60, 2000, true, 8, 'https://images.pexels.com/photos/5069432/pexels-photo-5069432.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  (v_hairremoval_id, 'Waxing', 'Professional body waxing service', 45, 800, true, 1, 'https://images.pexels.com/photos/3997982/pexels-photo-3997982.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_hairremoval_id, 'Threading', 'Precise eyebrow and facial threading', 20, 200, true, 2, 'https://images.pexels.com/photos/3738379/pexels-photo-3738379.jpeg?auto=compress&cs=tinysrgb&w=800'),
  
  (v_nails_id, 'Manicure', 'Complete hand and nail care', 45, 800, true, 1, 'https://images.pexels.com/photos/1582750/pexels-photo-1582750.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_nails_id, 'Pedicure', 'Complete foot and nail care', 60, 1000, true, 2, 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_nails_id, 'Nail Polish', 'Professional nail polish application', 20, 300, true, 3, 'https://images.pexels.com/photos/1582750/pexels-photo-1582750.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_nails_id, 'Nail Art', 'Creative nail art designs', 45, 800, true, 4, 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_nails_id, 'Nail Extensions', 'Acrylic or gel nail extensions', 90, 2000, true, 5, 'https://images.pexels.com/photos/1582750/pexels-photo-1582750.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_nails_id, 'Gel Polish', 'Long-lasting gel nail polish', 45, 1200, true, 6, 'https://images.pexels.com/photos/3997991/pexels-photo-3997991.jpeg?auto=compress&cs=tinysrgb&w=800'),
  (v_nails_id, 'Heel Peel', 'Foot heel treatment and care', 30, 600, true, 7, 'https://images.pexels.com/photos/1582750/pexels-photo-1582750.jpeg?auto=compress&cs=tinysrgb&w=800');
END $$;
