import React, { useState, useRef } from 'react';
import { FileDown, Loader2, AlertCircle, FileText, File, Plus, X } from 'lucide-react';

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

// --- Form Component for NDA ---
const NdaForm = ({ states }) => {
  const [currentPartyName, setCurrentPartyName] = useState('');
  const [currentPartyAddress, setCurrentPartyAddress] = useState('');

  const handleAddReceivingParty = () => {
    if (currentPartyName.trim() && currentPartyAddress.trim()) {
      states.setReceivingParties([
        ...states.receivingParties, 
        { name: currentPartyName.trim(), address: currentPartyAddress.trim() }
      ]);
      setCurrentPartyName('');
      setCurrentPartyAddress('');
    } else {
      alert("Please fill in both name and address for the receiving party.");
    }
  };

  const handleRemoveReceivingParty = (indexToRemove) => {
    states.setReceivingParties(states.receivingParties.filter((_, index) => index !== indexToRemove));
  };
  
  return (
    <div className="space-y-6">
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">1. Document Details</legend>
        <FormInput label="Purpose of Disclosure" id="purpose" value={states.purpose} onChange={(e) => states.setPurpose(e.target.value)} placeholder="e.g., 'Evaluating a potential business collaboration'" />
        <FormInput label="Business Purpose" id="businessPurpose" value={states.businessPurpose} onChange={(e) => states.setBusinessPurpose(e.target.value)} placeholder="e.g., 'Software development partnership'" />
        <FormInput label="Duration (in years)" id="duration" value={states.duration} onChange={(e) => states.setDuration(e.target.value)} placeholder="e.g., '5'" type="number" />
        <FormInput label="Jurisdiction (City)" id="jurisdiction" value={states.jurisdiction} onChange={(e) => states.setJurisdiction(e.target.value)} placeholder="e.g., 'Mumbai'" />
      </fieldset>
      
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">2. Disclosing Party (The one sharing secrets)</legend>
        <FormInput label="Full Legal Name" id="dpName" value={states.disclosingPartyName} onChange={(e) => states.setDisclosingPartyName(e.target.value)} placeholder="e.g., 'ABC Innovations Pvt. Ltd.'" />
        <FormInput label="Full Address" id="dpAddress" value={states.disclosingPartyAddress} onChange={(e) => states.setDisclosingPartyAddress(e.target.value)} placeholder="e.g., '123 Main St, Bangalore, India'" />
      </fieldset>

      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">3. Receiving Parties (The one(s) receiving secrets)</legend>
        <div className="space-y-2">
          {states.receivingParties.map((party, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-legal-gray-bg rounded-lg">
              <div>
                <p className="font-semibold text-legal-text-primary">{party.name}</p>
                <p className="text-sm text-gray-600">{party.address}</p>
              </div>
              <button type="button" onClick={() => handleRemoveReceivingParty(index)} className="p-1 text-red-500 hover:text-red-700">
                <X size={18} />
              </button>
            </div>
          ))}
          {states.receivingParties.length === 0 && <p className="text-sm text-gray-500 text-center">No receiving parties added yet.</p>}
        </div>
        <div className="p-4 border border-dashed rounded-lg space-y-3">
          <FormInput label="New Receiving Party Name" id="rpName" value={currentPartyName} onChange={(e) => setCurrentPartyName(e.target.value)} placeholder="e.g., 'XYZ Solutions'" required={false} />
          <FormInput label="New Receiving Party Address" id="rpAddress" value={currentPartyAddress} onChange={(e) => setCurrentPartyAddress(e.target.value)} placeholder="e.g., '456 MG Road, Pune, India'" required={false} />
          <button type="button" onClick={handleAddReceivingParty} className="w-full flex justify-center items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white bg-legal-gold-primary hover:bg-legal-gold-hover">
            <Plus size={16} /> Add Receiving Party
          </button>
        </div>
      </fieldset>
    </div>
  );
};

// --- Form Component for Affidavit ---
const AffidavitForm = ({ states }) => {
  return (
    <div className="space-y-6">
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">1. Deponent Details (The person making the oath)</legend>
        <FormInput label="Full Legal Name" id="deponentName" value={states.deponentName} onChange={(e) => states.setDeponentName(e.target.value)} placeholder="e.g., 'Rohan Sharma'" />
        <FormInput label="Age" id="deponentAge" value={states.deponentAge} onChange={(e) => states.setDeponentAge(e.target.value)} placeholder="e.g., '35'" type="number" />
        <FormInput label="S/o, D/o, W/o (Relation's Name)" id="relationName" value={states.relationName} onChange={(e) => states.setRelationName(e.target.value)} placeholder="e.g., 'Sunil Sharma'" />
        <FormInput label="Full Address" id="deponentAddress" value={states.deponentAddress} onChange={(e) => states.setDeponentAddress(e.target.value)} placeholder="e.g., 'Flat 10, Silver Arch, Pune, Maharashtra'" />
      </fieldset>
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">2. Affidavit Purpose</legend>
        <FormInput label="Purpose of Affidavit" id="purpose" value={states.purpose} onChange={(e) => states.setPurpose(e.target.value)} placeholder="e.g., 'To declare a change of name...'" />
      </fieldset>
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">3. Verification & Notary Details</legend>
        <FormInput label="Verification Place (City)" id="verificationPlace" value={states.verificationPlace} onChange={(e) => states.setVerificationPlace(e.target.value)} placeholder="e.g., 'Pune'" />
        <FormInput label="Identifier Name (Person who identified deponent)" id="identifierName" value={states.identifierName} onChange={(e) => states.setIdentifierName(e.target.value)} placeholder="e.g., 'Adv. Priya Singh'" />
        <FormInput label="Notary Public Name" id="notaryName" value={states.notaryName} onChange={(e) => states.setNotaryName(e.target.value)} placeholder="e.g., 'S. K. Jain'" />
        <FormInput label="Notary Registration No." id="notaryRegNo" value={states.notaryRegNo} onChange={(e) => states.setNotaryRegNo(e.target.value)} placeholder="e.g., '1234/2025'" />
        <FormInput label="Notary Office Address" id="notaryAddress" value={states.notaryAddress} onChange={(e) => states.setNotaryAddress(e.target.value)} placeholder="e.g., 'District Court, Pune'" />
      </fieldset>
    </div>
  );
};

