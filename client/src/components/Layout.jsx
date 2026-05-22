import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, Pill, Activity, Camera, Eye, FileText,
  LogOut, Menu, X, Heart, Bell, Settings, MessageCircle,
  Shield, MessageSquare, FileCheck, Download, ClipboardList
} from 'lucide-react';
import { useState, useEffect } from 'react';
import GlobalSearch from './GlobalSearch';
import api from '../services/api';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/medications', icon: Pill, label: 'Medications' },
  { path: '/physical-therapy', icon: Activity, label: 'Physical Therapy' },
  { path: '/skin-scans', icon: Camera, label: 'Skin Scanner' },
  { path: '/vision-tests', icon: Eye, label: 'Vision Tests' },
  { path: '/medical-history', icon: FileText, label: 'Medical History' },
  { path: '/lab-trend-watch', icon: ClipboardList, label: 'Lab Trend Watch' },
  { path: '/notifications', icon: Bell, label: 'Notifications' },
  { path: '/feedback', icon: MessageCircle, label: 'Feedback' },
  { path: '/contact', icon: MessageSquare, label: 'Contact' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const bottomLinks = [
  { path: '/privacy-policy', icon: Shield, label: 'Privacy Policy' },
  { path: '/terms-of-service', icon: FileCheck, label: 'Terms of Service' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications?limit=1');
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      // Silently fail
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExportCSV = async (type) => {
    try {
      const response = await api.get(`/export/csv/${type}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const allNavItems = user?.role === 'admin'
    ? [...navItems, { path: '/admin', icon: Shield, label: 'Admin Panel' }]
    : navItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-md px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="w-8 h-8 text-blue-600" />
          <span className="font-bold text-lg text-gray-800">HealthCare AI</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-lg hover:bg-gray-100"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
          >
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-xl
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="h-full flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-gray-800">HealthCare AI</h1>
                  <p className="text-xs text-gray-500">Your Health Companion</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-16 lg:mt-0">
              {allNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.path === '/notifications' && unreadCount > 0 && !isActive && (
                      <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}

              <div className="border-t border-gray-100 mt-4 pt-4">
                <p className="px-4 py-1 text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">AI Gap Features</p>
                {[
                  { path: '/gap-no-appointment-scheduling', label: 'Appointment Scheduling' },
                  { path: '/gap-no-insurance-information-module', label: 'Insurance Information' },
                  { path: '/gap-no-lab-result-import', label: 'Lab Result Import' },
                  { path: '/gap-no-medication-adherence-pattern-model', label: 'Medication Adherence Pattern' },
                  { path: '/gap-no-medication-interaction-checker', label: 'Medication Interaction' },
                  { path: '/gap-no-prescription-pharmacy-integration', label: 'Prescription & Pharmacy' },
                  { path: '/gap-no-provider-portal-share-data-with', label: 'Provider Portal' },
                  { path: '/gap-no-skin-lesion-vision-ai', label: 'Skin Lesion Vision AI' },
                  { path: '/gap-no-symptom-analyzer-endpoint', label: 'Symptom Analyzer' },
                  { path: '/gap-no-telemedicine', label: 'Telemedicine' },
                  { path: '/gap-no-therapy-progress-analyzer', label: 'Therapy Progress' },
                  { path: '/gap-no-vision-test-interpreter', label: 'Vision Test Interpreter' },
                  { path: '/gap-no-webhook-surface', label: 'Webhook Surface' },
                ].map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all duration-200 ${
                        isActive ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 mt-4 pt-4">
                {bottomLinks.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 text-sm"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:min-h-[calc(100vh)]" role="main">
          {/* Top bar with search */}
          <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b bg-white/80 backdrop-blur-sm">
            <GlobalSearch />
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {/* Export dropdown */}
              <div className="relative group">
                <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors" aria-label="Export data">
                  <Download className="w-5 h-5 text-gray-600" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 hidden group-hover:block z-50">
                  <p className="px-4 py-1 text-xs text-gray-400 font-semibold uppercase">Export CSV</p>
                  {['medications', 'physical-therapy', 'skin-scans', 'vision-tests', 'medical-history'].map(type => (
                    <button key={type} onClick={() => handleExportCSV(type)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 capitalize">
                      {type.replace(/-/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
