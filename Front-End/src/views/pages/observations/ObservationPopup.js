import React, { useRef, useState, useEffect,useCallback } from 'react';
import { Popup } from 'devextreme-react/popup';
import DataGrid, { Column, Paging, Editing } from 'devextreme-react/data-grid';
import FileUploader from 'devextreme-react/file-uploader';
import CustomStore from 'devextreme/data/custom_store';
import { Button } from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import axios from 'axios';
import ObservationPdfViewer from './ObservationPdfViewer';

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

const ObservationPopup = ({ isVisible, onClose, rowData }) => {
  const uploaderRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const dataDetailGridRefA = useRef(null);
  const [dataSource, setDataSource] = useState(null);
   const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);

  useEffect(() => {
    if (isVisible && rowData) {
      // Create new CustomStore instance when popup opens
      const newDataSource = new CustomStore({
        key: 'id',
        load: () => loadObservationsDocs(),
        remove: (key) => deleteObservationsDocsNDetails(key)
      });
      setDataSource(newDataSource);
    } else {
      // Clear data source when popup closes
      setDataSource(null);
    }
  }, [isVisible, rowData?.id]);

  const getDetailSno = (e, sec) => {
    if (sec === "A") {
      const gridInstance = dataDetailGridRefA.current.instance;
      const pageIndex = gridInstance.pageIndex();
      const pageSize = gridInstance.pageSize();

      return (
        <p className="PSerialNo">
          {(pageIndex * pageSize) + e.row.dataIndex + 1}
        </p>
      );
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.value[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('observationId', rowData?.id);

    try {
      setUploading(true);

      await axiosInstance.post('/observation-docs/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      notify('File uploaded successfully!', 'success', 2500);
      
      // Refresh the grid after upload
      if (dataDetailGridRefA.current) {
        dataDetailGridRefA.current.instance.refresh();
      }
    } catch (error) {
      console.error('Upload error:', error);
      notify(`File upload failed: ${error.response?.data || error.message}`, 'error', 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (uploaderRef.current && uploaderRef.current.instance) {
      uploaderRef.current.instance._selectButtonClickHandler();
    }
  };

  const loadObservationsDocs = async () => {
    // Guard clause: don't load if popup is closed or no rowData
    if (!isVisible || !rowData?.id) {
      return [];
    }

    try {
      const response = await axiosInstance.get(`/observation-docs/getObservationDocDetailBy/${rowData.id}`);
      return response.data || [];
    } catch (error) {
      notify(`Error loading Observation Docs Data: ${error.message}`, 'error', 3000);
      return [];
    }
  };

  const deleteObservationsDocsNDetails = async (key) => {
    try {
      await axiosInstance.delete(`/observation-docs/delete/${key}`);
      notify('Observation document deleted successfully', 'success', 2000);
      
      // The grid will automatically refresh after successful deletion
      // No need to manually refresh here as CustomStore handles it
    } catch (error) {
      notify(`Error deleting document: ${error.response?.data || error.message}`, 'error', 3000);
      throw error;
    }
  };

  const handleViewPdfDocs = useCallback((rowData) => {
      setSelectedRowData(rowData);
      setIsPopupVisible(true);
    }, []);
  
    const handleClosePdfPopup = useCallback(() => {
      setIsPopupVisible(false);
      setSelectedRowData(null);
    }, []);
  
    const renderViewDocsPdfButton = useCallback((cellData) => {
      //console.log(cellData);
      
      return (
        <Button 
          text="View" 
          type="default" 
          stylingMode="contained" 
          onClick={() => handleViewPdfDocs(cellData.data)} 
        />
      );
    }, [handleViewPdfDocs]);

    const renderFileTypeIcon = useCallback((cellData) => {
        const filename = cellData.value?.toLowerCase() || '';
        let icon = 'doc';
        let color = '#666';
    
        if (filename.endsWith('.pdf')) {
          icon = 'pdffile';
          color = '#d32f2f';
        } else if (filename.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
          icon = 'image';
          color = '#1976d2';
        } else if (filename.match(/\.(docx?|rtf|txt)$/)) {
          icon = 'doc';
          color = '#2e7d32';
        } else if (filename.match(/\.(pptx?|ppt)$/)) {
          icon = 'column';
          color = '#d84315';
        } else if (filename.match(/\.(xlsx?|xls|csv)$/)) {
          icon = 'xlsxfile';
          color = '#00796b';
        }
    
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className={`dx-icon-${icon}`} style={{ color, fontSize: '18px' }} />
            <span>{cellData.value}</span>
          </div>
        );
      }, []);


  return (
    <Popup
      visible={isVisible}
      onHiding={onClose}
      dragEnabled={false}
      showTitle={true}
      title="Documents"
      width="80%"
      height="400px"
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '10px',
          marginRight: '0px',
        }}
      >
        <FileUploader
          ref={uploaderRef}
          labelText=""
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          uploadMode="useForm"
          multiple={false}
          onValueChanged={handleFileUpload}
          visible={false}
        />

        <Button
          icon="upload"
          text={uploading ? 'Uploading...' : 'Upload File'}
          hint="Upload File"
          onClick={handleUploadClick}
          stylingMode="contained"
          type="default"
          disabled={uploading}
          visible={sessionStorage.getItem("adminUser")==="true"?true:false}
        />
      </div>

      {dataSource && (
        <DataGrid 
          dataSource={dataSource}
          showBorders={true}
          showRowLines={true}
          ref={dataDetailGridRefA}
          allowColumnReordering={true}
          repaintChangesOnly={false}
          columnAutoWidth={true}
          keyExpr="id"
        >
          <Editing
            mode="row"
            allowDeleting={sessionStorage.getItem("adminUser")==="true"?true:false}
            allowUpdating={false}
            allowAdding={false}
            useIcons={true}
            popup={{
              title: 'Docs',
              showTitle: true,
              width: 700,
              height: 500,
            }}
          />
          <Paging enabled={true} />
          <Column 
            caption="S No" 
            width={50} 
            alignment="center" 
            allowEditing={false} 
            cellRender={(e) => getDetailSno(e, "A")} 
            formItem={{ visible: false }} 
          />
          <Column dataField="originalFilename" caption="File Name"  cellRender={renderFileTypeIcon}/>
          <Column
            dataField="createdDate"
            caption="Upload Date"
            dataType="datetime"
            format="yyyy-MM-dd HH:mm:ss a"
          />
          <Column dataField="fileStatus" caption="Status" dataType="boolean" />
           <Column 
                        caption="View PDF" 
                        width={130} 
                        alignment="center" 
                        allowEditing={false} 
                        cellRender={(e)=>renderViewDocsPdfButton(e)}
                      />
        </DataGrid>
        
      )}
      <ObservationPdfViewer
              isVisible={isPopupVisible}
              onClose={handleClosePdfPopup}
              rowData={selectedRowData}
            />
    </Popup>
  );
};

export default ObservationPopup;