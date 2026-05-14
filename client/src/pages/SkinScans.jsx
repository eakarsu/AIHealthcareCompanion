import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResponseDisplay from '../components/AIResponseDisplay';
import ImageUpload from '../components/ImageUpload';
import {
  Camera, Plus, Search, Edit2, Trash2, Sparkles,
  AlertTriangle, CheckCircle, Clock, MapPin, Image, TestTube2
} from 'lucide-react';

export default function SkinScans() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScan, setSelectedScan] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiStructured, setAiStructured] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const LIMIT = 20;

  const [formData, setFormData] = useState({
    bodyLocation: '',
    symptomDescription: '',
    duration: '',
    severity: 'Mild',
    imageUrl: ''
  });

  useEffect(() => {
    fetchScans(page);
  }, [page]);

  const fetchScans = async (p = 1) => {
    try {
      const response = await api.get('/skin-scans', { params: { page: p, limit: LIMIT } });
      setScans(response.data.data || response.data);
      if (response.data.pagination) setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (scan) => {
    setSelectedScan(scan);
    setAiResponse(scan.aiDiagnosis || null);
    setAiStructured(null);
    setAiError(null);
    setShowDetailModal(true);
  };

  const handleAddNew = () => {
    setFormData({
      bodyLocation: '',
      symptomDescription: '',
      duration: '',
      severity: 'Mild',
      imageUrl: ''
    });
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = () => {
    setFormData({
      bodyLocation: selectedScan.bodyLocation,
      symptomDescription: selectedScan.symptomDescription,
      duration: selectedScan.duration,
      severity: selectedScan.severity,
      imageUrl: selectedScan.imageUrl || ''
    });
    setIsEditing(true);
    setShowDetailModal(false);
    setShowFormModal(true);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this skin scan?')) return;

    try {
      await api.delete(`/skin-scans/${selectedScan.id}`);
      setScans(scans.filter(s => s.id !== selectedScan.id));
      setShowDetailModal(false);
      setSelectedScan(null);
    } catch (error) {
      console.error('Error deleting scan:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const response = await api.put(`/skin-scans/${selectedScan.id}`, formData);
        setScans(prev => prev.map(s => s.id === selectedScan.id ? response.data : s));
        setShowFormModal(false);
      } else {
        const response = await api.post('/skin-scans', formData);
        const newScan = response.data;
        setScans(prev => [newScan, ...prev]);
        setShowFormModal(false);
        setSelectedScan(newScan);
        setAiResponse(null);
        setAiError(null);
        setShowDetailModal(true);
        setAiLoading(true);
        try {
          const aiRes = await api.post(`/skin-scans/${newScan.id}/analyze`);
          setAiResponse(aiRes.data.analysis);
          setAiStructured(aiRes.data.structured || null);
          setSelectedScan(aiRes.data.record);
          setScans(prev => prev.map(s => s.id === newScan.id ? aiRes.data.record : s));
        } catch (aiErr) {
          const status = aiErr.response?.status;
          const errMsg = status === 429 ? 'AI rate limit reached. Please wait before making more analysis requests.' : (aiErr.response?.data?.error || 'Failed to analyze skin condition');
          setAiError(errMsg);
        } finally {
          setAiLoading(false);
        }
      }
    } catch (error) {
      console.error('Error saving scan:', error);
    }
  };

  const handleAIAnalyze = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await api.post(`/skin-scans/${selectedScan.id}/analyze`);
      setAiResponse(response.data.analysis);
      setAiStructured(response.data.structured || null);
      setSelectedScan(response.data.record);
      setScans(prev => prev.map(s => s.id === selectedScan.id ? response.data.record : s));
    } catch (error) {
      const status = error.response?.status;
      const errMsg = status === 429 ? 'AI rate limit reached. Please wait before making more analysis requests.' : (error.response?.data?.error || 'Failed to analyze skin condition');
      setAiError(errMsg);
    } finally {
      setAiLoading(false);
    }
  };

  const sampleScans = [
    { bodyLocation: 'Left forearm', symptomDescription: 'Red, circular rash about 2cm in diameter. Slightly raised edges with clearing in the center. Mildly itchy, appeared 5 days ago. No history of similar rashes.', duration: '5 days', severity: 'Mild' },
    { bodyLocation: 'Back of neck', symptomDescription: 'Dark brown mole, asymmetric shape, approximately 6mm. Borders appear irregular. Has grown slightly over the past 2 months. No pain or itching.', duration: '2 months', severity: 'Moderate' },
    { bodyLocation: 'Right shin', symptomDescription: 'Dry, scaly patch of skin about 4cm. Silver-white flaky scales over red inflamed skin. Occasionally itchy and sometimes cracks. Gets worse in winter.', duration: '3 weeks', severity: 'Moderate' },
  ];

  const filteredScans = scans.filter(scan =>
    (scan.bodyLocation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (scan.symptomDescription || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'mild': return 'bg-green-100 text-green-700';
      case 'moderate': return 'bg-yellow-100 text-yellow-700';
      case 'high': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            AI Dermatology Scanner
          </h1>
          <p className="text-gray-600 mt-1">Analyze skin conditions with AI-powered insights</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
        >
          <Plus className="w-5 h-5" />
          New Scan
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search scans..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Scans List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Symptoms</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Risk Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredScans.map((scan) => (
                <tr
                  key={scan.id}
                  onClick={() => handleRowClick(scan)}
                  className="hover:bg-purple-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {scan.imageUrl ? (
                        <img
                          src={scan.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                      <span className="font-medium text-gray-800">{scan.bodyLocation}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-700 truncate max-w-xs">{scan.symptomDescription}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {scan.duration}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(scan.severity)}`}>
                      {scan.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {scan.riskLevel ? (
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(scan.riskLevel)}`}>
                        {scan.riskLevel === 'high' ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {scan.riskLevel}
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

        {filteredScans.length === 0 && (
          <div className="text-center py-12">
            <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No skin scans found</p>
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
        title="Skin Scan Details"
        size="lg"
      >
        {selectedScan && (
          <div className="space-y-6">
            {/* Uploaded Image */}
            {selectedScan.imageUrl && (
              <div className="rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={selectedScan.imageUrl}
                  alt="Skin condition"
                  className="w-full max-h-64 object-contain"
                />
              </div>
            )}

            {/* Scan Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Body Location</p>
                <p className="font-semibold text-gray-800">{selectedScan.bodyLocation}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Duration</p>
                <p className="font-semibold text-gray-800">{selectedScan.duration}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Severity (Self-reported)</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedScan.severity)}`}>
                  {selectedScan.severity}
                </span>
              </div>
              {selectedScan.riskLevel && (
                <div className={`rounded-xl p-4 border ${getRiskColor(selectedScan.riskLevel)}`}>
                  <p className="text-sm opacity-75 mb-1">AI Risk Assessment</p>
                  <p className="font-semibold capitalize">{selectedScan.riskLevel}</p>
                </div>
              )}
            </div>

            <div className="bg-purple-50 rounded-xl p-4">
              <p className="text-sm text-purple-600 mb-2">Symptom Description</p>
              <p className="text-gray-800">{selectedScan.symptomDescription}</p>
            </div>

            {selectedScan.followUpNeeded && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Follow-up Recommended</span>
                </div>
                <p className="text-red-600 text-sm mt-1">
                  Based on the analysis, we recommend consulting a dermatologist.
                </p>
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

            {/* Structured ABCDE Result Display */}
            {aiStructured && !aiLoading && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Vision Analysis Results
                </h4>

                {/* Urgency + Risk badges */}
                <div className="flex flex-wrap gap-3">
                  {aiStructured.urgency_tier && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${
                      aiStructured.urgency_tier === 'emergency' ? 'bg-red-100 text-red-700 border-red-300' :
                      aiStructured.urgency_tier === 'urgent' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                      'bg-green-100 text-green-700 border-green-300'
                    }`}>
                      Urgency: {aiStructured.urgency_tier}
                    </span>
                  )}
                  {aiStructured.risk_level && (
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskColor(aiStructured.risk_level)}`}>
                      Risk: {aiStructured.risk_level}
                    </span>
                  )}
                  {aiStructured.lesion_type && (
                    <span className="px-3 py-1 rounded-full text-sm font-semibold border bg-purple-100 text-purple-700 border-purple-300">
                      {aiStructured.lesion_type}
                    </span>
                  )}
                </div>

                {/* ABCDE Score */}
                {aiStructured.abcde_score && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">ABCDE Dermoscopy Score</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { key: 'asymmetry', label: 'Asymmetry', max: 5 },
                        { key: 'border', label: 'Border', max: 5 },
                        { key: 'color', label: 'Color', max: 5 },
                      ].map(({ key, label, max }) => {
                        const val = aiStructured.abcde_score[key] || 0;
                        const pct = (val / max) * 100;
                        return (
                          <div key={key}>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span>{label}</span>
                              <span>{val}/{max}</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${pct >= 70 ? 'bg-red-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Diameter Estimate</p>
                        <p className="text-sm font-medium text-gray-800">{aiStructured.abcde_score.diameter_estimate || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Evolution Unknown</p>
                        <p className="text-sm font-medium text-gray-800">{aiStructured.abcde_score.evolution_unknown ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {aiStructured.recommendations?.length > 0 && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <p className="text-sm font-semibold text-blue-800 mb-2">Recommendations</p>
                    <ul className="space-y-1">
                      {aiStructured.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Disclaimer */}
                <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
                  <p className="text-xs text-amber-800">
                    <strong>Disclaimer:</strong> {aiStructured.disclaimer || 'This AI analysis is for informational purposes only and is not a medical diagnosis. Always consult a qualified dermatologist for proper evaluation and treatment.'}
                  </p>
                </div>
              </div>
            )}

            {/* AI Response (text) */}
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
        title={isEditing ? 'Edit Skin Scan' : 'New Skin Scan'}
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
                {sampleScans.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...sample, imageUrl: '' })}
                    className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    {sample.bodyLocation}
                  </button>
                ))}
              </div>
            </div>
          )}
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Upload Skin Photo (Optional)
              </div>
            </label>
            <ImageUpload
              currentImage={formData.imageUrl}
              onImageUploaded={(url) => setFormData({ ...formData, imageUrl: url })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Body Location *</label>
            <input
              type="text"
              value={formData.bodyLocation}
              onChange={(e) => setFormData({ ...formData, bodyLocation: e.target.value })}
              placeholder="e.g., Left forearm, Back of neck"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symptom Description *</label>
            <textarea
              value={formData.symptomDescription}
              onChange={(e) => setFormData({ ...formData, symptomDescription: e.target.value })}
              rows={4}
              placeholder="Describe what you're observing (color, texture, size, any changes, itching, pain, etc.)"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 3 days, 2 weeks"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="Mild">Mild</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High / Severe</option>
              </select>
            </div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> This tool provides AI-assisted analysis for informational purposes only.
              Always consult a dermatologist for proper diagnosis and treatment.
            </p>
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
              className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Scan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
