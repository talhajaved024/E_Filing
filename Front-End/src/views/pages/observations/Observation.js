import React, { useRef, useState, useEffect, useCallback } from 'react';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import DataGrid, { Column, Editing, Lookup } from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import Button from 'devextreme-react/button';
import TagBox from 'devextreme-react/tag-box';
import SelectBox from 'devextreme-react/select-box';
import notify from 'devextreme/ui/notify';
import DateBox from 'devextreme-react/date-box';
import axios from 'axios';
import 'devextreme/dist/css/dx.light.css';
import ObservationPopup from './ObservationPopup';

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


const Observations = () => {
  const [members, setMembers] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [projectID, setProjectID] = useState(null);

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

  useEffect(() => {
  
  if (projectList.length > 0 && projectID === null) {
    
    setProjectID(projectList[0].id);
  }
}, [projectList]);

  const loadMembers = async () => {
    try {
      const response = await axiosInstance.get('/members/getAllMembers');
      setMembers(response.data);
    } catch (error) {
      notify(`Error loading members: ${error.message}`, 'error', 3000);
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
      notify(`Error loading Observations List: ${error.message}`, 'error', 3000);
      setProjectList([]);
    }
  };

  const insertObservation = async (values) => {
    const UserID = parseInt(sessionStorage.getItem("UserID"));
    try {
      const response = await axiosInstance.post('/observations/addNewObservations', values, {
        headers: {
          'UserID': UserID
        }
      });
      notify('observations created successfully', 'success', 2000);
      return response.data;
    } catch (error) {
      notify(`Error creating observations: ${error.response?.data || error.message}`, 'error', 3000);
      throw error;
    }
  };

  const updateObservations = async (key, values) => {
    try {
      const response = await axiosInstance.put(`/observations/updateObservationsBy/${key}`, values);
      notify('Project updated successfully', 'success', 2000);
      return response.data;
    } catch (error) {
      notify(`Error updating project: ${error.response?.data || error.message}`, 'error', 3000);
      throw error;
    }
  };

  const loadObservations = async () => {
  // Don't load if no project is selected
  if (!projectID) {
    return [];
  }
  
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
      const response = await axiosInstance.get('/observations/getObservationsByDateRange', {
        params: {
          from: fromDateStr,
          to: toDateStr,
          projectId: projectID
        }
      });
      return response.data;
    } else {
      const response = await axiosInstance.get('/observations/getObservationsByDateRangeAndMembers', {
        params: {
          from: fromDateStr,
          to: toDateStr,
          memberId: parseInt(UserID),
          projectId: projectID
        }
      });
      return response.data;
    }
  } catch (error) {
    notify(`Error loading observations: ${error.message}`, 'error', 3000);
    return [];
  }
};
  const deleteObservations = async (key) => {
    try {
      await axiosInstance.delete(`/observations/deleteObservationsBy/${key}`);
      notify('User deleted successfully', 'success', 2000);
    } catch (error) {
      notify(`Error deleting user: ${error.response?.data || error.message}`, 'error', 3000);
      throw error;
    }
  };

  const ObservationsDataSource = new CustomStore({
    key: 'id',
    load: loadObservations,
    insert: insertObservation,
    update: updateObservations,
    remove: deleteObservations,
  });

  useEffect(() => {
    if (dataDetailGridRefA.current) {
      dataDetailGridRefA.current.instance.refresh();
    }
  }, [dateFrom, dateTo, projectID]);

  const renderAssigneesCell = useCallback((cellData) => {
    let assigneeIds = cellData.value;
    
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

  const handleProjectChange = useCallback((e) => {
    setProjectID(e.value);
    dataDetailGridRefA.current?.instance.refresh();
  }, []);

  const onEditorPreparing = useCallback((e) => {
    if (e.parentType !== "dataRow") return;

    if (e.dataField === "projectId") {
      e.editorOptions.onValueChanged = async (args) => {
        e.setValue(args.value);
        e.component.cellValue(e.row.rowIndex, "membersId", []);

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
      };
    }

    if (e.dataField === "membersId") {
      e.editorName = "dxTagBox";
      
      let currentValue = e.row.data.membersId; 
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
      e.editorOptions.disabled = !currentProjectId;

      e.editorOptions.onValueChanged = (args) => {
        e.setValue(args.value || []); 
      };
    }
  }, [loadMembersByProject]);

  return (
    <>
      <CCard>
        <CCardHeader>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h5 style={{ margin: 0 }}>Observations</h5>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '14px', fontWeight: '500' }}>Project:</label>
                <SelectBox
                  dataSource={projectList}
                  value={projectID}
                  onValueChanged={handleProjectChange}
                  valueExpr="id"
                  displayExpr="projectName"
                  placeholder="All Projects"
                  showClearButton={true}
                  width={200}
                  stylingMode="outlined"
                />
              </div>
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
            dataSource={ObservationsDataSource}
            showBorders={true}
            showRowLines={true}
            ref={dataDetailGridRefA}
            allowColumnReordering={true}
            repaintChangesOnly={false}
            columnAutoWidth={true}
            onEditorPreparing={onEditorPreparing}
            keyExpr="id"
          >
            <Editing
              mode="popup"
              allowDeleting={sessionStorage.getItem("adminUser") === "true"}
              allowUpdating={sessionStorage.getItem("adminUser") === "true"}
              allowAdding={sessionStorage.getItem("adminUser") === "true"}
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
              dataField="observationSummary" 
              caption="Observation Summary" 
              validationRules={[{ type: 'required' }]} 
            />
            <Column 
              dataField="projectId" 
              caption="Projects" 
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
              dataField="membersId" 
              caption="Assignee(s)"
              width={200}
              cellRender={renderAssigneesCell}
              visible={sessionStorage.getItem("adminUser") === "true"}
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
            
            <Column 
              dataField="observationDateTime" 
              caption="Observation Date" 
              allowEditing={true} 
              dataType={"datetime"}
              format={"yyyy-MM-dd HH:MM:ss"}
              width={180} 
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

      <ObservationPopup
        isVisible={isPopupVisible}
        onClose={handleClosePopup}
        rowData={selectedRowData}
      />
    </>
  );
};

export default Observations;