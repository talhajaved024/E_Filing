import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import { Popup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { NumberBox } from 'devextreme-react/number-box';
import { Toolbar, Item } from 'devextreme-react/toolbar';
import { LoadPanel } from 'devextreme-react/load-panel';
import { ScrollView } from 'devextreme-react/scroll-view';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import notify from 'devextreme/ui/notify';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;

const API_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
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
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      notify('Session expired. Please login again.', 'error', 3000);
    }
    return Promise.reject(error);
  }
);

const TaskAssignmentViewPDF = ({ isVisible, onClose, rowData }) => {
  const [fileBlobUrl, setFileBlobUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [documentText, setDocumentText] = useState('');
  const [documentHtml, setDocumentHtml] = useState('');
  const [fileBlob, setFileBlob] = useState(null);
  const [officeFileType, setOfficeFileType] = useState(null); // 'word', 'excel', 'powerpoint'

  useEffect(() => {
    if (!rowData || !isVisible) return;

    const fetchDocument = async () => {
      setLoading(true);
      setError(null);
      setPageNumber(1);
      setRotation(0);
      setImageLoaded(false);
      setDocumentText('');
      setDocumentHtml('');
      setFileBlob(null);
      setOfficeFileType(null);
      
      //console.log.log('Fetching document for rowData:', rowData);
      
      try {
        const response = await axiosInstance.get(`/taskAssignment-docs/view/${rowData.id}`, {
          responseType: "blob",
        });

        //console.log.log('Response received:', response);
        //console.log.log('Content-Type:', response.headers['content-type']);
        //console.log.log('Blob size:', response.data.size);

        const contentType = response.headers['content-type'];
        const filename = rowData.originalFilename?.toLowerCase() || '';
        
        //console.log.log('Filename:', filename);
        //console.log.log('Content-Type from server:', contentType);

        // IMPORTANT: Prioritize filename extension over content-type
        // because backend is returning application/pdf for all files
        let detectedType = null;
        
        // First check filename extension (most reliable)
        if (/\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(filename)) {
          detectedType = 'image';
          //console.log.log('Detected as IMAGE based on filename extension');
        } else if (filename.endsWith('.pdf')) {
          detectedType = 'pdf';
          //console.log.log('Detected as PDF based on filename extension');
        } else if (/\.docx?$/i.test(filename)) {
          detectedType = 'office';
          setOfficeFileType('word');
          //console.log.log('Detected as WORD document based on filename extension');
        } else if (/\.xlsx?$/i.test(filename)) {
          detectedType = 'office';
          setOfficeFileType('excel');
          //console.log.log('Detected as EXCEL document based on filename extension');
        } else if (/\.pptx?$/i.test(filename)) {
          detectedType = 'office';
          setOfficeFileType('powerpoint');
          //console.log.log('Detected as POWERPOINT document based on filename extension');
        } else if (contentType?.includes('image')) {
          // Fallback to content-type if filename doesn't have extension
          detectedType = 'image';
          //console.log.log('Detected as IMAGE based on content-type');
        } else if (contentType?.includes('pdf')) {
          detectedType = 'pdf';
          //console.log.log('Detected as PDF based on content-type');
        } else if (contentType?.includes('officedocument') || contentType?.includes('msword') || contentType?.includes('ms-powerpoint')) {
          detectedType = 'office';
          //console.log.log('Detected as OFFICE based on content-type');
        } else {
          // Last resort - default to PDF
          detectedType = 'pdf';
          //console.log.log('Defaulting to PDF (no clear indicators)');
        }
        
        setFileType(detectedType);

        // Create blob with appropriate type based on detected file type
        // Override server content-type since it's returning application/pdf for all files
        let blobType;
        if (detectedType === 'pdf') {
          blobType = 'application/pdf';
        } else if (detectedType === 'image') {
          // Determine specific image type from filename
          if (filename.endsWith('.png')) {
            blobType = 'image/png';
          } else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) {
            blobType = 'image/jpeg';
          } else if (filename.endsWith('.gif')) {
            blobType = 'image/gif';
          } else if (filename.endsWith('.bmp')) {
            blobType = 'image/bmp';
          } else if (filename.endsWith('.webp')) {
            blobType = 'image/webp';
          } else {
            blobType = 'image/jpeg'; // default for unknown image types
          }
        } else {
          blobType = contentType || 'application/octet-stream';
        }

        //console.log.log('Creating blob with type:', blobType);
        
        const blob = new Blob([response.data], { type: blobType });
        const fileURL = URL.createObjectURL(blob);
        
        //console.log.log('Blob URL created:', fileURL);
        setFileBlobUrl(fileURL);
        setFileBlob(blob);
        
        // If it's an office document, parse it
        if (detectedType === 'office') {
          try {
            //console.log.log('Parsing office document, type:', officeFileType || 'unknown');
            const arrayBuffer = await blob.arrayBuffer();
            
            if (filename.match(/\.docx?$/i)) {
              // Parse Word document with mammoth
              const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
              //console.log.log('Word document parsed successfully');
              setDocumentHtml(result.value);
              if (result.messages.length > 0) {
                //console.log.log('Mammoth conversion messages:', result.messages);
              }
            } else if (filename.match(/\.xlsx?$/i)) {
              // Parse Excel document with xlsx
              const workbook = XLSX.read(arrayBuffer, { type: 'array' });
              //console.log.log('Excel workbook parsed, sheets:', workbook.SheetNames);
              
              // Convert first sheet to HTML
              const firstSheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[firstSheetName];
              const html = XLSX.utils.sheet_to_html(worksheet);
              setDocumentHtml(html);
              
              // Also store sheet names for reference
              setDocumentText(`Available sheets: ${workbook.SheetNames.join(', ')}`);
            } else if (filename.match(/\.pptx?$/i)) {
              // PowerPoint - no browser library supports this well
              setDocumentText('PowerPoint preview is not supported in browser. Please download the file to view.');
            }
          } catch (parseError) {
            console.log.error('Error parsing office document:', parseError);
            setDocumentText(`Error parsing document: ${parseError.message}. Click download to view in your office application.`);
          }
        }
        
        notify(`${detectedType === 'pdf' ? 'PDF' : detectedType === 'image' ? 'Image' : 'Office Document'} loaded successfully`, 'success', 1500);
      } catch (err) {
        ////console.log.error("Error loading document:", err);
        console.error("Error details:", err.response);
        setError(err.message);
        notify(`Failed to load document: ${err.message}`, 'error', 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();

    return () => {
      if (fileBlobUrl) {
        //console.log('Cleaning up blob URL');
        URL.revokeObjectURL(fileBlobUrl);
        setFileBlobUrl(null);
      }
    };
  }, [rowData?.id, isVisible]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    //console.log('PDF loaded successfully, pages:', numPages);
    setNumPages(numPages);
    setPageNumber(1);
    notify(`PDF loaded: ${numPages} pages`, 'success', 2000);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF document:', error);
    setError('Failed to load PDF');
    notify('Failed to load PDF document', 'error', 3000);
  };

  // PDF Navigation
  const goToPrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const goToFirstPage = () => setPageNumber(1);
  const goToLastPage = () => setPageNumber(numPages || 1);

  // PDF Zoom
  const zoomIn = () => {
    const newScale = Math.min(scale + 0.2, 3.0);
    setScale(newScale);
    notify(`Zoom: ${Math.round(newScale * 100)}%`, 'info', 1000);
  };

  const zoomOut = () => {
    const newScale = Math.max(scale - 0.2, 0.5);
    setScale(newScale);
    notify(`Zoom: ${Math.round(newScale * 100)}%`, 'info', 1000);
  };

  const resetZoom = () => {
    setScale(1.2);
    notify('Zoom reset', 'info', 1000);
  };

  // PDF Rotation
  const rotateClockwise = () => {
    setRotation((rotation + 90) % 360);
  };

  const rotateCounterClockwise = () => {
    setRotation((rotation - 90 + 360) % 360);
  };

  const fitToWidth = () => {
    setScale(1.5);
    notify('Fit to width', 'info', 1000);
  };

  const handlePageNumberChange = (e) => {
    const value = e.value;
    if (value >= 1 && value <= numPages) {
      setPageNumber(value);
    }
  };

  const downloadFile = () => {
    if (fileBlobUrl && rowData) {
      const link = document.createElement('a');
      link.href = fileBlobUrl;
      link.download = rowData.originalFilename || `document_${rowData.id}`;
      link.click();
      notify('Download started', 'success', 2000);
    }
  };

  const printFile = () => {
    if (fileBlobUrl && rowData) {
      window.open(fileBlobUrl, '_blank');
      notify('Opening print dialog...', 'info', 2000);
    }
  };

  const renderPDFToolbar = () => (
    <Toolbar style={{ backgroundColor: '#fff', borderBottom: '2px solid #e0e0e0' }}>
      <Item location="before">
        <Button
          icon="chevronleft"
          hint="First Page"
          onClick={goToFirstPage}
          disabled={pageNumber <= 1 || loading}
          stylingMode="text"
        />
      </Item>
      <Item location="before">
        <Button
          icon="chevronprev"
          hint="Previous Page"
          onClick={goToPrevPage}
          disabled={pageNumber <= 1 || loading}
          stylingMode="contained"
          type="default"
        />
      </Item>
      
      <Item location="before">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px' }}>
          <NumberBox
            value={pageNumber}
            min={1}
            max={numPages || 1}
            showSpinButtons={true}
            onValueChanged={handlePageNumberChange}
            width={80}
            disabled={loading}
          />
          <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
            / {numPages || '-'}
          </span>
        </div>
      </Item>

      <Item location="before">
        <Button
          icon="chevronnext"
          hint="Next Page"
          onClick={goToNextPage}
          disabled={pageNumber >= numPages || loading}
          stylingMode="contained"
          type="default"
        />
      </Item>
      <Item location="before">
        <Button
          icon="chevronright"
          hint="Last Page"
          onClick={goToLastPage}
          disabled={pageNumber >= numPages || loading}
          stylingMode="text"
        />
      </Item>

      <Item location="before">
        <div style={{ width: '1px', height: '30px', backgroundColor: '#ddd', margin: '0 10px' }} />
      </Item>

      <Item location="before">
        <Button
          icon="minus"
          hint="Zoom Out"
          onClick={zoomOut}
          disabled={scale <= 0.5 || loading}
          stylingMode="text"
        />
      </Item>
      <Item location="before">
        <span style={{ fontSize: '14px', fontWeight: '600', minWidth: '60px', textAlign: 'center', color: '#333' }}>
          {Math.round(scale * 100)}%
        </span>
      </Item>
      <Item location="before">
        <Button
          icon="plus"
          hint="Zoom In"
          onClick={zoomIn}
          disabled={scale >= 3.0 || loading}
          stylingMode="text"
        />
      </Item>
      <Item location="before">
        <Button
          text="Reset"
          hint="Reset Zoom"
          onClick={resetZoom}
          disabled={loading}
          stylingMode="outlined"
          type="normal"
        />
      </Item>
      <Item location="before">
        <Button
          icon="columnfield"
          hint="Fit to Width"
          onClick={fitToWidth}
          disabled={loading}
          stylingMode="text"
        />
      </Item>

      <Item location="center">
        <div style={{ width: '1px', height: '30px', backgroundColor: '#ddd', margin: '0 10px' }} />
      </Item>

      <Item location="center">
        <Button
          icon="undo"
          hint="Rotate Counter-Clockwise"
          onClick={rotateCounterClockwise}
          disabled={loading}
          stylingMode="text"
        />
      </Item>
      <Item location="center">
        <Button
          icon="redo"
          hint="Rotate Clockwise"
          onClick={rotateClockwise}
          disabled={loading}
          stylingMode="text"
        />
      </Item>

      <Item location="after">
        <Button
          icon="download"
          hint="Download"
          onClick={downloadFile}
          disabled={!fileBlobUrl || loading}
          stylingMode="text"
        />
      </Item>
      <Item location="after">
        <Button
          icon="print"
          hint="Print"
          onClick={printFile}
          disabled={!fileBlobUrl || loading}
          stylingMode="text"
        />
      </Item>
    </Toolbar>
  );

  const renderImageToolbar = () => (
    <Toolbar style={{ backgroundColor: '#fff', borderBottom: '2px solid #e0e0e0' }}>
      <Item location="before">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '0 10px'
        }}>
          <i className="dx-icon-info" style={{ color: '#1976d2', fontSize: '16px' }} />
          <span style={{ fontSize: '13px', color: '#666' }}>
            Click image to zoom in/out • Drag to pan when zoomed
          </span>
        </div>
      </Item>

      <Item location="after">
        <Button
          icon="download"
          hint="Download Image"
          onClick={downloadFile}
          disabled={!fileBlobUrl || loading}
          stylingMode="text"
        />
      </Item>
      <Item location="after">
        <Button
          icon="print"
          hint="Print Image"
          onClick={printFile}
          disabled={!fileBlobUrl || loading}
          stylingMode="text"
        />
      </Item>
    </Toolbar>
  );

  const renderOfficeToolbar = () => (
    <Toolbar style={{ backgroundColor: '#fff', borderBottom: '2px solid #e0e0e0' }}>
      <Item location="before">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          padding: '0 10px'
        }}>
          <i className="dx-icon-doc" style={{ color: '#2e7d32', fontSize: '16px' }} />
          <span style={{ fontSize: '13px', color: '#666' }}>
            {officeFileType === 'word' && 'Word Document Preview'}
            {officeFileType === 'excel' && 'Excel Spreadsheet Preview'}
            {officeFileType === 'powerpoint' && 'PowerPoint Document'}
            {!officeFileType && 'Office Document Preview'}
            {' • Download for full formatting'}
          </span>
        </div>
      </Item>

      <Item location="after">
        <Button
          icon="download"
          text="Download"
          hint="Download Document"
          onClick={downloadFile}
          disabled={!fileBlobUrl || loading}
          stylingMode="contained"
          type="success"
        />
      </Item>
    </Toolbar>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center' }}>
            <i className="dx-icon-spindown" style={{ fontSize: '48px' }} />
            <p style={{ marginTop: '20px', fontSize: '16px' }}>Loading document...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <i className="dx-icon-clear" style={{ fontSize: '48px', color: '#f44336' }} />
            <p style={{ marginTop: '20px', fontSize: '16px' }}>Error: {error}</p>
            <Button 
              text="Close" 
              onClick={onClose}
              stylingMode="contained"
              type="danger"
              style={{ marginTop: '20px' }}
            />
          </div>
        </div>
      );
    }

    if (!fileBlobUrl || !fileType || !rowData) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          color: 'white'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p>No document to display</p>
            {process.env.NODE_ENV === 'development' && (
              <p style={{ fontSize: '12px', marginTop: '10px' }}>
                Debug: fileBlobUrl={fileBlobUrl ? 'exists' : 'null'}, fileType={fileType || 'null'}, rowData={rowData ? 'exists' : 'null'}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (fileType === 'pdf') {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '100%',
          padding: '20px'
        }}>
          <div style={{ 
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            backgroundColor: 'white'
          }}>
            <Document
              file={fileBlobUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div style={{ padding: '100px', textAlign: 'center' }}>
                  <i className="dx-icon-spindown" style={{ fontSize: '32px', color: '#999' }} />
                  <p style={{ color: '#999' }}>Loading PDF...</p>
                </div>
              }
              error={
                <div style={{ padding: '100px', textAlign: 'center' }}>
                  <i className="dx-icon-clear" style={{ fontSize: '32px', color: '#f44336' }} />
                  <p style={{ color: '#f44336' }}>Error loading PDF</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                loading={
                  <div style={{ 
                    padding: '100px', 
                    color: '#999',
                    textAlign: 'center',
                    backgroundColor: 'white'
                  }}>
                    Loading page...
                  </div>
                }
              />
            </Document>
          </div>
        </div>
      );
    }

    if (fileType === 'image') {
      return (
        <div 
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100%',
            minWidth: '100%',
            padding: '20px',
            backgroundColor: '#525659'
          }}
        >
          <div 
            style={{
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              backgroundColor: 'white',
              padding: '10px',
              borderRadius: '4px',
              maxWidth: '95%',
              maxHeight: '95%'
            }}
          >
            <Zoom zoomMargin={40}>
              <img
                src={fileBlobUrl}
                alt={rowData?.originalFilename || 'Document'}
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 250px)',
                  width: 'auto',
                  height: 'auto',
                  display: 'block',
                  objectFit: 'contain'
                }}
                onLoad={() => {
                  //console.log('Image loaded successfully');
                  setImageLoaded(true);
                }}
                onError={(e) => {
                  console.error('Image load error:', e);
                  setError('Failed to load image');
                }}
              />
            </Zoom>
          </div>
        </div>
      );
    }

    if (fileType === 'office') {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          minHeight: '100%',
          padding: '20px',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            maxWidth: officeFileType === 'excel' ? '100%' : '900px',
            width: '100%',
            minHeight: '400px'
          }}>
            <div style={{
              borderBottom: '2px solid #e0e0e0',
              paddingBottom: '15px',
              marginBottom: '20px'
            }}>
              <h3 style={{ 
                margin: '0 0 10px 0',
                color: '#333',
                fontSize: '20px',
                fontWeight: '600'
              }}>
                {rowData?.originalFilename}
              </h3>
              <p style={{ 
                margin: 0,
                color: '#666',
                fontSize: '13px'
              }}>
                {officeFileType === 'word' && 'Document content with basic formatting'}
                {officeFileType === 'excel' && documentText && <>{documentText}</>}
                {officeFileType === 'powerpoint' && 'Preview not available'}
                {!officeFileType && 'Document preview'}
              </p>
            </div>
            
            {documentHtml ? (
              <div 
                style={{
                  lineHeight: '1.6',
                  fontSize: '14px',
                  color: '#333',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                }}
                dangerouslySetInnerHTML={{ __html: documentHtml }}
              />
            ) : documentText ? (
              <div style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                lineHeight: '1.6',
                fontSize: '14px',
                color: '#333',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
              }}>
                {documentText}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#999'
              }}>
                <i className="dx-icon-doc" style={{ fontSize: '48px', marginBottom: '20px', display: 'block' }} />
                <p>Processing document...</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        color: 'white'
      }}>
        <p>Unknown file type: {fileType}</p>
      </div>
    );
  };

  return (
    <Popup
      visible={isVisible}
      onHiding={onClose}
      dragEnabled={true}
      showTitle={true}
      title={`Document Viewer`}
      showCloseButton={true}
      width="88%"
      height="88%"
      resizeEnabled={true}
    >
      <div style={{ 
        width: "100%", 
        height: "100%", 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        {/* Debug info at top */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            backgroundColor: '#fff3cd', 
            padding: '5px 10px', 
            fontSize: '11px',
            borderBottom: '1px solid #ddd'
          }}>
            Debug: Type={fileType} | URL={fileBlobUrl ? 'exists' : 'null'} | Loading={loading.toString()}
          </div>
        )} */}

        {/* Toolbar */}
        {fileType === 'pdf' ? renderPDFToolbar() : fileType === 'image' ? renderImageToolbar() : null}

        {/* Content Area */}
        <ScrollView
          style={{ 
            flex: 1,
            backgroundColor: '#525659'
          }}
          showScrollbar="onScroll"
        >
          {renderContent()}
        </ScrollView>

        {/* Loading Panel */}
        <LoadPanel
          shadingColor="rgba(0,0,0,0.4)"
          visible={loading}
          showIndicator={true}
          showPane={true}
          message="Loading Document..."
          hideOnOutsideClick={false}
        />
      </div>
    </Popup>
  );
};

export default TaskAssignmentViewPDF;