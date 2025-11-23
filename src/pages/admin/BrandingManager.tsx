import { useState, useEffect } from 'react';
import { Save, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SiteBranding } from '../../types';

export const BrandingManager = () => {
  const [branding, setBranding] = useState<SiteBranding | null>(null);
  const [formData, setFormData] = useState({
    site_name: 'Geetandrim',
    logo_url: '',
    favicon_url: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    const { data } = await supabase.from('site_branding').select('*').maybeSingle();

    if (data) {
      setBranding(data);
      setFormData({
        site_name: data.site_name,
        logo_url: data.logo_url || '',
        favicon_url: data.favicon_url || '',
      });
    }
  };

  const handleSave = async () => {
    if (branding) {
      await supabase
        .from('site_branding')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', branding.id);
    } else {
      await supabase.from('site_branding').insert(formData);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    loadBranding();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#264025]">Site Branding</h2>
          <p className="text-sm text-[#82896E] mt-1">
            Customize your site name and logo
          </p>
        </div>
        {saved && (
          <span className="text-green-600 font-semibold">Settings saved successfully!</span>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-[#DDCBB7]/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-[#264025] mb-4">Site Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                Site Name
              </label>
              <input
                type="text"
                value={formData.site_name}
                onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder="Geetandrim"
              />
              <p className="text-xs text-[#82896E] mt-1">
                This name appears in the header and throughout the site
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#DDCBB7]/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Upload className="text-[#AD6B4B]" size={24} />
            <h3 className="text-lg font-bold text-[#264025]">Logo & Favicon</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                Logo URL
              </label>
              <input
                type="text"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-[#82896E] mt-1">
                Upload your logo to an image hosting service and paste the URL here. Recommended size: 200x60px
              </p>
              {formData.logo_url && (
                <div className="mt-4 p-4 bg-white rounded-lg border-2 border-[#DDCBB7]">
                  <p className="text-sm font-semibold text-[#264025] mb-2">Logo Preview:</p>
                  <img
                    src={formData.logo_url}
                    alt="Logo preview"
                    className="h-12 w-auto object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                Favicon URL (Optional)
              </label>
              <input
                type="text"
                value={formData.favicon_url}
                onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder="https://example.com/favicon.ico"
              />
              <p className="text-xs text-[#82896E] mt-1">
                Browser tab icon. Recommended format: .ico or .png (32x32px)
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <h4 className="font-bold text-blue-900 mb-2">How to upload images:</h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Use free image hosting services like Imgur, ImgBB, or Cloudinary</li>
            <li>Upload your logo/favicon image</li>
            <li>Copy the direct image URL</li>
            <li>Paste the URL in the field above</li>
            <li>Click Save Settings to apply changes</li>
          </ol>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-[#AD6B4B] text-white px-8 py-3 rounded-lg hover:bg-[#7B4B36] transition-colors shadow-lg"
        >
          <Save size={20} />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};
