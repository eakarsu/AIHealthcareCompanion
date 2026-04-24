import { useState, useEffect } from 'react';
import { Users, BarChart3, Shield, MessageCircle, Mail, FileText } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, logsRes, fbRes, contactRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/audit-logs'),
        api.get('/admin/feedbacks'),
        api.get('/admin/contacts')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users);
      setAuditLogs(logsRes.data.logs);
      setFeedbacks(fbRes.data);
      setContacts(contactRes.data);
    } catch (error) {
      console.error('Admin data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (item, type) => {
    setSelectedItem({ ...item, _type: type });
    setShowDetailModal(true);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'feedbacks', label: 'Feedbacks', icon: MessageCircle },
    { id: 'contacts', label: 'Messages', icon: Mail },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-red flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        Admin Panel
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all" onClick={() => {
              const tabMap = { users: 'users', feedbacks: 'feedbacks', contacts: 'contacts' };
              if (tabMap[key]) setActiveTab(tabMap[key]);
            }}>
              <p className="text-3xl font-bold text-gray-800">{value}</p>
              <p className="text-sm text-gray-500 capitalize">{key}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Verified</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} onClick={() => handleRowClick(u, 'user')} className="hover:bg-blue-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800">{u.name}</td>
                    <td className="px-6 py-4 text-gray-600">{u.email}</td>
                    <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{u.role}</span></td>
                    <td className="px-6 py-4">{u.emailVerified ? <span className="text-green-600">Yes</span> : <span className="text-gray-400">No</span>}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Resource</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map(log => (
                  <tr key={log.id} onClick={() => handleRowClick(log, 'audit')} className="hover:bg-blue-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4"><span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{log.action}</span></td>
                    <td className="px-6 py-4 text-gray-700">{log.resource}</td>
                    <td className="px-6 py-4 text-gray-600">{log.user?.name || 'System'}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">No audit logs yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feedbacks */}
      {activeTab === 'feedbacks' && (
        <div className="space-y-4">
          {feedbacks.map(fb => (
            <div key={fb.id} onClick={() => handleRowClick(fb, 'feedback')} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:border-blue-200 transition-all">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{fb.subject}</h3>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${fb.type === 'bug' ? 'bg-red-100 text-red-700' : fb.type === 'suggestion' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{fb.type}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${fb.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{fb.status}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm truncate">{fb.message}</p>
              <p className="text-xs text-gray-400 mt-2">{fb.user?.name || 'Anonymous'} - {new Date(fb.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
          {feedbacks.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl"><MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No feedbacks yet</p></div>
          )}
        </div>
      )}

      {/* Contact Messages */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          {contacts.map(c => (
            <div key={c.id} onClick={() => handleRowClick(c, 'contact')} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:border-blue-200 transition-all">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{c.subject}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${c.status === 'new' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{c.status}</span>
              </div>
              <p className="text-gray-600 text-sm">{c.name} ({c.email})</p>
              <p className="text-gray-500 text-sm mt-1 truncate">{c.message}</p>
            </div>
          ))}
          {contacts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl"><Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">No contact messages yet</p></div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Details" size="md">
        {selectedItem && (
          <div className="space-y-4">
            {Object.entries(selectedItem).filter(([k]) => !k.startsWith('_') && k !== 'password').map(([key, value]) => (
              <div key={key} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="text-gray-800 text-sm break-words">{typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : String(value ?? 'N/A')}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
