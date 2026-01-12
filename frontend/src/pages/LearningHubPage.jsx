import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Search, AlertCircle, Wand2, Edit, FileSearch, CheckCircle2, XCircle, Star, Award, BookText, HelpCircle, GitCompare, MessageSquare, Brain } from 'lucide-react';

// --- API Service (Embedded) ---
const API_BASE_URL = "http://localhost:8000";

// --- API Call for Tool 1 ---
async function simplifyBareAct(section) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/learning/simplify-bare-act`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: section }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "An unknown error occurred.");
    }
    return data;
  } catch (error) {
    console.error("Failed to simplify section:", error);
    throw error;
  }
}

// --- API Call for Tool 2 ---
async function evaluateAnswer(question, answer) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/learning/evaluate-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question, answer: answer }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "An unknown error occurred.");
    }
    return data;
  } catch (error) {
    console.error("Failed to evaluate answer:", error);
    throw error;
  }
}

// --- API Call for Tool 3 (NEW) ---
async function researchTopic(topic) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/learning/research-topic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topic }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "An unknown error occurred.");
    }
    return data; // Returns the research notes JSON
  } catch (error) {
    console.error("Failed to research topic:", error);
    throw error;
  }
}


// --- Reusable Tab Button ---
const TabButton = ({ title, icon, onClick, isActive }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-3 px-4 py-4 text-sm font-semibold border-b-4
      ${isActive 
        ? 'border-legal-blue-primary text-legal-blue-primary' 
        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }
      transition-all`}
  >
    {icon}
    {title}
  </button>
);

// --- Reusable Result Section ---
const ResultSection = ({ title, children, icon }) => (
  <div className="pt-5 mt-5 border-t border-gray-200">
    <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
      {icon}
      {title}
    </h4>
    <div className="text-legal-text-primary space-y-3">{children}</div>
  </div>
);

// --- Reusable List Item ---
const ListItem = ({ children, icon: Icon = CheckCircle2, color = "text-legal-gold-primary" }) => (
  <li className="relative pl-7">
    <span className={`absolute left-0 top-1 ${color}`}>
      <Icon size={18} />
    </span>
    {children}
  </li>
);

