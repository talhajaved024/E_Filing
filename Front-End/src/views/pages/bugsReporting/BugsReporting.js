// TaskAssignments.jsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import DataGrid, { Column, Editing, Lookup, PatternRule } from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import TagBox from 'devextreme-react/tag-box';
import DateBox from 'devextreme-react/date-box';
import axios from 'axios';
import BugsReportingDocsPopup from './BugsReportingDocsPopup';
import 'devextreme/dist/css/dx.light.css';

// ---------- Configure your API base here ----------
const API_URL = 'http://localhost:8080/api';
const adminUser = sessionStorage.getItem("adminUser");
      const UserID = sessionStorage.getItem("UserID");
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("refreshToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));
axiosInstance.interceptors.response.use((res) => res, (error) => {
  if (error?.response?.status === 401) notify('Session expired. Please login again.', 'error', 3000);
  return Promise.reject(error);
});

const priorityOptions = [
  { id: 1, name: 'Critical' },
  { id: 2, name: 'Standard' },
  { id: 3, name: 'Deferrable' }
];

const statusOptions = [
  { id: 1, name: 'Open' },
  { id: 2, name: 'In Progress' },
  { id: 3, name: 'On Hold / Needs Discussion' },
  { id: 4, name: 'Closed' }
];

// New: Reporting Unit options (customize as needed)
const reportingUnitOptions = [
  { id: 1, name: 'Development' },
  { id: 2, name: 'QA/Testing' },
  { id: 3, name: 'Operations' },
  { id: 4, name: 'Support' },
  { id: 5, name: 'Management' }
];

// ---------- Component ----------
const BugsReporting = () => {
  const [members, setMembers] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
   const activeTagBoxRef = useRef(null);
  const projectMembersCache = useRef({});
  const dataDetailGridRefA = useRef(null);

  const [dateFrom, setDateFrom] = useState(() => {
       const date = new Date();
       return new Date(date.getFullYear(), date.getMonth(), 1);
     });
     
     const [dateTo, setDateTo] = useState(() => {
       const date = new Date();
       return new Date(date.getFullYear(), date.getMonth() + 1, 0);
     });

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

  useEffect(() => {
    loadProjectList();
    loadMembers();
  }, []);

  // Load members for avatar/name lookup
  const loadMembers = async () => {
    try {
      const r = await axiosInstance.get('/members/getAllMembers');
      setMembers(r.data || []);
    } catch (err) {
      notify(`Error loading members: ${err.message}`, 'error', 3000);
    }
  };

  const loadMembersByProject = async (projectID) => {
    
    try {
      const res = await axiosInstance.get(`/members/getMembersByProject/${projectID}`);
      // Backend returns VxAllMembersByProjectEntity with userId,userName
      const mapped = (res.data || []).map((m) => {
        if (m.userId !== undefined) {
          return { id: m.userId, userFullName: m.userName || "" };
        }
        // fallback if full user objects
        return { id: m.id, userFullName: m.userFullName || m.userName || "" };
      });
      return mapped;
    } catch (err) {
      notify(`Error loading members by project: ${err.message}`, "error", 3000);
      return [];
    }
  };

  const loadProjectList = async () => {
    try {
      const response = await axiosInstance.get('http://localhost:8080/api/projects/getAllProjects');
      setProjectList(response.data || []);
    } catch (error) {
      notify(`Error loading Projects List: ${error.message}`, 'error', 3000);
      setProjectList([]);
    }
  };

  // --- Data operations (change endpoints to match your backend) ---
  const loadBugReport = async () => {
   try {
      // Format dates to 'YYYY-MM-DD HH:MM:SS' format for backend
      const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day} 00:00:00`;
      };

      const formatDateTimeTo = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day} 23:59:59`;
      };

      const fromDateStr = formatDateTime(dateFrom);
      const toDateStr = formatDateTimeTo(dateTo);
       

      if (adminUser==="true" || UserID==="33") {
      const response = await axiosInstance.get('/bugs/getBugReportByDateRange', {
        params: {
          from: fromDateStr,
          to: toDateStr
        }
      });
      return response.data;
    }
    else{

      const response = await axiosInstance.get('/bugs/getBugReportByDateRangeAndMembers', {
        params: {
          from: fromDateStr,
          to: toDateStr,
          memberId:parseInt(UserID)
        }
      });
      return response.data;


    }
    } catch (error) {
      notify(`Error loading Bug Report: ${error.message}`, 'error', 3000);
      return [];
    }
  };

  const insertBugReport = async (values) => {
    try {
      const response = await axiosInstance.post('/bugs/createNewBugReport', values, {
          headers: {
            'UserID': UserID
          }});
      notify('Task created successfully', 'success', 2000);
      return response.data;
    } catch (error) {
      console.error("=== ERROR DETAILS ===");
      console.error("Full error:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      
      let errorMessage = 'Error creating Task: ';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage += error.response.data;
        } else if (error.response.data.message) {
          errorMessage += error.response.data.message;
        } else {
          errorMessage += JSON.stringify(error.response.data);
        }
      } else {
        errorMessage += error.message;
      }
      
      notify(errorMessage, 'error', 3000);
      throw error;
    }
  };

  const updateBugReport = async (key, values) => {
    try {
      const response = await axiosInstance.patch(`/bugs/updateBugReport/${key}`, values);
      notify('Task updated successfully', 'success', 2000);
      return response.data;
    } catch (error) {
      let errorMessage = 'Error updating Task: ';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage += error.response.data;
        } else if (error.response.data.message) {
          errorMessage += error.response.data.message;
        } else {
          errorMessage += JSON.stringify(error.response.data);
        }
      } else {
        errorMessage += error.message;
      }

      notify(errorMessage, 'error', 3000);
      throw error;
    }
  };

  const deleteBugReport = async (key) => {
    try {
      await axiosInstance.delete(`/bugs/deleteBugReport/${key}`);
      notify('Task deleted', 'success', 1500);
    } catch (err) {
      notify(`Delete failed: ${err.response?.data || err.message}`, 'error', 3000);
      throw err;
    }
  };

  const getPriorityColor = (priorityId) => {
    switch(priorityId) {
      case 1: return '#ff4444'; // Critical - Red
      case 2: return '#ffa500'; // Standard - Orange
      case 3: return '#008000'; // Deferrable - Green
      default: return '#f0f0f0';
    }
  };

  const getPriorityTextColor = (priorityId) => {
    return [1, 2].includes(priorityId) ? '#ffffff' : '#ffffff';
  };

  const getPriorityName = (priorityId) => {
    const priority = priorityOptions.find(p => p.id === priorityId);
    return priority ? priority.name : '';
  };

  const getStatusColor = (statusId) => {
    switch(statusId) {
      case 1: return '#007bff'; // Open - Blue
      case 2: return '#17a2b8'; // In Progress - Teal
      case 3: return '#ffc107'; // On Hold / Needs Discussion - Yellow
      case 4: return '#6c757d'; // Closed - Gray
      default: return '#f0f0f0';
    }
  };

  const getStatusTextColor = (statusId) => {
    return [1, 2, 4].includes(statusId) ? '#ffffff' : '#000000';
  };

  const getStatusName = (statusId) => {
    const status = statusOptions.find(s => s.id === statusId);
    return status ? status.name : '';
  };

  useEffect(() => {
        if (dataDetailGridRefA.current) {
          dataDetailGridRefA.current.instance.refresh();
        }
      }, [dateFrom, dateTo]);

  const BugsStore = new CustomStore({
    key: 'id',
    insert: insertBugReport,
    update: updateBugReport,
    load: loadBugReport,
    remove: deleteBugReport,
  });

  const handleViewDocs = useCallback((rowData) => {
    setSelectedRowData(rowData);
    setIsPopupVisible(true);
  }, []);

  const handleClosePopup = useCallback(() => {
    setIsPopupVisible(false);
    setSelectedRowData(null);
  }, []);

  const renderViewDocsButton = useCallback((cellData) => {
    return (
      <Button 
        text="Open" 
        type="default" 
        stylingMode="contained" 
        onClick={() => handleViewDocs(cellData.data)} 
      />
    );
  }, [handleViewDocs]);


  const renderAssigneesCell = useCallback((cellData) => {
      let assigneeIds = cellData.value;
      
      // Handle backward compatibility - convert single ID to array
      if (assigneeIds && !Array.isArray(assigneeIds)) {
        assigneeIds = [assigneeIds];
      }
      
      if (!assigneeIds || assigneeIds.length === 0) {
        return <span style={{ color: '#999' }}>No assignees</span>;
      }
      
      const assigneeNames = assigneeIds.map(id => {
        const member = members.find(m => m.id === id);
        return member ? member.userFullName : '';
      }).filter(name => name);
      
      return <span>{assigneeNames.join(', ')}</span>;
    }, [members]);

  //   const AssigneeEditor = useCallback((cellInfo) => {
  //   const { data, setValue } = cellInfo;
  //   let currentValue = data.member;
    
  //   // Handle backward compatibility
  //   if (currentValue && !Array.isArray(currentValue)) {
  //     currentValue = [currentValue];
  //   }


    
    
  //   return (
  //     <TagBox
  //       dataSource={members}
  //       defaultValue={currentValue || []}
  //       displayExpr="userFullName"
  //       valueExpr="id"
  //       showSelectionControls={true}
  //       searchEnabled={true}
  //       placeholder="Select assignees..."
  //       showClearButton={true}
  //       stylingMode="outlined"
  //       onValueChanged={(e) => {
  //         setValue(e.value || []);
  //       }}
  //     />
  //   );
  // }, [members]);

  const AssigneeTagBoxEditor = ({ value, setValue, projectId }) => {
  const [projectMembers, setProjectMembers] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (projectId) {
        const list = await loadMembersByProject(projectId);
        if (isMounted) setProjectMembers(list);
      } else {
        setProjectMembers([]); // EMPTY if no project selected
      }
    };

    load();

    return () => { isMounted = false; };
  }, [projectId]);

  return (
    <TagBox
      dataSource={projectMembers}
      value={value || []}
      valueExpr="id"
      displayExpr="userFullName"
      showSelectionControls={true}
      searchEnabled={true}
      placeholder="Select assignees..."
      showClearButton={true}
      onValueChanged={(e) => setValue(e.value)}
    />
  );
};

 const handleDateFromChange = useCallback((e) => {
      setDateFrom(e.value);
      // You can add filtering logic here
      dataDetailGridRefA.current?.instance.refresh();
    }, []);
  
    const handleDateToChange = useCallback((e) => {
      setDateTo(e.value);
      // You can add filtering logic here
      dataDetailGridRefA.current?.instance.refresh();
    }, []);
  