// --- Form Component for Rent Agreement ---
const RentAgreementForm = ({ states }) => {
  return (
    <div className="space-y-6">
      <FormInput label="Agreement City" id="agreementCity" value={states.agreementCity} onChange={(e) => states.setAgreementCity(e.target.value)} placeholder="e.g., 'Mumbai'" />
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">1. Landlord Details</legend>
        <FormInput label="Landlord Full Name" id="landlordName" value={states.landlordName} onChange={(e) => states.setLandlordName(e.target.value)} placeholder="e.g., 'Mr. Suresh Gupta'" />
        <FormInput label="Landlord Age" id="landlordAge" value={states.landlordAge} onChange={(e) => states.setLandlordAge(e.target.value)} type="number" />
        <FormInput label="Landlord S/o, D/o, W/o" id="landlordRelation" value={states.landlordRelation} onChange={(e) => states.setLandlordRelation(e.target.value)} placeholder="e.g., 'Late Mr. Ramesh Gupta'" />
        <FormInput label="Landlord Address" id="landlordAddress" value={states.landlordAddress} onChange={(e) => states.setLandlordAddress(e.target.value)} placeholder="e.g., '101, Marine Drive, Mumbai'" />
        <FormInput label="Landlord Phone" id="landlordPhone" value={states.landlordPhone} onChange={(e) => states.setLandlordPhone(e.target.value)} placeholder="e.g., '98XXXXXX01'" />
      </fieldset>
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">2. Tenant Details</legend>
        <FormInput label="Tenant Full Name" id="tenantName" value={states.tenantName} onChange={(e) => states.setTenantName(e.target.value)} placeholder="e.g., 'Ms. Priya Sharma'" />
        <FormInput label="Tenant Age" id="tenantAge" value={states.tenantAge} onChange={(e) => states.setTenantAge(e.target.value)} type="number" />
        <FormInput label="Tenant S/o, D/o, W/o" id="tenantRelation" value={states.tenantRelation} onChange={(e) => states.setTenantRelation(e.target.value)} placeholder="e.g., 'Mr. Ashok Sharma'" />
        <FormInput label="Tenant Address" id="tenantAddress" value={states.tenantAddress} onChange={(e) => states.setTenantAddress(e.target.value)} placeholder="e.g., 'A-502, New Horizons, Pune'" />
        <FormInput label="Tenant Phone" id="tenantPhone" value={states.tenantPhone} onChange={(e) => states.setTenantPhone(e.target.value)} placeholder="e.g., '98XXXXXX02'" />
      </fieldset>
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">3. Property Details</legend>
        <FormInput label="Full Property Address" id="propertyAddress" value={states.propertyAddress} onChange={(e) => states.setPropertyAddress(e.target.value)} placeholder="e.g., 'Flat 2B, Sunshine Apartments, Bandra West, Mumbai'" />
        <FormInput label="Property Description" id="propertyDescription" value={states.propertyDescription} onChange={(e) => states.setPropertyDescription(e.target.value)} placeholder="e.g., '2BHK, 1st Floor, 1200 sq.ft.'" />
        <FormInput label="Usage Type" id="usageType" value={states.usageType} onChange={(e) => states.setUsageType(e.target.value)} placeholder="e.g., 'Residential'" />
      </fieldset>
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">4. Terms & Payment</legend>
        <FormInput label="Start Date (DD/MM/YYYY)" id="startDate" value={states.startDate} onChange={(e) => states.setStartDate(e.target.value)} placeholder="e.g., '01/12/2025'" />
        <FormInput label="Duration (in Months)" id="durationMonths" value={states.durationMonths} onChange={(e) => states.setDurationMonths(e.target.value)} type="number" />
        <FormInput label="Monthly Rent (₹)" id="monthlyRent" value={states.monthlyRent} onChange={(e) => states.setMonthlyRent(e.target.value)} type="number" />
        <FormInput label="Monthly Rent (in words)" id="monthlyRentWords" value={states.monthlyRentWords} onChange={(e) => states.setMonthlyRentWords(e.target.value)} placeholder="e.g., 'Fifty Thousand'" />
        <FormInput label="Rent Due Day (of each month)" id="dueDay" value={states.dueDay} onChange={(e) => states.setDueDay(e.target.value)} type="number" />
        <FormInput label="Payment Mode" id="paymentMode" value={states.paymentMode} onChange={(e) => states.setPaymentMode(e.target.value)} placeholder="e.g., 'Bank Transfer / NEFT'" />
        <FormInput label="Payment Address / Details" id="paymentAddress" value={states.paymentAddress} onChange={(e) => states.setPaymentAddress(e.target.value)} placeholder="e.g., 'HDFC Bank, A/C 1234...'" />
        <FormInput label="Security Deposit (₹)" id="securityAmount" value={states.securityAmount} onChange={(e) => states.setSecurityAmount(e.target.value)} type="number" />
        <FormInput label="Notice Period (in Months)" id="noticePeriod" value={states.noticePeriod} onChange={(e) => states.setNoticePeriod(e.target.value)} type="number" />
        <FormInput label="Jurisdiction (City)" id="jurisdictionCity" value={states.jurisdictionCity} onChange={(e) => states.setJurisdictionCity(e.target.value)} placeholder="e.g., 'Mumbai'" />
      </fieldset>
    </div>
  );
};

