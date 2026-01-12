import React, { useState, useRef } from 'react';
import { FileDown, Loader2, AlertCircle, FileText, File } from 'lucide-react';

// --- Re-usable Form Input Component ---
const FormInput = ({ label, id, value, onChange, placeholder, required = true, type = "text" }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-legal-text-primary">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-legal-blue-primary focus:ring-2 focus:ring-legal-blue-primary/50"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

// --- Form Component for Unpaid Salary Notice ---
const UnpaidSalaryForm = ({ states }) => {
  return (
    <div className="space-y-6">
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">1. Recipient Details (To)</legend>
        <FormInput label="Recipient Full Name" id="recipientName" value={states.recipient_name} onChange={(e) => states.setRecipientName(e.target.value)} placeholder="e.g., 'Mr. HR Manager'" />
        <FormInput label="Recipient Designation" id="recipientDesignation" value={states.recipient_designation} onChange={(e) => states.setRecipientDesignation(e.target.value)} placeholder="e.g., 'Head of Human Resources'" />
        <FormInput label="Company Name" id="recipientCompany" value={states.recipient_company_name} onChange={(e) => states.setRecipientCompanyName(e.target.value)} placeholder="e.g., 'Tech Solutions Pvt. Ltd.'" />
        <FormInput label="Company Address" id="recipientAddress" value={states.recipient_company_address} onChange={(e) => states.setRecipientCompanyAddress(e.target.value)} placeholder="e.g., '123 Cyber Towers, Hyderabad'" />
      </fieldset>
      
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">2. Sender Details (From)</legend>
        <FormInput label="Your Full Name" id="senderName" value={states.sender_name} onChange={(e) => states.setSenderName(e.target.value)} placeholder="e.g., 'Priya Sharma'" />
        <FormInput label="Your Employee ID" id="employeeId" value={states.employee_id} onChange={(e) => states.setEmployeeId(e.target.value)} placeholder="e.g., 'TS1234'" />
        <FormInput label="Your Company Name" id="employeeCompany" value={states.employee_company_name} onChange={(e) => states.setEmployeeCompanyName(e.target.value)} placeholder="e.g., 'Tech Solutions Pvt. Ltd.'" />
        <FormInput label="Your Address (for records)" id="employeeAddress" value={states.employee_company_address} onChange={(e) => states.setEmployeeCompanyAddress(e.target.value)} placeholder="e.g., '456, Green Park, Delhi'" />
      </fieldset>

      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">3. Case Details</legend>
        <FormInput label="Employment Start Date" id="startDate" value={states.employment_start_date} onChange={(e) => states.setEmploymentStartDate(e.target.value)} placeholder="e.g., '01/06/2023'" />
        <FormInput label="Employment End Date" id="endDate" value={states.employment_end_date} onChange={(e) => states.setEmploymentEndDate(e.target.value)} placeholder="e.g., '15/10/2025'" />
        <FormInput label="Unpaid Salary Period" id="unpaidPeriod" value={states.unpaid_salary_period} onChange={(e) => states.setUnpaidSalaryPeriod(e.target.value)} placeholder="e.g., 'September & October 2025'" />
        <FormInput label="Unpaid Salary Amount (₹)" id="unpaidAmount" value={states.unpaid_salary_amount} onChange={(e) => states.setUnpaidSalaryAmount(e.target.value)} type="number" placeholder="e.g., '100000'" />
        <FormInput label="Unpaid Salary (in words)" id="unpaidWords" value={states.unpaid_salary_amount_words} onChange={(e) => states.setUnpaidSalaryAmountWords(e.target.value)} placeholder="e.g., 'One Lakh'" />
        <FormInput label="Response Time (in days)" id="responseDays" value={states.response_time_days} onChange={(e) => states.setResponseTimeDays(e.target.value)} type="number" placeholder="e.g., '15'" />
      </fieldset>
    </div>
  );
};

// --- NEW Form Component for Loan Repayment Notice ---
const LoanRepaymentForm = ({ states }) => {
  return (
    <div className="space-y-6">
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">1. Borrower Details (To)</legend>
        <FormInput label="Borrower's Full Name" id="borrowerName" value={states.borrower_name} onChange={(e) => states.setBorrowerName(e.target.value)} placeholder="e.g., 'Mr. Arun Kumar'" />
        <FormInput label="Borrower's Address" id="borrowerAddress" value={states.borrower_address} onChange={(e) => states.setBorrowerAddress(e.target.value)} placeholder="e.g., '789, MG Road, Bangalore'" />
      </fieldset>
      
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">2. Lender Details (From)</legend>
        <FormInput label="Your Full Name (Lender)" id="lenderName" value={states.lender_name} onChange={(e) => states.setLenderName(e.target.value)} placeholder="e.g., 'Mr. Suresh Reddy'" />
        <FormInput label="Your Address" id="lenderAddress" value={states.lender_address} onChange={(e) => states.setLenderAddress(e.target.value)} placeholder="e.g., '123, Jubilee Hills, Hyderabad'" />
        <FormInput label="Your Contact Number" id="lenderContact" value={states.lender_contact} onChange={(e) => states.setLenderContact(e.target.value)} placeholder="e.g., '98XXXXXX99'" />
      </fieldset>

      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">3. Loan & Default Details</legend>
        <FormInput label="Original Loan Amount (₹)" id="loanAmount" value={states.loan_amount} onChange={(e) => states.setLoanAmount(e.target.value)} type="number" placeholder="e.g., '50000'" />
        <FormInput label="Loan Amount (in words)" id="loanAmountWords" value={states.loan_amount_words} onChange={(e) => states.setLoanAmountWords(e.target.value)} placeholder="e.g., 'Fifty Thousand'" />
        <FormInput label="Date of Loan" id="loanDate" value={states.loan_date} onChange={(e) => states.setLoanDate(e.target.value)} placeholder="e.g., '01/01/2025'" />
        <FormInput label="Repayment Period (in months)" id="repaymentPeriod" value={states.repayment_period} onChange={(e) => states.setRepaymentPeriod(e.target.value)} type="number" placeholder="e.g., '6'" />
        <FormInput label="Purpose of Loan" id="loanPurpose" value={states.loan_purpose} onChange={(e) => states.setLoanPurpose(e.target.value)} placeholder="e.g., 'a personal medical emergency'" />
        <FormInput label="Installment Amount (₹)" id="installmentAmount" value={states.installment_amount} onChange={(e) => states.setInstallmentAmount(e.target.value)} type="number" placeholder="e.g., '9000'" />
        <FormInput label="Outstanding Amount As Of (Date)" id="outstandingDate" value={states.outstanding_date} onChange={(e) => states.setOutstandingDate(e.target.value)} placeholder="e.g., '12/11/2025'" />
        <FormInput label="Total Outstanding Amount (₹)" id="outstandingAmount" value={states.outstanding_amount} onChange={(e) => states.setOutstandingAmount(e.target.value)} type="number" placeholder="e.g., '32000'" />
        <FormInput label="Outstanding Amount (in words)" id="outstandingAmountWords" value={states.outstanding_amount_words} onChange={(e) => states.setOutstandingAmountWords(e.target.value)} placeholder="e.g., 'Thirty-Two Thousand'" />
        <FormInput label="Response Time (in days)" id="responseDays" value={states.response_time_days} onChange={(e) => states.setResponseTimeDays(e.target.value)} type="number" placeholder="e.g., '15'" />
      </fieldset>
    </div>
  );
};


// --- Main Page Component ---
function NoticeGeneratorPage() {
  
  // --- Global State ---
  const [noticeType, setNoticeType] = useState('unpaid_salary');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadLinks, setDownloadLinks] = useState(null);
  const outputRef = useRef(null);
  const API_BASE_URL = "http://localhost:8000";

  // --- Form State for Unpaid Salary ---
  const [recipient_name, setRecipientName] = useState('');
  const [recipient_designation, setRecipientDesignation] = useState('');
  const [recipient_company_name, setRecipientCompanyName] = useState('');
  const [recipient_company_address, setRecipientCompanyAddress] = useState('');
  const [sender_name, setSenderName] = useState('');
  const [employee_id, setEmployeeId] = useState('');
  const [employee_company_name, setEmployeeCompanyName] = useState('');
  const [employee_company_address, setEmployeeCompanyAddress] = useState('');
  const [employment_start_date, setEmploymentStartDate] = useState('');
  const [employment_end_date, setEmploymentEndDate] = useState('');
  const [unpaid_salary_period, setUnpaidSalaryPeriod] = useState('');
  const [unpaid_salary_amount, setUnpaidSalaryAmount] = useState('');
  const [unpaid_salary_amount_words, setUnpaidSalaryAmountWords] = useState('');
  const [response_time_days, setResponseTimeDays] = useState('15');

  // --- NEW Form State for Loan Repayment ---
  const [borrower_name, setBorrowerName] = useState('');
  const [borrower_address, setBorrowerAddress] = useState('');
  const [lender_name, setLenderName] = useState('');
  const [lender_address, setLenderAddress] = useState('');
  const [lender_contact, setLenderContact] = useState('');
  const [loan_amount, setLoanAmount] = useState('');
  const [loan_amount_words, setLoanAmountWords] = useState('');
  const [loan_date, setLoanDate] = useState('');
  const [repayment_period, setRepaymentPeriod] = useState('');
  const [loan_purpose, setLoanPurpose] = useState('');
  const [installment_amount, setInstallmentAmount] = useState('');
  const [outstanding_date, setOutstandingDate] = useState('');
  const [outstanding_amount, setOutstandingAmount] = useState('');
  const [outstanding_amount_words, setOutstandingAmountWords] = useState('');
  const [loan_response_time_days, setLoanResponseTimeDays] = useState('15');


  // --- Form Submit Function ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDownloadLinks(null);
    outputRef.current?.scrollIntoView({ behavior: 'smooth' });

    let requestBody;
    let endpoint = ''; 

    if (noticeType === 'unpaid_salary') {
      endpoint = `${API_BASE_URL}/api/v1/notice/generate-unpaid-salary-notice`; 
      requestBody = {
        recipient_name,
        recipient_designation,
        recipient_company_name,
        recipient_company_address,
        sender_name,
        employee_id,
        employee_company_name,
        employee_company_address,
        employment_start_date,
        employment_end_date,
        unpaid_salary_period,
        unpaid_salary_amount: parseInt(unpaid_salary_amount, 10),
        unpaid_salary_amount_words,
        response_time_days: parseInt(response_time_days, 10)
      };
    } else if (noticeType === 'loan_repayment') {
      endpoint = `${API_BASE_URL}/api/v1/notice/generate-loan-repayment-notice`;
      requestBody = {
        borrower_name,
        borrower_address,
        lender_name,
        lender_address,
        lender_contact,
        loan_amount: parseInt(loan_amount, 10),
        loan_amount_words,
        loan_date,
        repayment_period: parseInt(repayment_period, 10),
        loan_purpose,
        installment_amount: parseInt(installment_amount, 10),
        outstanding_date,
        outstanding_amount: parseInt(outstanding_amount, 10),
        outstanding_amount_words,
        response_time_days: parseInt(loan_response_time_days, 10)
      };
    } else {
      setError("Selected notice type is not yet supported.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(endpoint, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        let errorMsg = "An unknown error occurred.";
        try {
          const errData = await response.json();
          if (errData.detail) {
            if (Array.isArray(errData.detail)) {
              errorMsg = errData.detail
                .map(err => `Field: '${err.loc[err.loc.length - 1]}', Message: ${err.msg}`)
                .join('; ');
            } 
            else if (typeof errData.detail === 'string') {
              errorMsg = errData.detail;
            }
          }
        } catch (jsonError) {
          errorMsg = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMsg.replace("Value error, ", "")); // Clean up pydantic's error
      }

      const data = await response.json();
      setDownloadLinks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Main Render ---
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
      
      {/* --- 1. Form Section --- */}
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold text-legal-text-primary mb-6">
          Legal Notice Generator
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- Document Type Selector --- */}
          <div>
            <label htmlFor="docType" className="block text-sm font-semibold text-legal-text-primary">
              Notice Type <span className="text-red-500">*</span>
            </label>
            <select
              id="docType"
              value={noticeType}
              onChange={(e) => setNoticeType(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-gray-800 appearance-none px-4 py-3 shadow-sm focus:border-legal-blue-primary focus:ring-2 focus:ring-legal-blue-primary/50"
              style={{
                backgroundColor: "white",
                color: "#1f2937",
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
              }}
            >
              <option value="unpaid_salary">Notice for Unpaid Salary</option>
              <option value="loan_repayment">Notice for Loan Repayment</option>
              <option value="defamation" disabled>Notice for Defamation (Coming Soon)</option>
              <option value="property" disabled>Property Dispute Notice (Coming Soon)</option>
            </select>
          </div>

          {/* --- Conditional Form Rendering --- */}
          {noticeType === 'unpaid_salary' && (
            <UnpaidSalaryForm 
              states={{
                recipient_name, setRecipientName,
                recipient_designation, setRecipientDesignation,
                recipient_company_name, setRecipientCompanyName,
                recipient_company_address, setRecipientCompanyAddress,
                sender_name, setSenderName,
                employee_id, setEmployeeId,
                employee_company_name, setEmployeeCompanyName,
                employee_company_address, setEmployeeCompanyAddress,
                employment_start_date, setEmploymentStartDate,
                employment_end_date, setEmploymentEndDate,
                unpaid_salary_period, setUnpaidSalaryPeriod,
                unpaid_salary_amount, setUnpaidSalaryAmount,
                unpaid_salary_amount_words, setUnpaidSalaryAmountWords,
                response_time_days, setResponseTimeDays,
              }}
            />
          )}

          {noticeType === 'loan_repayment' && (
            <LoanRepaymentForm 
              states={{
                borrower_name, setBorrowerName,
                borrower_address, setBorrowerAddress,
                lender_name, setLenderName,
                lender_address, setLenderAddress,
                lender_contact, setLenderContact,
                loan_amount, setLoanAmount,
                loan_amount_words, setLoanAmountWords,
                loan_date, setLoanDate,
                repayment_period, setRepaymentPeriod,
                loan_purpose, setLoanPurpose,
                installment_amount, setInstallmentAmount,
                outstanding_date, setOutstandingDate,
                outstanding_amount, setOutstandingAmount,
                outstanding_amount_words, setOutstandingAmountWords,
                response_time_days: loan_response_time_days, setResponseTimeDays: setLoanResponseTimeDays,
              }}
            />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center gap-2 rounded-lg px-6 py-4 text-lg font-semibold text-white transition-colors
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-legal-blue-primary hover:bg-legal-blue-highlight shadow-lg'
              }`}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <FileText />}
            {isLoading ? 'Generating Notice...' : 'Generate Notice'}
          </button>
        </form>
      </div>

      {/* --- 2. Output Section (DOWNLOAD-ONLY) --- */}
      <div ref={outputRef} className="p-8 bg-white rounded-lg shadow-md lg:col-span-1">
        <h3 className="text-2xl font-semibold text-legal-text-primary mb-6">
          Your Generated Files
        </h3>
        
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-300 text-red-700 flex items-center gap-3">
            <AlertCircle />
            <div><h4 className="font-semibold">Error</h4><p>{error}</p></div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <Loader2 className="h-12 w-12 animate-spin text-legal-blue-primary" />
            <p className="mt-4 text-lg font-medium">Generating your document...</p>
          </div>
        )}

        {downloadLinks && (
          <div className="space-y-4">
            <p className="text-green-700 font-semibold">
              Success! Your notice is ready to download.
            </p>
            
            {downloadLinks.pdf_url ? (
              <a
                href={`${API_BASE_URL}${downloadLinks.pdf_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex justify-between items-center gap-3 rounded-lg border-2 border-legal-blue-primary px-6 py-4 text-legal-blue-primary font-semibold hover:bg-legal-blue-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3"><File className="text-red-600" />Download PDF Notice</div>
                <FileDown />
              </a>
            ) : (
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-300 text-yellow-700 flex items-center gap-3">
                <AlertCircle />
                <p>PDF conversion failed, but your DOCX file was generated.</p>
              </div>
            )}

            <a
              href={`${API_BASE_URL}${downloadLinks.docx_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex justify-between items-center gap-3 rounded-lg border-2 border-legal-blue-primary px-6 py-4 text-legal-blue-primary font-semibold hover:bg-legal-blue-primary/5 transition-colors"
            >
              <div className="flex items-center gap-3"><File className="text-blue-600" />Download DOCX Notice</div>
              <FileDown />
            </a>
            
          </div>
        )}
        
        {!isLoading && !error && !downloadLinks && (
           <div className="flex flex-col items-center justify-center h-48 text-gray-400 border-2 border-dashed rounded-lg">
            <p className="text-lg">Select a notice type and fill out the form.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NoticeGeneratorPage;