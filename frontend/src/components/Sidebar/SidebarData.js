import React from 'react';
import { 
  MessageCircle, 
  FileText, 
  FileUp, 
  Library, 
  Edit, 
  FileSearch, 
  BookOpen, 
  ListChecks 
} from 'lucide-react';

export const sidebarData = [
  {
    title: "Legal Query Chatbot",
    IconComponent: MessageCircle, // Pass the component itself
    path: "/dashboard/chatbot"
  },
  {
    title: "Document Generator",
    IconComponent: FileText,
    path: "/dashboard/document-generator"
  },
  {
    title: "Case Law Summarizer",
    IconComponent: FileUp,
    path: "/dashboard/case-summarizer"
  },
  {
    title: "FIR & Evidence Analyzer",
    IconComponent: Library,
    path: "/dashboard/fir-analyzer"
  },
  {
    title: "Legal Notice Generator",
    IconComponent: Edit,
    path: "/dashboard/notice-generator"
  },
  {
    title: "Law Student Hub",
    IconComponent: BookOpen,
    path: "/dashboard/learning-hub"
  },
  {
    title: "FAQ Builder",
    IconComponent: ListChecks,
    path: "/dashboard/faq-builder"
  }
  // We've removed "Lawyer Recommender" for now
];