import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { EmailSettings } from '../../types';

export const SettingsManager = () => {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [formData, setFormData] = useState({
    smtp_host: '',
    smtp_port: 465,
    smtp_user: '',
    smtp_password: '',
    admin_emails: [] as string[],
    from_email: '',
    from_name: '',
  });
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase.from('email_settings').select('*').maybeSingle();

    if (data) {
      setSettings(data);
      setFormData({
        smtp_host: data.smtp_host,
        smtp_port: data.smtp_port,
        smtp_user: data.smtp_user,
        smtp_password: data.smtp_password,
        admin_emails: data.admin_emails,
        from_email: data.from_email,
        from_name: data.from_name,
      });
    }
  };

  const handleSave = async () => {
    if (settings) {
      await supabase
        .from('email_settings')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', settings.id);
    } else {
      await supabase.from('email_settings').insert(formData);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    loadSettings();
  };

  const addAdminEmail = () => {
    if (adminEmailInput && !formData.admin_emails.includes(adminEmailInput)) {
      setFormData({
        ...formData,
        admin_emails: [...formData.admin_emails, adminEmailInput],
      });
      setAdminEmailInput('');
    }
  };

  const removeAdminEmail = (email: string) => {
    setFormData({
      ...formData,
      admin_emails: formData.admin_emails.filter((e) => e !== email),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#264025]">Email Settings</h2>
        {saved && (
          <span className="text-green-600 font-semibold">Settings saved successfully!</span>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-[#DDCBB7]/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-[#264025] mb-4">SMTP Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                SMTP Host
              </label>
              <input
                type="text"
                value={formData.smtp_host}
                onChange={(e) => setFormData({ ...formData, smtp_host: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder="smtp.hostinger.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                value={formData.smtp_port}
                onChange={(e) => setFormData({ ...formData, smtp_port: parseInt(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                SMTP Username
              </label>
              <input
                type="text"
                value={formData.smtp_user}
                onChange={(e) => setFormData({ ...formData, smtp_user: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder="booking@geetandrim.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                SMTP Password
              </label>
              <input
                type="password"
                value={formData.smtp_password}
                onChange={(e) => setFormData({ ...formData, smtp_password: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#DDCBB7]/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-[#264025] mb-4">Sender Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                From Email
              </label>
              <input
                type="email"
                value={formData.from_email}
                onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder="booking@geetandrim.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#264025] mb-2">
                From Name
              </label>
              <input
                type="text"
                value={formData.from_name}
                onChange={(e) => setFormData({ ...formData, from_name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
                placeholder="Geetandrim Salon"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#DDCBB7]/20 rounded-xl p-6">
          <h3 className="text-lg font-bold text-[#264025] mb-4">Admin Notification Emails</h3>
          <div className="flex space-x-2 mb-4">
            <input
              type="email"
              value={adminEmailInput}
              onChange={(e) => setAdminEmailInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAdminEmail()}
              className="flex-1 px-4 py-2 rounded-lg border-2 border-[#DDCBB7] focus:border-[#AD6B4B] outline-none"
              placeholder="Add admin email"
            />
            <button
              onClick={addAdminEmail}
              className="bg-[#AD6B4B] text-white px-6 py-2 rounded-lg hover:bg-[#7B4B36] transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.admin_emails.map((email) => (
              <div
                key={email}
                className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full"
              >
                <span className="text-[#264025]">{email}</span>
                <button
                  onClick={() => removeAdminEmail(email)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
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
