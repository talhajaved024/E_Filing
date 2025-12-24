import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CButton,
  CContainer,
  CSpinner,
  CAlert
} from '@coreui/react';

// RECTIFIED: Consolidate imports to prevent Webpack resolution errors
//import { FileUploader, List } from 'devextreme-react';
import FileUploader from 'devextreme-react/file-uploader';
import DateBox from 'devextreme-react/date-box';
import List from 'devextreme-react/list';

import axios from 'axios';

// Styles
import 'devextreme/dist/css/dx.light.css';
import '@coreui/coreui/dist/css/coreui.min.css';

const ExcelToXmlConverter = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [excelFiles, setExcelFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [xmlOutput, setXmlOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [availableDates, setAvailableDates] = useState([]);

  const API_BASE_URL = 'http://localhost:8080/api/excel';

  const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("refreshToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      notify('Session expired. Please login again.', 'error', 3000);
    }
    return Promise.reject(error);
  }
);
  // Load available dates on component mount
  useEffect(() => {
    loadAvailableDates();
  }, []);

  // Load files when date changes
  useEffect(() => {
    loadExcelFiles();
  }, [selectedDate]);

  const loadAvailableDates = async () => {
    try {
      const response = await axiosInstance.get(`/dates`);
      setAvailableDates(response.data);
    } catch (error) {
      console.error('Error loading dates:', error);
    }
  };

  const formatDateForAPI = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const loadExcelFiles = async () => {
    setLoading(true);
    try {
      const formattedDate = formatDateForAPI(selectedDate);
      const response = await axiosInstance.get(`/files`, {
        params: { date: formattedDate }
      });
      setExcelFiles(response.data);
      setSelectedFile(null);
      setXmlOutput('');
      setMessage({ type: '', text: '' });
    } catch (error) {
      console.error('Error loading files:', error);
      setExcelFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    if (e.value && e.value.length > 0) {
      const file = e.value[0];
      
      // Validate file type
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setMessage({ type: 'danger', text: 'Only Excel files (.xlsx, .xls) are allowed!' });
        return;
      }

      setUploadLoading(true);
      setMessage({ type: '', text: '' });

      const formData = new FormData();
      formData.append('file', file);

      try {
        await axiosInstance.post(`/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        setMessage({ type: 'success', text: `${file.name} uploaded successfully!` });
        setUploadedFile(file);
        
        // Reload lists
        await loadExcelFiles();
        await loadAvailableDates();
        
      } catch (error) {
        const errorMsg = error.response?.data || 'Failed to upload file';
        setMessage({ type: 'danger', text: errorMsg });
      } finally {
        setUploadLoading(false);
      }
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.itemData);
    setXmlOutput('');
  };

  const handleGenerateXml = async () => {
    if (!selectedFile) {
      setMessage({ type: 'warning', text: 'Please select a file first' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formattedDate = formatDateForAPI(selectedDate);
      const response = await axiosInstance.post(`/convert-to-xml`, null, {
        params: {
          fileName: selectedFile.fileName,
          date: formattedDate
        }
      });
      
      setXmlOutput(response.data);
      setMessage({ type: 'success', text: 'XML generated successfully!' });
      
    } catch (error) {
      const errorMsg = error.response?.data || 'Failed to convert file';
      setMessage({ type: 'danger', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadXml = async () => {
    if (!xmlOutput) return;

    try {
      const formattedDate = formatDateForAPI(selectedDate);
      const response = await axiosInstance.get(`/download-xml`, {
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
    } catch (error) {
      setMessage({ type: 'danger', text: 'Failed to download XML file' });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderFileItem = (item) => (
    <div style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: '500', color: '#2d3748', marginBottom: '4px' }}>
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

  return (
    <div style={{ backgroundColor: '#f0f4f8', minHeight: '100vh', padding: '40px 0' }}>
      <CContainer>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#2c5282', fontSize: '2.5rem', fontWeight: 'bold' }}>
            Excel to XML Converter
          </h1>
          <p style={{ color: '#718096', fontSize: '1.1rem' }}>
            Convert your Excel data to <strong>XML</strong> format easily.
          </p>
        </div>

        {message.text && (
          <CAlert color={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
            {message.text}
          </CAlert>
        )}

        {/* 1. Upload Section */}
        <CCard className="mb-4 border-0 shadow-sm">
          <CCardBody className="p-4">
            <h4 className="mb-4 text-dark font-weight-bold">1. Upload Excel File</h4>
            <div style={{
              border: '2px dashed #cbd5e0',
              borderRadius: '8px',
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: '#f7fafc',
              position: 'relative'
            }}>
              {uploadLoading && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
                  <CSpinner color="primary" />
                </div>
              )}
              <FileUploader
                selectButtonText="Browse Files"
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
            <h4 className="mb-4 text-dark font-weight-bold">2. Select Excel File</h4>
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

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '150px', maxHeight: '300px', overflow: 'auto' }}>
              {loading ? (
                <div className="text-center p-5"><CSpinner color="primary" /></div>
              ) : excelFiles.length === 0 ? (
                <div className="text-center p-5 text-muted">No files found for this date</div>
              ) : (
                <List
                  dataSource={excelFiles}
                  keyExpr="fileName"
                  selectionMode="single"
                  onItemClick={handleFileSelect}
                  itemRender={renderFileItem}
                  selectedItems={selectedFile ? [selectedFile] : []}
                />
              )}
            </div>
          </CCardBody>
        </CCard>

        {/* 3. Generate Section */}
        {selectedFile && (
          <CCard className="mb-4 border-0 shadow-sm">
            <CCardBody className="p-4 text-center">
              <h4 className="text-start mb-4">3. Generate XML File</h4>
              <CButton 
                color="primary" 
                size="lg" 
                onClick={handleGenerateXml} 
                disabled={loading}
                className="px-5"
              >
                {loading ? <CSpinner size="sm" /> : 'Generate XML'}
              </CButton>
            </CCardBody>
          </CCard>
        )}

        {/* Preview Section */}
        {xmlOutput && (
          <CCard className="border-0 shadow-sm">
            <CCardBody className="p-4">
              <h5 className="mb-3">Output Preview:</h5>
              <div style={{
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                borderRadius: '6px',
                padding: '20px',
                maxHeight: '400px',
                overflow: 'auto',
                marginBottom: '20px'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{xmlOutput}</pre>
              </div>
              <div className="text-center">
                <CButton color="success" size="lg" onClick={handleDownloadXml} className="text-white px-5">
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