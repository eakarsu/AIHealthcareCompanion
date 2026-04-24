import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Pill, Activity, Camera, Eye, FileText,
  ArrowRight, Sparkles, Shield, Clock, Heart,
  Bell, Settings, MessageCircle, MessageSquare,
  Download, FileCheck
} from 'lucide-react';

const features = [
  {
    id: 'medications',
    path: '/medications',
    title: 'AI Medication Reminder',
    description: 'Track medications, check drug interactions, and get dosage reminders',
    icon: Pill,
    gradient: 'gradient-blue',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'physical-therapy',
    path: '/physical-therapy',
    title: 'AI Physical Therapy Guide',
    description: 'Exercise guidance, form correction tips, and progress tracking',
    icon: Activity,
    gradient: 'gradient-green',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'skin-scans',
    path: '/skin-scans',
    title: 'AI Dermatology Scanner',
    description: 'Analyze skin conditions and get AI-powered recommendations',
    icon: Camera,
    gradient: 'gradient-purple',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'vision-tests',
    path: '/vision-tests',
    title: 'AI Vision Test',
    description: 'Basic eye exams and vision analysis with AI insights',
    icon: Eye,
    gradient: 'gradient-orange',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'medical-history',
    path: '/medical-history',
    title: 'AI Medical History Analyzer',
    description: 'Comprehensive health records with AI-powered pattern insights',
    icon: FileText,
    gradient: 'gradient-red',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 'notifications',
    path: '/notifications',
    title: 'Notifications & Reminders',
    description: 'Medication reminders, appointment alerts, and health notifications',
    icon: Bell,
    gradient: 'gradient-orange',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'feedback',
    path: '/feedback',
    title: 'Feedback & Suggestions',
    description: 'Help us improve by sharing your experience and ideas',
    icon: MessageCircle,
    gradient: 'gradient-blue',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'contact',
    path: '/contact',
    title: 'Contact & Support',
    description: 'Get help, report issues, or ask questions about the app',
    icon: MessageSquare,
    gradient: 'gradient-green',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 'settings',
    path: '/settings',
    title: 'Settings & Privacy',
    description: 'Dark mode, language, password change, GDPR data export/deletion',
    icon: Settings,
    gradient: 'gradient-purple',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    id: 'privacy-policy',
    path: '/privacy-policy',
    title: 'Privacy Policy',
    description: 'Learn how we protect and handle your health data',
    icon: Shield,
    gradient: 'gradient-blue',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'terms-of-service',
    path: '/terms-of-service',
    title: 'Terms of Service',
    description: 'Review the terms and conditions of using our platform',
    icon: FileCheck,
    gradient: 'gradient-red',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-gray-600">
          Your AI-powered health companion is ready to assist you.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">AI Powered</p>
              <p className="text-sm text-gray-500">Smart health insights</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">Secure</p>
              <p className="text-sm text-gray-500">GDPR compliant</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">24/7</p>
              <p className="text-sm text-gray-500">Always available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Health Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {features.slice(0, 5).map((feature) => (
          <div
            key={feature.id}
            onClick={() => handleCardClick(feature.path)}
            className="feature-card bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer group hover:shadow-lg hover:border-blue-200 transition-all"
            role="button"
            tabIndex={0}
            aria-label={`Open ${feature.title}`}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick(feature.path)}
          >
            <div className={`w-14 h-14 rounded-2xl ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
            <div className={`flex items-center gap-2 ${feature.color} font-medium text-sm`}>
              <span>Open Feature</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* More Features */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4">More Features</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {features.slice(5).map((feature) => (
          <div
            key={feature.id}
            onClick={() => handleCardClick(feature.path)}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer group hover:shadow-md hover:border-blue-200 transition-all flex items-center gap-4"
            role="button"
            tabIndex={0}
            aria-label={`Open ${feature.title}`}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick(feature.path)}
          >
            <div className={`w-12 h-12 rounded-xl ${feature.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <feature.icon className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-800 text-sm">{feature.title}</h3>
              <p className="text-gray-500 text-xs truncate">{feature.description}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
          </div>
        ))}
      </div>

      {/* AI Disclaimer */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Important Health Notice</h3>
            <p className="text-sm text-gray-600">
              AI Healthcare Companion provides general health information and should not replace professional medical advice.
              Always consult with qualified healthcare providers for diagnosis and treatment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
