import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResponseDisplay from '../components/AIResponseDisplay';
import {
  Pill, Plus, Search, Edit2, Trash2, Sparkles,
  Clock, AlertCircle, CheckCircle, Calendar, TestTube2
} from 'lucide-react';

export default function Medications() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    timeOfDay: '',
    startDate: '',
    endDate: '',
    purpose: '',
    sideEffects: '',
    notes: '',
    isActive: true
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await api.get('/medications');
      setMedications(response.data);
    } catch (error) {
      console.error('Error fetching medications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (med) => {
    setSelectedMed(med);
    setAiResponse(med.aiAnalysis || null);
    setAiError(null);
    setShowDetailModal(true);
  };

  const handleAddNew = () => {
    setFormData({
      name: '',
      dosage: '',
      frequency: '',
      timeOfDay: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      purpose: '',
      sideEffects: '',
      notes: '',
      isActive: true
    });
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = () => {
    setFormData({
      name: selectedMed.name,
      dosage: selectedMed.dosage,
      frequency: selectedMed.frequency,
      timeOfDay: selectedMed.timeOfDay,
      startDate: selectedMed.startDate?.split('T')[0] || '',
      endDate: selectedMed.endDate?.split('T')[0] || '',
      purpose: selectedMed.purpose,
      sideEffects: selectedMed.sideEffects || '',
      notes: selectedMed.notes || '',
      isActive: selectedMed.isActive
    });
    setIsEditing(true);
    setShowDetailModal(false);
    setShowFormModal(true);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this medication?')) return;

    try {
      await api.delete(`/medications/${selectedMed.id}`);
      setMedications(medications.filter(m => m.id !== selectedMed.id));
      setShowDetailModal(false);
      setSelectedMed(null);
    } catch (error) {
      console.error('Error deleting medication:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const response = await api.put(`/medications/${selectedMed.id}`, formData);
        setMedications(prev => prev.map(m => m.id === selectedMed.id ? response.data : m));
        setShowFormModal(false);
      } else {
        const response = await api.post('/medications', formData);
        const newMed = response.data;
        setMedications(prev => [newMed, ...prev]);
        setShowFormModal(false);
        setSelectedMed(newMed);
        setAiResponse(null);
        setAiError(null);
        setShowDetailModal(true);
        setAiLoading(true);
        try {
          const aiRes = await api.post(`/medications/${newMed.id}/analyze`);
          setAiResponse(aiRes.data.analysis);
          setSelectedMed(aiRes.data.record);
          setMedications(prev => prev.map(m => m.id === newMed.id ? aiRes.data.record : m));
        } catch (aiErr) {
          setAiError(aiErr.response?.data?.error || 'Failed to analyze medication');
        } finally {
          setAiLoading(false);
        }
      }
    } catch (error) {
      console.error('Error saving medication:', error);
    }
  };

  const handleAIAnalyze = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await api.post(`/medications/${selectedMed.id}/analyze`);
      setAiResponse(response.data.analysis);
      setSelectedMed(response.data.record);
      setMedications(prev => prev.map(m => m.id === selectedMed.id ? response.data.record : m));
    } catch (error) {
      setAiError(error.response?.data?.error || 'Failed to analyze medication');
    } finally {
      setAiLoading(false);
    }
  };

  const sampleMedications = [
    { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', timeOfDay: 'Morning with food', startDate: '2025-01-15', purpose: 'High blood pressure management', sideEffects: 'Dizziness, dry cough', notes: 'Also taking Metformin and Aspirin - check interactions', isActive: true },
    { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', timeOfDay: 'Morning and evening with meals', startDate: '2024-06-01', purpose: 'Type 2 diabetes management', sideEffects: 'Nausea, stomach upset', notes: 'Monitor blood sugar levels regularly', isActive: true },
    { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', timeOfDay: 'Morning', startDate: '2025-03-10', purpose: 'Heart attack and stroke prevention', sideEffects: 'Stomach irritation, easy bruising', notes: 'Low-dose aspirin therapy', isActive: true },
  ];

  const filteredMedications = medications.filter(med =>
    (med.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (med.purpose || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            Medication Reminder
          </h1>
          <p className="text-gray-600 mt-1">Track your medications and check for interactions</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <Plus className="w-5 h-5" />
          Add Medication
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search medications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Medications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Medication</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dosage</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Frequency</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMedications.map((med) => (
                <tr
                  key={med.id}
                  onClick={() => handleRowClick(med)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Pill className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{med.name}</p>
                        <p className="text-sm text-gray-500">{med.purpose}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{med.dosage}</td>
                  <td className="px-6 py-4 text-gray-700">{med.frequency}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {med.timeOfDay}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {med.isActive ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMedications.length === 0 && (
          <div className="text-center py-12">
            <Pill className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No medications found</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Medication Details"
        size="lg"
      >
        {selectedMed && (
          <div className="space-y-6">
            {/* Medication Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Medication Name</p>
                <p className="font-semibold text-gray-800">{selectedMed.name}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Dosage</p>
                <p className="font-semibold text-gray-800">{selectedMed.dosage}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Frequency</p>
                <p className="font-semibold text-gray-800">{selectedMed.frequency}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Time of Day</p>
                <p className="font-semibold text-gray-800">{selectedMed.timeOfDay}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Purpose</p>
                <p className="font-semibold text-gray-800">{selectedMed.purpose}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Start Date</p>
                <p className="font-semibold text-gray-800">
                  {new Date(selectedMed.startDate).toLocaleDateString()}
                </p>
              </div>
              {selectedMed.sideEffects && (
                <div className="bg-amber-50 rounded-xl p-4 md:col-span-2">
                  <p className="text-sm text-amber-600 mb-1">Known Side Effects</p>
                  <p className="font-semibold text-amber-800">{selectedMed.sideEffects}</p>
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
        title={isEditing ? 'Edit Medication' : 'Add New Medication'}
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
                {sampleMedications.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...sample })}
                    className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dosage *</label>
              <input
                type="text"
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                placeholder="e.g., 10mg"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select frequency</option>
                <option value="Once daily">Once daily</option>
                <option value="Twice daily">Twice daily</option>
                <option value="Three times daily">Three times daily</option>
                <option value="Every 6 hours">Every 6 hours</option>
                <option value="Every 8 hours">Every 8 hours</option>
                <option value="As needed">As needed</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time of Day *</label>
              <input
                type="text"
                value={formData.timeOfDay}
                onChange={(e) => setFormData({ ...formData, timeOfDay: e.target.value })}
                placeholder="e.g., Morning with food"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="What is this medication for?"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Side Effects</label>
            <input
              type="text"
              value={formData.sideEffects}
              onChange={(e) => setFormData({ ...formData, sideEffects: e.target.value })}
              placeholder="Known side effects"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">Currently taking this medication</label>
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
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Add Medication'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
