import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Pill, Activity, Camera, Eye, FileText, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      const wasUnread = notifications.find(n => n.id === id)?.read === false;
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'medication': return <Pill className="w-5 h-5 text-blue-600" />;
      case 'exercise': return <Activity className="w-5 h-5 text-green-600" />;
      case 'skin': return <Camera className="w-5 h-5 text-purple-600" />;
      case 'vision': return <Eye className="w-5 h-5 text-orange-600" />;
      case 'medical': return <FileText className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'medication': return 'bg-blue-100';
      case 'exercise': return 'bg-green-100';
      case 'skin': return 'bg-purple-100';
      case 'vision': return 'bg-orange-100';
      case 'medical': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-3 py-1 bg-red-500 text-white text-sm rounded-full">{unreadCount}</span>
            )}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
            <CheckCheck className="w-5 h-5" /> Mark All Read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div key={notif.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${notif.read ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl ${getIconBg(notif.type)} flex items-center justify-center flex-shrink-0`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className={`font-semibold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>{notif.title}</h3>
                  <span className="text-xs text-gray-400 flex-shrink-0">{new Date(notif.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">{notif.message}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {!notif.read && (
                  <button onClick={() => markAsRead(notif.id)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Mark as read">
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => deleteNotification(notif.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
