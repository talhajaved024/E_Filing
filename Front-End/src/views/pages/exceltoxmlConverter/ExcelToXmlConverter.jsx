import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CButton,
  CContainer,
  CSpinner,
  CAlert
} from '@coreui/react';
import FileUploader from 'devextreme-react/file-uploader';
import DateBox from 'devextreme-react/date-box';
import List from 'devextreme-react/list';
import TrialExpired from './TrialExpired';
import axios from 'axios';

// Styles
import 'devextreme/dist/css/dx.light.css';
import '@coreui/coreui/dist/css/coreui.min.css';

const ExcelToXmlConverter = () => {
  // State Management
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [excelFiles, setExcelFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [xmlOutput, setXmlOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isExpired, setIsExpired] = useState(false);
  const [checkingExpiry, setCheckingExpiry] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);

  // API Configuration
  const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/excel`;
console.log(process.env.REACT_APP_API_URL);

  // Axios Instance Setup
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request Interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = sessionStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        setMessage({ 
          type: 'danger', 
          text: 'Session expired. Please login again.' 
        });
      }
      return Promise.reject(error);
    }
  );

  // Load expiry status and initial data on component mount
  useEffect(() => {
    const initializeComponent = async () => {
      await loadCheckExpiryEnabled();
      await loadAvailableDates();
    };
    initializeComponent();
  }, []);

  // Load files when date changes
  useEffect(() => {
    if (!checkingExpiry && !isExpired) {
      loadExcelFiles();
    }
  }, [selectedDate, checkingExpiry, isExpired]);

  // Check if trial has expired
  const loadCheckExpiryEnabled = async () => {
    try {
      setCheckingExpiry(true);
      const response = await axiosInstance.get(
        `${process.env.REACT_APP_API_URL}/api/enable-disable-expiry/getAll`
      );
      
      console.log('Expiry Check Response:', response.data);

      const hasExpiredExcelToXml = response.data.some(
          item => item.projectName?.includes("Excel to Xml") && item.isExpired === true
        );

setIsExpired(hasExpiredExcelToXml);
    } catch (error) {
      console.error('Error checking expiry status:', error);
      // Default to not expired on error to allow usage
      setIsExpired(false);
    } finally {
      setCheckingExpiry(false);
    }
  };

  // Load available dates
  const loadAvailableDates = async () => {
    try {
      const response = await axiosInstance.get('/dates');
      setAvailableDates(response.data);
    } catch (error) {
      console.error('Error loading dates:', error);
      setMessage({ 
        type: 'danger', 
        text: 'Failed to load available dates' 
      });
    }
  };

  // Format date for API requests
  const formatDateForAPI = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Load Excel files for selected date
  const loadExcelFiles = async () => {
    setLoading(true);
    try {
      const formattedDate = formatDateForAPI(selectedDate);
      const response = await axiosInstance.get('/files', {
        params: { date: formattedDate }
      });
      setExcelFiles(response.data);
      setSelectedFile(null);
      setXmlOutput('');
      setMessage({ type: '', text: '' });
    } catch (error) {
      console.error('Error loading files:', error);
      setExcelFiles([]);
      setMessage({ 
        type: 'warning', 
        text: 'No files found for the selected date' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    if (e.value && e.value.length > 0) {
      const file = e.value[0];
      
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setMessage({ 
          type: 'danger', 
          text: 'Only Excel files (.xlsx, .xls) are allowed!' 
        });
        return;
      }

      setUploadLoading(true);
      setMessage({ type: '', text: '' });

      const formData = new FormData();
      formData.append('file', file);

      try {
        await axiosInstance.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setMessage({ 
          type: 'success', 
          text: `${file.name} uploaded successfully!` 
        });
        setUploadedFile(file);
        
        // Reload lists
        await loadExcelFiles();
        await loadAvailableDates();
        
      }  catch (error) {
    // Extract the specific message string from the Spring error object
    const errorMsg = error.response?.data?.message 
                     || error.response?.data 
                     || 'Failed to upload file';
    
    // Safety check: if errorMsg is still somehow an object, stringify it
    setMessage({ 
        type: 'danger', 
        text: typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg 
    });
    } finally {
        setUploadLoading(false);
      }
    }
  };

  // Handle file selection from list
  const handleFileSelect = (e) => {
    setSelectedFile(e.itemData);
    setXmlOutput('');
    setMessage({ type: '', text: '' });
  };

  // Generate XML from selected file
  const handleGenerateXml = async () => {
    if (!selectedFile) {
      setMessage({ 
        type: 'warning', 
        text: 'Please select a file first' 
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formattedDate = formatDateForAPI(selectedDate);
      const response = await axiosInstance.post('/convert-to-xml', null, {
        params: {
          fileName: selectedFile.fileName,
          date: formattedDate
        }
      });
      
      setXmlOutput(response.data);
      setMessage({ 
        type: 'success', 
        text: 'XML generated successfully!' 
      });
      
    } catch (error) {
      const errorMsg = error.response?.data || 'Failed to convert file';
      setMessage({ type: 'danger', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  // Download generated XML
  const handleDownloadXml = async () => {
    if (!xmlOutput) return;

    try {
      const formattedDate = formatDateForAPI(selectedDate);
      const response = await axiosInstance.get('/download-xml', {
        params: {
          fileName: selectedFile.fileName,
          date: formattedDate
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.fileName.replace(/\.(xlsx|xls)$/, '.xml');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setMessage({ 
        type: 'success', 
        text: 'XML file downloaded successfully!' 
      });
    } catch (error) {
      console.error('Download error:', error);
      setMessage({ 
        type: 'danger', 
        text: 'Failed to download XML file' 
      });
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render file item in list
  const renderFileItem = (item) => (
    <div style={{ 
      padding: '12px', 
      borderBottom: '1px solid #e2e8f0',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div>
          <div style={{ 
            fontWeight: '500', 
            color: '#2d3748', 
            marginBottom: '4px' 
          }}>
            {item.fileName}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#718096' }}>
            {formatFileSize(item.size)}
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="#48bb78">
          <path d="M6 2C5.45 2 5 2.45 5 3v14c0 .55.45 1 1 1h8c.55 0 1-.45 1-1V6l-4-4H6zm7 5V3l4 4h-4z"/>
        </svg>
      </div>
    </div>
  );

  // Show loading spinner while checking expiry status
  if (checkingExpiry) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f0f4f8'
      }}>
        <div style={{ textAlign: 'center' }}>
          <CSpinner color="primary" style={{ width: '3rem', height: '3rem' }} />
          <p style={{ marginTop: '20px', color: '#718096' }}>
            Loading application...
          </p>
        </div>
      </div>
    );
  }

  // Show TrialExpired component if trial has expired
  if (isExpired) {
    return <TrialExpired />;
  }

  // Main Component Render
  return (
    <div style={{ 
      backgroundColor: '#f0f4f8', 
      minHeight: '100vh', 
      padding: '40px 0' 
    }}>
      <CContainer>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ 
            color: '#2c5282', 
            fontSize: '2.5rem', 
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            Excel to XML Converter
          </h1>
          <p style={{ color: '#718096', fontSize: '1.1rem' }}>
            Convert your Excel data to <strong>XML</strong> format easily.
          </p>
        </div>

        {/* Alert Message */}
        {message.text && (
          <CAlert 
            color={message.type} 
            dismissible 
            onClose={() => setMessage({ type: '', text: '' })}
            style={{ marginBottom: '20px' }}
          >
            {message.text}
          </CAlert>
        )}

        {/* 1. Upload Section */}
        <CCard className="mb-4 border-0 shadow-sm">
          <CCardBody className="p-4">
            <h4 className="mb-4 text-dark font-weight-bold">
              1. Upload Excel File
            </h4>
            <div style={{
              border: '2px dashed #cbd5e0',
              borderRadius: '8px',
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: '#f7fafc',
              position: 'relative'
            }}>
              {uploadLoading && (
                <div style={{ 
                  position: 'absolute', 
                  top: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, -50%)', 
                  zIndex: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  padding: '20px',
                  borderRadius: '8px'
                }}>
                  <CSpinner color="primary" />
                  <p style={{ marginTop: '10px', color: '#718096' }}>
                    Uploading...
                  </p>
                </div>
              )}
              <FileUploader
                selectButtonText="Browse Files"
                labelText="or drag and drop files here"
                accept=".xlsx,.xls"
                uploadMode="useForm"
                onValueChanged={handleFileUpload}
                disabled={uploadLoading}
              />
            </div>
          </CCardBody>
        </CCard>

        {/* 2. Selection Section */}
        <CCard className="mb-4 border-0 shadow-sm">
          <CCardBody className="p-4">
            <h4 className="mb-4 text-dark font-weight-bold">
              2. Select Excel File
            </h4>
            
            {/* Date Selector */}
             <div className="mb-3">
              <label className="form-label text-muted">Select Date:</label>
              <DateBox
                value={selectedDate}
                onValueChanged={(e) => setSelectedDate(e.value)}
                displayFormat="dd-MM-yyyy"
                type="date"
                width="20%"
                stylingMode="outlined"
              />
            </div>

            {/* File List */}
            <div style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              minHeight: '150px', 
              maxHeight: '300px', 
              overflow: 'auto',
              backgroundColor: '#ffffff'
            }}>
              {loading ? (
                <div className="text-center p-5">
                  <CSpinner color="primary" />
                  <p style={{ marginTop: '10px', color: '#718096' }}>
                    Loading files...
                  </p>
                </div>
              ) : excelFiles.length === 0 ? (
                <div className="text-center p-5 text-muted">
                  <svg 
                    width="48" 
                    height="48" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    style={{ margin: '0 auto 10px', opacity: 0.5 }}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  <p>No files found for this date</p>
                </div>
              ) : (
                <List
                  dataSource={excelFiles}
                  keyExpr="fileName"
                  selectionMode="single"
                  onItemClick={handleFileSelect}
                  itemRender={renderFileItem}
                  selectedItems={selectedFile ? [selectedFile] : []}
                  hoverStateEnabled={true}
                />
              )}
            </div>
          </CCardBody>
        </CCard>

        {/* 3. Generate Section */}
        {selectedFile && (
          <CCard className="mb-4 border-0 shadow-sm">
            <CCardBody className="p-4">
              <h4 className="mb-4 text-dark font-weight-bold">
                3. Generate XML File
              </h4>
              <div className="text-center">
                <p style={{ color: '#718096', marginBottom: '20px' }}>
                  Selected File: <strong>{selectedFile.fileName}</strong>
                </p>
                <CButton 
                  color="primary" 
                  size="lg" 
                  onClick={handleGenerateXml} 
                  disabled={loading}
                  className="px-5"
                  style={{ minWidth: '200px' }}
                >
                  {loading ? (
                    <>
                      <CSpinner size="sm" className="me-2" />
                      Generating...
                    </>
                  ) : (
                    'Generate XML'
                  )}
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        )}

        {/* Preview Section */}
        {xmlOutput && (
          <CCard className="border-0 shadow-sm">
            <CCardBody className="p-4">
              <h5 className="mb-3 text-dark font-weight-bold">
                XML Output Preview:
              </h5>
              <div style={{
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                borderRadius: '6px',
                padding: '20px',
                maxHeight: '400px',
                overflow: 'auto',
                marginBottom: '20px',
                fontFamily: 'monospace',
                fontSize: '0.9rem'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {xmlOutput}
                </pre>
              </div>
              <div className="text-center">
                <CButton 
                  color="success" 
                  size="lg" 
                  onClick={handleDownloadXml} 
                  className="text-white px-5"
                  style={{ minWidth: '200px' }}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  Download XML File
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        )}
      </CContainer>
    </div>
  );
};

export default ExcelToXmlConverter;