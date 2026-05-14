import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import AIResponseDisplay from '../components/AIResponseDisplay';
import {
  Activity, Plus, Search, Edit2, Trash2, Sparkles,
  Clock, CheckCircle, Timer, Dumbbell, Target, Video, Play, TestTube2
} from 'lucide-react';

export default function PhysicalTherapy() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [userDescription, setUserDescription] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const LIMIT = 20;

  const [formData, setFormData] = useState({
    exerciseName: '',
    bodyPart: '',
    description: '',
    duration: '',
    repetitions: '',
    sets: '',
    difficulty: '',
    instructions: '',
    precautions: '',
    videoUrl: ''
  });

  useEffect(() => {
    fetchExercises(page);
  }, [page]);

  const fetchExercises = async (p = 1) => {
    try {
      const response = await api.get('/physical-therapy', { params: { page: p, limit: LIMIT } });
      setExercises(response.data.data || response.data);
      if (response.data.pagination) setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (exercise) => {
    setSelectedExercise(exercise);
    setAiResponse(exercise.aiFormFeedback || null);
    setAiError(null);
    setUserDescription('');
    setShowDetailModal(true);
  };

  const handleAddNew = () => {
    setFormData({
      exerciseName: '',
      bodyPart: '',
      description: '',
      duration: '',
      repetitions: '',
      sets: '',
      difficulty: 'Easy',
      instructions: '',
      precautions: '',
      videoUrl: ''
    });
    setIsEditing(false);
    setShowFormModal(true);
  };

  const handleEdit = () => {
    setFormData({
      exerciseName: selectedExercise.exerciseName,
      bodyPart: selectedExercise.bodyPart,
      description: selectedExercise.description,
      duration: selectedExercise.duration.toString(),
      repetitions: selectedExercise.repetitions.toString(),
      sets: selectedExercise.sets.toString(),
      difficulty: selectedExercise.difficulty,
      instructions: selectedExercise.instructions,
      precautions: selectedExercise.precautions || '',
      videoUrl: selectedExercise.videoUrl || ''
    });
    setIsEditing(true);
    setShowDetailModal(false);
    setShowFormModal(true);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this exercise?')) return;

    try {
      await api.delete(`/physical-therapy/${selectedExercise.id}`);
      setExercises(exercises.filter(e => e.id !== selectedExercise.id));
      setShowDetailModal(false);
      setSelectedExercise(null);
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleMarkComplete = async () => {
    try {
      const response = await api.post(`/physical-therapy/${selectedExercise.id}/complete`);
      setExercises(exercises.map(e => e.id === selectedExercise.id ? response.data : e));
      setSelectedExercise(response.data);
    } catch (error) {
      console.error('Error marking complete:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const response = await api.put(`/physical-therapy/${selectedExercise.id}`, formData);
        setExercises(prev => prev.map(e => e.id === selectedExercise.id ? response.data : e));
        setShowFormModal(false);
      } else {
        const response = await api.post('/physical-therapy', formData);
        const newExercise = response.data;
        setExercises(prev => [newExercise, ...prev]);
        setShowFormModal(false);
        setSelectedExercise(newExercise);
        setAiResponse(null);
        setAiError(null);
        setUserDescription('');
        setShowDetailModal(true);
        setAiLoading(true);
        try {
          const aiRes = await api.post(`/physical-therapy/${newExercise.id}/analyze-form`, { userDescription: '' });
          setAiResponse(aiRes.data.analysis);
          setSelectedExercise(aiRes.data.record);
          setExercises(prev => prev.map(e => e.id === newExercise.id ? aiRes.data.record : e));
        } catch (aiErr) {
          const status = aiErr.response?.status;
          setAiError(status === 429 ? 'AI rate limit reached. Please wait before making more analysis requests.' : (aiErr.response?.data?.error || 'Failed to analyze exercise'));
        } finally {
          setAiLoading(false);
        }
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
    }
  };

  const handleAIAnalyze = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await api.post(`/physical-therapy/${selectedExercise.id}/analyze-form`, {
        userDescription
      });
      setAiResponse(response.data.analysis);
      setSelectedExercise(response.data.record);
      setExercises(prev => prev.map(e => e.id === selectedExercise.id ? response.data.record : e));
    } catch (error) {
      const status = error.response?.status;
      setAiError(status === 429 ? 'AI rate limit reached. Please wait before making more analysis requests.' : (error.response?.data?.error || 'Failed to analyze form'));
    } finally {
      setAiLoading(false);
    }
  };

  const sampleExercises = [
    { exerciseName: 'Wall Squats', bodyPart: 'Knee', description: 'Stand with back against wall, slide down to 90-degree knee bend and hold', duration: '10', repetitions: '12', sets: '3', difficulty: 'Medium', instructions: 'Stand with your back flat against a wall. Slide down until your knees are at a 90-degree angle. Hold for 5 seconds, then slide back up. Keep your weight in your heels.', precautions: 'Stop if you feel sharp knee pain. Do not let knees extend past toes.' },
    { exerciseName: 'Shoulder External Rotation', bodyPart: 'Shoulder', description: 'Resistance band external rotation exercise for rotator cuff strengthening', duration: '8', repetitions: '15', sets: '3', difficulty: 'Easy', instructions: 'Hold a resistance band with both hands at waist level. Keep elbows tucked to your sides at 90 degrees. Rotate forearms outward against band resistance. Slowly return to start.', precautions: 'Use light resistance. Avoid if experiencing acute shoulder inflammation.' },
    { exerciseName: 'Dead Bug', bodyPart: 'Core', description: 'Core stabilization exercise performed lying on back with alternating arm and leg movements', duration: '12', repetitions: '10', sets: '3', difficulty: 'Medium', instructions: 'Lie on your back with arms extended toward ceiling and knees bent at 90 degrees. Slowly extend right arm overhead and left leg forward simultaneously. Return to start and repeat on opposite side. Keep lower back pressed into the floor.', precautions: 'Do not arch your lower back. Breathe steadily throughout the movement.' },
  ];

  const filteredExercises = exercises.filter(ex =>
    (ex.exerciseName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ex.bodyPart || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            Physical Therapy Guide
          </h1>
          <p className="text-gray-600 mt-1">Exercise form guidance and progress tracking</p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
        >
          <Plus className="w-5 h-5" />
          Add Exercise
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => handleRowClick(exercise)}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg transition-all hover:border-green-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-green-600" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(exercise.difficulty)}`}>
                {exercise.difficulty}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">{exercise.exerciseName}</h3>
            <p className="text-sm text-gray-500 mb-3">{exercise.bodyPart}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Timer className="w-4 h-4" />
                {exercise.duration} min
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                {exercise.sets} x {exercise.repetitions}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {exercise.videoUrl && (
                <span className="flex items-center gap-1 text-blue-600">
                  <Play className="w-4 h-4" />
                  <span className="text-xs">Video</span>
                </span>
              )}
              {exercise.status === 'completed' && (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-medium">Done</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No exercises found</p>
        </div>
      )}

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
        title="Exercise Details"
        size="lg"
      >
        {selectedExercise && (
          <div className="space-y-6">
            {/* Exercise Info */}
            <div className="bg-gradient-to-r from-green-50 to-cyan-50 rounded-xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{selectedExercise.exerciseName}</h3>
                  <p className="text-gray-600">Target: {selectedExercise.bodyPart}</p>
                </div>
                <span className={`px-4 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedExercise.difficulty)}`}>
                  {selectedExercise.difficulty}
                </span>
              </div>
              <p className="text-gray-700">{selectedExercise.description}</p>
            </div>

            {/* Video Player */}
            {selectedExercise.videoUrl && (
              <div className="bg-gray-900 rounded-xl overflow-hidden">
                {selectedExercise.videoUrl.includes('youtube.com') || selectedExercise.videoUrl.includes('youtu.be') ? (
                  <iframe
                    src={selectedExercise.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedExercise.videoUrl}
                    controls
                    className="w-full"
                  />
                )}
                <div className="px-4 py-2 bg-gray-800 flex items-center gap-2 text-white text-sm">
                  <Video className="w-4 h-4" />
                  <span>Exercise Demonstration Video</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Timer className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">{selectedExercise.duration}</p>
                <p className="text-sm text-gray-500">Minutes</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">{selectedExercise.sets}</p>
                <p className="text-sm text-gray-500">Sets</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <Activity className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">{selectedExercise.repetitions}</p>
                <p className="text-sm text-gray-500">Reps</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-blue-50 rounded-xl p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Instructions</h4>
                <p className="text-blue-700">{selectedExercise.instructions}</p>
              </div>
              {selectedExercise.precautions && (
                <div className="bg-amber-50 rounded-xl p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">Precautions</h4>
                  <p className="text-amber-700">{selectedExercise.precautions}</p>
                </div>
              )}
            </div>

            {/* AI Form Analysis */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Describe Your Form (Optional)</h4>
              <textarea
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                placeholder="Describe how you're performing the exercise for personalized feedback..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 mb-3"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {selectedExercise.status !== 'completed' && (
                <button
                  onClick={handleMarkComplete}
                  className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark Complete
                </button>
              )}
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
        title={isEditing ? 'Edit Exercise' : 'Add New Exercise'}
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
                {sampleExercises.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...sample })}
                    className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    {sample.exerciseName}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Name *</label>
              <input
                type="text"
                value={formData.exerciseName}
                onChange={(e) => setFormData({ ...formData, exerciseName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Body Part *</label>
              <input
                type="text"
                value={formData.bodyPart}
                onChange={(e) => setFormData({ ...formData, bodyPart: e.target.value })}
                placeholder="e.g., Knee, Shoulder, Core"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min) *</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                min="1"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repetitions *</label>
              <input
                type="number"
                value={formData.repetitions}
                onChange={(e) => setFormData({ ...formData, repetitions: e.target.value })}
                min="1"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sets *</label>
              <input
                type="number"
                value={formData.sets}
                onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                min="1"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty *</label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions *</label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={3}
              placeholder="Step-by-step instructions for performing the exercise"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precautions</label>
            <textarea
              value={formData.precautions}
              onChange={(e) => setFormData({ ...formData, precautions: e.target.value })}
              rows={2}
              placeholder="Any safety warnings or precautions"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Video URL (Optional)
              </div>
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="YouTube link or direct video URL"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">Supports YouTube links or direct video URLs</p>
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
              className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Add Exercise'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
