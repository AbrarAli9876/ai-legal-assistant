import React from 'react';
import { Link } from 'react-router-dom';

// Brand Colors
const deepBlue = "#0A2A43";
const softGray = "#F7F9FA";
const white = "#FFFFFF";

// Reusable component for Support sections
const SupportSection = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-semibold mb-4" style={{ color: deepBlue }}>
      {title}
    </h2>
    <div className="space-y-4 text-gray-700 leading-relaxed">
      {children}
    </div>
  </section>
);

function CustomerSupportPage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: softGray }}>
      
      {/* 1. Header (No Login Button) */}
      <header className="shadow-sm" style={{ backgroundColor: white }}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img src="/logo.png" alt="KannonAI Logo" className="h-10 w-10" />
              <span className="text-2xl font-bold" style={{ color: deepBlue }}>
                KannonAI
              </span>
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
            Customer Support Policy
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            Last Updated: November 16, 2025
          </p>
        </section>

        <div className="mt-10">
          <p className="text-gray-700 mb-6">
            At KannonAI, we aim to provide fast, reliable, and helpful customer support to ensure a smooth experience for all users. This policy explains how users can contact us, how we handle support requests, and what they can expect from our support process.
          </p>

          <SupportSection title="1. Support Availability">
            <p>KannonAI offers customer support through email only.</p>
            <p>Support is available:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Monday to Saturday</li>
              <li>10:00 AM to 7:00 PM (IST)</li>
            </ul>
            <p>Responses outside these hours may be delayed to the next working day.</p>
          </SupportSection>

          <SupportSection title="2. How to Contact Support">
            <p>All support requests can be emailed to:</p>
            <p className="font-semibold">📧 <a href="mailto:ksaabrarahmed2021@gmail.com" className="text-blue-600 hover:underline">ksaabrarahmed2021@gmail.com</a></p>
            <p>When contacting support, please include:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Your full name</li>
              <li>A clear description of the issue</li>
              <li>Screenshots or error messages</li>
            </ul>
            <p>This helps our team resolve your issue faster.</p>
          </SupportSection>

          <SupportSection title="3. Types of Issues We Support">
            <p>Our support team can help you with:</p>
            <h4 className="font-semibold text-gray-800">A. Platform-Related Issues</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Errors or bugs in KannonAI</li>
              <li>Issues with generating responses</li>
              <li>Problems with PDF uploads, extraction, or case summaries</li>
              <li>Account or access issues (if applicable)</li>
            </ul>
            <h4 className="font-semibold text-gray-800">B. General Help</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>How to use KannonAI features</li>
              <li>Understanding output formats</li>
              <li>Clarification on how the system works</li>
            </ul>
            <h4 className="font-semibold text-gray-800">C. Reporting Abuse or Violations</h4>
            <ul className="list-disc list-inside space-y-2">
              <li>Misuse of content</li>
              <li>Security concerns</li>
              <li>Unlawful or suspicious activities on the platform</li>
            </ul>
          </SupportSection>
          
          <SupportSection title="4. Issues We Do Not Support">
            <p>KannonAI does not assist with:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Providing legal advice</li>
              <li>Preparing legal documents from scratch on request</li>
              <li>Solving personal legal cases directly</li>
              <li>Court procedure guidance</li>
              <li>Issues outside the KannonAI platform</li>
              <li>Urgent or emergency legal matters</li>
            </ul>
            <p>For legal advice, always consult a licensed advocate.</p>
          </SupportSection>

          <SupportSection title="5. Response Time">
            <p>We aim to respond to all emails within:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>24–48 hours on working days</li>
              <li>Complex issues may take up to 72 hours to investigate and resolve.</li>
            </ul>
          </SupportSection>

          <SupportSection title="6. User Responsibilities">
            <p>To help us provide effective support, users must:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide accurate information about their issue</li>
              <li>Not misuse or spam the support email</li>
              <li>Communicate respectfully with the support team</li>
              <li>Avoid sharing unnecessary sensitive personal information</li>
            </ul>
          </SupportSection>

          <SupportSection title="7. Security & Privacy of Support Requests">
            <p>All support queries are handled confidentially.</p>
            <p>However:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Do not send sensitive personal information (Aadhar, PAN, financial info, etc.)</li>
              <li>We take reasonable measures to protect support communications</li>
            </ul>
          </SupportSection>

          <SupportSection title="8. Escalation Procedure">
            <p>If an issue remains unresolved:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>You may request an escalation in the same email thread</li>
              <li>A senior team member will review and prioritize the case</li>
              <li>Escalations are handled within 2–5 working days depending on complexity.</li>
            </ul>
          </SupportSection>

          <SupportSection title="9. Limitations of Support">
            <p>KannonAI is an AI-driven platform, and certain limitations apply:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Support cannot guarantee a solution if the issue is caused by third-party tools or external services</li>
              <li>Support cannot override system restrictions or AI model limitations</li>
              <li>Support cannot modify legal outputs manually</li>
            </ul>
          </SupportSection>

          <SupportSection title="10. Updates to Customer Support Policy">
            <p>We may update this policy from time to time to improve clarity and service quality.</p>
            <p>Changes become effective immediately upon posting.</p>
          </SupportSection>
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
            &copy; 2025 KannonAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default CustomerSupportPage;