// --- Form Component for Sale Deed ---
const SaleDeedForm = ({ states }) => {
  return (
    <div className="space-y-6">
      <FormInput label="Execution City" id="execCity" value={states.executionCity} onChange={(e) => states.setExecutionCity(e.target.value)} placeholder="e.g., 'Chennai'" />
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">1. Seller (Vendor) Details</legend>
        <FormInput label="Seller Full Name" id="sellerName" value={states.sellerName} onChange={(e) => states.setSellerName(e.target.value)} placeholder="e.g., 'Mr. Arjun Reddy'" />
        <FormInput label="Seller Age" id="sellerAge" value={states.sellerAge} onChange={(e) => states.setSellerAge(e.target.value)} type="number" />
        <FormInput label="Seller S/o, D/o, W/o" id="sellerRelation" value={states.sellerRelation} onChange={(e) => states.setSellerRelation(e.target.value)} placeholder="e.g., 'Mr. Krishna Reddy'" />
        <FormInput label="Seller Address" id="sellerAddress" value={states.sellerAddress} onChange={(e) => states.setSellerAddress(e.target.value)} placeholder="e.g., '12, Jubilee Hills, Hyderabad'" />
        <FormInput label="Seller Phone" id="sellerPhone" value={states.sellerPhone} onChange={(e) => states.setSellerPhone(e.target.value)} placeholder="e.g., '98XXXXXX03'" />
      </fieldset>
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">2. Buyer (Vendee) Details</legend>
        <FormInput label="Buyer Full Name" id="buyerName" value={states.buyerName} onChange={(e) => states.setBuyerName(e.target.value)} placeholder="e.g., 'Mrs. Meera Krishnan'" />
        <FormInput label="Buyer Age" id="buyerAge" value={states.buyerAge} onChange={(e) => states.setBuyerAge(e.target.value)} type="number" />
        <FormInput label="Buyer S/o, D/o, W/o" id="buyerRelation" value={states.buyerRelation} onChange={(e) => states.setBuyerRelation(e.target.value)} placeholder="e.g., 'Mr. Ramesh Krishnan'" />
        <FormInput label="Buyer Address" id="buyerAddress" value={states.buyerAddress} onChange={(e) => states.setBuyerAddress(e.target.value)} placeholder="e.g., '34, Anna Nagar, Chennai'" />
        <FormInput label="Buyer Phone" id="buyerPhone" value={states.buyerPhone} onChange={(e) => states.setBuyerPhone(e.target.value)} placeholder="e.g., '98XXXXXX04'" />
      </fieldset>
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">3. Property & Sale Details</legend>
        <FormInput label="Full Property Address" id="propAddress" value={states.propertyAddress} onChange={(e) => states.setPropertyAddress(e.target.value)} placeholder="e.g., 'Plot 5, Adyar, Chennai'" />
        <FormInput label="Ownership Details" id="ownershipDetails" value={states.ownershipDetails} onChange={(e) => states.setOwnershipDetails(e.target.value)} placeholder="e.g., 'via Sale Deed dated 10/05/2010'" />
        <FormInput label="Total Sale Amount (₹)" id="saleAmount" value={states.saleAmount} onChange={(e) => states.setSaleAmount(e.target.value)} type="number" />
        <FormInput label="Sale Amount (in words)" id="saleAmountWords" value={states.saleAmountWords} onChange={(e) => states.setSaleAmountWords(e.target.value)} placeholder="e.g., 'One Crore Fifty Lakhs'" />
        <FormInput label="Jurisdiction (City)" id="jurisdictionCity" value={states.jurisdictionCity} onChange={(e) => states.setJurisdictionCity(e.target.value)} placeholder="e.g., 'Chennai'" />
      </fieldset>
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">4. Payment Details</legend>
        <FormInput label="Payment Mode" id="payMode" value={states.paymentMode} onChange={(e) => states.setPaymentMode(e.target.value)} placeholder="e.g., 'Bank Cheque / Cash'" />
        <FormInput label="Reference No. (if any)" id="payRef" value={states.paymentReference} onChange={(e) => states.setPaymentReference(e.target.value)} placeholder="e.g., 'Cheque No. 123456'" required={false} />
        <FormInput label="Payment Date" id="payDate" value={states.paymentDate} onChange={(e) => states.setPaymentDate(e.target.value)} placeholder="e.g., '11/11/2025'" />
        <FormInput label="Payment Amount (₹)" id="payAmount" value={states.paymentAmount} onChange={(e) => states.setPaymentAmount(e.target.value)} type="number" />
      </fieldset>
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">5. Property Schedule (Boundaries & Area)</legend>
        <FormInput label="Property Type" id="propType" value={states.propertyType} onChange={(e) => states.setPropertyType(e.target.value)} placeholder="e.g., 'Residential Plot'" />
        <FormInput label="Property Area (in sq.ft.)" id="propArea" value={states.propertyArea} onChange={(e) => states.setPropertyArea(e.target.value)} placeholder="e.g., '2400 sq.ft.'" />
        <FormInput label="Survey Number" id="surveyNo" value={states.surveyNumber} onChange={(e) => states.setSurveyNumber(e.target.value)} placeholder="e.g., 'Survey No. 78/A'" />
        <FormInput label="Property Description" id="propDesc" value={states.propertyDescription} onChange={(e) => states.setPropertyDescription(e.target.value)} placeholder="e.g., 'Plot No. 5, K-Nagar...'" />
        <FormInput label="Boundary (East)" id="bEast" value={states.boundaryEast} onChange={(e) => states.setBoundaryEast(e.target.value)} placeholder="e.g., 'Public Road'" />
        <FormInput label="Boundary (West)" id="bWest" value={states.boundaryWest} onChange={(e) => states.setBoundaryWest(e.target.value)} placeholder="e.g., 'Property of Mr. X'" />
        <FormInput label="Boundary (North)" id="bNorth" value={states.boundaryNorth} onChange={(e) => states.setBoundaryNorth(e.target.value)} placeholder="e.g., 'Property of Mr. Y'" />
        <FormInput label="Boundary (South)" id="bSouth" value={states.boundarySouth} onChange={(e) => states.setBoundarySouth(e.target.value)} placeholder="e.g., 'Park'" />
      </fieldset>
    </div>
  );
};

