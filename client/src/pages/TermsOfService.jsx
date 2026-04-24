import { FileCheck } from 'lucide-react';

const sections = [
  { title: '1. Acceptance of Terms', content: 'By accessing and using the AI Healthcare Companion application ("Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.' },
  { title: '2. Description of Service', content: 'AI Healthcare Companion is a health management platform that provides medication tracking, physical therapy guidance, skin scan analysis, vision testing, medical history management, and AI-powered health insights. The Service is designed for informational purposes only.' },
  { title: '3. Medical Disclaimer', content: 'THE SERVICE IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE, DIAGNOSIS, OR TREATMENT. Always seek the advice of your physician or other qualified health provider with any questions regarding a medical condition. Never disregard professional medical advice or delay seeking it because of information provided by this Service.' },
  { title: '4. AI-Generated Content', content: 'Our AI analysis features provide general health information based on the data you input. AI-generated recommendations are not medical diagnoses. The accuracy of AI analysis depends on the quality and completeness of information provided. AI technology has limitations and may produce incorrect results.' },
  { title: '5. User Accounts', content: 'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information during registration. You must notify us immediately of any unauthorized use of your account. We reserve the right to suspend accounts that violate these terms.' },
  { title: '6. User Responsibilities', content: 'You agree to: provide accurate health information, use the Service only for lawful purposes, not share your account with others, not attempt to reverse-engineer or hack the Service, not upload malicious content or files, and comply with all applicable laws and regulations.' },
  { title: '7. Data and Privacy', content: 'Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to the collection and use of information as detailed in the Privacy Policy. We implement industry-standard security measures to protect your data.' },
  { title: '8. Intellectual Property', content: 'All content, features, and functionality of the Service are owned by AI Healthcare Companion and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.' },
  { title: '9. Limitation of Liability', content: 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, AI HEALTHCARE COMPANION SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR HEALTH OUTCOMES, ARISING FROM YOUR USE OF THE SERVICE.' },
  { title: '10. Indemnification', content: 'You agree to indemnify and hold harmless AI Healthcare Companion, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.' },
  { title: '11. Service Availability', content: 'We strive to provide 24/7 availability but do not guarantee uninterrupted access. The Service may be temporarily unavailable for maintenance, updates, or due to circumstances beyond our control. We will provide advance notice of planned maintenance when possible.' },
  { title: '12. Modifications to Service', content: 'We reserve the right to modify, suspend, or discontinue any part of the Service at any time. We will provide reasonable notice of significant changes. Continued use of the Service after modifications constitutes acceptance of the updated terms.' },
  { title: '13. Termination', content: 'You may terminate your account at any time through the Settings page. We may terminate or suspend your access if you violate these Terms. Upon termination, you may export your data before your account is deleted. Some provisions of these Terms survive termination.' },
  { title: '14. Governing Law', content: 'These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of San Francisco County, California.' },
  { title: '15. Contact Information', content: 'For questions about these Terms of Service, please contact us at: legal@healthcare.com or through the Contact & Support page in the application. We will respond to inquiries within 5 business days.' },
];

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-red flex items-center justify-center">
          <FileCheck className="w-5 h-5 text-white" />
        </div>
        Terms of Service
      </h1>

      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
        <p className="text-sm text-yellow-700">Last updated: January 2025. Please read these terms carefully before using the AI Healthcare Companion application.</p>
      </div>

      <div className="space-y-6">
        {sections.map((section, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">{section.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
