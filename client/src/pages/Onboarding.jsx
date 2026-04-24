import { useState } from 'react';
import { Heart, Pill, Activity, Camera, Eye, FileText, ArrowRight, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import api from '../services/api';

const steps = [
  {
    title: 'Welcome to AI Healthcare Companion',
    description: 'Your personal AI-powered health assistant. Let us show you around!',
    icon: Heart,
    gradient: 'gradient-blue',
    details: [
      'Track medications and check drug interactions',
      'Get AI-powered physical therapy guidance',
      'Analyze skin conditions with AI insights',
      'Monitor your vision health over time',
      'Maintain comprehensive medical history'
    ]
  },
  {
    title: 'Medication Tracker',
    description: 'Keep track of all your medications, dosages, and schedules. Our AI can check for drug interactions.',
    icon: Pill,
    gradient: 'gradient-blue',
    details: [
      'Add all your current medications',
      'Set dosage and frequency reminders',
      'AI checks for dangerous drug interactions',
      'Track side effects and notes',
      'Export your medication list for doctor visits'
    ]
  },
  {
    title: 'Physical Therapy Guide',
    description: 'Get personalized exercise guidance with AI-powered form correction tips.',
    icon: Activity,
    gradient: 'gradient-green',
    details: [
      'Browse exercises by body part',
      'Follow step-by-step instructions',
      'Get AI feedback on your form',
      'Track completed exercises',
      'Video demonstrations available'
    ]
  },
  {
    title: 'Skin Scanner',
    description: 'Describe skin conditions and get AI-assisted analysis. Always consult a dermatologist for proper diagnosis.',
    icon: Camera,
    gradient: 'gradient-purple',
    details: [
      'Upload photos of skin concerns',
      'Describe symptoms in detail',
      'AI provides preliminary analysis',
      'Risk level assessment',
      'Follow-up recommendations'
    ]
  },
  {
    title: 'Vision Tests',
    description: 'Take interactive eye tests and track your vision health over time.',
    icon: Eye,
    gradient: 'gradient-orange',
    details: [
      'Interactive Snellen eye chart test',
      'Color vision screening',
      'Track results over time',
      'AI analysis of trends',
      'Know when to see an eye doctor'
    ]
  },
  {
    title: 'Medical History',
    description: 'Maintain a comprehensive record of your health conditions with AI-powered pattern insights.',
    icon: FileText,
    gradient: 'gradient-red',
    details: [
      'Record all conditions and diagnoses',
      'Track treating doctors and hospitals',
      'Log surgeries and allergies',
      'Family history tracking',
      'AI identifies health patterns and risks'
    ]
  },
  {
    title: 'You\'re All Set!',
    description: 'Start exploring your health dashboard. Remember: AI insights complement, but never replace, professional medical advice.',
    icon: Sparkles,
    gradient: 'gradient-blue',
    details: [
      'Your data is encrypted and secure',
      'Export your data anytime (GDPR compliant)',
      'Dark mode available in Settings',
      'Submit feedback to help us improve',
      'Contact support if you need help'
    ]
  }
];

export default function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleComplete = async () => {
    try {
      await api.put('/settings', { onboardingDone: true });
    } catch (e) {
      // Continue even if save fails
    }
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {steps.map((_, idx) => (
            <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-white' : idx < currentStep ? 'w-2 bg-white/70' : 'w-2 bg-white/30'}`} />
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8 min-h-[480px] flex flex-col">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className={`w-20 h-20 ${step.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <step.icon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{step.title}</h2>
            <p className="text-gray-600">{step.description}</p>
          </div>

          {/* Details */}
          <div className="flex-1 space-y-3 mb-6">
            {step.details.map((detail, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-700 text-sm">{detail}</p>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {currentStep > 0 ? (
              <button onClick={() => setCurrentStep(currentStep - 1)} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button onClick={handleComplete} className="text-gray-400 hover:text-gray-600 text-sm">Skip tour</button>
            )}

            {isLast ? (
              <button onClick={handleComplete} className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 shadow-lg">
                Get Started <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={() => setCurrentStep(currentStep + 1)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-white/60 text-sm mt-4">
          Step {currentStep + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}
