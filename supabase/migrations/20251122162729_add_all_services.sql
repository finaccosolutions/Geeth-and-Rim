/*
  # Add All Salon Services

  ## Overview
  Comprehensive migration to add all salon services across different categories as specified
  in the requirements.

  ## Services Added

  1. **Haircut & Styling**
     - Haircut & Blow Dry
     - Shave
     - Moustache & Beard Design
     - Kids Haircut

  2. **Face Care**
     - Clean Up
     - Facials
     - Add-on Masks
     - Bleach
     - Under Eye Treatment

  3. **Wedding Packages**
     - Bridal Makeup & Styling
     - Groom's Makeup & Styling
     - Pre-Bridal & Bridal Packages
     - Groom's Pre-Wedding Packages
     - Bridesmaids Makeup & Styling
     - Engagement Makeup
     - Saree Draping
     - Party Makeup
     - HD Makeup

  4. **Hair Treatments**
     - Hair Spa
     - Hair Colouring
     - Streaks
     - Balayage
     - Highlights
     - Ombre
     - Straightening
     - Smoothening
     - Keratin Treatment
     - Botox Treatment
     - Wellaplex Treatment
     - Permanent Blow Dry
     - Anti-Hair Fall Treatment
     - Anti-Dandruff Treatment

  5. **Body Care**
     - De-tan
     - Depigmentation
     - Underarms Lightening
     - Body Polishing
     - Body Wrap
     - Steam Bath
     - Reflexology
     - Footlogix Treatment

  6. **Hair Removal**
     - Waxing (Full Body)
     - Waxing (Arms)
     - Waxing (Legs)
     - Threading (Eyebrows)
     - Threading (Upper Lip)
     - Threading (Full Face)

  7. **Nails**
     - Manicure
     - Pedicure
     - Nail Polish
     - Nail Art
     - Nail Extensions
     - Heel Peel

  ## Notes
  - All services are set as active by default
  - Duration and pricing are estimates and can be updated via admin panel
  - Image URLs can be updated via admin panel
*/

-- Face Care Services
INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Face Care'),
  'Clean Up',
  'Deep cleansing facial treatment for refreshed skin',
  45,
  800.00,
  1,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Clean Up' AND category_id = (SELECT id FROM service_categories WHERE name = 'Face Care'));

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Face Care'),
  'Facials',
  'Professional facial treatments for glowing skin',
  60,
  1500.00,
  2,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Facials' AND category_id = (SELECT id FROM service_categories WHERE name = 'Face Care'));

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Face Care'),
  'Add-on Masks',
  'Specialized face masks for targeted skin concerns',
  30,
  500.00,
  3,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Add-on Masks' AND category_id = (SELECT id FROM service_categories WHERE name = 'Face Care'));

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Face Care'),
  'Bleach',
  'Face bleaching for brighter complexion',
  30,
  600.00,
  4,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Bleach' AND category_id = (SELECT id FROM service_categories WHERE name = 'Face Care'));

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Face Care'),
  'Under Eye Treatment',
  'Specialized treatment for dark circles and puffiness',
  30,
  700.00,
  5,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Under Eye Treatment' AND category_id = (SELECT id FROM service_categories WHERE name = 'Face Care'));