// --- Form Component for Lease Deed ---
const LeaseDeedForm = ({ states }) => {
  return (
    <div className="space-y-6">
      <FormInput label="Execution City" id="execCity" value={states.executionCity} onChange={(e) => states.setExecutionCity(e.target.value)} placeholder="e.g., 'Bangalore'" />
      
      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">1. Lessor (Owner) Details</legend>
        <FormInput label="Lessor Full Name" id="lessorName" value={states.lessorName} onChange={(e) => states.setLessorName(e.target.value)} placeholder="e.g., 'Mr. Prakash Rao'" />
        <FormInput label="Lessor Age" id="lessorAge" value={states.lessorAge} onChange={(e) => states.setLessorAge(e.target.value)} type="number" />
        <FormInput label="Lessor S/o, D/o, W/o" id="lessorRelation" value={states.lessorRelation} onChange={(e) => states.setLessorRelation(e.target.value)} placeholder="e.g., 'Mr. Mohan Rao'" />
        <FormInput label="Lessor Address" id="lessorAddress" value={states.lessorAddress} onChange={(e) => states.setLessorAddress(e.target.value)} placeholder="e.g., '123, Indiranagar, Bangalore'" />
        <FormInput label="Lessor Phone" id="lessorPhone" value={states.lessorPhone} onChange={(e) => states.setLessorPhone(e.target.value)} placeholder="e.g., '98XXXXXX05'" />
      </fieldset>

      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">2. Lessee (Tenant) Details</legend>
        <FormInput label="Lessee Full Name" id="lesseeName" value={states.lesseeName} onChange={(e) => states.setLesseeName(e.target.value)} placeholder="e.g., 'Mr. Vikram Singh'" />
        <FormInput label="Lessee Age" id="lesseeAge" value={states.lesseeAge} onChange={(e) => states.setLesseeAge(e.target.value)} type="number" />
        <FormInput label="Lessee S/o, D/o, W/o" id="lesseeRelation" value={states.lesseeRelation} onChange={(e) => states.setLesseeRelation(e.target.value)} placeholder="e.g., 'Mr. Anand Singh'" />
        <FormInput label="Lessee Address" id="lesseeAddress" value={states.lesseeAddress} onChange={(e) => states.setLesseeAddress(e.target.value)} placeholder="e.g., '456, Koramangala, Bangalore'" />
        <FormInput label="Lessee Phone" id="lesseePhone" value={states.lesseePhone} onChange={(e) => states.setLesseePhone(e.target.value)} placeholder="e.g., '98XXXXXX06'" />
      </fieldset>

      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">3. Lease Property Details</legend>
        
        {/* --- THIS IS THE BUG (FIXED) --- */}
        <FormInput label="Full Property Address" id="leasePropAddress" value={states.propertyAddress} onChange={(e) => states.setPropertyAddress(e.target.value)} placeholder="e.g., 'Ground Floor, 123, Indiranagar, Bangalore'" />
        
        <FormInput label="Property Description" id="leasePropDesc" value={states.propertyDescription} onChange={(e) => states.setPropertyDescription(e.target.value)} placeholder="e.g., 'Commercial office space, 1500 sq.ft.'" />
        <FormInput label="Lease Purpose" id="leasePurpose" value={states.leasePurpose} onChange={(e) => states.setLeasePurpose(e.target.value)} placeholder="e.g., 'For running a software development office'" />
      </fieldset>

      <fieldset className="space-y-4 border-b pb-6">
        <legend className="text-lg font-semibold text-legal-blue-primary">4. Lease Terms & Payment</legend>
        <FormInput label="Lease Start Date" id="leaseStartDate" value={states.leaseStartDate} onChange={(e) => states.setLeaseStartDate(e.target.value)} placeholder="e.g., '01/01/2026'" />
        <FormInput label="Lease Duration (in Years)" id="leaseDuration" value={states.leaseDurationYears} onChange={(e) => states.setLeaseDurationYears(e.target.value)} type="number" />
        <FormInput label="Lease End Date" id="leaseEndDate" value={states.leaseEndDate} onChange={(e) => states.setLeaseEndDate(e.target.value)} placeholder="e.g., '31/12/2028'" />
        <FormInput label="Lease Rent Amount (₹ per month)" id="leaseRent" value={states.leaseRentAmount} onChange={(e) => states.setLeaseRentAmount(e.target.value)} type="number" />
        <FormInput label="Rent (in words)" id="leaseRentWords" value={states.leaseRentWords} onChange={(e) => states.setLeaseRentWords(e.target.value)} placeholder="e.g., 'One Lakh'" />
        <FormInput label="Rent Due Day (of each month)" id="leaseRentDueDay" value={states.rentDueDay} onChange={(e) => states.setRentDueDay(e.target.value)} type="number" />
        <FormInput label="Payment Mode" id="leasePayMode" value={states.paymentMode} onChange={(e) => states.setPaymentMode(e.target.value)} placeholder="e.g., 'Bank Transfer'" />
        
        {/* --- ADDING THE NEW OPTIONAL FIELD --- */}
        <FormInput 
          label="Reference No. (if any)" 
          id="leasePayRef" 
          value={states.paymentReference} 
          onChange={(e) => states.setPaymentReference(e.target.value)} 
          placeholder="e.g., 'Transaction ID / N/A'" 
          required={false} 
        />
        
        <FormInput label="Security Deposit (₹)" id="leaseSecurity" value={states.securityDepositAmount} onChange={(e) => states.setSecurityDepositAmount(e.target.value)} type="number" />
        <FormInput label="Termination Notice Period (in Months)" id="leaseNotice" value={states.terminationNoticePeriod} onChange={(e) => states.setTerminationNoticePeriod(e.target.value)} type="number" />
        <FormInput label="Rent Default Period (in Months)" id="leaseDefault" value={states.defaultMonths} onChange={(e) => states.setDefaultMonths(e.target.value)} type="number" />
        <FormInput label="Registration & Stamp Duty Borne By" id="regBorneBy" value={states.registrationBorneBy} onChange={(e) => states.setRegistrationBorneBy(e.target.value)} placeholder="e.g., 'Lessee' or 'Both Parties Equally'" />
        <FormInput label="Jurisdiction (City)" id="leaseJurisdiction" value={states.jurisdictionCity} onChange={(e) => states.setJurisdictionCity(e.target.value)} placeholder="e.g., 'Bangalore'" />
      </fieldset>
    </div>
  );
};


