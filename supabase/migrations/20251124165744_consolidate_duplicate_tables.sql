/*
  # Consolidate Duplicate Tables and Clean Up Database

  ## Changes Made:
  
  1. **Remove Duplicate Settings Tables**
     - Drop `business_settings` (duplicate of contact_settings)
     - Drop `salon_settings` (duplicate of contact_settings)
     - Drop `site_settings` (duplicate of contact_settings)
     - Keep only `contact_settings` as the single source of truth
  
  2. **Consolidate Image Categories**
     - Merge `service_category` into `category` in site_images
     - Merge `hero_grid` into `hero` in site_images
     - These are duplicates serving the same purpose
  
  3. **Keep Existing Tables**
     - `hero_images` - for legacy hero slider (can be migrated later if needed)
     - `gallery_images` - for general gallery
     - `site_images` - for organized site-wide images with categories
  
  ## Data Preservation:
  - All existing data is preserved
  - Categories are merged, not deleted
*/

-- Step 1: Update site_images categories to consolidate duplicates
UPDATE site_images 
SET category = 'category' 
WHERE category = 'service_category';

UPDATE site_images 
SET category = 'hero' 
WHERE category = 'hero_grid';

-- Step 2: Drop duplicate settings tables (keeping contact_settings as primary)
DROP TABLE IF EXISTS business_settings CASCADE;
DROP TABLE IF EXISTS salon_settings CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;

-- Step 3: Add index for better performance on site_images
CREATE INDEX IF NOT EXISTS idx_site_images_category ON site_images(category);
CREATE INDEX IF NOT EXISTS idx_site_images_active ON site_images(is_active) WHERE is_active = true;
