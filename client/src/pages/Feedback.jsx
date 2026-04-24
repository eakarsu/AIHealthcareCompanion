import { useState, useEffect } from 'react';
import { MessageCircle, Plus, Send, Bug, Lightbulb, ThumbsUp } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';

export default function Feedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [formData, setFormData] = useState({ type: 'suggestion', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchFeedbacks(); }, []);

  const fetchFeedbacks = async () => {
    try {
      const response = await api.get('/feedback');
      setFeedbacks(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post('/feedback', formData);
      setFeedbacks(prev => [response.data, ...prev]);
      setShowModal(false);
      setFormData({ type: 'suggestion', subject: '', message: '' });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRowClick = (fb) => {
    setSelectedFeedback(fb);
    setShowDetailModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await api.delete(`/feedback/${id}`);
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug': return <Bug className="w-4 h-4" />;
      case 'suggestion': return <Lightbulb className="w-4 h-4" />;
      case 'praise': return <ThumbsUp className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'bug': return 'bg-red-100 text-red-700';
      case 'suggestion': return 'bg-blue-100 text-blue-700';
      case 'praise': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          Feedback
        </h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5" /> New Feedback
        </button>
      </div>

      <div className="space-y-4">
        {feedbacks.map(fb => (
          <div key={fb.id} onClick={() => handleRowClick(fb)} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:border-blue-200 transition-all">
            <div className="flex justify-between mb-2">
              <h3 className="font-semibold text-gray-800">{fb.subject}</h3>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getTypeBadge(fb.type)}`}>
                  {getTypeIcon(fb.type)} {fb.type}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${fb.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {fb.status}
                </span>
              </div>
            </div>
            <p className="text-gray-600 text-sm truncate">{fb.message}</p>
            <p className="text-xs text-gray-400 mt-2">{new Date(fb.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
        {feedbacks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No feedbacks yet</p>
            <button onClick={() => setShowModal(true)} className="mt-4 text-blue-600 hover:underline">Submit your first feedback</button>
          </div>
        )}
      </div>

      {/* Submit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Submit Feedback" size="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
              <option value="suggestion">Suggestion</option>
              <option value="bug">Bug Report</option>
              <option value="praise">Praise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" required placeholder="Brief summary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 h-32 resize-none" required placeholder="Describe in detail..." />
          </div>
          <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
            <Send className="w-5 h-5" /> {submitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Feedback Details" size="md">
        {selectedFeedback && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(selectedFeedback.type)}`}>{selectedFeedback.type}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedFeedback.status === 'open' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{selectedFeedback.status}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2">{selectedFeedback.subject}</h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{selectedFeedback.message}</p>
            </div>
            {selectedFeedback.response && (
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-xs text-blue-600 font-semibold mb-1">Admin Response</p>
                <p className="text-gray-700 text-sm">{selectedFeedback.response}</p>
              </div>
            )}
            <p className="text-xs text-gray-400">Submitted on {new Date(selectedFeedback.createdAt).toLocaleString()}</p>
            <button onClick={() => handleDelete(selectedFeedback.id)} className="w-full py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-sm">
              Delete Feedback
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
