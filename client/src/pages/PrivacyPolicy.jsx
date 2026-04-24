import { Shield } from 'lucide-react';

const sections = [
  { title: '1. Introduction', content: 'AI Healthcare Companion ("we," "our," or "us") is committed to protecting your personal and health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.' },
  { title: '2. Information We Collect', content: 'We collect information you provide directly: name, email address, health records, medication data, physical therapy exercises, skin scan images, vision test results, and medical history. We also collect usage data such as log data, device information, and cookies.' },
  { title: '3. How We Use Your Information', content: 'We use your information to: provide and maintain our service, send medication reminders and health notifications, provide AI-powered health analysis and recommendations, improve our services, communicate with you about updates and support, and comply with legal obligations.' },
  { title: '4. Health Data Protection', content: 'Your health data is treated with the highest level of security. All health records are encrypted at rest and in transit. We follow HIPAA-compliant practices for handling Protected Health Information (PHI). Access to health data is strictly limited to you and authorized personnel.' },
  { title: '5. AI Analysis Disclaimer', content: 'Our AI-powered analysis features are designed to provide general health information only. They are NOT a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical decisions.' },
  { title: '6. Data Sharing', content: 'We do not sell, trade, or rent your personal health information to third parties. We may share data with: service providers who assist in operating our platform (under strict confidentiality agreements), legal authorities when required by law, and emergency services if there is an imminent threat to life.' },
  { title: '7. Data Storage and Security', content: 'Your data is stored on secure servers with encryption at rest (AES-256) and in transit (TLS 1.3). We implement regular security audits, access controls, intrusion detection systems, and automated backup systems. We retain your data only as long as necessary for the purposes outlined in this policy.' },
  { title: '8. Your Rights (GDPR)', content: 'Under GDPR and applicable data protection laws, you have the right to: access your personal data, correct inaccurate data, delete your data (right to be forgotten), export your data in machine-readable format, object to data processing, restrict processing of your data, and withdraw consent at any time.' },
  { title: '9. Data Export and Deletion', content: 'You can export all your personal and health data in JSON format at any time through the Settings page. You can also request complete deletion of your account and all associated data. Deletion is permanent and cannot be undone.' },
  { title: '10. Cookies and Tracking', content: 'We use essential cookies for authentication and session management. We do not use third-party advertising cookies. You can control cookie settings through your browser preferences.' },
  { title: '11. Children\'s Privacy', content: 'Our service is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we discover that a child has provided personal information, we will delete it immediately.' },
  { title: '12. International Data Transfers', content: 'If you are accessing our service from outside the United States, your data may be transferred to and processed in the United States. We ensure appropriate safeguards are in place for international data transfers.' },
  { title: '13. Data Breach Notification', content: 'In the event of a data breach that affects your personal information, we will notify you within 72 hours of becoming aware of the breach, in accordance with GDPR requirements. We will provide details of the breach and steps being taken to mitigate its effects.' },
  { title: '14. Changes to This Policy', content: 'We may update this Privacy Policy periodically. We will notify you of significant changes via email or through the application. Continued use of the service after changes constitutes acceptance of the updated policy.' },
  { title: '15. Contact Us', content: 'For questions about this Privacy Policy or your data, contact us at: privacy@healthcare.com or through the Contact & Support page in the application. Data Protection Officer: dpo@healthcare.com.' },
];

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        Privacy Policy
      </h1>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <p className="text-sm text-blue-700">Last updated: January 2025. This policy applies to all users of the AI Healthcare Companion application.</p>
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