// --- Main Page Component ---
function DocumentGeneratorPage() {
  
  // --- Global State ---
  const [docType, setDocType] = useState('nda');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadLinks, setDownloadLinks] = useState(null);
  const outputRef = useRef(null);
  const API_BASE_URL = "http://localhost:8000";

  // --- NDA Form State ---
  const [nda_purpose, setNdaPurpose] = useState('');
  const [nda_businessPurpose, setNdaBusinessPurpose] = useState('');
  const [nda_duration, setNdaDuration] = useState('5');
  const [nda_jurisdiction, setNdaJurisdiction] = useState('');
  const [nda_disclosingPartyName, setNdaDisclosingPartyName] = useState('');
  const [nda_disclosingPartyAddress, setNdaDisclosingPartyAddress] = useState('');
  const [nda_receivingParties, setNdaReceivingParties] = useState([]); 

  // --- Affidavit Form State ---
  const [aff_deponentName, setAffDeponentName] = useState('');
  const [aff_deponentAge, setAffDeponentAge] = useState('30');
  const [aff_relationName, setAffRelationName] = useState('');
  const [aff_deponentAddress, setAffDeponentAddress] = useState('');
  const [aff_purpose, setAffPurpose] = useState('');
  const [aff_verificationPlace, setAffVerificationPlace] = useState('');
  const [aff_identifierName, setAffIdentifierName] = useState('');
  const [aff_notaryName, setAffNotaryName] = useState('');
  const [aff_notaryRegNo, setAffNotaryRegNo] = useState('');
  const [aff_notaryAddress, setAffNotaryAddress] = useState('');

  // --- Rent Agreement Form State ---
  const [rent_agreementCity, setRentAgreementCity] = useState('');
  const [rent_landlordName, setRentLandlordName] = useState('');
  const [rent_landlordAge, setRentLandlordAge] = useState('55');
  const [rent_landlordRelation, setRentLandlordRelation] = useState('');
  const [rent_landlordAddress, setRentLandlordAddress] = useState('');
  const [rent_landlordPhone, setRentLandlordPhone] = useState('');
  const [rent_tenantName, setRentTenantName] = useState('');
  const [rent_tenantAge, setRentTenantAge] = useState('28');
  const [rent_tenantRelation, setRentTenantRelation] = useState('');
  const [rent_tenantAddress, setRentTenantAddress] = useState('');
  const [rent_tenantPhone, setRentTenantPhone] = useState('');
  const [rent_propertyAddress, setRentPropertyAddress] = useState('');
  const [rent_propertyDescription, setRentPropertyDescription] = useState('');
  const [rent_startDate, setRentStartDate] = useState('');
  const [rent_durationMonths, setRentDurationMonths] = useState('11');
  const [rent_monthlyRent, setRentMonthlyRent] = useState('50000');
  const [rent_monthlyRentWords, setRentMonthlyRentWords] = useState('');
  const [rent_dueDay, setRentDueDay] = useState('5');
  const [rent_paymentMode, setRentPaymentMode] = useState('');
  const [rent_paymentAddress, setRentPaymentAddress] = useState('');
  const [rent_securityAmount, setRentSecurityAmount] = useState('200000');
  const [rent_usageType, setRentUsageType] = useState('Residential');
  const [rent_noticePeriod, setRentNoticePeriod] = useState('2');
  const [rent_jurisdictionCity, setRentJurisdictionCity] = useState('');
  
  // --- Sale Deed Form State ---
  const [sale_executionCity, setSaleExecutionCity] = useState('');
  const [sale_sellerName, setSaleSellerName] = useState('');
  const [sale_sellerAge, setSaleSellerAge] = useState('50');
  const [sale_sellerRelation, setSaleSellerRelation] = useState('');
  const [sale_sellerAddress, setSaleSellerAddress] = useState('');
  const [sale_sellerPhone, setSaleSellerPhone] = useState('');
  const [sale_buyerName, setSaleBuyerName] = useState('');
  const [sale_buyerAge, setSaleBuyerAge] = useState('40');
  const [sale_buyerRelation, setSaleBuyerRelation] = useState('');
  const [sale_buyerAddress, setSaleBuyerAddress] = useState('');
  const [sale_buyerPhone, setSaleBuyerPhone] = useState('');
  const [sale_propertyAddress, setSalePropertyAddress] = useState('');
  const [sale_ownershipDetails, setSaleOwnershipDetails] = useState('');
  const [sale_saleAmount, setSaleSaleAmount] = useState('10000000');
  const [sale_saleAmountWords, setSaleSaleAmountWords] = useState('');
  const [sale_paymentMode, setSalePaymentMode] = useState('');
  const [sale_paymentReference, setSalePaymentReference] = useState('');
  const [sale_paymentDate, setSalePaymentDate] = useState('');
  const [sale_paymentAmount, setSalePaymentAmount] = useState('10000000');
  const [sale_propertyType, setSalePropertyType] = useState('');
  const [sale_boundaryEast, setSaleBoundaryEast] = useState('');
  const [sale_boundaryWest, setSaleBoundaryWest] = useState('');
  const [sale_boundaryNorth, setSaleBoundaryNorth] = useState('');
  const [sale_boundarySouth, setSaleBoundarySouth] = useState('');
  const [sale_propertyArea, setSalePropertyArea] = useState('');
  const [sale_jurisdictionCity, setSaleJurisdictionCity] = useState('');
  const [sale_propertyDescription, setSalePropertyDescription] = useState('');
  const [sale_surveyNumber, setSaleSurveyNumber] = useState('');

  // --- LEASE DEED Form State ---
  const [lease_executionCity, setLeaseExecutionCity] = useState('');
  const [lease_lessorName, setLeaseLessorName] = useState('');
  const [lease_lessorAge, setLeaseLessorAge] = useState('60');
  const [lease_lessorRelation, setLeaseLessorRelation] = useState('');
  const [lease_lessorAddress, setLeaseLessorAddress] = useState('');
  const [lease_lessorPhone, setLeaseLessorPhone] = useState('');
  const [lease_lesseeName, setLeaseLesseeName] = useState('');
  const [lease_lesseeAge, setLeaseLesseeAge] = useState('35');
  const [lease_lesseeRelation, setLeaseLesseeRelation] = useState('');
  const [lease_lesseeAddress, setLeaseLesseeAddress] = useState('');
  const [lease_lesseePhone, setLeaseLesseePhone] = useState('');
  const [lease_propertyAddress, setLeasePropertyAddress] = useState('');
  const [lease_propertyDescription, setLeasePropertyDescription] = useState('');
  const [lease_leasePurpose, setLeaseLeasePurpose] = useState('Commercial');
  const [lease_leaseStartDate, setLeaseLeaseStartDate] = useState('');
  const [lease_leaseDurationYears, setLeaseLeaseDurationYears] = useState('3');
  const [lease_leaseEndDate, setLeaseLeaseEndDate] = useState('');
  const [lease_leaseRentAmount, setLeaseLeaseRentAmount] = useState('100000');
  const [lease_leaseRentWords, setLeaseLeaseRentWords] = useState('');
  const [lease_rentDueDay, setLeaseRentDueDay] = useState('5');
  const [lease_paymentMode, setLeasePaymentMode] = useState('Bank Transfer');
  const [lease_paymentReference, setLeasePaymentReference] = useState(''); // <-- ADDED STATE
  const [lease_securityDepositAmount, setLeaseSecurityDepositAmount] = useState('600000');
  const [lease_terminationNoticePeriod, setLeaseTerminationNoticePeriod] = useState('3');
  const [lease_defaultMonths, setLeaseDefaultMonths] = useState('2');
  const [lease_registrationBorneBy, setLeaseRegistrationBorneBy] = useState('');
  const [lease_jurisdictionCity, setLeaseJurisdictionCity] = useState('');


  // --- Form Submit Function ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setDownloadLinks(null);
    outputRef.current?.scrollIntoView({ behavior: 'smooth' });

    let requestBody;
    let endpoint = ''; 

    if (docType === 'nda') {
      if (nda_receivingParties.length === 0) {
        setError("You must add at least one Receiving Party for an NDA.");
        setIsLoading(false);
        return;
      }
      endpoint = `${API_BASE_URL}/api/v1/document/generate-nda`; 
      requestBody = {
        purpose_of_disclosure: nda_purpose,
        business_purpose: nda_businessPurpose,
        duration_years: parseInt(nda_duration, 10),
        jurisdiction_city: nda_jurisdiction,
        disclosing_party: {
          name: nda_disclosingPartyName,
          address: nda_disclosingPartyAddress
        },
        receiving_parties: nda_receivingParties
      };
    } else if (docType === 'affidavit') {
      endpoint = `${API_BASE_URL}/api/v1/document/generate-affidavit`; 
      requestBody = {
        deponent_full_name: aff_deponentName,
        deponent_age: parseInt(aff_deponentAge, 10), 
        relation_name: aff_relationName,
        deponent_address: aff_deponentAddress,
        purpose_of_affidavit: aff_purpose,
        verification_place: aff_verificationPlace,
        identifier_name: aff_identifierName,
        notary_name: aff_notaryName,
        notary_reg_no: aff_notaryRegNo,
        notary_office_address: aff_notaryAddress
      };
    } else if (docType === 'rent') {
      endpoint = `${API_BASE_URL}/api/v1/document/generate-rent-agreement`;
      requestBody = {
        agreement_city: rent_agreementCity,
        landlord_full_name: rent_landlordName,
        landlord_age: parseInt(rent_landlordAge, 10),
        landlord_relation_name: rent_landlordRelation,
        landlord_address: rent_landlordAddress,
        landlord_phone: rent_landlordPhone,
        tenant_full_name: rent_tenantName,
        tenant_age: parseInt(rent_tenantAge, 10),
        tenant_relation_name: rent_tenantRelation,
        tenant_address: rent_tenantAddress,
        tenant_phone: rent_tenantPhone,
        property_address: rent_propertyAddress,
        property_description: rent_propertyDescription,
        start_date: rent_startDate,
        duration_months: parseInt(rent_durationMonths, 10),
        monthly_rent: parseInt(rent_monthlyRent, 10),
        monthly_rent_words: rent_monthlyRentWords,
        due_day: parseInt(rent_dueDay, 10),
        payment_mode: rent_paymentMode,
        payment_address: rent_paymentAddress,
        security_amount: parseInt(rent_securityAmount, 10),
        usage_type: rent_usageType,
        notice_period: parseInt(rent_noticePeriod, 10),
        jurisdiction_city: rent_jurisdictionCity
      };
    } else if (docType === 'sale_deed') {
      endpoint = `${API_BASE_URL}/api/v1/document/generate-sale-deed`; 
      requestBody = {
        execution_city: sale_executionCity,
        seller_full_name: sale_sellerName,
        seller_age: parseInt(sale_sellerAge, 10),
        seller_relation_name: sale_sellerRelation,
        seller_address: sale_sellerAddress,
        seller_phone: sale_sellerPhone,
        buyer_full_name: sale_buyerName,
        buyer_age: parseInt(sale_buyerAge, 10),
        buyer_relation_name: sale_buyerRelation,
        buyer_address: sale_buyerAddress,
        buyer_phone: sale_buyerPhone,
        property_address: sale_propertyAddress,
        ownership_details: sale_ownershipDetails,
        sale_amount: parseInt(sale_saleAmount, 10),
        sale_amount_words: sale_saleAmountWords,
        payment_mode: sale_paymentMode,
        payment_reference: sale_paymentReference,
        payment_date: sale_paymentDate,
        payment_amount: parseInt(sale_paymentAmount, 10),
        property_type: sale_propertyType,
        boundary_east: sale_boundaryEast,
        boundary_west: sale_boundaryWest,
        boundary_north: sale_boundaryNorth,
        boundary_south: sale_boundarySouth,
        property_area: sale_propertyArea,
        jurisdiction_city: sale_jurisdictionCity,
        property_description: sale_propertyDescription,
        survey_number: sale_surveyNumber
      };
    } else if (docType === 'lease_deed') {
      endpoint = `${API_BASE_URL}/api/v1/document/generate-lease-deed`;
      requestBody = {
        execution_city: lease_executionCity,
        lessor_full_name: lease_lessorName,
        lessor_age: parseInt(lease_lessorAge, 10),
        lessor_relation_name: lease_lessorRelation,
        lessor_address: lease_lessorAddress,
        lessor_phone: lease_lessorPhone,
        lessee_full_name: lease_lesseeName,
        lessee_age: parseInt(lease_lesseeAge, 10),
        lessee_relation_name: lease_lesseeRelation,
        lessee_address: lease_lesseeAddress,
        lessee_phone: lease_lesseePhone,
        property_address: lease_propertyAddress,
        property_description: lease_propertyDescription,
        lease_purpose: lease_leasePurpose,
        lease_start_date: lease_leaseStartDate,
        lease_duration_years: parseInt(lease_leaseDurationYears, 10),
        lease_end_date: lease_leaseEndDate,
        lease_rent_amount: parseInt(lease_leaseRentAmount, 10),
        lease_rent_words: lease_leaseRentWords,
        rent_due_day: parseInt(lease_rentDueDay, 10),
        payment_mode: lease_paymentMode,
        payment_reference: lease_paymentReference, // <-- ADDED FIELD
        security_deposit_amount: parseInt(lease_securityDepositAmount, 10),
        termination_notice_period: parseInt(lease_terminationNoticePeriod, 10),
        default_months: parseInt(lease_defaultMonths, 10),
        registration_borne_by: lease_registrationBorneBy,
        jurisdiction_city: lease_jurisdictionCity,
      };
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
          Legal Document Generator
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* --- Document Type Selector --- */}
          <div>
            <label htmlFor="docType" className="block text-sm font-semibold text-legal-text-primary">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              id="docType"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white text-gray-800 appearance-none px-4 py-3 shadow-sm focus:border-legal-blue-primary focus:ring-2 focus:ring-legal-blue-primary/50"
              style={{
                backgroundColor: "white",
                color: "#1f2937",
                WebkitAppearance: "none",
                MozAppearance: "none",
                appearance: "none",
              }}
            >
              <option value="nda">Non-Disclosure Agreement (NDA)</option>
              <option value="affidavit">General Affidavit</option>
              <option value="rent">Rent Agreement</option>
              <option value="sale_deed">Sale Deed Agreement</option>
              <option value="lease_deed">Lease Deed Agreement</option>
            </select>
          </div>

          {/* --- Conditional Form Rendering --- */}
          {docType === 'nda' && (
            <NdaForm 
              states={{
                purpose: nda_purpose, setPurpose: setNdaPurpose,
                businessPurpose: nda_businessPurpose, setBusinessPurpose: setNdaBusinessPurpose,
                duration: nda_duration, setDuration: setNdaDuration,
                jurisdiction: nda_jurisdiction, setJurisdiction: setNdaJurisdiction,
                disclosingPartyName: nda_disclosingPartyName, setDisclosingPartyName: setNdaDisclosingPartyName,
                disclosingPartyAddress: nda_disclosingPartyAddress, setDisclosingPartyAddress: setNdaDisclosingPartyAddress,
                receivingParties: nda_receivingParties, setReceivingParties: setNdaReceivingParties,
              }}
            />
          )}

          {docType === 'affidavit' && (
            <AffidavitForm 
              states={{
                deponentName: aff_deponentName, setDeponentName: setAffDeponentName,
                deponentAge: aff_deponentAge, setDeponentAge: setAffDeponentAge,
                relationName: aff_relationName, setRelationName: setAffRelationName,
                deponentAddress: aff_deponentAddress, setDeponentAddress: setAffDeponentAddress,
                purpose: aff_purpose, setPurpose: setAffPurpose,
                verificationPlace: aff_verificationPlace, setVerificationPlace: setAffVerificationPlace,
                identifierName: aff_identifierName, setIdentifierName: setAffIdentifierName,
                notaryName: aff_notaryName, setNotaryName: setAffNotaryName,
                notaryRegNo: aff_notaryRegNo, setNotaryRegNo: setAffNotaryRegNo,
                notaryAddress: aff_notaryAddress, setNotaryAddress: setAffNotaryAddress,
              }}
            />
          )}

          {docType === 'rent' && (
            <RentAgreementForm
              states={{
                agreementCity: rent_agreementCity, setAgreementCity: setRentAgreementCity,
                landlordName: rent_landlordName, setLandlordName: setRentLandlordName,
                landlordAge: rent_landlordAge, setLandlordAge: setRentLandlordAge,
                landlordRelation: rent_landlordRelation, setLandlordRelation: setRentLandlordRelation,
                landlordAddress: rent_landlordAddress, setLandlordAddress: setRentLandlordAddress,
                landlordPhone: rent_landlordPhone, setLandlordPhone: setRentLandlordPhone,
                tenantName: rent_tenantName, setTenantName: setRentTenantName,
                tenantAge: rent_tenantAge, setTenantAge: setRentTenantAge,
                tenantRelation: rent_tenantRelation, setTenantRelation: setRentTenantRelation,
                tenantAddress: rent_tenantAddress, setTenantAddress: setRentTenantAddress,
                tenantPhone: rent_tenantPhone, setTenantPhone: setRentTenantPhone,
                propertyAddress: rent_propertyAddress, setPropertyAddress: setRentPropertyAddress,
                propertyDescription: rent_propertyDescription, setPropertyDescription: setRentPropertyDescription,
                startDate: rent_startDate, setStartDate: setRentStartDate,
                durationMonths: rent_durationMonths, setDurationMonths: setRentDurationMonths,
                monthlyRent: rent_monthlyRent, setMonthlyRent: setRentMonthlyRent,
                monthlyRentWords: rent_monthlyRentWords, setMonthlyRentWords: setRentMonthlyRentWords,
                dueDay: rent_dueDay, setDueDay: setRentDueDay,
                paymentMode: rent_paymentMode, setPaymentMode: setRentPaymentMode,
                paymentAddress: rent_paymentAddress, setPaymentAddress: setRentPaymentAddress,
                securityAmount: rent_securityAmount, setSecurityAmount: setRentSecurityAmount,
                usageType: rent_usageType, setUsageType: setRentUsageType,
                noticePeriod: rent_noticePeriod, setNoticePeriod: setRentNoticePeriod,
                jurisdictionCity: rent_jurisdictionCity, setJurisdictionCity: setRentJurisdictionCity,
              }}
            />
          )}
          
          {docType === 'sale_deed' && (
            <SaleDeedForm
              states={{
                executionCity: sale_executionCity, setExecutionCity: setSaleExecutionCity,
                sellerName: sale_sellerName, setSellerName: setSaleSellerName,
                sellerAge: sale_sellerAge, setSellerAge: setSaleSellerAge,
                sellerRelation: sale_sellerRelation, setSellerRelation: setSaleSellerRelation,
                sellerAddress: sale_sellerAddress, setSellerAddress: setSaleSellerAddress,
                sellerPhone: sale_sellerPhone, setSellerPhone: setSaleSellerPhone,
                buyerName: sale_buyerName, setBuyerName: setSaleBuyerName,
                buyerAge: sale_buyerAge, setBuyerAge: setSaleBuyerAge,
                buyerRelation: sale_buyerRelation, setBuyerRelation: setSaleBuyerRelation,
                buyerAddress: sale_buyerAddress, setBuyerAddress: setSaleBuyerAddress,
                buyerPhone: sale_buyerPhone, setBuyerPhone: setSaleBuyerPhone,
                propertyAddress: sale_propertyAddress, setPropertyAddress: setSalePropertyAddress,
                ownershipDetails: sale_ownershipDetails, setOwnershipDetails: setSaleOwnershipDetails,
                saleAmount: sale_saleAmount, setSaleAmount: setSaleSaleAmount,
                saleAmountWords: sale_saleAmountWords, setSaleAmountWords: setSaleSaleAmountWords,
                paymentMode: sale_paymentMode, setPaymentMode: setSalePaymentMode,
                paymentReference: sale_paymentReference, setPaymentReference: setSalePaymentReference,
                paymentDate: sale_paymentDate, setPaymentDate: setSalePaymentDate,
                paymentAmount: sale_paymentAmount, setPaymentAmount: setSalePaymentAmount,
                propertyType: sale_propertyType, setPropertyType: setSalePropertyType,
                boundaryEast: sale_boundaryEast, setBoundaryEast: setSaleBoundaryEast,
                boundaryWest: sale_boundaryWest, setBoundaryWest: setSaleBoundaryWest,
                boundaryNorth: sale_boundaryNorth, setBoundaryNorth: setSaleBoundaryNorth,
                boundarySouth: sale_boundarySouth, setBoundarySouth: setSaleBoundarySouth,
                propertyArea: sale_propertyArea, setPropertyArea: setSalePropertyArea,
                jurisdictionCity: sale_jurisdictionCity, setJurisdictionCity: setSaleJurisdictionCity,
                propertyDescription: sale_propertyDescription, setPropertyDescription: setSalePropertyDescription,
                surveyNumber: sale_surveyNumber, setSurveyNumber: setSaleSurveyNumber,
              }}
            />
          )}
          
          {docType === 'lease_deed' && (
            <LeaseDeedForm
              states={{
                executionCity: lease_executionCity, setExecutionCity: setLeaseExecutionCity,
                lessorName: lease_lessorName, setLessorName: setLeaseLessorName,
                lessorAge: lease_lessorAge, setLessorAge: setLeaseLessorAge,
                lessorRelation: lease_lessorRelation, setLessorRelation: setLeaseLessorRelation,
                lessorAddress: lease_lessorAddress, setLessorAddress: setLeaseLessorAddress,
                lessorPhone: lease_lessorPhone, setLessorPhone: setLeaseLessorPhone,
                lesseeName: lease_lesseeName, setLesseeName: setLeaseLesseeName,
                lesseeAge: lease_lesseeAge, setLesseeAge: setLeaseLesseeAge,
                lesseeRelation: lease_lesseeRelation, setLesseeRelation: setLeaseLesseeRelation,
                lesseeAddress: lease_lesseeAddress, setLesseeAddress: setLeaseLesseeAddress,
                lesseePhone: lease_lesseePhone, setLesseePhone: setLeaseLesseePhone,
                propertyAddress: lease_propertyAddress, setPropertyAddress: setLeasePropertyAddress,
                propertyDescription: lease_propertyDescription, setPropertyDescription: setLeasePropertyDescription,
                leasePurpose: lease_leasePurpose, setLeasePurpose: setLeaseLeasePurpose,
                leaseStartDate: lease_leaseStartDate, setLeaseStartDate: setLeaseLeaseStartDate,
                leaseDurationYears: lease_leaseDurationYears, setLeaseDurationYears: setLeaseLeaseDurationYears,
                leaseEndDate: lease_leaseEndDate, setLeaseEndDate: setLeaseLeaseEndDate,
                leaseRentAmount: lease_leaseRentAmount, setLeaseRentAmount: setLeaseLeaseRentAmount,
                leaseRentWords: lease_leaseRentWords, setLeaseRentWords: setLeaseLeaseRentWords,
                rentDueDay: lease_rentDueDay, setRentDueDay: setLeaseRentDueDay,
                paymentMode: lease_paymentMode, setPaymentMode: setLeasePaymentMode,
                paymentReference: lease_paymentReference, setPaymentReference: setLeasePaymentReference,
                securityDepositAmount: lease_securityDepositAmount, setSecurityDepositAmount: setLeaseSecurityDepositAmount,
                terminationNoticePeriod: lease_terminationNoticePeriod, setTerminationNoticePeriod: setLeaseTerminationNoticePeriod,
                defaultMonths: lease_defaultMonths, setDefaultMonths: setLeaseDefaultMonths,
                registrationBorneBy: lease_registrationBorneBy, setRegistrationBorneBy: setLeaseRegistrationBorneBy,
                jurisdictionCity: lease_jurisdictionCity, setJurisdictionCity: setLeaseJurisdictionCity,
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
            {isLoading ? 'Generating Document...' : 'Generate Document'}
          </button>
        </form>
      </div>

      {/* --- 2. Output Section (Unchanged) --- */}
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
            <p className="mt-4 text-lg font-medium">Generating your documents...</p>
          </div>
        )}

        {downloadLinks && (
          <div className="space-y-4">
            <p className="text-green-700 font-semibold">
              Success! Your documents are ready to download.
            </p>
            {/* Show PDF link only if it's not null */}
            {downloadLinks.pdf_url && (
              <a
                href={`${API_BASE_URL}${downloadLinks.pdf_url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex justify-between items-center gap-3 rounded-lg border-2 border-legal-blue-primary px-6 py-4 text-legal-blue-primary font-semibold hover:bg-legal-blue-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3"><File className="text-red-600" />Download PDF</div>
                <FileDown />
              </a>
            )}
            <a
              href={`${API_BASE_URL}${downloadLinks.docx_url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex justify-between items-center gap-3 rounded-lg border-2 border-gray-400 px-6 py-4 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3"><File className="text-blue-600" />Download .DOCX</div>
              <FileDown />
            </a>
          </div>
        )}
        
        {!isLoading && !error && !downloadLinks && (
           <div className="flex flex-col items-center justify-center h-48 text-gray-400 border-2 border-dashed rounded-lg">
            <p className="text-lg">Select a document type and fill out the form.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentGeneratorPage;