import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import axios from 'axios';
import { Popup } from 'devextreme-react/popup';
import { Button } from 'devextreme-react/button';
import { NumberBox } from 'devextreme-react/number-box';
import { Toolbar, Item } from 'devextreme-react/toolbar';
import { LoadPanel } from 'devextreme-react/load-panel';
import { ScrollView } from 'devextreme-react/scroll-view';
import notify from 'devextreme/ui/notify';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
//pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.js`;
//console.log(pdfjs.version);

const API_URL = `${process.env.REACT_APP_API_URL}/api`;

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

const ObservationPdfViewer = ({ isVisible, onClose, rowData }) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [loading, setLoading] = useState(false);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!rowData || !isVisible) return;

    const fetchPDF = async () => {
      setLoading(true);
      setPageNumber(1);
      setRotation(0);
      
      try {
        const response = await axiosInstance.get(`/observation-docs/view/${rowData.id}`, {
          responseType: "blob",
        });

        const fileURL = URL.createObjectURL(
          new Blob([response.data], { type: "application/pdf" })
        );
        setPdfBlobUrl(fileURL);
      } catch (err) {
        console.error("Error loading PDF:", err);
        notify('Failed to load PDF document', 'error', 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchPDF();

    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
    };
  }, [rowData?.id, isVisible]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    notify(`Document loaded: ${numPages} pages`, 'success', 2000);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    notify('Failed to load PDF document', 'error', 3000);
  };

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
    notify('Zoom reset to 100%', 'info', 1000);
  };

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

  const downloadPDF = () => {
    if (pdfBlobUrl) {
      const link = document.createElement('a');
      link.href = pdfBlobUrl;
      link.download = `document_${rowData.id}.pdf`;
      link.click();
      notify('Download started', 'success', 2000);
    }
  };

  const printPDF = () => {
    if (pdfBlobUrl) {
      window.open(pdfBlobUrl, '_blank');
      notify('Opening print dialog...', 'info', 2000);
    }
  };

  return (
    <Popup
      visible={isVisible}
      onHiding={onClose}
      dragEnabled={true}
      showTitle={true}
      title="Document Viewer"
      showCloseButton={true}
      width="90%"
      height="95%"
      resizeEnabled={true}
    >
      <div style={{ 
        width: "100%", 
        height: "100%", 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        {/* Toolbar with DevExtreme components */}
        <Toolbar style={{ backgroundColor: '#fff', borderBottom: '2px solid #e0e0e0' }}>
          {/* Navigation Group */}
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

          {/* Separator */}
          <Item location="before">
            <div style={{ 
              width: '1px', 
              height: '30px', 
              backgroundColor: '#ddd',
              margin: '0 10px'
            }} />
          </Item>

          {/* Zoom Group */}
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
            <span style={{ 
              fontSize: '14px', 
              fontWeight: '600',
              minWidth: '60px',
              textAlign: 'center',
              color: '#333'
            }}>
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

          {/* Separator */}
          <Item location="center">
            <div style={{ 
              width: '1px', 
              height: '30px', 
              backgroundColor: '#ddd',
              margin: '0 10px'
            }} />
          </Item>

          {/* Rotation Group */}
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

          {/* Actions Group */}
          <Item location="after">
            <Button
              icon="download"
              hint="Download PDF"
              onClick={downloadPDF}
              disabled={!pdfBlobUrl || loading}
              stylingMode="text"
            />
          </Item>
          <Item location="after">
            <Button
              icon="print"
              hint="Print PDF"
              onClick={printPDF}
              disabled={!pdfBlobUrl || loading}
              stylingMode="text"
            />
          </Item>
        </Toolbar>

        {/* PDF Content Area with ScrollView */}
        <ScrollView
          style={{ 
            flex: 1,
            backgroundColor: '#525659'
          }}
          showScrollbar="onScroll"
        >
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            minHeight: '100%',
            padding: '20px'
          }}>
            {pdfBlobUrl && !loading && (
              <div style={{ 
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                backgroundColor: 'white'
              }}>
                <Document
                  file={pdfBlobUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div style={{ padding: '40px', color: '#fff', textAlign: 'center' }}>
                      <i className="dx-icon-spindown" style={{ fontSize: '32px' }} />
                      <p>Loading PDF...</p>
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
            )}
          </div>
        </ScrollView>

        {/* Loading Panel */}
        <LoadPanel
          shadingColor="rgba(0,0,0,0.4)"
          visible={loading}
          showIndicator={true}
          showPane={true}
          message="Loading PDF Document..."
         // closeOnOutsideClick={false}
          hideOnOutsideClick={false}
        />
      </div>
    </Popup>
  );
};

export default ObservationPdfViewer;