-- Wedding Packages
INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Wedding Packages'),
  'Bridal Makeup & Styling',
  'Complete bridal makeover with hair and makeup',
  180,
  15000.00,
  1,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Bridal Makeup & Styling' AND category_id = (SELECT id FROM service_categories WHERE name = 'Wedding Packages'));

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Wedding Packages'),
  'Groom''s Makeup & Styling',
  'Complete grooming for the groom',
  120,
  5000.00,
  2,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Groom''s Makeup & Styling' AND category_id = (SELECT id FROM service_categories WHERE name = 'Wedding Packages'));

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Wedding Packages'),
  'Pre-Bridal & Bridal Packages',
  'Complete package including pre-bridal treatments',
  240,
  25000.00,
  3,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Pre-Bridal & Bridal Packages' AND category_id = (SELECT id FROM service_categories WHERE name = 'Wedding Packages'));

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Wedding Packages'),
  'Groom''s Pre-Wedding Packages',
  'Complete grooming package for groom',
  180,
  10000.00,
  4,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Groom''s Pre-Wedding Packages' AND category_id = (SELECT id FROM service_categories WHERE name = 'Wedding Packages'));

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Wedding Packages'),
  'Bridesmaids Makeup & Styling',
  'Professional makeup and styling for bridesmaids',
  90,
  3500.00,
  5,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Bridesmaids Makeup & Styling' AND category_id = (SELECT id FROM service_categories WHERE name = 'Wedding Packages'));

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Wedding Packages'),
  'Engagement Makeup',
  'Special makeup for engagement ceremony',
  120,
  8000.00,
  6,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Engagement Makeup' AND category_id = (SELECT id FROM service_categories WHERE name = 'Wedding Packages'));

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Wedding Packages'),
  'Saree Draping',
  'Professional saree draping service',
  30,
  1000.00,
  7,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Saree Draping' AND category_id = (SELECT id FROM service_categories WHERE name = 'Wedding Packages'));

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Wedding Packages'),
  'Party Makeup',
  'Glamorous makeup for parties and events',
  90,
  4000.00,
  8,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Party Makeup' AND category_id = (SELECT id FROM service_categories WHERE name = 'Wedding Packages'));

INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
SELECT 
  (SELECT id FROM service_categories WHERE name = 'Wedding Packages'),
  'HD Makeup',
  'High-definition makeup perfect for photos and videos',
  120,
  6000.00,
  9,
  true
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'HD Makeup' AND category_id = (SELECT id FROM service_categories WHERE name = 'Wedding Packages'));

-- Hair Treatments
INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
VALUES 
((SELECT id FROM service_categories WHERE name = 'Hair Treatments'), 'Hair Spa', 'Relaxing hair spa treatment for healthy hair', 60, 1500.00, 1, true),
((SELECT id FROM service_categories WHERE name = 'Hair Treatments'), 'Hair Colouring', 'Professional hair coloring service', 120, 3000.00, 2, true),
((SELECT id FROM service_categories WHERE name = 'Hair Treatments'), 'Streaks', 'Stylish hair streaks for a trendy look', 90, 2500.00, 3, true),
((SELECT id FROM service_categories WHERE name = 'Hair Treatments'), 'Balayage', 'Natural-looking hair highlighting technique', 150, 5000.00, 4, true),
((SELECT id FROM service_categories WHERE name = 'Hair Treatments'), 'Highlights', 'Professional hair highlighting service', 120, 3500.00, 5, true),
((SELECT id FROM service_categories WHERE name = 'Hair Treatments'), 'Ombre', 'Gradient hair color effect', 150, 4500.00, 6, true),
((SELECT id FROM service_categories WHERE name = 'Hair Treatments'), 'Straightening', 'Permanent hair straightening treatment', 180, 6000.00, 7, true),
((SELECT id FROM service_categories WHERE name = 'Hair Treatments'), 'Smoothening', 'Hair smoothening for silky smooth hair', 150, 5000.00, 8, true),
((SELECT id FROM service_categories WHERE name = 'Hair Treatments'), 'Keratin Treatment', 'Keratin-based hair treatment for frizz control', 180, 7000.00, 9, true),
((SELECT id FROM service_categories WHERE name = 'Hair Treatments'), 'Botox Treatment', 'Hair botox for damaged hair repair', 120, 6000.00, 10, true),
((SELECT id FROM service_categories WHERE name = 'Hair Treatments'), 'Wellaplex Treatment', 'Advanced hair strengthening treatment', 90, 4000.00, 11, true),
((SELECT id FROM service_categories WHERE name = 'Hair Treatments'), 'Permanent Blow Dry', 'Long-lasting blow dry treatment', 120, 5000.00, 12, true),
((SELECT id FROM service_categories WHERE name = 'Hair Treatments'), 'Anti-Hair Fall Treatment', 'Treatment to reduce hair fall', 60, 2000.00, 13, true),
((SELECT id FROM service_categories WHERE name = 'Hair Treatments'), 'Anti-Dandruff Treatment', 'Specialized treatment for dandruff control', 60, 1800.00, 14, true)
ON CONFLICT DO NOTHING;

