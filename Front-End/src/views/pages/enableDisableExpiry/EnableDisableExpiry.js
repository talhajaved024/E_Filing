import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import DataGrid, { Column, Editing, Lookup } from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';
// import Button from 'devextreme-react/button';
// import TagBox from 'devextreme-react/tag-box';
// import SelectBox from 'devextreme-react/select-box';
import notify from 'devextreme/ui/notify';
// import DateBox from 'devextreme-react/date-box';
import axios from 'axios';
import 'devextreme/dist/css/dx.light.css';
//import ObservationPopup from './ObservationPopup';

const API_URL = `${process.env.REACT_APP_API_URL}/api/enable-disable-expiry`;

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


const EnableDisableExpiry = () => {
//   const [members, setMembers] = useState([]);
//   const [projectList, setProjectList] = useState([]);
//   const [isPopupVisible, setIsPopupVisible] = useState(false);
//   const [selectedRowData, setSelectedRowData] = useState(null);
  const [projectID, setProjectID] = useState(null);



  const dataDetailGridRefA = useRef(null);


  
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



  const loadEnableDisable = async () => {
    try {
      const response = await axiosInstance.get('/getAll');
      return response.data;
    } catch (error) {
      notify(`Error loading data: ${error.message}`, 'error', 3000);
    }
  };


  const insertEnableDisable = async (values) => {
    //const UserID = parseInt(sessionStorage.getItem("UserID"));
    try {
      const response = await axiosInstance.post('/createNew', values);
      notify('Created successfully', 'success', 2000);
      return response.data;
    } catch (error) {
      notify(`Error creating : ${error.response?.data || error.message}`, 'error', 3000);
      throw error;
    }
  };

  const updateEnableDisable = async (key, values) => {
    try {
      const response = await axiosInstance.patch(`/patchData/${key}`, values);
      notify('Updated successfully', 'success', 2000);
      return response.data;
    } catch (error) {
      notify(`Error updating : ${error.response?.data || error.message}`, 'error', 3000);
      throw error;
    }
  };

//   const loadObservations = async () => {
//   // Don't load if no project is selected
//   if (!projectID) {
//     return [];
//   }
  
//   try {
//     const formatDateTime = (date) => {
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
//       return `${year}-${month}-${day} 00:00:00`;
//     };

//     const formatDateTimeTo = (date) => {
//       const year = date.getFullYear();
//       const month = String(date.getMonth() + 1).padStart(2, '0');
//       const day = String(date.getDate()).padStart(2, '0');
//       return `${year}-${month}-${day} 23:59:59`;
//     };

//     const fromDateStr = formatDateTime(dateFrom);
//     const toDateStr = formatDateTimeTo(dateTo);
//     const adminUser = sessionStorage.getItem("adminUser");
//     const UserID = sessionStorage.getItem("UserID");

//     if (adminUser === "true") {
//       const response = await axiosInstance.get('/observations/getObservationsByDateRange', {
//         params: {
//           from: fromDateStr,
//           to: toDateStr,
//           projectId: projectID
//         }
//       });
//       return response.data;
//     } else {
//       const response = await axiosInstance.get('/observations/getObservationsByDateRangeAndMembers', {
//         params: {
//           from: fromDateStr,
//           to: toDateStr,
//           memberId: parseInt(UserID),
//           projectId: projectID
//         }
//       });
//       return response.data;
//     }
//   } catch (error) {
//     notify(`Error loading observations: ${error.message}`, 'error', 3000);
//     return [];
//   }
// };
  const deleteEnableDisable = async (key) => {
    try {
      await axiosInstance.delete(`/deleteData/${key}`);
      notify('deleted successfully', 'success', 2000);
    } catch (error) {
      notify(`Error deleting : ${error.response?.data || error.message}`, 'error', 3000);
      throw error;
    }
  };

  const EnableDisableDataSource = new CustomStore({
    key: 'id',
    load: loadEnableDisable,
    insert: insertEnableDisable,
    update: updateEnableDisable,
    remove: deleteEnableDisable,
  });

  useEffect(() => {
    if (dataDetailGridRefA.current) {
      dataDetailGridRefA.current.instance.refresh();
    }
  }, []);



  return (
    <>
      <CCard>
        <CCardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 style={{ margin: 0 }}>Enable/Disable Expiry</h5>
           
          </div>
        </CCardHeader>
        <CCardBody>
          <DataGrid
            dataSource={EnableDisableDataSource}
            showBorders={true}
            showRowLines={true}
            ref={dataDetailGridRefA}
            allowColumnReordering={true}
            repaintChangesOnly={false}
            columnAutoWidth={true}
           // onEditorPreparing={onEditorPreparing}
            keyExpr="id"
          >
            <Editing
              mode="popup"
              allowDeleting={true}
              allowUpdating={true}
              allowAdding={true}
              useIcons={true}
              popup={{
                title: 'User Details',
                showTitle: true,
                width: 700,
                height: 500,
              }}
            />
            
            <Column 
              caption="S No" 
              width={50} 
              alignment="center" 
              allowEditing={false} 
              cellRender={(e) => getDetailSno(e, "A")} 
              formItem={{ visible: false }} 
            />
            <Column 
              dataField="projectName" 
              caption="Project Name" 
              validationRules={[{ type: 'required' }]} 
            />
            <Column 
              dataField="dateInitiated" 
              caption="Date Initiated" 
              width={200} 
              dataType={"datetime"}
              format={"yyyy-MM-dd HH:MM:ss"}
              validationRules={[{ type: 'required' }]}
            >
              
            </Column>
            
         
            
          
            
           <Column 
             dataField="isTrialPeriod" 
                caption="On Trial"
                dataType="boolean"
                width={120}
                alignment="center"
                />

                 <Column 
                    dataField="isExpired" 
                        caption="is Expired"
                        dataType="boolean"
                        width={120}
                        alignment="center"
                />
          </DataGrid>
        </CCardBody>
      </CCard>

      
    </>
  );
};

export default EnableDisableExpiry;