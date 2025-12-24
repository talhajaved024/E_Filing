import React, { FC, useState, useEffect, ChangeEvent } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import ImageUpload from './ImageUpload';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CFormSelect,
  CFormFeedback,
  CCardHeader,
  CFormCheck
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilBadge, cilBuilding, cilDevices, cilFingerprint, cilLayers, cilLockLocked, cilUser, cilUserX } from '@coreui/icons';

const Register: FC = () => {
  const [username, setUsername] = useState('');
  const [userfullname, setUserFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userUniqueId, setuserUniqueId] = useState('');
  const [usergender, setUsergender] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [userDeviceIP, setUserDeviceIP] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const [isAdminUser, setIsAdmin] = useState(false);
  
  // Image state - lifted from child component
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDesigId, setSelectedDesigId] = useState('');

  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [dropdownLoading, setDropdownLoading] = useState({
    org: true,
    dept: true,
    desig: true
  });

  interface ValidationResult {
    isValid: boolean;
    message: string;
  }

  const genderOptions = [
    { id:1, value: '', label: 'Select Gender' },
    { id:2, value: 'Male', label: 'Male' },
    { id:3, value: 'Female', label: 'Female' }
  ];

  useEffect(() => {
    const fetchDropdownData = async () => {
      const token = sessionStorage.getItem('refreshToken');
      
      try {
        const orgResponse = await axios.get(`${process.env.REACT_APP_API_URL}/Lookup/organizations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrganizations(orgResponse.data);
        setDropdownLoading(prev => ({ ...prev, org: false }));

        const deptResponse = await axios.get(`${process.env.REACT_APP_API_URL}/Lookup/departments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(deptResponse.data);
        setDropdownLoading(prev => ({ ...prev, dept: false }));

        const desigResponse = await axios.get(`${process.env.REACT_APP_API_URL}/Lookup/designation`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDesignations(desigResponse.data);
        setDropdownLoading(prev => ({ ...prev, desig: false }));

      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        setDropdownLoading({ org: false, dept: false, desig: false });
      }
    };

    fetchDropdownData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!selectedOrgId || !selectedDeptId || !selectedDesigId) {
      setError('Please select Organization, Department, and Designation.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Step 1: Register the user first
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        username,
        user_full_name: userfullname,
        email,
        password,
        user_unique_id: userUniqueId,
        organization_id: selectedOrgId,
        department_id: selectedDeptId,
        designation_id: selectedDesigId,
        gender: usergender,
        user_device_ip: userDeviceIP,
        is_Admin_User: isAdminUser,
      });

      // Step 2: Upload image if one is selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('userId', userUniqueId);

        const refreshToken = sessionStorage.getItem("refreshToken");

        await axios.post(`${process.env.REACT_APP_API_URL}/api/images/upload`, formData, {
          headers: {
            "Authorization": `Bearer ${refreshToken}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setSuccess('Registration successful! ' + (selectedImage ? 'Image uploaded successfully!' : ''));
      
      // Reset all form fields
      setUsername('');
      setUserFullname('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setuserUniqueId('');
      setUsergender('');
      setUserDeviceIP('');
      setSelectedOrgId('');
      setSelectedDeptId('');
      setSelectedDesigId('');
      setIsAdmin(false);
      setSelectedImage(null);
      
    } catch (err: any) {
      let msg = 'Registration failed.';
      if (err?.response?.data) {
        // If the error response has a message property, use it
        if (typeof err.response.data === 'string') {
          msg = err.response.data;
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        } else if (err.response.data.error) {
          msg = err.response.data.error;
        }
      } else if (err.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const validateIPAddress = (ip: string): ValidationResult => {
    const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
    
    if (!ip || ip.trim() === '') {
      return { isValid: false, message: 'IP address is required' };
    }

    if (ipv4Regex.test(ip) || ipv6Regex.test(ip)) {
      return { isValid: true, message: '' };
    }

    return { isValid: false, message: 'Please enter a valid IP address' };
  };

  const handleIPChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserDeviceIP(value);
    const validation = validateIPAddress(value);
    setIsValid(validation.isValid);
    setErrorMessage(validation.message);
  };

  const handleBlur = () => {
    const validation = validateIPAddress(userDeviceIP);
    setIsValid(validation.isValid);
    setErrorMessage(validation.message);
  };

  if (redirectToLogin) return <Navigate to="/login" />;

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer style={{marginTop:'-100px'}}>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardHeader style={{backgroundColor:'white', borderRadius: '0px solid white', borderBottom:'none'}}>
                <h1>Register</h1>
                <p className="text-medium-emphasis">Create your new account</p>
              </CCardHeader>
              <CCardBody className="p-4">
                
                <ImageUpload 
                  selectedImage={selectedImage}
                  setSelectedImage={setSelectedImage}
                />
                
                <CForm onSubmit={handleSubmit} style={{marginTop:'50px'}}>
                  
                  <CRow>
                    <CCol>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Username"
                          autoComplete="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </CInputGroup>
                    </CCol>
                    <CCol>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Full-Name"
                          autoComplete="Full-Name"
                          value={userfullname}
                          onChange={(e) => setUserFullname(e.target.value)}
                          required
                        />
                      </CInputGroup>
                    </CCol>
                    <CCol>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilFingerprint} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="User ID"
                          autoComplete="username"
                          value={userUniqueId}
                          onChange={(e) => setuserUniqueId(e.target.value)}
                          required
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6}>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilBuilding} />
                        </CInputGroupText>
                        <CFormSelect 
                          value={selectedOrgId} 
                          onChange={(e) => setSelectedOrgId(e.target.value)}
                          aria-label="Select Organization"
                          required
                        >
                          <option value="">Select Organization</option>
                          {dropdownLoading.org ? (
                            <option disabled>Loading...</option>
                          ) : (
                            organizations.map((org: any) => (
                              <option key={org.id} value={org.id}>
                                {org.organizationName}
                              </option>
                            ))
                          )}
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>

                    <CCol md={6}>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilLayers} />
                        </CInputGroupText>
                        <CFormSelect 
                          value={selectedDeptId} 
                          onChange={(e) => setSelectedDeptId(e.target.value)}
                          aria-label="Select Department"
                          required
                        >
                          <option value="">Select Department</option>
                          {dropdownLoading.dept ? (
                            <option disabled>Loading...</option>
                          ) : (
                            departments.map((dept: any) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.userDepartment}
                              </option>
                            ))
                          )}
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={6}>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilBadge} />
                        </CInputGroupText>
                        <CFormSelect 
                          value={selectedDesigId} 
                          onChange={(e) => setSelectedDesigId(e.target.value)}
                          aria-label="Select Designation"
                          required
                        >
                          <option value="">Select Designation</option>
                          {dropdownLoading.desig ? (
                            <option disabled>Loading...</option>
                          ) : (
                            designations.map((desig: any) => (
                              <option key={desig.id} value={desig.id}>
                                {desig.userDesignation}
                              </option>
                            ))
                          )}
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>

                    <CCol>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilDevices} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="User Device IP (e.g., 192.168.1.1)"
                          autoComplete="off"
                          value={userDeviceIP}
                          onChange={handleIPChange}
                          onBlur={handleBlur}
                          invalid={!isValid}
                          required
                        />
                        <CFormFeedback invalid>
                          {errorMessage}
                        </CFormFeedback>
                      </CInputGroup>
                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol md={5}>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUserX} />
                        </CInputGroupText>
                        <CFormSelect
                          value={usergender}
                          onChange={(e) => setUsergender(e.target.value)}
                          aria-label="Select Gender"
                          required
                        >
                          {genderOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </CFormSelect>
                      </CInputGroup>
                    </CCol>
                    <CCol md={7}>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>@</CInputGroupText>
                        <CFormInput
                          placeholder="Email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </CInputGroup>
                    </CCol>
                  </CRow>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-4">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CFormCheck
                        id="isAdminCheckbox"
                        checked={isAdminUser}
                        onChange={(e) => setIsAdmin(e.target.checked)}
                      />
                    </CInputGroupText>
                    <CFormInput
                      placeholder="Is User Admin?"
                      readOnly
                      value={isAdminUser ? "Admin User" : "Regular User"}
                      style={{ backgroundColor: '#fff', cursor: 'default' }}
                    />
                  </CInputGroup>

                  {error && <div className="text-danger mb-3">{error}</div>}
                  {success && <div className="text-success mb-3">{success}</div>}

                  <div className="d-grid">
                    <CButton type="submit" color="success" disabled={loading}>
                      {loading ? 'Registering...' : 'Create Account'}
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Register;