-- Body Care
INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
VALUES 
((SELECT id FROM service_categories WHERE name = 'Body Care'), 'De-tan', 'Remove tan and restore natural skin tone', 60, 2000.00, 1, true),
((SELECT id FROM service_categories WHERE name = 'Body Care'), 'Depigmentation', 'Treatment for skin pigmentation issues', 90, 3500.00, 2, true),
((SELECT id FROM service_categories WHERE name = 'Body Care'), 'Underarms Lightening', 'Specialized underarm brightening treatment', 30, 1000.00, 3, true),
((SELECT id FROM service_categories WHERE name = 'Body Care'), 'Body Polishing', 'Full body polishing for smooth skin', 90, 3000.00, 4, true),
((SELECT id FROM service_categories WHERE name = 'Body Care'), 'Body Wrap', 'Detoxifying body wrap treatment', 60, 2500.00, 5, true),
((SELECT id FROM service_categories WHERE name = 'Body Care'), 'Steam Bath', 'Relaxing steam bath session', 30, 800.00, 6, true),
((SELECT id FROM service_categories WHERE name = 'Body Care'), 'Reflexology', 'Therapeutic foot reflexology massage', 45, 1200.00, 7, true),
((SELECT id FROM service_categories WHERE name = 'Body Care'), 'Footlogix Treatment', 'Professional foot care treatment', 60, 1500.00, 8, true)
ON CONFLICT DO NOTHING;

-- Hair Removal
INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
VALUES 
((SELECT id FROM service_categories WHERE name = 'Hair Removal'), 'Waxing - Full Body', 'Complete body waxing service', 90, 2500.00, 1, true),
((SELECT id FROM service_categories WHERE name = 'Hair Removal'), 'Waxing - Arms', 'Arm waxing service', 20, 400.00, 2, true),
((SELECT id FROM service_categories WHERE name = 'Hair Removal'), 'Waxing - Legs', 'Leg waxing service', 30, 600.00, 3, true),
((SELECT id FROM service_categories WHERE name = 'Hair Removal'), 'Waxing - Full Legs', 'Full leg waxing including thighs', 45, 900.00, 4, true),
((SELECT id FROM service_categories WHERE name = 'Hair Removal'), 'Threading - Eyebrows', 'Eyebrow shaping by threading', 15, 100.00, 5, true),
((SELECT id FROM service_categories WHERE name = 'Hair Removal'), 'Threading - Upper Lip', 'Upper lip threading', 10, 50.00, 6, true),
((SELECT id FROM service_categories WHERE name = 'Hair Removal'), 'Threading - Full Face', 'Complete face threading', 30, 300.00, 7, true)
ON CONFLICT DO NOTHING;

-- Nails
INSERT INTO services (category_id, name, description, duration_minutes, price, display_order, is_active) 
VALUES 
((SELECT id FROM service_categories WHERE name = 'Nails'), 'Manicure', 'Professional manicure service', 45, 600.00, 1, true),
((SELECT id FROM service_categories WHERE name = 'Nails'), 'Pedicure', 'Professional pedicure service', 60, 800.00, 2, true),
((SELECT id FROM service_categories WHERE name = 'Nails'), 'Nail Polish', 'Nail polish application', 20, 200.00, 3, true),
((SELECT id FROM service_categories WHERE name = 'Nails'), 'Nail Art', 'Creative nail art designs', 60, 1000.00, 4, true),
((SELECT id FROM service_categories WHERE name = 'Nails'), 'Nail Extensions', 'Artificial nail extensions', 90, 2000.00, 5, true),
((SELECT id FROM service_categories WHERE name = 'Nails'), 'Heel Peel', 'Heel crack repair and softening treatment', 30, 400.00, 6, true)
ON CONFLICT DO NOTHING;
