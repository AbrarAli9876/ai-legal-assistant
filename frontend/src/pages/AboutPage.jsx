import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // We still need Link for the header/footer
import { Mail, Phone, Linkedin, Github, XCircle } from 'lucide-react';

// --- IMPORT ASSETS ---
import mainLogo from '../assets/logo.png'; 
import developerPhoto from '../assets/developer-ksaab.png';

// Brand Colors (from your application's existing theme)
const deepBlue = "#0A2A43";
const goldAccent = "#F5C242";
const softGray = "#F7F9FA";
const white = "#FFFFFF";

function AboutPage() {
  const [isPhotoPopOutOpen, setIsPhotoPopOutOpen] = useState(false);

  const openPhotoPopOut = () => setIsPhotoPopOutOpen(true);
  const closePhotoPopOut = () => setIsPhotoPopOutOpen(false);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: softGray }}>
      
      {/* Header (This part still uses <Link> for fast navigation) */}
      <header className="shadow-sm" style={{ backgroundColor: white }}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              {/* --- THIS IS THE FIX --- */}
              <img src={mainLogo} alt="KanoonAI Logo" className="h-10 w-10" />
              <span className="text-2xl font-bold" style={{ color: deepBlue }}>
                KanoonAI
              </span>
              {/* --- END OF FIX --- */}
            </Link>
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

      {/* --- (Main Content is unchanged) --- */}
      <main className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        
        {/* --- Introduction Section --- */}
        <section className="text-center mb-16">
          <h1 
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: deepBlue }}
          >
            {/* --- THIS IS THE FIX --- */}
            About KanoonAI
            {/* --- END OF FIX --- */}
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-700">
            {/* --- THIS IS THE FIX --- */}
            KanoonAI is a modern, AI-powered legal companion built to help people understand law simple, fast, and accessible for everyone in India.
            {/* --- END OF FIX --- */}
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-700">
            {/* --- THIS IS THE FIX --- */}
            Whether you're a student, professional, or someone seeking clarity, KanoonAI helps you understand legal concepts instantly.
            {/* --- END OF FIX --- */}
            We simplify complex laws, summarize cases, assist with drafting, and answer legal questions in clean, easy language — all within seconds.
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-lg font-semibold" style={{ color: deepBlue }}>
            Our goal is simple: to make legal knowledge easier to access, easier to learn, and easier to use.
          </p>
        </section>

        {/* --- Developer Section --- */}
        <section className="flex flex-col items-center">
          <h2 
            className="text-3xl font-bold text-center mb-8"
            style={{ color: deepBlue }}
          >
            Meet the Developer
          </h2>
          
          <div 
            className="rounded-2xl p-8 w-full max-w-md shadow-xl" 
            style={{ backgroundColor: white, border: `1px solid ${softGray}` }}
          >
            <div className="flex flex-col items-center">
              <img 
                src={developerPhoto}
                alt="Developer K S Abrar Ali Ahmed"
                className="h-48 w-48 rounded-full border-4 shadow-md object-cover object-center 
                           cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105"
                style={{ borderColor: goldAccent }}
                onClick={openPhotoPopOut}
              />
              
              <h3 className="text-3xl font-semibold mt-6" style={{ color: deepBlue }}>
                K S Abrar Ali Ahmed
              </h3>
              
              <p className="text-base mt-2 text-gray-700 whitespace-nowrap">
                College: K S School of Engineering and Management
              </p>

              <div className="flex gap-4 mt-6">
                <a 
                  href="https://www.linkedin.com/in/abrar-ali-ahmed/"
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-6 py-2 rounded-lg text-base font-medium flex items-center gap-2 transition-colors duration-200"
                  style={{ backgroundColor: deepBlue, color: white }}
                >
                  <Linkedin size={18} />
                  LinkedIn
                </a>
                <a 
                  href="https://github.com/AbrarAli9876/"
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-6 py-2 rounded-lg text-base font-medium flex items-center gap-2 transition-colors duration-200"
                  style={{ backgroundColor: deepBlue, color: white }}
                >
                  <Github size={18} />
                  GitHub
                </a>
              </div>

              <div className="border-t w-full mt-6 pt-6 border-gray-200">
                <div className="flex flex-col items-center space-y-3">
                  <a 
                    href="mailto:ksaabrarahmed2021@gmail.com" 
                    className="flex items-center gap-2 text-base text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    <Mail size={18} />
                    ksaabrarahmed2021@gmail.com
                  </a>
                  <span className="flex items-center gap-2 text-base text-gray-700">
                    <Phone size={18} />
                    +919494013210
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* --- FOOTER (THIS IS THE FIX) --- */}
      {/* ... (rest of the AboutPage component) ... */}

      {/* Footer (UPDATED) */}
      <footer style={{ backgroundColor: deepBlue }}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center gap-4 md:gap-6 mb-4">
            {/* --- THIS IS THE FIX (changed 'a' to 'Link') --- */}
            <Link to="/about" className="text-sm text-gray-300 hover:text-white">
              About Us
            </Link>
            {/* --- END OF FIX --- */}
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

      {/* ... (rest of the pop-out modal) ... */}
    </div>
  );
}

export default AboutPage;