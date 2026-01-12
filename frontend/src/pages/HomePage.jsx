import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  FileText, 
  Library, 
  FileSearch, 
  FileUp, 
  Edit, 
  BookOpen, 
  ListChecks, 
  Shield,
  Award
} from 'lucide-react';
// Make sure this path is correct for your folder structure
import logo from '../assets/logo.png'; 

// Brand Colors
const deepBlue = "#0A2A43";
const white = "#FFFFFF";
const goldAccent = "#F5C242";
const softGray = "#F7F9FA";

// Reusable component for feature cards
const FeatureCard = ({ icon, title, description }) => {
  const Icon = icon;
  return (
    <div 
      className="flex flex-col p-6 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-300
               hover:shadow-2xl hover:-translate-y-2"
    >
      <div className="flex items-center justify-center h-12 w-12 rounded-full" style={{ backgroundColor: softGray }}>
        <Icon className="h-6 w-6" style={{ color: deepBlue }} />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
};

// Main Home Page Component
function HomePage() {
  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: softGray }}>
      
      {/* 1. Header/Navbar */}
      <header className="shadow-sm" style={{ backgroundColor: white }}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              {/* --- THIS IS THE FIX --- */}
              <img src={logo} alt="KanoonAI Logo" className="h-10 w-10" />
              {/* --- END OF FIX --- */}
              <span className="text-2xl font-bold" style={{ color: deepBlue }}>
                KanoonAI
              </span>
            </Link>
            {/* Login Button */}
            <div>
              <Link
                to="/login"
                className={`inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-semibold 
                            rounded-md shadow-sm text-white transition-all duration-300 
                            hover:scale-105 hover:shadow-lg`}
                style={{ backgroundColor: deepBlue }}
              >
                Login / Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* 2. Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center">
          <h1 
            className="text-5xl md:text-6xl font-extrabold tracking-tight"
            style={{ color: deepBlue }}
          >
            Meet Your AI Legal Assistant
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-gray-700">
            Automate your legal research, generate complex documents, and get instant answers. 
            Our platform streamlines your entire workflow, saving you time and money.
          </p>
          <div className="mt-10">
            <Link
              to="/signup"
              className={`inline-flex items-center justify-center px-10 py-4 border border-transparent 
                          text-lg font-semibold rounded-md shadow-sm text-white transition-all duration-300 
                          hover:scale-105 hover:shadow-lg`}
              style={{ backgroundColor: deepBlue, color: goldAccent }}
            >
              Get Started Now
            </Link>
          </div>
        </div>

        {/* 3. Features Grid */}
        <div className="py-24" style={{ backgroundColor: white }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-800">
                An All-in-One Legal Toolkit
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Everything you need to supercharge your legal practice.
              </p>
            </div>
            
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={MessageCircle}
                title="Legal Query Chatbot"
                description="Get instant, accurate answers to complex legal questions, trained on Indian law."
              />
              <FeatureCard 
                icon={FileText}
                title="Document Generator"
                description="Create print-ready contracts, affidavits, and deeds (NDA, Rent, Sale) in seconds."
              />
              <FeatureCard 
                icon={FileUp}
                title="Case Law Summarizer"
                description="Upload any judgment and receive a perfect 9-point summary and downloadable report."
              />
              <FeatureCard 
                icon={Library}
                title="FIR & Evidence Analyzer"
                description="Extract key information (complainant, sections, etc.) from uploaded FIRs instantly."
              />
              <FeatureCard 
                icon={Edit}
                title="Legal Notice Generator"
                description="Draft and generate professional legal notices for unpaid salary, loan recovery, and more."
              />
              <FeatureCard 
                icon={BookOpen}
                title="Law Student Hub"
                description="Your personal AI mentor for simplifying bare acts, evaluating answers, and researching topics."
              />
              <FeatureCard 
                icon={ListChecks}
                title="FAQ Builder"
                description="Instantly generate a list of common client questions and answers for any legal topic."
              />
              <FeatureCard 
                icon={Shield}
                title="Secure & Private"
                description="Your data is your own. We prioritize security and confidentiality for all your work."
              />
            </div>
          </div>
        </div>

        {/* 4. Trust Section */}
        <div className="py-24" style={{ backgroundColor: softGray }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-800">
                Why Choose KanoonAI?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                We're built for excellence, efficiency, and your peace of mind.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div 
                className="flex items-start p-6 bg-white rounded-lg shadow-lg border border-gray-200 
                           transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-full mr-4" style={{ backgroundColor: goldAccent }}>
                  <Award className="h-5 w-5" style={{ color: deepBlue }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Unmatched Accuracy</h3>
                  <p className="text-gray-600 text-sm">Provides highly accurate legal reasoning and explanations.</p>
                </div>
              </div>
              <div 
                className="flex items-start p-6 bg-white rounded-lg shadow-lg border border-gray-200 
                           transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-full mr-4" style={{ backgroundColor: goldAccent }}>
                  <Award className="h-5 w-5" style={{ color: deepBlue }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Clarity & Simplicity</h3>
                  <p className="text-gray-600 text-sm">Delivers complex legal information in simple, easy-to-understand language.</p>
                </div>
              </div>
              <div 
                className="flex items-start p-6 bg-white rounded-lg shadow-lg border border-gray-200 
                           transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-full mr-4" style={{ backgroundColor: goldAccent }}>
                  <Award className="h-5 w-5" style={{ color: deepBlue }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Lightning Fast</h3>
                  <p className="text-gray-600 text-sm">Get instant answers and results in seconds, not hours or days.</p>
                </div>
              </div>
              <div 
                className="flex items-start p-6 bg-white rounded-lg shadow-lg border border-gray-200 
                           transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-full mr-4" style={{ backgroundColor: goldAccent }}>
                  <Award className="h-5 w-5" style={{ color: deepBlue }} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">Designed for India</h3>
                  <p className="text-gray-600 text-sm">Specifically tailored and trained on the nuances of Indian legal frameworks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* 5. Footer */}
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
            &copy; 2025 KanoonAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;