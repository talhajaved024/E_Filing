import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import DataGrid, { Column, Editing, Lookup } from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import DateBox from 'devextreme-react/date-box';
import TaskAssignmentPopup from './TaskAssignmentPopup';
import Button from 'devextreme-react/button';
import notify from 'devextreme/ui/notify';
import axios from 'axios';
import 'devextreme/dist/css/dx.light.css';

// ---------- Configure your API base here ----------
const API_URL = `${process.env.REACT_APP_API_URL}/api`;
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

// ---------- Component ----------
const TaskAssignment = () => {
  const [members, setMembers] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const dataDetailGridRefA = useRef(null);

  // --- REFS FOR CASCADING LOOKUPS (Prevents Re-renders) ---
  const activeMemberEditorRef = useRef(null); // Holds the "Assigned To" editor instance
  const projectMembersCache = useRef({});     // Caches API responses

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
      const mapped = (res.data || []).map((m) => {
        if (m.userId !== undefined) {
          return { id: m.userId, userFullName: m.userName || "" };
        }
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

  // --- CASCADING LOOKUP LOGIC ---
  const onEditorPreparing = useCallback((e) => {
    if (e.parentType !== "dataRow") return;

    // 1. PROJECT (Parent)
    if (e.dataField === "projectId") {
      e.editorOptions.onValueChanged = async (args) => {
        // A. Set Project Value
        e.setValue(args.value);
        
        // B. Clear "Assigned To" Value (Child)
        // We set it to null so the user is forced to pick a new valid member
        e.component.cellValue(e.row.rowIndex, "memberId", null);

        // C. Update Child Options Directy
        if (args.value) {
          // Check Cache
          let membersData = projectMembersCache.current[args.value];
          
          if (!membersData) {
            // Fetch if not cached
            membersData = await loadMembersByProject(args.value);
            projectMembersCache.current[args.value] = membersData;
          }

          // Direct DOM Update: Update DataSource of the Child Editor
          if (activeMemberEditorRef.current) {
            activeMemberEditorRef.current.option("dataSource", membersData);
            activeMemberEditorRef.current.option("disabled", false);
          }
        } else {
          // If Project cleared, clear child options
          if (activeMemberEditorRef.current) {
            activeMemberEditorRef.current.option("dataSource", []);
            activeMemberEditorRef.current.option("disabled", true);
          }
        }
      };
    }

    // 2. MEMBER (Child)
    if (e.dataField === "memberId") {
      // Capture the instance so Parent can talk to it
      e.editorOptions.onInitialized = (args) => {
        activeMemberEditorRef.current = args.component;
      };

      const currentProjectId = e.row.data.projectId;

      // Configure Initial State
      if (currentProjectId) {
         // If we have cache, use it immediately
         if (projectMembersCache.current[currentProjectId]) {
             e.editorOptions.dataSource = projectMembersCache.current[currentProjectId];
         } else {
             // Load async without blocking render
             loadMembersByProject(currentProjectId).then(data => {
                 projectMembersCache.current[currentProjectId] = data;
                 if (activeMemberEditorRef.current) {
                     activeMemberEditorRef.current.option("dataSource", data);
                 }
             });
             e.editorOptions.dataSource = []; // Placeholder
         }
         e.editorOptions.disabled = false;
      } else {
         // No project selected yet
         e.editorOptions.dataSource = [];
         e.editorOptions.disabled = true;
         e.editorOptions.placeholder = "Select Project first";
      }
    }
  }, []); // No dependencies needed

  // --- Data operations ---
  const loadTasks = async () => {
    try {
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
      const adminUser = sessionStorage.getItem("adminUser");
      const UserID = sessionStorage.getItem("UserID");

      if (adminUser === "true") {
        const response = await axiosInstance.get('/task-assignments/getAssignmentByDateRange', {
          params: { from: fromDateStr, to: toDateStr }
        });
        return response.data;
      } else {
        const response = await axiosInstance.get('/task-assignments/getTaskAssignmentByDateRangeAndMembers', {
          params: { from: fromDateStr, to: toDateStr, memberId: parseInt(UserID) }
        });
        return response.data;
      }
    } catch (error) {
      notify(`Error loading Tasks: ${error.message}`, 'error', 3000);
      return [];
    }
  };

  const insertTasks = async (values) => {
    const UserID = parseInt(sessionStorage.getItem("UserID"));
    try {
      const response = await axiosInstance.post('/task-assignments/createTaskAssignment', values, {
        headers: { 'UserID': UserID }
      });
      notify('Task created successfully', 'success', 2000);
      return response.data;
    } catch (error) {
       // ... existing error handling ...
       notify('Error creating task', 'error', 3000);
       throw error;
    }
  };

  const updateTasks = async (key, values) => {
    try {
      const response = await axiosInstance.patch(`/task-assignments/patchTaskAssignmentField/${key}`, values);
      notify('Task updated successfully', 'success', 2000);
      return response.data;
    } catch (error) {
      notify('Error updating task', 'error', 3000);
      throw error;
    }
  };

  const deleteTask = async (key) => {
    try {
      await axiosInstance.delete(`/task-assignments/deleteTaskAssignment/${key}`);
      notify('Task deleted', 'success', 1500);
    } catch (err) {
      notify(`Delete failed: ${err.message}`, 'error', 3000);
      throw err;
    }
  };

  useEffect(() => {
    if (dataDetailGridRefA.current) {
      dataDetailGridRefA.current.instance.refresh();
    }
  }, [dateFrom, dateTo]);

  const getPriorityColor = (priorityId) => {
    switch (priorityId) {
      case 1: return '#ff4444'; 
      case 2: return '#ffa500'; 
      case 3: return '#008000'; 
      default: return '#f0f0f0';
    }
  };

  const getPriorityTextColor = (priorityId) => { return '#ffffff'; };
  const getPriorityName = (priorityId) => {
    const priority = priorityOptions.find(p => p.id === priorityId);
    return priority ? priority.name : '';
  };

  const getStatusColor = (statusId) => {
    switch (statusId) {
      case 1: return '#007bff'; 
      case 2: return '#17a2b8'; 
      case 3: return '#ffc107'; 
      case 4: return '#6c757d'; 
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

  const TasksStore = new CustomStore({
    key: 'id',
    insert: insertTasks,
    update: updateTasks,
    load: loadTasks,
    remove: deleteTask,
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

  const handleDateFromChange = useCallback((e) => {
    setDateFrom(e.value);
    dataDetailGridRefA.current?.instance.refresh();
  }, []);

  const handleDateToChange = useCallback((e) => {
    setDateTo(e.value);
    dataDetailGridRefA.current?.instance.refresh();
  }, []);

  return (
    <>
      <CCard>
        <CCardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 style={{ margin: 0 }}>Task Assignment</h5>
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
            dataSource={TasksStore}
            showBorders
            showRowLines
            ref={dataDetailGridRefA}
            columnAutoWidth
            allowColumnResizing
            keyExpr="id"
            onEditorPreparing={onEditorPreparing} // <--- ATTACH THE LOGIC HERE
          >
            <Editing
              mode="row"
              allowDeleting={sessionStorage.getItem("adminUser") === "true"}
              allowUpdating={true}
              allowAdding={sessionStorage.getItem("adminUser") === "true"}
              useIcons={true}
              popup={{
                title: 'Task Details',
                showTitle: true,
                width: 700,
                height: 500,
              }}
            />

            <Column
              caption="S No"
              width={50}
              alignment="center"
              allowEditing={sessionStorage.getItem("adminUser") === "true"}
              cellRender={(e) => getDetailSno(e, "A")}
              formItem={{ visible: false }}
            />

            <Column 
              dataField="task" 
              caption="Task" 
              allowEditing={sessionStorage.getItem("adminUser") === "true"} 
              width={300} 
              validationRules={[{ type: 'required' }]} 
            />
            
            <Column
              dataField="projectId"
              caption="Project"
              alignment="center"
              allowEditing={sessionStorage.getItem("adminUser") === "true"}
              width={200}
              validationRules={[{ type: 'required' }]}
            >
              <Lookup
                dataSource={projectList}
                valueExpr="id"
                displayExpr="projectName"
              />
            </Column>

            <Column
              dataField="memberId"
              caption="Assigned To"
              alignment="center"
              width={150}
              visible={sessionStorage.getItem("adminUser") === "true"}
              allowEditing={sessionStorage.getItem("adminUser") === "true"}
              validationRules={[{ type: 'required' }]}
            >
              {/* This Lookup handles the display in the Grid Cell (Read Mode) */}
              <Lookup
                dataSource={members}
                valueExpr="id"
                displayExpr="userFullName"
              />
            </Column>

            <Column
              dataField="priorityId"
              caption="Priority"
              alignment="center"
              allowEditing={sessionStorage.getItem("adminUser") === "true"}
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
              allowEditing={sessionStorage.getItem("adminUser") === "true"} 
              width={180} 
              dataType={"datetime"} 
              format={"yyyy-MM-dd HH:MM:ss a"} 
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

      <TaskAssignmentPopup
        isVisible={isPopupVisible}
        onClose={handleClosePopup}
        rowData={selectedRowData}
      />
    </>
  );
};

export default TaskAssignment;