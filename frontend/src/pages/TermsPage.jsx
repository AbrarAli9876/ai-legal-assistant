import React from 'react';
import { Link } from 'react-router-dom';
// No logo import needed

// Brand Colors
const deepBlue = "#0A2A43";
const goldAccent = "#F5C242";
const softGray = "#F7F9FA";
const white = "#FFFFFF";

// Reusable component for T&C sections
const TermSection = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="text-2xl font-semibold mb-4" style={{ color: deepBlue }}>
      {title}
    </h2>
    <div className="space-y-4 text-gray-700 leading-relaxed">
      {children}
    </div>
  </section>
);

function TermsPage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: softGray }}>
      
      {/* 1. Header (Consistent with HomePage) */}
      <header className="shadow-sm" style={{ backgroundColor: white }}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              {/* Use the public path for the logo */}
              <img src="/logo.png" alt="KanoonAI Logo" className="h-10 w-10" />
              <span className="text-2xl font-bold" style={{ color: deepBlue }}>
                KanoonAI
              </span>
            </Link>
            
            {/* --- THIS IS THE FIX --- */}
            {/* The Login Button div has been removed from here. */}
            
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
            Terms & Conditions
          </h1>
          <p className="mt-4 text-sm text-gray-500">
            Last Updated: 15th November 2025
          </p>
        </section>

        <div className="mt-10">
          <p className="text-lg text-gray-700 mb-6">
            Welcome to KanoonAI, an AI-powered legal assistance platform designed to simplify legal research, automate document drafting, and provide quick, reliable legal insights.
          </p>
          <p className="text-gray-700 mb-6">
            By accessing or using KanoonAI, you acknowledge that you have read, understood, and agree to be bound by these Terms & Conditions.
            If you do not agree with these Terms, please discontinue use of the Platform immediately.
          </p>

          <TermSection title="1. Definitions">
            <p>For the purposes of these Terms:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>“Platform”</strong> refers to the KanoonAI website, tools, APIs, and services.</li>
              <li><strong>“User”</strong> or <strong>“You”</strong> means any person accessing or using the Platform.</li>
              <li><strong>“Content”</strong> means all information, responses, documents, code, or data generated through the Platform.</li>
              <li><strong>“Services”</strong> refers to AI-based legal summaries, research tools, document drafting assistance, lawyer recommendations, and any other features KanoonAI provides.</li>
            </ul>
          </TermSection>

          <TermSection title="2. Nature of the Platform">
            <p>KanoonAI is not a law firm, does not provide official legal advice, and does not represent users in any legal proceedings.</p>
            <p>The Platform uses artificial intelligence to assist with legal information, but:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>It cannot replace a licensed advocate.</li>
              <li>Outputs may contain errors, omissions, or outdated information.</li>
              <li>Users must verify all AI-generated content before relying on it.</li>
            </ul>
            <p>No lawyer-client relationship is created through KanoonAI.</p>
          </TermSection>

          <TermSection title="3. Eligibility">
            <p>To use the Platform, you must:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Use the Platform only for lawful and educational purposes;</li>
              <li>Not violate any applicable Indian laws;</li>
              <li>Not misuse the Platform by scraping, spamming, reverse engineering, or engaging in harmful activities.</li>
            </ul>
            <p>Since KanoonAI is an educational legal technology platform, individuals of any age, including students below 18, are permitted to access and use the Platform.</p>
          </TermSection>

          <TermSection title="4. Description of Services">
            <p>KanoonAI provides the following services, which may expand or change over time:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>AI-generated case law summaries</li>
              <li>Section-wise act explanations</li>
              <li>Legal document drafting assistance</li>
              <li>FIR explanation and formatting</li>
              <li>Automated legal research assistance</li>
              <li>Extraction of legal details from uploaded PDFs</li>
            </ul>
            <p>KanoonAI may modify, update, or discontinue parts of its Services at any time.</p>
          </TermSection>

          <TermSection title="5. No Legal Advice Disclaimer">
            <p>All outputs generated by KanoonAI are informational and educational. They do not constitute legal advice.</p>
            <p>KanoonAI does not guarantee accuracy, completeness, or correctness of its content. It should not be relied upon as a sole resource for legal decision-making. It should be used as a support tool, not a substitute for legal consultation. Users are strongly encouraged to consult a licensed advocate for professional advice.</p>
          </TermSection>

          <TermSection title="6. User Responsibilities">
            <p>You agree to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide accurate and lawful information.</li>
              <li>Not upload harmful, abusive, defamatory, or illegal materials.</li>
              <li>Not use the Platform to generate fraudulent legal documents.</li>
              <li>Not violate any intellectual property rights of third parties.</li>
              <li>Not exploit system vulnerabilities or interfere with service functionality.</li>
              <li>Verify the AI output before using it in legal matters.</li>
            </ul>
            <p>Any misuse may result in account termination and legal action.</p>
          </TermSection>

          <TermSection title="7. Data Collection & Privacy">
            <p>KanoonAI collects certain types of data to improve performance and user experience, such as user queries, uploaded documents, usage patterns, and account information (if applicable).</p>
            <p>We do not sell user data. We may store and use your data to generate responses, improve and train AI systems, for analytics and debugging, and to ensure security and fraud detection.</p>
            <p>A separate Privacy Policy governs how your data is collected and stored. By using the Platform, you consent to data usage outlined in the Privacy Policy.</p>
          </TermSection>

          <TermSection title="8. Intellectual Property Rights">
            <p>All rights in the Platform, including software, algorithms, UI/UX design, branding, trademarks, icons, text, graphics, and training data/models, are the exclusive property of KanoonAI or its licensors.</p>
            <p>Users may use AI-generated outputs for personal and educational purposes but cannot:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Resell KanoonAI outputs as a service</li>
              <li>Copy or reproduce the platform features</li>
              <li>Reverse engineer or extract the model</li>
              <li>Build competing AI legal products using our content</li>
            </ul>
          </TermSection>

          <TermSection title="9. Third-Party Services">
            <p>KanoonAI may integrate with third-party tools and APIs, such as search engines, AI model providers, cloud hosting platforms, public lawyer directories (Bar Council databases), and PDF processing libraries.</p>
            <p>We are not responsible for failures or inaccuracies in third-party services, outages caused by third-party providers, or data handling practices of external websites. Users should read the Terms of those third parties separately.</p>
          </TermSection>

          <TermSection title="10. Limitation of Liability">
            <p>To the maximum extent permitted by Indian law: KanoonAI is not liable for direct, indirect, special, incidental, or consequential damages. The Platform is provided on an “as-is” and “as-available” basis. We do not guarantee uninterrupted or error-free operation. We are not responsible for any legal outcomes resulting from reliance on AI-generated content. Users willingly take full responsibility for how they use the Platform.</p>
          </TermSection>

          <TermSection title="11. Indemnification">
            <p>You agree to indemnify and hold harmless KanoonAI, its team, partners, and affiliates from any claims, damages, losses, liabilities, or expenses arising out of: misuse of the Platform, violation of these Terms, violation of laws, uploading unlawful or infringing content, or reliance on inaccurate AI-generated responses.</p>
          </TermSection>

          <TermSection title="12. Changes to Terms">
            <p>KanoonAI may update, modify, or change these Terms & Conditions at any time. Changes take effect immediately upon posting. Continued use of the Platform constitutes acceptance of the updated Terms.</p>
          </TermSection>

          <TermSection title="13. Termination">
            <p>KanoonAI reserves the right to limit access, suspend accounts, or permanently terminate use for violations, unlawful activity, system abuse, or security concerns. Users may stop using the Platform at any time.</p>
          </TermSection>

          <TermSection title="14. Governing Law & Jurisdiction">
            <p>These Terms are governed by the laws of India. Any disputes will be resolved exclusively in the courts located in Bangalore, Karnataka.</p>
            <p>In the event of any legal proceedings, the User (You) agrees to bear and pay all expenses on behalf of KanoonAI or its team, including but not limited to: lawyer fees, travel expenses, judiciary paper expenses, and other immediate and unexpected legal expenses.</p>
          </TermSection>

          <TermSection title="15. Contact Information">
            <p>For any concerns, support, or legal queries, you may contact:</p>
            <p>📧 Email: <a href="mailto:ksaabrarahmed2021@gmail.com" className="text-blue-600 hover:underline">ksaabrarahmed2021@gmail.com</a></p>
          </TermSection>
        </div>

      </main>

      {/* 3. Footer (Consistent with HomePage) */}
      <footer style={{ backgroundColor: deepBlue }}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-4 md:gap-6 mb-4">
            <Link to="/about" className="text-sm text-gray-300 hover:text-white">
              About Us
            </Link>
            <span className="text-gray-500">|</span>
            {/* Link to this page */}
            <Link to="/terms-and-conditions" className="text-sm text-gray-300 hover:text-white">
              Terms & Conditions
            </Link>
            <span className="text-gray-500">|</span>
            <Link to="/customer-support" className="text-sm text-gray-300 hover:text-white">
              Customer Support
            </Link>
          </div>
          
          <p className="text-gray-400">
            &copy; 2025 KanoonAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default TermsPage;