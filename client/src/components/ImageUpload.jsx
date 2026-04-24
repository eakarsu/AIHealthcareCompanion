import { useState, useRef } from 'react';
import { Camera, Upload, X, Image } from 'lucide-react';
import api from '../services/api';

export default function ImageUpload({ onImageUploaded, currentImage, type = 'image' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload file
    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (onImageUploaded) {
        onImageUploaded(response.data.url);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Camera error:', error);
      alert('Could not access camera. Please use file upload instead.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      setPreview(canvas.toDataURL('image/jpeg'));
      stopCamera();
      await uploadFile(file);
    }, 'image/jpeg', 0.9);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const clearImage = () => {
    setPreview(null);
    if (onImageUploaded) {
      onImageUploaded(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Camera View */}
      {showCamera && (
        <div className="relative rounded-xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <button
              onClick={capturePhoto}
              className="px-6 py-3 bg-white text-gray-800 rounded-xl font-semibold shadow-lg hover:bg-gray-100"
            >
              Capture
            </button>
            <button
              onClick={stopCamera}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold shadow-lg hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Preview */}
      {preview && !showCamera && (
        <div className="relative rounded-xl overflow-hidden bg-gray-100">
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-64 object-contain"
          />
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Buttons */}
      {!showCamera && !preview && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Upload a photo or take one with your camera</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload className="w-5 h-5" />
              Upload Photo
            </button>
            <button
              onClick={startCamera}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
              Take Photo
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      )}

      {/* Uploading Indicator */}
      {uploading && (
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Uploading...</span>
        </div>
      )}
    </div>
  );
}