// ----------------------------------------------------------------------
// 🎓 TOOL 1: BARE ACT SIMPLIFIER
// ----------------------------------------------------------------------
const BareActSimplifier = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchTerm) {
      setError("Please enter a legal section.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await simplifyBareAct(searchTerm);
      setResult(data);
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const CaseItem = ({ caseData }) => (
    <li className="relative pl-7 space-y-1">
      <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-legal-gold-primary"></span>
      <strong className="block text-legal-text-primary">{caseData.case_name}</strong>
      <span className="block text-xs font-mono text-gray-500">{caseData.citation}</span>
      <p className="text-gray-600">{caseData.summary}</p>
    </li>
  );

  return (
    <div className="mt-6">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-legal-blue-primary focus:ring-2 focus:ring-legal-blue-primary/50"
          placeholder="e.g., 'IPC 304A', 'Section 113B Evidence Act'"
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`flex justify-center items-center gap-2 rounded-lg px-6 py-3 text-lg font-semibold text-white transition-colors
            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-legal-blue-primary hover:bg-legal-blue-highlight shadow-lg'}`}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
          {isLoading ? 'Analyzing...' : 'Simplify'}
        </button>
      </form>

      {/* --- Results Section --- */}
      <div className="mt-6">
        {isLoading && (
          <div className="flex items-center justify-center p-8 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-legal-blue-primary" />
            <p className="ml-3 text-lg font-medium">Loading analysis...</p>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-300 text-red-700 flex items-center gap-3">
            <AlertCircle />
            <div><h4 className="font-semibold">Error</h4><p>{error}</p></div>
          </div>
        )}
        {result && (
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <ResultSection title="Section Title" icon={<BookText size={16} />}><h3 className="text-2xl font-bold text-legal-blue-primary">{result.section_title}</h3></ResultSection>
            <ResultSection title="Simplified Meaning" icon={<BookText size={16} />}><p className="leading-relaxed">{result.simplified_meaning}</p></ResultSection>
            <ResultSection title="Legal Ingredients (Checklist)" icon={<BookText size={16} />}><ul className="list-none space-y-2">{result.legal_ingredients.map((item, i) => <ListItem key={i} color="text-legal-gold-primary" icon={CheckCircle2}>{item}</ListItem>)}</ul></ResultSection>
            <ResultSection title="Exceptions (if any)" icon={<BookText size={16} />}><ul className="list-none space-y-2">{result.exceptions.length > 0 ? result.exceptions.map((item, i) => <ListItem key={i} color="text-gray-500" icon={XCircle}>{item}</ListItem>) : <ListItem color="text-gray-500" icon={CheckCircle2}><i>No specific exceptions mentioned.</i></ListItem>}</ul></ResultSection>
            {/* --- FLOWCHART REMOVED FROM HERE --- */}
            <ResultSection title="Real-life Illustration" icon={<BookText size={16} />}><blockquote className="pl-4 border-l-4 border-legal-gold-primary bg-legal-gray-bg p-4 rounded-r-lg"><p className="text-gray-800 italic">{result.real_life_illustration}</p></blockquote></ResultSection>
            <ResultSection title="Landmark Cases" icon={<BookText size={16} />}><ul className="list-none space-y-4">{result.landmark_cases.map((caseData, i) => (<CaseItem key={i} caseData={caseData} />))}</ul></ResultSection>
            <ResultSection title="Memory Trick (Mnemonic)" icon={<Brain size={16} />}><p className="text-gray-700">{result.memory_trick}</p></ResultSection>
          </div>
        )}
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// 🎓 TOOL 2: AI ANSWER WRITING EVALUATOR
// ----------------------------------------------------------------------
const AnswerEvaluator = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question || !answer) {
      setError("Please provide both the question and your answer.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await evaluateAnswer(question, answer);
      setResult(data);
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const EvaluationItem = ({ title, feedback }) => (
    <div className="py-2">
      <h5 className="font-semibold text-legal-text-primary">{title}</h5>
      <p className="text-gray-600 text-sm">{feedback}</p>
    </div>
  );

  return (
    <div className="mt-6">
      <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-4">
        <div>
          <label htmlFor="question" className="block text-sm font-semibold text-legal-text-primary mb-1">1. Enter the Exam Question</label>
          <textarea id="question" rows="3" value={question} onChange={(e) => setQuestion(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-legal-blue-primary focus:ring-2 focus:ring-legal-blue-primary/50" placeholder="e.g., 'What is Culpable Homicide? Differentiate it from Murder.'" />
        </div>
        <div>
          <label htmlFor="answer" className="block text-sm font-semibold text-legal-text-primary mb-1">2. Enter Your Full Answer</label>
          <textarea id="answer" rows="8" value={answer} onChange={(e) => setAnswer(e.target.value)} className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-legal-blue-primary focus:ring-2 focus:ring-legal-blue-primary/50" placeholder="e.g., 'Culpable Homicide is defined under Section 299 of the IPC...'" />
        </div>
        <button type="submit" disabled={isLoading} className={`w-full flex justify-center items-center gap-2 rounded-lg px-6 py-4 text-lg font-semibold text-white transition-colors ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-legal-blue-primary hover:bg-legal-blue-highlight shadow-lg'}`}>
          {isLoading ? <Loader2 className="animate-spin" /> : <Edit />}
          {isLoading ? 'Evaluating...' : 'Evaluate My Answer'}
        </button>
      </form>

      {/* --- Results Section --- */}
      <div className="mt-6">
        {isLoading && (<div className="flex items-center justify-center p-8 text-gray-500"><Loader2 className="h-8 w-8 animate-spin text-legal-blue-primary" /><p className="ml-3 text-lg font-medium">Evaluating your answer...</p></div>)}
        {error && (<div className="p-4 rounded-lg bg-red-50 border border-red-300 text-red-700 flex items-center gap-3"><AlertCircle /><div><h4 className="font-semibold">Error</h4><p>{error}</p></div></div>)}
        {result && (
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            <ResultSection title="AI Professor's Score" icon={<Star size={16} />}><div className="flex items-center gap-3"><span className="text-6xl font-bold text-legal-blue-primary">{result.marks_out_of_10}</span><span className="text-2xl font-semibold text-gray-500">/ 10</span></div></ResultSection>
            <ResultSection title="Evaluation Criteria" icon={<Award size={16} />}><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><EvaluationItem title="Structure" feedback={result.evaluation_criteria.structure} /><EvaluationItem title="Case Law Usage" feedback={result.evaluation_criteria.case_usage} /><EvaluationItem title="Bare Act Accuracy" feedback={result.evaluation_criteria.bare_act_accuracy} /><EvaluationItem title="Grammar & Clarity" feedback={result.evaluation_criteria.grammar} /><EvaluationItem title="Legal Reasoning" feedback={result.evaluation_criteria.legal_reasoning} /></div></ResultSection>
            <ResultSection title="Areas for Improvement" icon={<XCircle size={16} />}><ul className="list-none space-y-2">{result.mistakes.map((item, i) => (<ListItem key={i} color="text-red-500" icon={XCircle}>{item}</ListItem>))}</ul></ResultSection>
            <ResultSection title="Suggestion to Score More" icon={<Wand2 size={16} />}><blockquote className="pl-4 border-l-4 border-legal-gold-primary bg-legal-gray-bg p-4 rounded-r-lg"><p className="text-gray-800 italic">{result.suggestion_to_score_more}</p></blockquote></ResultSection>
            <ResultSection title="Model 'A+' Answer" icon={<CheckCircle2 size={16} />}><div className="p-4 bg-gray-50 rounded-lg text-gray-700 leading-relaxed whitespace-pre-wrap">{result.improved_answer}</div></ResultSection>
          </div>
        )}
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// 🎓 TOOL 3: LEGAL RESEARCH ASSISTANT
// ----------------------------------------------------------------------
const LegalResearcher = () => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic) {
      setError("Please enter a legal topic to research.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await researchTopic(topic);
      setResult(data);
    } catch (err) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const ResearchCaseItem = ({ caseData }) => (
    <li className="relative pl-7 space-y-1">
      <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-legal-gold-primary"></span>
      <strong className="block text-legal-text-primary">{caseData.case_name}</strong>
      <p className="text-gray-600 text-sm"><strong className="font-semibold">Facts:</strong> {caseData.facts}</p>
      <p className="text-gray-600 text-sm"><strong className="font-semibold">Ratio:</strong> {caseData.ratio}</p>
    </li>
  );

  return (
    <div className="mt-6">
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="flex-1 w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-legal-blue-primary focus:ring-2 focus:ring-legal-blue-primary/50"
          placeholder="e.g., 'Cruelty under Hindu Marriage Act', 'Section 34 IPC Common Intention'"
        />
        <button
          type="submit"
          disabled={isLoading}
          className={`flex justify-center items-center gap-2 rounded-lg px-6 py-3 text-lg font-semibold text-white transition-colors
            ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-legal-blue-primary hover:bg-legal-blue-highlight shadow-lg'}`}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : <FileSearch />}
          {isLoading ? 'Researching...' : 'Get Notes'}
        </button>
      </form>

      {/* --- Results Section --- */}
      <div className="mt-6">
        {isLoading && (
          <div className="flex items-center justify-center p-8 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-legal-blue-primary" />
            <p className="ml-3 text-lg font-medium">Generating complete notes...</p>
          </div>
        )}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-300 text-red-700 flex items-center gap-3">
            <AlertCircle />
            <div><h4 className="font-semibold">Error</h4><p>{error}</p></div>
          </div>
        )}
        {result && (
          <div className="p-6 bg-white border border-gray-200 rounded-lg">
            
            <ResultSection title="Topic Definition" icon={<BookText size={16} />}>
              <p className="leading-relaxed">{result.topic_definition}</p>
            </ResultSection>

            <ResultSection title="Bare Act Section(s)" icon={<BookText size={16} />}>
              <p className="p-4 bg-gray-50 rounded-lg font-mono text-gray-700">{result.bare_act_section}</p>
            </ResultSection>

            <ResultSection title="Legal Ingredients" icon={<CheckCircle2 size={16} />}>
              <ul className="list-none space-y-2">{result.legal_ingredients.map((item, i) => <ListItem key={i}>{item}</ListItem>)}</ul>
            </ResultSection>
            
            <ResultSection title="Landmark Cases" icon={<Award size={16} />}>
              <ul className="list-none space-y-4">{result.important_cases.map((caseData, i) => (<ResearchCaseItem key={i} caseData={caseData} />))}</ul>
            </ResultSection>

            {/* --- THIS IS THE FIX: REMOVED FLOWCHART FROM RESEARCHER --- */}
            
            <ResultSection title="Comparison with Similar Concepts" icon={<GitCompare size={16} />}>
              <div className="p-4 bg-gray-50 rounded-lg text-gray-700 leading-relaxed whitespace-pre-wrap">
                {result.comparison}
              </div>
            </ResultSection>
            
            <ResultSection title="10-Mark Model Answer" icon={<Edit size={16} />}>
              <div className="p-4 bg-gray-100 rounded-lg text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-200">
                {result.model_answer_10_marks}
              </div>
            </ResultSection>

            <ResultSection title="Potential Viva Questions" icon={<HelpCircle size={16} />}>
              <ul className="list-none space-y-2">{result.viva_questions.map((item, i) => <ListItem key={i} icon={MessageSquare} color="text-legal-blue-primary">{item}</ListItem>)}</ul>
            </ResultSection>

          </div>
        )}
      </div>
    </div>
  );
};


// ----------------------------------------------------------------------
// 🎓 MAIN PAGE COMPONENT
// ----------------------------------------------------------------------
function LearningHubPage() {
  
  const location = useLocation();
  const navigate = useNavigate();

  const getToolFromHash = () => {
    const validTools = ['simplifier', 'evaluator', 'researcher'];
    const hash = location.hash.replace('#', '');
    if (validTools.includes(hash)) {
      return hash;
    }
    return 'simplifier'; // Default
  };

  const [activeTool, setActiveTool] = useState(getToolFromHash());

  const handleTabClick = (toolName) => {
    setActiveTool(toolName);
    navigate(`#${toolName}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      
      {/* 1. Header */}
      <h2 className="text-3xl font-semibold text-legal-text-primary mb-6">
        Law Student Hub (AI Mentor)
      </h2>

      {/* 2. Tab Navigation */}
      <div className="flex bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <TabButton 
          title="Bare Act Simplifier"
          icon={<Wand2 size={16} />}
          isActive={activeTool === 'simplifier'}
          onClick={() => handleTabClick('simplifier')}
        />
        <TabButton 
          title="Answer Evaluator"
          icon={<Edit size={16} />}
          isActive={activeTool === 'evaluator'}
          onClick={() => handleTabClick('evaluator')}
        />
        <TabButton 
          title="Legal Researcher"
          icon={<FileSearch size={16} />}
          isActive={activeTool === 'researcher'}
          onClick={() => handleTabClick('researcher')}
        />
      </div>

      {/* 3. Conditional Tool Display */}
      <div className="mt-6">
        {activeTool === 'simplifier' && (
          <BareActSimplifier />
        )}
        
        {activeTool === 'evaluator' && (
          <AnswerEvaluator />
        )}
        
        {activeTool === 'researcher' && (
          <LegalResearcher /> 
        )}
      </div>
    </div>
  );
}

export default LearningHubPage;