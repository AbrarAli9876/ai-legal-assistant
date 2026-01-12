import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import Layouts and Pages
import DashboardLayout from './components/Layout/DashboardLayout';
import HomePage from './pages/HomePage'; // <-- Already correctly imported
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import AboutPage from './pages/AboutPage';
import TermsPage from './pages/TermsPage'; 

// Import all your tool page components
import ChatbotPage from './pages/ChatbotPage';
import DocumentGeneratorPage from './pages/DocumentGeneratorPage';
import CaseSummarizerPage from './pages/CaseSummarizerPage';
import AnalyzerPage from './pages/AnalyzerPage';
import NoticeGeneratorPage from './pages/NoticeGeneratorPage';
import LearningHubPage from './pages/LearningHubPage';
import FAQBuilderPage from './pages/FAQBuilderPage';
import SettingsPage from './pages/SettingsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CustomerSupportPage from './pages/CustomerSupportPage.jsx';
import ReportIssuePage from './pages/ReportIssuePage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // Import
import ResetPasswordPage from './pages/ResetPasswordPage';   // Import

function App() {
  return (
    <Routes>
      
      {/* --- PUBLIC ROUTES --- */}
      {/* This route correctly loads your new HomePage */}
      <Route path="/" element={<HomePage />} /> 
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/terms-and-conditions" element={<TermsPage />} /> 
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/customer-support" element={<CustomerSupportPage />} />
      <Route path="/report-issue" element={<ReportIssuePage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* --- PRIVATE DASHBOARD ROUTE --- */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        {/* This redirects /dashboard to /dashboard/chatbot */}
        <Route index element={<Navigate to="chatbot" replace />} />
        
        {/* All your app's tools */}
        <Route path="chatbot" element={<ChatbotPage />} />
        <Route path="document-generator" element={<DocumentGeneratorPage />} />
        <Route path="case-summarizer" element={<CaseSummarizerPage />} />
        <Route path="fir-analyzer" element={<AnalyzerPage />} />
        <Route path="notice-generator" element={<NoticeGeneratorPage />} />
        <Route path="learning-hub" element={<LearningHubPage />} />
        <Route path="faq-builder" element={<FAQBuilderPage />} />
        <Route path="settings" element={<SettingsPage />} />
        
      </Route>
      
    </Routes>
  );
}

export default App;