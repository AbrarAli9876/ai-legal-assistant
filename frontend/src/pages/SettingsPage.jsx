import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, Save, FileText, Shield, HelpCircle, AlertCircle, Camera, Phone, Trash2 } from 'lucide-react';

// --- Reusable Component for Sections ---
const SettingsSection = ({ title, description, children, icon: Icon }) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
    <div className="p-6 border-b">
      <h3 className="flex items-center gap-2 text-xl font-semibold text-legal-text-primary">
        {Icon && <Icon size={20} />}
        {title}
      </h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// --- Reusable Input Component ---
const InputField = ({ label, id, name, type = "text", value, onChange, readOnly = false, disabled = false, placeholder = "" }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type} id={id} name={name} value={value} onChange={onChange} readOnly={readOnly} disabled={disabled} placeholder={placeholder}
      className={`mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'focus:border-legal-blue-primary focus:ring-2 focus:ring-legal-blue-primary/50'}`}
    />
  </div>
);

function SettingsPage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'prefer_not_to_say',
    profile_pic: '' 
  });
  
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setProfile(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone_number || userData.phone || '',
          gender: userData.gender || 'prefer_not_to_say',
          profile_pic: userData.profile_pic || ''
        }));
        
        if (userData.profile_pic) {
          setProfilePicPreview(userData.profile_pic);
        }
      } catch (e) { console.error("Error parsing user data", e); }
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const localPreviewUrl = URL.createObjectURL(file);
      setProfilePicPreview(localPreviewUrl);

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, profile_pic: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePic = () => {
    setProfile(prev => ({ ...prev, profile_pic: null })); 
    setProfilePicPreview(null); 
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const handleProfileChange = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: profile.name,
            email: profile.email, 
            gender: profile.gender,
            phone_number: profile.phone,
            profile_pic: profile.profile_pic 
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to update profile");

      const currentUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...currentUser, ...data };
      
      if(data.phone_number) updatedUser.phone_number = data.phone_number; 
      updatedUser.profile_pic = data.profile_pic; 

      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert(`Profile updated successfully!`);
    } catch (error) {
      console.error("Update error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return alert("New password and confirmation do not match!");
    if (!passwords.current) return alert("Please enter your current password.");
    try {
      const response = await fetch('http://localhost:8000/api/auth/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, current_password: passwords.current, new_password: passwords.new }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to update password");
      alert("Password updated successfully!");
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) { alert(`Error: ${error.message}`); }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h2 className="text-3xl font-semibold text-legal-text-primary">Account Settings</h2>

      <SettingsSection title="Profile Information" description="Update your account's profile information." icon={User}>
        <form onSubmit={handleProfileSubmit}>
          <div className="space-y-6">
            
            {/* --- Profile Picture Section --- */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {profilePicPreview ? (
                  <img src={profilePicPreview} alt="Profile" className="h-24 w-24 rounded-full border-4 border-legal-blue-primary object-cover shadow-sm"/>
                ) : (
                  <div className="h-24 w-24 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 shadow-sm"><User size={48} /></div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden"/>
              </div>
              
              <div className="flex gap-3">
                <button type="button" onClick={() => fileInputRef.current.click()} className="inline-flex items-center gap-2 justify-center rounded-lg px-4 py-2 text-sm font-semibold text-legal-blue-primary border border-legal-blue-primary hover:bg-blue-50 transition-colors">
                  <Camera size={16} />
                  {profilePicPreview ? "Change Picture" : "Upload Picture"}
                </button>
                
                {profilePicPreview && (
                  <button type="button" onClick={handleRemovePic} className="inline-flex items-center gap-2 justify-center rounded-lg px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors">
                    <Trash2 size={16} />
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Full Name" id="name" name="name" value={profile.name} onChange={handleProfileChange} placeholder="Your Name"/>
              
              {/* Email - Locked */}
              <InputField label="Email Address" id="email" name="email" type="email" value={profile.email} readOnly disabled placeholder="email@example.com"/>
              
              {/* Gender - Locked (CHANGED HERE) */}
              <InputField label="Gender" id="gender" name="gender" value={profile.gender} readOnly disabled />

              {/* Phone - Editable */}
              <InputField label="Phone Number" id="phone" name="phone" type="tel" value={profile.phone} onChange={handleProfileChange} placeholder="+91 98765 43210"/>
            </div>
          </div>
          <div className="text-right mt-6 border-t pt-6">
            <button type="submit" className="inline-flex items-center gap-2 justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white bg-legal-blue-primary hover:bg-legal-blue-highlight shadow-md transition-all"><Save size={16} />Save Changes</button>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection title="Password & Security" description="Manage your password and login security." icon={Lock}>
        <form onSubmit={handlePasswordSubmit}>
          <div className="space-y-4">
             <InputField label="Current Password" id="current" name="current" type="password" value={passwords.current} onChange={handlePasswordChange} placeholder="••••••••"/>
            <InputField label="New Password" id="new" name="new" type="password" value={passwords.new} onChange={handlePasswordChange} placeholder="••••••••"/>
            <InputField label="Confirm New Password" id="confirm" name="confirm" type="password" value={passwords.confirm} onChange={handlePasswordChange} placeholder="••••••••"/>
          </div>
          <div className="text-right mt-6 border-t pt-6">
            <button type="submit" className="inline-flex items-center gap-2 justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white bg-legal-blue-primary hover:bg-legal-blue-highlight shadow-md transition-all"><Lock size={16} />Update Password</button>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection title="Legal & Support" description="Find our policies and get help." icon={HelpCircle}>
        <div className="divide-y divide-gray-200">
          <Link to="/terms-and-conditions" className="flex items-center justify-between py-4 text-sm font-medium text-legal-text-primary hover:text-legal-blue-primary"><span><FileText size={16} className="inline mr-2" />Terms & Conditions</span><span>&rarr;</span></Link>
          <Link to="/privacy-policy" className="flex items-center justify-between py-4 text-sm font-medium text-legal-text-primary hover:text-legal-blue-primary"><span><Shield size={16} className="inline mr-2" />Privacy Policy</span><span>&rarr;</span></Link>
          <Link to="/customer-support" className="flex items-center justify-between py-4 text-sm font-medium text-legal-text-primary hover:text-legal-blue-primary"><span><HelpCircle size={16} className="inline mr-2" />Customer Support</span><span>&rarr;</span></Link>
          <Link to="/report-issue" className="flex items-center justify-between py-4 text-sm font-medium text-red-600 hover:text-red-700"><span><AlertCircle size={16} className="inline mr-2" />Report an Issue</span><span>&rarr;</span></Link>
        </div>
      </SettingsSection>
    </div>
  );
}

export default SettingsPage;