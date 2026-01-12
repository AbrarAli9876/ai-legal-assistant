import React from 'react';
import { Link } from 'react-router-dom';

// Brand Colors
const deepBlue = "#0A2A43";
const softGray = "#F7F9FA";
const white = "#FFFFFF";

// Reusable component for Privacy sections
const PolicySection = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-semibold mb-4" style={{ color: deepBlue }}>
      {title}
    </h2>
    <div className="space-y-4 text-gray-700 leading-relaxed">
      {children}
    </div>
  </section>
);

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: softGray }}>
      
      {/* 1. Header (No Login Button) */}
      <header className="shadow-sm" style={{ backgroundColor: white }}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              {/* --- THIS IS THE FIX --- */}
              <img src="/logo.png" alt="KanoonAI Logo" className="h-10 w-10" />
              <span className="text-2xl font-bold" style={{ color: deepBlue }}>
                KanoonAI
              </span>
              {/* --- END OF FIX --- */}
            </Link>
          </div>
        </nav>
      </header>

      {/* 2. Main Content Area */}
      <main className="max-w-4xl mx-auto py-16 px-6 bg-white my-12 rounded-lg shadow-lg border border-gray-200">
        
        {/* --- Introduction Section --- */}
        <section className="text-center pb-8 border-b border-gray-200">
          <h1 
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: deepBlue }}
          >
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            Last Updated: 16th November 2025
          </p>
        </section>

        <div className="mt-10">
          {/* --- THIS IS THE FIX --- */}
          <p className="text-gray-700 mb-6">
            KanoonAI (“we”, “our”, “us”) is committed to protecting your privacy and ensuring that your personal data is handled responsibly, securely, and transparently.
          </p>
          <p className="text-gray-700 mb-6">
            This Privacy Policy explains how we collect, use, store, and protect the information you provide while using our Platform.
          </p>
          <p className="text-gray-700 mb-6">
            By accessing or using KanoonAI, you agree to the practices described in this Privacy Policy.
          </p>
          {/* --- END OF FIX --- */}

          <PolicySection title="1. Information We Collect">
            <p>We collect the following types of information when you use the Platform:</p>
            <h4 className="font-semibold text-gray-800">A. Information You Provide Directly</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Search queries</li>
              <li>Legal questions</li>
              <li>Uploaded PDFs, documents, or case files</li>
              <li>Text entered in forms</li>
              <li>Contact information (only if you voluntarily provide it)</li>
            </ul>
            <h4 className="font-semibold text-gray-800">B. Automatic Data Collection</h4>
            <p>We may automatically collect certain information such as:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Device type, browser type, operating system</li>
              <li>IP address</li>
              <li>Usage logs (pages visited, features used, timestamps)</li>
              <li>Error logs and debugging data</li>
            </ul>
            <p>This is used solely to improve performance, security, and reliability.</p>
          </PolicySection>

          <PolicySection title="2. How We Use Your Information">
            <p>We use your information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>To generate legal summaries, insights, and responses</li>
              <li>To improve the accuracy and performance of our AI models</li>
              <li>To enhance user experience and platform usability</li>
              <li>For analytics, debugging, and fraud prevention</li>
              <li>To protect the platform against misuse</li>
              <li>To communicate updates or important notices (only when necessary)</li>
            </ul>
            <p>We do not use your information for advertising or marketing unless you explicitly opt-in.</p>
          </PolicySection>

          <PolicySection title="3. How We Handle Uploaded Documents">
            <p>When you upload FIRs, legal case PDFs, or documents:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>They are processed securely</li>
              <li>Used only for generating responses requested by you</li>
              <li>May be temporarily stored for performance and improvement</li>
              <li>Are protected with strict access control</li>
            </ul>
            <p>We do not claim ownership over any uploaded documents.</p>
          </PolicySection>
          
          <PolicySection title="4. Data Sharing & Third Parties">
            {/* --- THIS IS THE FIX --- */}
            <p>KanoonAI does not sell, rent, or trade user data.</p>
            {/* --- END OF FIX --- */}
            <p>We may share necessary data only with:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Cloud hosting providers</li>
              <li>AI model providers</li>
              <li>Essential analytics and security tools</li>
            </ul>
            <p>These partners are bound by strict confidentiality and data protection obligations.</p>
            <p>We do not share personal information with advertisers, legal firms, or external agencies.</p>
          </PolicySection>

          <PolicySection title="5. Cookies & Tracking Technologies">
            {/* --- THIS IS THE FIX --- */}
            <p>KanoonAI may use:</p>
            {/* --- END OF FIX --- */}
            <ul className="list-disc list-inside space-y-2">
              <li>Cookies</li>
              <li>Session storage</li>
              <li>Local browser storage</li>
              <li>Analytics scripts</li>
            </ul>
            <p>These help improve platform performance, personalize your experience, and detect unusual activity.</p>
            <p>You can disable cookies in your browser, but certain features may stop working.</p>
          </PolicySection>

          <PolicySection title="6. Data Security">
            <p>We implement multiple security measures, including:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Encryption</li>
              <li>Secure server infrastructure</li>
              <li>Access control</li>
              <li>Regular security audits</li>
              <li>Threat detection and monitoring</li>
            </ul>
            <p>However, no system is completely immune from vulnerabilities.</p>
            <p>Users are advised to avoid sharing sensitive personal details unnecessarily.</p>
          </PolicySection>

          <PolicySection title="7. Data Retention">
            <p>We retain user information only for as long as necessary to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide services</li>
              <li>Improve the platform</li>
              <li>Comply with legal requirements</li>
              <li>Resolve disputes</li>
            </ul>
            <p>You may request deletion of your data at any time (see Section 9).</p>
          </PolicySection>

          <PolicySection title="8. Children’s Privacy">
            {/* --- THIS IS THE FIX --- */}
            <p>KanoonAI may be used by individuals under 18 strictly for educational and learning purposes.</p>
            {/* --- END OF FIX --- */}
            <p>We do not knowingly collect personal information from children.</p>
            <p>If you believe a minor has shared personal data, contact us for immediate removal.</p>
          </PolicySection>

          <PolicySection title="9. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Request access to your data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Request information about how your data is processed</li>
            </ul>
            <p>To exercise these rights, contact us at the email below.</p>
          </PolicySection>

          <PolicySection title="10. Legal Compliance">
            <p>We comply with:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>The Information Technology Act, 2000</li>
              <li>IT (Reasonable Security Practices and Procedures) Rules, 2011</li>
              <li>Indian data protection guidelines and emerging standards</li>
            </ul>
            <p>We may disclose information only when legally required by courts or government authorities.</p>
          </PolicySection>

          <PolicySection title="11. Changes to This Privacy Policy">
            <p>We may update or modify this Privacy Policy from time to time.</p>
            <p>Changes become effective immediately upon posting.</p>
            <p>Your continued use of the Platform indicates acceptance of the updated Policy.</p>
          </PolicySection>

          <PolicySection title="12. Contact Information">
            <p>For any privacy-related concerns, data deletion requests, or questions, contact us at:</p>
            <p>📧 Email: <a href="mailto:ksaabrarahmed2021@gmail.com" className="text-blue-600 hover:underline">ksaabrarahmed2021@gmail.com</a></p>
          </PolicySection>

        </div>
      </main>

      {/* 3. Footer (Consistent with other pages) */}
      <footer style={{ backgroundColor: deepBlue }}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-4 md:gap-6 mb-4">
            <Link to="/about" className="text-sm text-gray-300 hover:text-white">
              About Us
            </Link>
            <span className="text-gray-500">|</span>
            <Link to="/terms-and-conditions" className="text-sm text-gray-300 hover:text-white">
              Terms & Conditions
            </Link>
            <span className="text-gray-500">|</span>
            <Link to="/customer-support" className="text-sm text-gray-300 hover:text-white">
              Customer Support
            </Link>
          </div>
          
          <p className="text-gray-400">
            {/* --- THIS IS THE FIX --- */}
            &copy; 2025 KanoonAI. All rights reserved.
            {/* --- END OF FIX --- */}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default PrivacyPolicyPage;