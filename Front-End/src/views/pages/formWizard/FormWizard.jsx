import React, { useState, useCallback } from 'react';
import {
  CCard,
  CCardBody,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CProgress,
  CButton,
  CRow,
  CCol,
  CAlert
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilLocationPin, cilBriefcase, cilSettings, cilClipboard } from '@coreui/icons';
import notify from 'devextreme/ui/notify';
import {
  TextBox,
  DateBox,
  SelectBox,
  CheckBox,
  RadioGroup
} from 'devextreme-react';
import 'devextreme/dist/css/dx.light.css';
import './FormWizard.css';

const FormWizard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [completedTabs, setCompletedTabs] = useState([]);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
    gender: '',
    
    // Address Information
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    addressType: '',
    
    // Professional Information
    company: '',
    position: '',
    department: '',
    startDate: null,
    employmentType: '',
    salary: '',
    
    // Preferences & Agreements
    newsletter: false,
    notifications: false,
    dataSharing: false,
    preferredContact: '',
    termsAgreed: false,
    privacyAgreed: false
  });

  const [validationErrors, setValidationErrors] = useState({});

  const tabs = [
    { id: 0, title: 'Personal Info', icon: cilUser },
    { id: 1, title: 'Address', icon: cilLocationPin },
    { id: 2, title: 'Professional', icon: cilBriefcase },
    { id: 3, title: 'Preferences', icon: cilSettings },
    { id: 4, title: 'Preview', icon: cilClipboard }
  ];

  const genderOptions = [
    { value: 'male', text: 'Male' },
    { value: 'female', text: 'Female' },
    { value: 'other', text: 'Other' },
    { value: 'prefer-not-to-say', text: 'Prefer not to say' }
  ];

  const stateOptions = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
    'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia'
  ];

  const countryOptions = [
    'United States', 'Canada', 'United Kingdom', 'Australia',
    'Germany', 'France', 'Japan', 'India'
  ];

  const addressTypeOptions = [
    { value: 'home', text: 'Home' },
    { value: 'work', text: 'Work' },
    { value: 'other', text: 'Other' }
  ];

  const departmentOptions = [
    'Engineering', 'Sales', 'Marketing', 'Human Resources',
    'Finance', 'Operations', 'Customer Service', 'IT'
  ];

  const employmentTypeOptions = [
    { value: 'full-time', text: 'Full Time' },
    { value: 'part-time', text: 'Part Time' },
    { value: 'contract', text: 'Contract' },
    { value: 'internship', text: 'Internship' }
  ];

  const contactMethodOptions = [
    { value: 'email', text: 'Email' },
    { value: 'phone', text: 'Phone' },
    { value: 'sms', text: 'SMS' }
  ];

  const validateTab = (tabIndex) => {
    const errors = {};
    
    switch(tabIndex) {
      case 0: // Personal Information
        if (!formData.firstName?.trim()) errors.firstName = 'First name is required';
        if (!formData.lastName?.trim()) errors.lastName = 'Last name is required';
        if (!formData.email?.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Invalid email format';
        }
        if (!formData.phone?.trim()) {
          errors.phone = 'Phone is required';
        } else if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) {
          errors.phone = 'Invalid phone format';
        }
        if (!formData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) errors.gender = 'Gender is required';
        break;
        
      case 1: // Address Information
        if (!formData.street?.trim()) errors.street = 'Street address is required';
        if (!formData.city?.trim()) errors.city = 'City is required';
        if (!formData.state) errors.state = 'State is required';
        if (!formData.zipCode?.trim()) {
          errors.zipCode = 'ZIP code is required';
        } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
          errors.zipCode = 'Invalid ZIP code format';
        }
        if (!formData.country) errors.country = 'Country is required';
        if (!formData.addressType) errors.addressType = 'Address type is required';
        break;
        
      case 2: // Professional Information
        if (!formData.company?.trim()) errors.company = 'Company name is required';
        if (!formData.position?.trim()) errors.position = 'Position is required';
        if (!formData.department) errors.department = 'Department is required';
        if (!formData.startDate) errors.startDate = 'Start date is required';
        if (!formData.employmentType) errors.employmentType = 'Employment type is required';
        if (!formData.salary?.trim()) {
          errors.salary = 'Salary is required';
        } else if (!/^\d+$/.test(formData.salary)) {
          errors.salary = 'Salary must be a number';
        }
        break;
        
      case 3: // Preferences & Agreements
        if (!formData.preferredContact) errors.preferredContact = 'Preferred contact method is required';
        if (!formData.termsAgreed) errors.termsAgreed = 'You must agree to terms and conditions';
        if (!formData.privacyAgreed) errors.privacyAgreed = 'You must agree to privacy policy';
        break;
        
      default:
        break;
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateTab(activeTab)) {
      if (!completedTabs.includes(activeTab)) {
        setCompletedTabs([...completedTabs, activeTab]);
      }
      
      // If moving to preview tab, validate all previous tabs
      if (activeTab + 1 === 4) {
        const allValid = [0, 1, 2, 3].every(tabIndex => validateTab(tabIndex));
        if (!allValid) {
          //alert('Please complete all required fields in all sections before proceeding to preview.');
          notify('Please complete all required fields in all sections before proceeding to preview.', 'warning', 2000);
          return;
        }
      }
      
      setActiveTab(activeTab + 1);
    }
  };

  const handlePrevious = () => {
    setActiveTab(activeTab - 1);
  };

  const handleTabClick = (tabIndex) => {
    // If clicking on Preview tab, validate all sections first
    if (tabIndex === 4) {
      const allValid = [0, 1, 2, 3].every(index => {
        const tempErrors = {};
        // Quick validation check without setting state
        switch(index) {
          case 0:
            if (!formData.firstName?.trim() || !formData.lastName?.trim() || 
                !formData.email?.trim() || !formData.phone?.trim() || 
                !formData.dateOfBirth || !formData.gender) return false;
            break;
          case 1:
            if (!formData.street?.trim() || !formData.city?.trim() || 
                !formData.state || !formData.zipCode?.trim() || 
                !formData.country || !formData.addressType) return false;
            break;
          case 2:
            if (!formData.company?.trim() || !formData.position?.trim() || 
                !formData.department || !formData.startDate || 
                !formData.employmentType || !formData.salary?.trim()) return false;
            break;
          case 3:
            if (!formData.preferredContact || !formData.termsAgreed || 
                !formData.privacyAgreed) return false;
            break;
        }
        return true;
      });
      
      if (!allValid) {
        alert('Please complete all required fields in all sections before viewing the preview.');
        return;
      }
    }
    
    // Allow navigation to completed tabs or the next immediate tab
    if (completedTabs.includes(tabIndex) || tabIndex === 0 || tabIndex === activeTab || tabIndex === 4) {
      setActiveTab(tabIndex);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    // Final validation before submission
    const allValid = [0, 1, 2, 3].every(tabIndex => validateTab(tabIndex));
    
    if (!allValid) {
      alert('Please complete all required fields before submitting the form.');
      return;
    }
    
    console.log('Form submitted:', formData);
    alert('Form submitted successfully!');
    // Here you would typically send the data to your backend
  };

  const getProgressPercentage = () => {
    return ((completedTabs.length) / (tabs.length - 1)) * 100;
  };

  const renderPreviewSection = (title, data) => (
    <div className="preview-section">
      <h5 className="preview-section-title">{title}</h5>
      <div className="preview-content">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="preview-item">
            <span className="preview-label">{formatLabel(key)}:</span>
            <span className="preview-value">{formatValue(value)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const formatLabel = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const formatValue = (value) => {
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    if (value === '' || value === null || value === undefined) {
      return 'Not provided';
    }
    return value;
  };

  return (
    <div className="form-wizard-container">
      <CCard className="wizard-card">
        <CCardBody>
          <div className="wizard-header">
            <h2 className="wizard-title">Registration Form</h2>
            <p className="wizard-subtitle">Complete all required fields to proceed</p>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <CProgress className="wizard-progress">
              <div 
                className="wizard-progress-bar"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </CProgress>
            <div className="progress-text">
              {completedTabs.length} of {tabs.length - 1} sections completed
            </div>
          </div>

          {/* Tabs Navigation */}
          <CNav variant="tabs" className="wizard-nav">
            {tabs.map((tab) => (
              <CNavItem key={tab.id}>
                <CNavLink
                  active={activeTab === tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`wizard-nav-link ${
                    completedTabs.includes(tab.id) ? 'completed' : ''
                  } ${
                    !completedTabs.includes(tab.id) && tab.id !== 0 && tab.id !== activeTab ? 'disabled' : ''
                  }`}
                  disabled={!completedTabs.includes(tab.id) && tab.id !== 0 && tab.id !== activeTab}
                >
                  <span className="tab-icon">
                    <CIcon icon={tab.icon} />
                  </span>
                  <span className="tab-title">{tab.title}</span>
                  {completedTabs.includes(tab.id) && <span className="tab-check">✓</span>}
                </CNavLink>
              </CNavItem>
            ))}
          </CNav>

          {/* Tab Content */}
          <CTabContent className="wizard-content">
            {/* Tab 1: Personal Information */}
            <CTabPane visible={activeTab === 0}>
              <div className="tab-content-inner">
                <h4 className="tab-heading">Personal Information</h4>
                
                <CRow>
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">First Name</label>
                      <TextBox
                        value={formData.firstName}
                        onValueChanged={(e) => handleInputChange('firstName', e.value)}
                        placeholder="Enter your first name"
                        className={validationErrors.firstName ? 'dx-invalid' : ''}
                      />
                      {validationErrors.firstName && (
                        <div className="error-message">{validationErrors.firstName}</div>
                      )}
                    </div>
                  </CCol>
                  
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">Last Name</label>
                      <TextBox
                        value={formData.lastName}
                        onValueChanged={(e) => handleInputChange('lastName', e.value)}
                        placeholder="Enter your last name"
                        className={validationErrors.lastName ? 'dx-invalid' : ''}
                      />
                      {validationErrors.lastName && (
                        <div className="error-message">{validationErrors.lastName}</div>
                      )}
                    </div>
                  </CCol>
                </CRow>

                <CRow>
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">Email Address</label>
                      <TextBox
                        value={formData.email}
                        onValueChanged={(e) => handleInputChange('email', e.value)}
                        placeholder="your.email@example.com"
                        className={validationErrors.email ? 'dx-invalid' : ''}
                        mode="email"
                      />
                      {validationErrors.email && (
                        <div className="error-message">{validationErrors.email}</div>
                      )}
                    </div>
                  </CCol>
                  
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">Phone Number</label>
                      <TextBox
                        value={formData.phone}
                        onValueChanged={(e) => handleInputChange('phone', e.value)}
                        placeholder="+1 (555) 123-4567"
                        className={validationErrors.phone ? 'dx-invalid' : ''}
                        mode="tel"
                      />
                      {validationErrors.phone && (
                        <div className="error-message">{validationErrors.phone}</div>
                      )}
                    </div>
                  </CCol>
                </CRow>

                <CRow>
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">Date of Birth</label>
                      <DateBox
                        value={formData.dateOfBirth}
                        onValueChanged={(e) => handleInputChange('dateOfBirth', e.value)}
                        placeholder="Select date"
                        displayFormat="MM/dd/yyyy"
                        max={new Date()}
                        className={validationErrors.dateOfBirth ? 'dx-invalid' : ''}
                      />
                      {validationErrors.dateOfBirth && (
                        <div className="error-message">{validationErrors.dateOfBirth}</div>
                      )}
                    </div>
                  </CCol>
                  
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">Gender</label>
                      <SelectBox
                        value={formData.gender}
                        onValueChanged={(e) => handleInputChange('gender', e.value)}
                        items={genderOptions}
                        displayExpr="text"
                        valueExpr="value"
                        placeholder="Select gender"
                        className={validationErrors.gender ? 'dx-invalid' : ''}
                      />
                      {validationErrors.gender && (
                        <div className="error-message">{validationErrors.gender}</div>
                      )}
                    </div>
                  </CCol>
                </CRow>
              </div>
            </CTabPane>

            {/* Tab 2: Address Information */}
            <CTabPane visible={activeTab === 1}>
              <div className="tab-content-inner">
                <h4 className="tab-heading">Address Information</h4>
                
                <CRow>
                  <CCol md={12}>
                    <div className="form-group">
                      <label className="form-label required">Street Address</label>
                      <TextBox
                        value={formData.street}
                        onValueChanged={(e) => handleInputChange('street', e.value)}
                        placeholder="123 Main Street, Apt 4B"
                        className={validationErrors.street ? 'dx-invalid' : ''}
                      />
                      {validationErrors.street && (
                        <div className="error-message">{validationErrors.street}</div>
                      )}
                    </div>
                  </CCol>
                </CRow>

                <CRow>
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">City</label>
                      <TextBox
                        value={formData.city}
                        onValueChanged={(e) => handleInputChange('city', e.value)}
                        placeholder="Enter city"
                        className={validationErrors.city ? 'dx-invalid' : ''}
                      />
                      {validationErrors.city && (
                        <div className="error-message">{validationErrors.city}</div>
                      )}
                    </div>
                  </CCol>
                  
                  <CCol md={3}>
                    <div className="form-group">
                      <label className="form-label required">State</label>
                      <SelectBox
                        value={formData.state}
                        onValueChanged={(e) => handleInputChange('state', e.value)}
                        items={stateOptions}
                        placeholder="Select state"
                        searchEnabled={true}
                        className={validationErrors.state ? 'dx-invalid' : ''}
                      />
                      {validationErrors.state && (
                        <div className="error-message">{validationErrors.state}</div>
                      )}
                    </div>
                  </CCol>
                  
                  <CCol md={3}>
                    <div className="form-group">
                      <label className="form-label required">ZIP Code</label>
                      <TextBox
                        value={formData.zipCode}
                        onValueChanged={(e) => handleInputChange('zipCode', e.value)}
                        placeholder="12345"
                        className={validationErrors.zipCode ? 'dx-invalid' : ''}
                      />
                      {validationErrors.zipCode && (
                        <div className="error-message">{validationErrors.zipCode}</div>
                      )}
                    </div>
                  </CCol>
                </CRow>

                <CRow>
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">Country</label>
                      <SelectBox
                        value={formData.country}
                        onValueChanged={(e) => handleInputChange('country', e.value)}
                        items={countryOptions}
                        placeholder="Select country"
                        searchEnabled={true}
                        className={validationErrors.country ? 'dx-invalid' : ''}
                      />
                      {validationErrors.country && (
                        <div className="error-message">{validationErrors.country}</div>
                      )}
                    </div>
                  </CCol>
                  
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">Address Type</label>
                      <RadioGroup
                        value={formData.addressType}
                        onValueChanged={(e) => handleInputChange('addressType', e.value)}
                        items={addressTypeOptions}
                        displayExpr="text"
                        valueExpr="value"
                        layout="horizontal"
                        className={validationErrors.addressType ? 'dx-invalid' : ''}
                      />
                      {validationErrors.addressType && (
                        <div className="error-message">{validationErrors.addressType}</div>
                      )}
                    </div>
                  </CCol>
                </CRow>
              </div>
            </CTabPane>

            {/* Tab 3: Professional Information */}
            <CTabPane visible={activeTab === 2}>
              <div className="tab-content-inner">
                <h4 className="tab-heading">Professional Information</h4>
                
                <CRow>
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">Company Name</label>
                      <TextBox
                        value={formData.company}
                        onValueChanged={(e) => handleInputChange('company', e.value)}
                        placeholder="Enter company name"
                        className={validationErrors.company ? 'dx-invalid' : ''}
                      />
                      {validationErrors.company && (
                        <div className="error-message">{validationErrors.company}</div>
                      )}
                    </div>
                  </CCol>
                  
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">Position/Title</label>
                      <TextBox
                        value={formData.position}
                        onValueChanged={(e) => handleInputChange('position', e.value)}
                        placeholder="Enter your position"
                        className={validationErrors.position ? 'dx-invalid' : ''}
                      />
                      {validationErrors.position && (
                        <div className="error-message">{validationErrors.position}</div>
                      )}
                    </div>
                  </CCol>
                </CRow>

                <CRow>
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">Department</label>
                      <SelectBox
                        value={formData.department}
                        onValueChanged={(e) => handleInputChange('department', e.value)}
                        items={departmentOptions}
                        placeholder="Select department"
                        searchEnabled={true}
                        className={validationErrors.department ? 'dx-invalid' : ''}
                      />
                      {validationErrors.department && (
                        <div className="error-message">{validationErrors.department}</div>
                      )}
                    </div>
                  </CCol>
                  
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">Start Date</label>
                      <DateBox
                        value={formData.startDate}
                        onValueChanged={(e) => handleInputChange('startDate', e.value)}
                        placeholder="Select start date"
                        displayFormat="MM/dd/yyyy"
                        className={validationErrors.startDate ? 'dx-invalid' : ''}
                      />
                      {validationErrors.startDate && (
                        <div className="error-message">{validationErrors.startDate}</div>
                      )}
                    </div>
                  </CCol>
                </CRow>

                <CRow>
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">Employment Type</label>
                      <RadioGroup
                        value={formData.employmentType}
                        onValueChanged={(e) => handleInputChange('employmentType', e.value)}
                        items={employmentTypeOptions}
                        displayExpr="text"
                        valueExpr="value"
                        layout="horizontal"
                        className={validationErrors.employmentType ? 'dx-invalid' : ''}
                      />
                      {validationErrors.employmentType && (
                        <div className="error-message">{validationErrors.employmentType}</div>
                      )}
                    </div>
                  </CCol>
                  
                  <CCol md={6}>
                    <div className="form-group">
                      <label className="form-label required">Annual Salary (USD)</label>
                      <TextBox
                        value={formData.salary}
                        onValueChanged={(e) => handleInputChange('salary', e.value)}
                        placeholder="50000"
                        mode="number"
                        className={validationErrors.salary ? 'dx-invalid' : ''}
                      />
                      {validationErrors.salary && (
                        <div className="error-message">{validationErrors.salary}</div>
                      )}
                    </div>
                  </CCol>
                </CRow>
              </div>
            </CTabPane>

            {/* Tab 4: Preferences & Agreements */}
            <CTabPane visible={activeTab === 3}>
              <div className="tab-content-inner">
                <h4 className="tab-heading">Preferences & Agreements</h4>
                
                <div className="form-section">
                  <h5 className="section-title">Communication Preferences</h5>
                  
                  <div className="form-group">
                    <CheckBox
                      value={formData.newsletter}
                      onValueChanged={(e) => handleInputChange('newsletter', e.value)}
                      text="Subscribe to newsletter"
                    />
                  </div>
                  
                  <div className="form-group">
                    <CheckBox
                      value={formData.notifications}
                      onValueChanged={(e) => handleInputChange('notifications', e.value)}
                      text="Receive email notifications"
                    />
                  </div>
                  
                  <div className="form-group">
                    <CheckBox
                      value={formData.dataSharing}
                      onValueChanged={(e) => handleInputChange('dataSharing', e.value)}
                      text="Allow data sharing with partners"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label required">Preferred Contact Method</label>
                    <RadioGroup
                      value={formData.preferredContact}
                      onValueChanged={(e) => handleInputChange('preferredContact', e.value)}
                      items={contactMethodOptions}
                      displayExpr="text"
                      valueExpr="value"
                      layout="horizontal"
                      className={validationErrors.preferredContact ? 'dx-invalid' : ''}
                    />
                    {validationErrors.preferredContact && (
                      <div className="error-message">{validationErrors.preferredContact}</div>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h5 className="section-title">Legal Agreements</h5>
                  
                  <div className="form-group checkbox-group">
                    <CheckBox
                      value={formData.termsAgreed}
                      onValueChanged={(e) => handleInputChange('termsAgreed', e.value)}
                      className={validationErrors.termsAgreed ? 'dx-invalid' : ''}
                    />
                    <label className="checkbox-label required">
                      I agree to the <a href="#" className="link">Terms and Conditions</a>
                    </label>
                    {validationErrors.termsAgreed && (
                      <div className="error-message">{validationErrors.termsAgreed}</div>
                    )}
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <CheckBox
                      value={formData.privacyAgreed}
                      onValueChanged={(e) => handleInputChange('privacyAgreed', e.value)}
                      className={validationErrors.privacyAgreed ? 'dx-invalid' : ''}
                    />
                    <label className="checkbox-label required">
                      I agree to the <a href="#" className="link">Privacy Policy</a>
                    </label>
                    {validationErrors.privacyAgreed && (
                      <div className="error-message">{validationErrors.privacyAgreed}</div>
                    )}
                  </div>
                </div>
              </div>
            </CTabPane>

            {/* Tab 5: Preview */}
            <CTabPane visible={activeTab === 4}>
              <div className="tab-content-inner preview-tab">
                <h4 className="tab-heading">Review Your Information</h4>
                <p className="preview-description">
                  Please review all the information below. Click on any section title to edit.
                </p>

                {/* Validation status alert */}
                {(() => {
                  const hasErrors = [0, 1, 2, 3].some(index => {
                    switch(index) {
                      case 0:
                        return !formData.firstName?.trim() || !formData.lastName?.trim() || 
                               !formData.email?.trim() || !formData.phone?.trim() || 
                               !formData.dateOfBirth || !formData.gender;
                      case 1:
                        return !formData.street?.trim() || !formData.city?.trim() || 
                               !formData.state || !formData.zipCode?.trim() || 
                               !formData.country || !formData.addressType;
                      case 2:
                        return !formData.company?.trim() || !formData.position?.trim() || 
                               !formData.department || !formData.startDate || 
                               !formData.employmentType || !formData.salary?.trim();
                      case 3:
                        return !formData.preferredContact || !formData.termsAgreed || 
                               !formData.privacyAgreed;
                      default:
                        return false;
                    }
                  });

                  if (hasErrors) {
                    return (
                      <CAlert color="warning" className="validation-alert">
                        <strong>⚠️ Incomplete Information:</strong> Some required fields are missing. 
                        Please click on the sections below to complete all required fields before submitting.
                      </CAlert>
                    );
                  }
                  return (
                    <CAlert color="success" className="validation-alert">
                      <strong>✓ All Set:</strong> All required fields are completed. 
                      Review the information below and click "Save & Submit" when ready.
                    </CAlert>
                  );
                })()}

                <div 
                  className="preview-section-wrapper"
                  onClick={() => handleTabClick(0)}
                >
                  {renderPreviewSection('Personal Information', {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phone: formData.phone,
                    dateOfBirth: formData.dateOfBirth,
                    gender: formData.gender
                  })}
                </div>

                <div 
                  className="preview-section-wrapper"
                  onClick={() => handleTabClick(1)}
                >
                  {renderPreviewSection('Address Information', {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zipCode: formData.zipCode,
                    country: formData.country,
                    addressType: formData.addressType
                  })}
                </div>

                <div 
                  className="preview-section-wrapper"
                  onClick={() => handleTabClick(2)}
                >
                  {renderPreviewSection('Professional Information', {
                    company: formData.company,
                    position: formData.position,
                    department: formData.department,
                    startDate: formData.startDate,
                    employmentType: formData.employmentType,
                    salary: formData.salary
                  })}
                </div>

                <div 
                  className="preview-section-wrapper"
                  onClick={() => handleTabClick(3)}
                >
                  {renderPreviewSection('Preferences & Agreements', {
                    newsletter: formData.newsletter,
                    notifications: formData.notifications,
                    dataSharing: formData.dataSharing,
                    preferredContact: formData.preferredContact,
                    termsAgreed: formData.termsAgreed,
                    privacyAgreed: formData.privacyAgreed
                  })}
                </div>

                <div className="submit-section">
                  <CButton
                    color="success"
                    size="lg"
                    onClick={handleSubmit}
                    className="submit-button"
                  >
                    Save & Submit
                  </CButton>
                </div>
              </div>
            </CTabPane>
          </CTabContent>

          {/* Navigation Buttons */}
          {activeTab < 4 && (
            <div className="wizard-actions">
              <CButton
                color="secondary"
                onClick={handlePrevious}
                disabled={activeTab === 0}
                className="action-button"
              >
                ← Previous
              </CButton>
              
              <CButton
                color="primary"
                onClick={handleNext}
                className="action-button"
              >
                Next →
              </CButton>
            </div>
          )}

          {activeTab === 4 && (
            <div className="wizard-actions">
              <CButton
                color="secondary"
                onClick={handlePrevious}
                className="action-button"
              >
                ← Back to Preferences
              </CButton>
            </div>
          )}
        </CCardBody>
      </CCard>
    </div>
  );
};

export default FormWizard;