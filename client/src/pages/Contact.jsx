import { useState } from 'react';
import { MessageSquare, Send, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      alert('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Message Sent!</h2>
        <p className="text-gray-600 mb-6">Thank you for reaching out. We'll get back to you within 24-48 hours.</p>
        <button onClick={() => setSubmitted(false)} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        Contact & Support
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
            <p className="text-sm text-gray-600">support@healthcare.com</p>
            <p className="text-xs text-gray-400 mt-1">We respond within 24-48 hours</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Phone</h3>
            <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
            <p className="text-xs text-gray-400 mt-1">Mon-Fri, 9am-5pm EST</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Office</h3>
            <p className="text-sm text-gray-600">123 Health Street</p>
            <p className="text-xs text-gray-400 mt-1">San Francisco, CA 94105</p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" required placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" required placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500" required placeholder="What is this about?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 h-40 resize-none" required placeholder="Describe your question or issue in detail..." />
              </div>
              <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
                <Send className="w-5 h-5" /> {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
