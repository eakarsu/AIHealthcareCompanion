import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResponseDisplay from '../components/AIResponseDisplay';
import {
  FileText, Plus, Search, Edit2, Trash2, Sparkles,
  Calendar, User, Building, CheckCircle, Clock, AlertCircle, TestTube2
} from 'lucide-react';

export default function MedicalHistory() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState(null);

  const [formData, setFormData] = useState({
    condition: '',
    diagnosisDate: '',
    status: 'Managed',
    treatingDoctor: '',
    hospital: '',
    medications: '',
    surgeries: '',
    allergies: '',
    familyHistory: '',
    notes: ''
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await api.get('/medical-history');
      setRecords(response.data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (record) => {
    setSelectedRecord(record);
    setAiResponse(record.aiInsights || null);
    setAiError(null);
    setShowDetailModal(true);
  };

  const handleAddNew = () => {
    setFormData({
      condition: '',
      diagnosisDate: new Date().toISOString().split('T')[0],
      status: 'Managed',
      treatingDoctor: '',
      hospital: '',
      medications: '',
      surgeries: '',
      allergies: '',
      familyHistory: '',
      notes: ''
    });
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = () => {
    setFormData({
      condition: selectedRecord.condition,
      diagnosisDate: selectedRecord.diagnosisDate?.split('T')[0] || '',
      status: selectedRecord.status,
      treatingDoctor: selectedRecord.treatingDoctor || '',
      hospital: selectedRecord.hospital || '',
      medications: selectedRecord.medications || '',
      surgeries: selectedRecord.surgeries || '',
      allergies: selectedRecord.allergies || '',
      familyHistory: selectedRecord.familyHistory || '',
      notes: selectedRecord.notes || ''
    });
    setIsEditing(true);
    setShowDetailModal(false);
    setShowFormModal(true);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this medical record?')) return;

    try {
      await api.delete(`/medical-history/${selectedRecord.id}`);
      setRecords(records.filter(r => r.id !== selectedRecord.id));
      setShowDetailModal(false);
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const response = await api.put(`/medical-history/${selectedRecord.id}`, formData);
        setRecords(prev => prev.map(r => r.id === selectedRecord.id ? response.data : r));
        setShowFormModal(false);
      } else {
        const response = await api.post('/medical-history', formData);
        const newRecord = response.data;
        setRecords(prev => [newRecord, ...prev]);
        setShowFormModal(false);
        setSelectedRecord(newRecord);
        setAiResponse(null);
        setAiError(null);
        setShowDetailModal(true);
        setAiLoading(true);
        try {
          const aiRes = await api.post(`/medical-history/${newRecord.id}/analyze`);
          setAiResponse(aiRes.data.analysis);
          setSelectedRecord(aiRes.data.record);
          setRecords(prev => prev.map(r => r.id === newRecord.id ? aiRes.data.record : r));
        } catch (aiErr) {
          setAiError(aiErr.response?.data?.error || 'Failed to analyze medical history');
        } finally {
          setAiLoading(false);
        }
      }
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Failed to save record. Please try again.');
    }
  };

  const handleAIAnalyze = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await api.post(`/medical-history/${selectedRecord.id}/analyze`);
      setAiResponse(response.data.analysis);
      setSelectedRecord(response.data.record);
      setRecords(prev => prev.map(r => r.id === selectedRecord.id ? response.data.record : r));
    } catch (error) {
      setAiError(error.response?.data?.error || 'Failed to analyze medical history');
    } finally {
      setAiLoading(false);
    }
  };

  const sampleRecords = [
    { condition: 'Type 2 Diabetes', diagnosisDate: '2023-03-15', status: 'Managed', treatingDoctor: 'Dr. Sarah Johnson', hospital: 'City General Hospital', medications: 'Metformin 500mg twice daily', surgeries: '', allergies: 'Penicillin, Sulfa drugs', familyHistory: 'Father had Type 2 Diabetes, Mother had hypertension', notes: 'A1C levels trending down from 8.2 to 7.1 over past year. Regular exercise and diet modifications.' },
    { condition: 'Hypertension', diagnosisDate: '2022-08-20', status: 'Controlled', treatingDoctor: 'Dr. Michael Chen', hospital: 'Heart Care Clinic', medications: 'Lisinopril 10mg daily, Amlodipine 5mg daily', surgeries: '', allergies: 'Penicillin', familyHistory: 'Mother had hypertension, Maternal grandmother had stroke', notes: 'Blood pressure consistently around 128/82 on current medication regimen.' },
    { condition: 'Lumbar Disc Herniation', diagnosisDate: '2024-11-05', status: 'Improving', treatingDoctor: 'Dr. Emily Rodriguez', hospital: 'Spine & Orthopedic Center', medications: 'Ibuprofen 400mg as needed, Cyclobenzaprine 10mg at night', surgeries: 'Microdiscectomy L4-L5 (Jan 2025)', allergies: '', familyHistory: 'No relevant family history', notes: 'Post-surgery recovery going well. Physical therapy 3x per week. Pain reduced from 8/10 to 3/10.' },
  ];

  const filteredRecords = records.filter(record =>
    (record.condition || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'managed':
      case 'controlled': return 'bg-blue-100 text-blue-700';
      case 'chronic':
      case 'intermittent': return 'bg-yellow-100 text-yellow-700';
      case 'mild': return 'bg-gray-100 text-gray-700';
      case 'improving': return 'bg-cyan-100 text-cyan-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'chronic':
      case 'intermittent': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-red flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            Medical History Analyzer
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive health records with AI insights</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
        >
          <Plus className="w-5 h-5" />
          Add Record
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search medical records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>

      {/* Records List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Condition</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Diagnosis Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">AI Insights</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => handleRowClick(record)}
                  className="hover:bg-red-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <span className="font-medium text-gray-800">{record.condition}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(record.diagnosisDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {record.treatingDoctor ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4" />
                        {record.treatingDoctor}
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {record.aiInsights ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                        <Sparkles className="w-4 h-4" />
                        Available
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not analyzed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No medical records found</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Medical Record Details"
        size="lg"
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Record Header */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{selectedRecord.condition}</h3>
                  <p className="text-gray-600 mt-1">
                    Diagnosed: {new Date(selectedRecord.diagnosisDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRecord.status)}`}>
                  {selectedRecord.status}
                </span>
              </div>
            </div>

            {/* Record Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedRecord.treatingDoctor && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Treating Doctor</span>
                  </div>
                  <p className="font-semibold text-gray-800">{selectedRecord.treatingDoctor}</p>
                </div>
              )}
              {selectedRecord.hospital && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Building className="w-4 h-4" />
                    <span className="text-sm">Hospital/Clinic</span>
                  </div>
                  <p className="font-semibold text-gray-800">{selectedRecord.hospital}</p>
                </div>
              )}
              {selectedRecord.medications && (
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-600 mb-1">Related Medications</p>
                  <p className="font-semibold text-blue-800">{selectedRecord.medications}</p>
                </div>
              )}
              {selectedRecord.surgeries && (
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-purple-600 mb-1">Surgeries</p>
                  <p className="font-semibold text-purple-800">{selectedRecord.surgeries}</p>
                </div>
              )}
              {selectedRecord.allergies && (
                <div className="bg-red-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-red-600 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Allergies</span>
                  </div>
                  <p className="font-semibold text-red-800">{selectedRecord.allergies}</p>
                </div>
              )}
              {selectedRecord.familyHistory && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-sm text-amber-600 mb-1">Family History</p>
                  <p className="font-semibold text-amber-800">{selectedRecord.familyHistory}</p>
                </div>
              )}
            </div>

            {selectedRecord.notes && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Notes</p>
                <p className="text-gray-700">{selectedRecord.notes}</p>
              </div>
            )}

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
        title={isEditing ? 'Edit Medical Record' : 'Add Medical Record'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isEditing && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <TestTube2 className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Fill with sample data</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sampleRecords.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...sample })}
                    className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    {sample.condition}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition/Diagnosis *</label>
              <input
                type="text"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                placeholder="e.g., Type 2 Diabetes"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis Date *</label>
              <input
                type="date"
                value={formData.diagnosisDate}
                onChange={(e) => setFormData({ ...formData, diagnosisDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="Managed">Managed</option>
                <option value="Controlled">Controlled</option>
                <option value="Resolved">Resolved</option>
                <option value="Chronic">Chronic</option>
                <option value="Intermittent">Intermittent</option>
                <option value="Improving">Improving</option>
                <option value="Mild">Mild</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Treating Doctor</label>
              <input
                type="text"
                value={formData.treatingDoctor}
                onChange={(e) => setFormData({ ...formData, treatingDoctor: e.target.value })}
                placeholder="e.g., Dr. Smith"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Clinic</label>
              <input
                type="text"
                value={formData.hospital}
                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                placeholder="e.g., City General Hospital"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Related Medications</label>
              <input
                type="text"
                value={formData.medications}
                onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                placeholder="e.g., Metformin 500mg"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Surgeries</label>
            <input
              type="text"
              value={formData.surgeries}
              onChange={(e) => setFormData({ ...formData, surgeries: e.target.value })}
              placeholder="Any related surgeries"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                placeholder="Known allergies"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Family History</label>
              <input
                type="text"
                value={formData.familyHistory}
                onChange={(e) => setFormData({ ...formData, familyHistory: e.target.value })}
                placeholder="Relevant family history"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Additional notes or information"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
            />
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
              className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Add Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
