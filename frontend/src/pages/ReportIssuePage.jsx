import React from 'react';
import { Link } from 'react-router-dom';

// Brand Colors
const deepBlue = "#0A2A43";
const softGray = "#F7F9FA";
const white = "#FFFFFF";

// Reusable component
const ReportSection = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-semibold mb-4" style={{ color: deepBlue }}>
      {title}
    </h2>
    <div className="space-y-4 text-gray-700 leading-relaxed">
      {children}
    </div>
  </section>
);

function ReportIssuePage() {
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
             Report Issue
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            Last Updated: November 16, 2025
          </p>
        </section>

        <div className="mt-10">
          {/* --- THIS IS THE FIX --- */}
          <p className="text-gray-700 mb-6">
            If you face any problem while using KanoonAI, you can report it to us.
          </p>
          {/* --- END OF FIX --- */}
          <p className="text-gray-700 mb-6">
            We will check the issue and fix it as soon as possible.
          </p>

          <ReportSection title="1. What Issues You Can Report">
            <ul className="list-disc list-inside space-y-2">
              <li>Errors in responses</li>
              <li>Problems with PDF upload or extraction</li>
              <li>Bugs or glitches</li>
              <li>Slow loading or page not working</li>
              <li>Wrong or unexpected AI output</li>
              <li>Security or misuse concerns</li>
            </ul>
          </ReportSection>

          <ReportSection title="2. How to Report">
            <p>Email your issue to:</p>
            <p className="font-semibold">📧 <a href="mailto:ksaabrarahmed2021@gmail.com" className="text-blue-600 hover:underline">ksaabrarahmed2021@gmail.com</a></p>
            <p>Please include:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>A short description of the issue</li>
              <li>Screenshot (if possible)</li>
            </ul>
          </ReportSection>

          <ReportSection title="3. Response Time">
            <p>We usually reply within 24–48 hours.</p>
            <p>Fixing the issue may take a few days, depending on the problem.</p>
          </ReportSection>
          
          <ReportSection title="4. Important Note">
            <ul className="list-disc list-inside space-y-2">
              <li>Do not share sensitive personal information.</li>
              <li>Please explain the issue clearly so we can understand and resolve it faster.</li>
            </ul>
          </ReportSection>
        </div>
      </main>

      {/* 3. Footer (With corrected Customer Support link) */}
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

export default ReportIssuePage;