// const onEditorPreparing = useCallback((e) => {
//   if (e.parentType !== "dataRow") return;

//   if (e.dataField === "projectId") {
//     e.editorOptions.onValueChanged = async (args) => {
//       e.setValue(args.value);
//       e.component.cellValue(e.row.rowIndex, "memberId", []);

//       if (args.value) {
//         let membersData = projectMembersCache.current[args.value];
        
//         if (!membersData) {
//           try {
//              membersData = await loadMembersByProject(args.value);
//              projectMembersCache.current[args.value] = membersData;
//           } catch (err) {
//              console.error(err);
//              membersData = [];
//           }
//         }

//         if (activeTagBoxRef.current) {
//           activeTagBoxRef.current.option("dataSource", membersData);
//         }
//       } else {
//         if (activeTagBoxRef.current) {
//           activeTagBoxRef.current.option("dataSource", []);
//         }
//       }
//     };
//   }

 
//   if (e.dataField === "memberId") {
//     e.editorName = "dxTagBox";
    
   
//     let currentValue = e.row.data.membersId; 
//     if (!Array.isArray(currentValue)) {
//         currentValue = currentValue ? [currentValue] : [];
//     }
//     e.editorOptions.value = currentValue;

//     e.editorOptions.onInitialized = (args) => {
//       activeTagBoxRef.current = args.component;
//     };

