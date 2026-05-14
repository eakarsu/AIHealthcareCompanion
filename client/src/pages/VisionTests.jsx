import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResponseDisplay from '../components/AIResponseDisplay';
import EyeChart from '../components/EyeChart';
import {
  Eye, Plus, Search, Edit2, Trash2, Sparkles,
  Calendar, CheckCircle, Target, PlayCircle, TestTube2
} from 'lucide-react';

export default function VisionTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showEyeTestModal, setShowEyeTestModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const LIMIT = 20;

  const [formData, setFormData] = useState({
    testType: 'Comprehensive',
    leftEyeResult: '',
    rightEyeResult: '',
    colorVision: '',
    contrastSensitivity: '',
    nearVision: '',
    distanceVision: '',
    testDate: ''
  });

  useEffect(() => {
    fetchTests(page);
  }, [page]);

  const fetchTests = async (p = 1) => {
    try {
      const response = await api.get('/vision-tests', { params: { page: p, limit: LIMIT } });
      setTests(response.data.data || response.data);
      if (response.data.pagination) setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (test) => {
    setSelectedTest(test);
    setAiResponse(test.aiAnalysis || null);
    setAiError(null);
    setShowDetailModal(true);
  };

  const handleAddNew = () => {
    setFormData({
      testType: 'Comprehensive',
      leftEyeResult: '',
      rightEyeResult: '',
      colorVision: '',
      contrastSensitivity: '',
      nearVision: '',
      distanceVision: '',
      testDate: new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = () => {
    setFormData({
      testType: selectedTest.testType,
      leftEyeResult: selectedTest.leftEyeResult || '',
      rightEyeResult: selectedTest.rightEyeResult || '',
      colorVision: selectedTest.colorVision || '',
      contrastSensitivity: selectedTest.contrastSensitivity || '',
      nearVision: selectedTest.nearVision || '',
      distanceVision: selectedTest.distanceVision || '',
      testDate: selectedTest.testDate?.split('T')[0] || ''
    });
    setIsEditing(true);
    setShowDetailModal(false);
    setShowFormModal(true);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this vision test?')) return;

    try {
      await api.delete(`/vision-tests/${selectedTest.id}`);
      setTests(tests.filter(t => t.id !== selectedTest.id));
      setShowDetailModal(false);
      setSelectedTest(null);
    } catch (error) {
      console.error('Error deleting test:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const response = await api.put(`/vision-tests/${selectedTest.id}`, formData);
        setTests(prev => prev.map(t => t.id === selectedTest.id ? response.data : t));
        setShowFormModal(false);
      } else {
        const response = await api.post('/vision-tests', formData);
        const newTest = response.data;
        setTests(prev => [newTest, ...prev]);
        setShowFormModal(false);
        setSelectedTest(newTest);
        setAiResponse(null);
        setAiError(null);
        setShowDetailModal(true);
        setAiLoading(true);
        try {
          const aiRes = await api.post(`/vision-tests/${newTest.id}/analyze`);
          setAiResponse(aiRes.data.analysis);
          setSelectedTest(aiRes.data.record);
          setTests(prev => prev.map(t => t.id === newTest.id ? aiRes.data.record : t));
        } catch (aiErr) {
          setAiError(aiErr.response?.status === 429 ? 'AI rate limit reached. Please wait before making more analysis requests.' : (aiErr.response?.data?.error || 'Failed to analyze vision test'));
        } finally {
          setAiLoading(false);
        }
      }
    } catch (error) {
      console.error('Error saving test:', error);
      alert('Failed to save test. Please try again.');
    }
  };

  const handleAIAnalyze = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await api.post(`/vision-tests/${selectedTest.id}/analyze`);
      setAiResponse(response.data.analysis);
      setSelectedTest(response.data.record);
      setTests(prev => prev.map(t => t.id === selectedTest.id ? response.data.record : t));
    } catch (error) {
      setAiError(error.response?.status === 429 ? 'AI rate limit reached. Please wait before making more analysis requests.' : (error.response?.data?.error || 'Failed to analyze vision test'));
    } finally {
      setAiLoading(false);
    }
  };

  const handleEyeTestComplete = async (results) => {
    try {
      const testData = {
        testType: 'Interactive Screening',
        leftEyeResult: results.left,
        rightEyeResult: results.right,
        colorVision: results.color,
        testDate: new Date().toISOString().split('T')[0]
      };
      const response = await api.post('/vision-tests', testData);
      setTests([response.data, ...tests]);
      setShowEyeTestModal(false);
    } catch (error) {
      console.error('Error saving test:', error);
    }
  };

  const sampleVisionTests = [
    { testType: 'Comprehensive', leftEyeResult: '20/25', rightEyeResult: '20/30', colorVision: 'Normal', contrastSensitivity: 'Slightly reduced', nearVision: '20/20', distanceVision: '20/30', testDate: '2026-02-01' },
    { testType: 'Distance Vision', leftEyeResult: '20/40', rightEyeResult: '20/20', colorVision: 'Normal', contrastSensitivity: 'Normal', nearVision: '20/25', distanceVision: '20/40', testDate: '2026-01-15' },
    { testType: 'Screening', leftEyeResult: '20/20', rightEyeResult: '20/25', colorVision: 'Mild red-green deficiency', contrastSensitivity: 'Normal', nearVision: '20/20', distanceVision: '20/20', testDate: '2025-12-20' },
  ];

  const filteredTests = tests.filter(test =>
    (test.testType || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-orange flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            AI Vision Test
          </h1>
          <p className="text-gray-600 mt-1">Track your vision health with AI-powered analysis</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowEyeTestModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
          >
            <PlayCircle className="w-5 h-5" />
            Take Eye Test
          </button>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
          >
            <Plus className="w-5 h-5" />
            Manual Entry
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search tests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>

      {/* Tests List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Test Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Left Eye</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Right Eye</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">AI Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTests.map((test) => (
                <tr
                  key={test.id}
                  onClick={() => handleRowClick(test)}
                  className="hover:bg-orange-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Eye className="w-5 h-5 text-orange-600" />
                      </div>
                      <span className="font-medium text-gray-800">{test.testType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-gray-700">{test.leftEyeResult || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-gray-700">{test.rightEyeResult || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(test.testDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {test.aiAnalysis ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Analyzed
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTests.length === 0 && (
          <div className="text-center py-12">
            <Eye className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No vision tests found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">Page {page} of {pagination.totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Vision Test Details"
        size="lg"
      >
        {selectedTest && (
          <div className="space-y-6">
            {/* Test Info */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{selectedTest.testType} Vision Test</h3>
                <span className="text-gray-500">
                  {new Date(selectedTest.testDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Eye Results */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-blue-600 mb-1">Left Eye</p>
                <p className="text-2xl font-bold text-gray-800">{selectedTest.leftEyeResult || 'N/A'}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-5 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-green-600 mb-1">Right Eye</p>
                <p className="text-2xl font-bold text-gray-800">{selectedTest.rightEyeResult || 'N/A'}</p>
              </div>
            </div>

            {/* Additional Tests */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedTest.colorVision && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Color Vision</p>
                  <p className="font-semibold text-gray-800">{selectedTest.colorVision}</p>
                </div>
              )}
              {selectedTest.contrastSensitivity && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Contrast</p>
                  <p className="font-semibold text-gray-800">{selectedTest.contrastSensitivity}</p>
                </div>
              )}
              {selectedTest.nearVision && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Near Vision</p>
                  <p className="font-semibold text-gray-800">{selectedTest.nearVision}</p>
                </div>
              )}
              {selectedTest.distanceVision && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Distance Vision</p>
                  <p className="font-semibold text-gray-800">{selectedTest.distanceVision}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
            </div>

            {/* AI Response */}
            <AIResponseDisplay
              response={aiResponse}
              loading={aiLoading}
              error={aiError}
            />
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        title={isEditing ? 'Edit Vision Test' : 'New Vision Test'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <TestTube2 className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Fill with sample data</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sampleVisionTests.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...sample })}
                    className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    {sample.testType}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Type *</label>
              <select
                value={formData.testType}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                required
              >
                <option value="Comprehensive">Comprehensive</option>
                <option value="Distance Vision">Distance Vision</option>
                <option value="Near Vision">Near Vision</option>
                <option value="Color Vision">Color Vision</option>
                <option value="Contrast Sensitivity">Contrast Sensitivity</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Screening">Screening</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Date *</label>
              <input
                type="date"
                value={formData.testDate}
                onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Left Eye Result</label>
              <input
                type="text"
                value={formData.leftEyeResult}
                onChange={(e) => setFormData({ ...formData, leftEyeResult: e.target.value })}
                placeholder="e.g., 20/20"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Right Eye Result</label>
              <input
                type="text"
                value={formData.rightEyeResult}
                onChange={(e) => setFormData({ ...formData, rightEyeResult: e.target.value })}
                placeholder="e.g., 20/25"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color Vision</label>
              <input
                type="text"
                value={formData.colorVision}
                onChange={(e) => setFormData({ ...formData, colorVision: e.target.value })}
                placeholder="e.g., Normal"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contrast Sensitivity</label>
              <input
                type="text"
                value={formData.contrastSensitivity}
                onChange={(e) => setFormData({ ...formData, contrastSensitivity: e.target.value })}
                placeholder="e.g., Normal"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Near Vision</label>
              <input
                type="text"
                value={formData.nearVision}
                onChange={(e) => setFormData({ ...formData, nearVision: e.target.value })}
                placeholder="e.g., Normal"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distance Vision</label>
              <input
                type="text"
                value={formData.distanceVision}
                onChange={(e) => setFormData({ ...formData, distanceVision: e.target.value })}
                placeholder="e.g., Slightly reduced"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowFormModal(false)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Save Test'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Interactive Eye Test Modal */}
      <Modal
        isOpen={showEyeTestModal}
        onClose={() => setShowEyeTestModal(false)}
        title="Interactive Vision Screening"
        size="md"
      >
        <EyeChart onComplete={handleEyeTestComplete} />
      </Modal>
    </div>
  );
}
