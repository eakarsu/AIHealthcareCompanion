import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Globe, Lock, Download, Trash2, Shield, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({ name: '', darkMode: false, language: 'en' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings({ name: response.data.name, darkMode: response.data.darkMode, language: response.data.language });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/settings', settings);
      setMessage({ type: 'success', text: 'Settings saved successfully' });
      if (settings.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setChangingPassword(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/settings/password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setMessage({ type: 'success', text: 'Password changed successfully' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to change password' });
    } finally {
      setChangingPassword(false);
    }
  };

  const exportData = async () => {
    try {
      const response = await api.get('/gdpr/export');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'health-data-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to export data');
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to permanently delete your account and ALL data? This cannot be undone.')) return;
    if (!confirm('FINAL WARNING: This will permanently delete all your health records, medications, scans, and personal data. Continue?')) return;
    try {
      await api.delete('/gdpr/delete-account');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    } catch (error) {
      alert('Failed to delete account');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        Settings
      </h1>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Profile Settings */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input type="text" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={user?.email || ''} className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50" disabled />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.darkMode ? <Moon className="w-5 h-5 text-blue-600" /> : <Sun className="w-5 h-5 text-yellow-600" />}
            <div>
              <p className="font-medium text-gray-800">Dark Mode</p>
              <p className="text-sm text-gray-500">Switch between light and dark theme</p>
            </div>
          </div>
          <button onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })} className={`relative w-14 h-7 rounded-full transition-colors ${settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'}`} aria-label="Toggle dark mode">
            <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${settings.darkMode ? 'translate-x-7' : ''}`} />
          </button>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Globe className="w-5 h-5" /> Language</h2>
        <select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="zh">Chinese</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="ar">Arabic</option>
          <option value="hi">Hindi</option>
          <option value="pt">Portuguese</option>
        </select>
      </div>

      <button onClick={saveSettings} disabled={saving} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
        <Save className="w-5 h-5" /> {saving ? 'Saving...' : 'Save Settings'}
      </button>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Lock className="w-5 h-5" /> Change Password</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <input type="password" placeholder="Current Password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" required />
          <input type="password" placeholder="New Password (min 6 characters)" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" required minLength={6} />
          <input type="password" placeholder="Confirm New Password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" required minLength={6} />
          <button type="submit" disabled={changingPassword} className="px-6 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-900 disabled:opacity-50">
            {changingPassword ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Data & Privacy */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Shield className="w-5 h-5" /> Data & Privacy (GDPR)</h2>
        <div className="space-y-4">
          <button onClick={exportData} className="w-full flex items-center justify-center gap-2 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100">
            <Download className="w-5 h-5" /> Export All My Data (JSON)
          </button>
          <button onClick={deleteAccount} className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100">
            <Trash2 className="w-5 h-5" /> Delete My Account & All Data
          </button>
        </div>
      </div>
    </div>
  );
}