//     const currentProjectId = e.row.data.projectId;
//     if (currentProjectId) {
     
//       if (projectMembersCache.current[currentProjectId]) {
//         e.editorOptions.dataSource = projectMembersCache.current[currentProjectId];
//       } else {
       
//         loadMembersByProject(currentProjectId).then(data => {
//             projectMembersCache.current[currentProjectId] = data;
//             if (activeTagBoxRef.current) {
//                 activeTagBoxRef.current.option("dataSource", data);
//             }
//         });
//         e.editorOptions.dataSource = [];
//       }
//     } else {
//       e.editorOptions.dataSource = [];
//     }

//     e.editorOptions.valueExpr = "id";
//     e.editorOptions.displayExpr = "userFullName";
//     e.editorOptions.showSelectionControls = true;
//     e.editorOptions.searchEnabled = true;
//     e.editorOptions.showClearButton = true;
//     e.editorOptions.placeholder = currentProjectId ? "Select assignees..." : "Select a project first";
    
    
//     e.editorOptions.disabled = !currentProjectId;

//     e.editorOptions.onValueChanged = (args) => {
//        e.setValue(args.value || []); 
//     };
//   }
// }, [loadMembersByProject]);

const onEditorPreparing = useCallback((e) => {
  if (e.parentType !== "dataRow") return;

  
  const isEditable = typeof e.setValue === "function";

  
  if (e.dataField === "projectId") {
    

    e.editorOptions.onValueChanged = async (args) => {
      try {
        
        e.setValue(args.value);
        
        e.component.cellValue(e.row.rowIndex, "memberId", []);

        if (args.value) {
          let membersData = projectMembersCache.current[args.value];
          
          if (!membersData) {
            try {
               membersData = await loadMembersByProject(args.value);
               projectMembersCache.current[args.value] = membersData;
            } catch (err) {
               console.error(err);
               membersData = [];
            }
          }

          if (activeTagBoxRef.current) {
            activeTagBoxRef.current.option("dataSource", membersData);
          }
        } else {
          if (activeTagBoxRef.current) {
            activeTagBoxRef.current.option("dataSource", []);
          }
        }
      } catch (error) {
        
        if (error.name === 'TypeError' && error.message.includes('setValue')) {
          notify('This field is disabled and cannot be changed.', 'warning', 1500);
        } else {
          
          throw error; 
        }
      }
    };
    
  }

  
  if (e.dataField === "memberId") {
    e.editorName = "dxTagBox";
    
    

    let currentValue = e.row.data.memberId; 
    if (!Array.isArray(currentValue)) {
        currentValue = currentValue ? [currentValue] : [];
    }
    e.editorOptions.value = currentValue;

    e.editorOptions.onInitialized = (args) => {
      activeTagBoxRef.current = args.component;
    };

    const currentProjectId = e.row.data.projectId;
    
    if (currentProjectId) {
      if (projectMembersCache.current[currentProjectId]) {
        e.editorOptions.dataSource = projectMembersCache.current[currentProjectId];
      } else {
        loadMembersByProject(currentProjectId).then(data => {
            projectMembersCache.current[currentProjectId] = data;
            if (activeTagBoxRef.current) {
                activeTagBoxRef.current.option("dataSource", data);
            }
        });
        e.editorOptions.dataSource = [];
      }
    } else {
      e.editorOptions.dataSource = [];
    }
    
    
    e.editorOptions.valueExpr = "id";
    e.editorOptions.displayExpr = "userFullName";
    e.editorOptions.showSelectionControls = true;
    e.editorOptions.searchEnabled = true;
    e.editorOptions.showClearButton = true;
    e.editorOptions.placeholder = currentProjectId ? "Select assignees..." : "Select a project first";
    e.editorOptions.disabled = !isEditable || !currentProjectId;

    
    e.editorOptions.onValueChanged = (args) => {
      try {
        
         e.setValue(args.value || []); 
      } catch (error) {
        
        if (error.name === 'TypeError' && error.message.includes('setValue')) {
          notify('This field is disabled and cannot be changed.', 'warning', 1500);
        } else {
          
          throw error;
        }
      }
    };
  }
}, [loadMembersByProject]); 

  return (
    <>
      <CCard>
        <CCardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 style={{ margin: 0 }}>{sessionStorage.getItem("adminUser")==="true"?"Assign Bugs":"Assigned Bugs"}</h5>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Date From:</label>
                <DateBox
                  value={dateFrom}
                  onValueChanged={handleDateFromChange}
                  type="date"
                  displayFormat="yyyy-MM-dd"
                  width={150}
                  stylingMode="outlined"
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Date To:</label>
                <DateBox
                  value={dateTo}
                  onValueChanged={handleDateToChange}
                  type="date"
                  displayFormat="yyyy-MM-dd"
                  width={150}
                  stylingMode="outlined"
                />
              </div>
            </div>
          </div>
        </CCardHeader>
        <CCardBody>
          <DataGrid
            dataSource={BugsStore}
            showBorders
            showRowLines
            ref={dataDetailGridRefA}
            columnAutoWidth
            allowColumnResizing
            keyExpr="id"
            loadingTimeout={100}
            onEditorPreparing={onEditorPreparing}
            repaintChangesOnly={false}
          >
             <Editing
                          mode="popup"
                          allowDeleting={sessionStorage.getItem("adminUser")==="true"?true:false}
                          allowUpdating={true}
                          allowAdding={sessionStorage.getItem("adminUser")==="true"?true:false || UserID==="33"}
                          useIcons={true}
                          popup={{
                            title: 'Bug Detail',
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
              dataField="task" 
              caption="Bug Detail" 
              width={300} 
              allowEditing={sessionStorage.getItem("adminUser")==="true"?true:false}
              validationRules={[{ type: 'required' }]}
            />

            <Column 
              dataField="projectId" 
              caption="Project" 
              alignment="center"
              allowEditing={sessionStorage.getItem("adminUser")==="true"?true:false}
              width={200} 
              validationRules={[{ type: 'required' }]}
            >
              <Lookup 
                dataSource={projectList} 
                valueExpr="id" 
                displayExpr="projectName" 
              />
            </Column>

            {/* <Column 
              dataField="memberId" 
              caption="Assigned To" 
              alignment="center"
              width={150}
              validationRules={[{ type: 'required' }]} 
            >
              <Lookup 
                dataSource={members} 
                valueExpr="id" 
                displayExpr="userFullName"
              />
            </Column> */}


            {/* <Column 
                          dataField="memberId" 
                          caption="Assignee(s)"
                          width={200}
                          allowEditing={sessionStorage.getItem("adminUser")==="true"?true:false}
                          visible={sessionStorage.getItem("adminUser")==="true"?true:false}
                          cellRender={renderAssigneesCell}
                          alignment="center"
                           validationRules={[{ type: 'required' }]}
                          editorOptions={{
                            dataSource: members,
                            displayExpr: "userFullName",
                            valueExpr: "id", 
                            showSelectionControls: true,
                            searchEnabled: true,
                            placeholder: "Select assignees...",
                            showClearButton: true
                          }}
                          formItem={{
                            editorType: "dxTagBox"
                          }}
                        /> */}


                         <Column 
                                      dataField="memberId" 
                                      caption="Assignee(s)"
                                      width={200}
                                      cellRender={renderAssigneesCell}
                                     allowEditing={sessionStorage.getItem("adminUser")==="true"?true:false}
                                      visible={sessionStorage.getItem("adminUser")==="true"?true:false}
                                       validationRules={[{ type: 'required' }]}
                                      editorOptions={{
                                        dataSource: members,
                                        displayExpr: "userFullName",
                                        valueExpr: "id", 
                                        showSelectionControls: true,
                                        searchEnabled: true,
                                        placeholder: "Select assignees...",
                                        showClearButton: true
                                      }}
                                      formItem={{
                                        editorType: "dxTagBox"
                                      }}
                                    />

            {/* NEW: Reporting Unit Column */}
            <Column 
              dataField="reportingUnit" 
              caption="Reporting Unit" 
              alignment="center"
              width={150}
              allowEditing={sessionStorage.getItem("adminUser")==="true"?true:false}
              validationRules={[{ type: 'required' }]}
            >
              {/* <Lookup 
                dataSource={reportingUnitOptions} 
                valueExpr="id" 
                displayExpr="name"
              /> */}
            </Column>

            {/* NEW: Reported By Column */}
            <Column 
              dataField="reportedBy" 
              caption="Reported By" 
              alignment="center"
              allowEditing={sessionStorage.getItem("adminUser")==="true"?true:false}
              width={180}
              validationRules={[{ type: 'required' }]}
            />

            {/* NEW: Reporter Contact Column with Phone Number Pattern */}
            <Column
              dataField="reporterContact"
              caption="Reporter Contact"
              allowEditing={sessionStorage.getItem("adminUser")==="true"?true:false}
              alignment="center"
              width={150}
              calculateCellValue={(data) => {
              const v = data.reporterContact?.toString();
              if (!v || v.length !== 7) return v;
              return `${v.substring(0, 3)}-${v.substring(3)}`;
            }}
              validationRules={[
                { type: 'required' }
              ]}
              editorOptions={{
                mask: '000-0000',
                maskInvalidMessage: 'Phone number must be in format: XXX-XXXX',
                placeholder: 'XXX-XXXX'
              }}
            />


            <Column 
              dataField="priorityId" 
              caption="Priority"
              allowEditing={sessionStorage.getItem("adminUser")==="true"?true:false}
              alignment="center"
              validationRules={[{ type: 'required' }]} 
              cellRender={({ data }) => (
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  backgroundColor: getPriorityColor(data.priorityId),
                  color: getPriorityTextColor(data.priorityId),
                  fontWeight: 'bold'
                }}>
                  {getPriorityName(data.priorityId)}
                </div>
              )}
            >
              <Lookup
                dataSource={priorityOptions}
                valueExpr="id"
                displayExpr="name"
              />
            </Column>

            <Column 
              dataField="statusId" 
              caption="Task Status"
              alignment="center"
              width={230} 
              validationRules={[{ type: 'required' }]} 
              cellRender={({ data }) => (
                <div style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  textAlign: 'center',
                  backgroundColor: getStatusColor(data.statusId),
                  color: getStatusTextColor(data.statusId),
                  fontWeight: 'bold'
                }}>
                  {getStatusName(data.statusId)}
                </div>
              )}
            >
              <Lookup
                dataSource={statusOptions}
                valueExpr="id"
                displayExpr="name"
              />
            </Column>

            <Column 
              dataField="dueDate" 
              caption="Due Date" 
              alignment="center" 
              
              allowEditing={sessionStorage.getItem("adminUser")==="true"?true:false} 
              width={180} 
              dataType={"datetime"} 
              format={"yyyy-MM-dd HH:MM:ss a"}
              validationRules={[{ type: 'required' }]}
            />

            <Column 
              caption="Related Docs" 
              width={130} 
              alignment="center" 
              allowEditing={false} 
              cellRender={(e) => renderViewDocsButton(e)}
            />
          </DataGrid>
        </CCardBody>
      </CCard>
      
      <BugsReportingDocsPopup
        isVisible={isPopupVisible}
        onClose={handleClosePopup}
        rowData={selectedRowData}
      />
    </>
  );
};

export default BugsReporting;