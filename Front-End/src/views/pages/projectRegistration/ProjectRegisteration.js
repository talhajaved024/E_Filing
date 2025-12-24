import React, {useRef,  useState, useEffect, useCallback } from 'react';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import DataGrid, { Column, Editing, Lookup, MasterDetail } from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import notify from 'devextreme/ui/notify';
import axios from 'axios';
import 'devextreme/dist/css/dx.light.css';

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

const ProjectRegistration = () => {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    await Promise.all([loadMembers(), loadRoles()]);
    setIsLoading(false);
  };

  const loadMembers = async () => {
    try {
      const response = await axiosInstance.get('/members/getAllMembers');
      const membersData = Array.isArray(response.data) ? response.data : [];
      setMembers(membersData);
      return membersData;
    } catch (error) {
      console.error('Error loading members:', error);
      notify(`Error loading members: ${error.message}`, 'error', 3000);
      setMembers([]);
      return [];
    }
  };

  const loadRoles = async () => {
    try {
      const response = await axiosInstance.get('http://localhost:8080/Lookup/designation');
      const rolesData = Array.isArray(response.data) ? response.data : [];
      setRoles(rolesData);
      return rolesData;
    } catch (error) {
      console.error('Error loading roles:', error);
      notify(`Error loading roles: ${error.message}`, 'error', 3000);
      setRoles([]);
      return [];
    }
  };

  const loadProjects = async () => {
    try {
      const response = await axiosInstance.get('/projects/getAllProjectsGridData');
      //console.log(response.data);
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      notify(`Error loading projects: ${error.message}`, 'error', 3000);
      return [];
    }
  };

  const insertProject = async (values) => {
    try {
      const response = await axiosInstance.post('/projects/createNewProject', values);
      notify('Project created successfully', 'success', 2000);
      return response.data;
    } catch (error) {
      notify(`Error creating project: ${error.response?.data || error.message}`, 'error', 3000);
      throw error;
    }
  };

  const updateProject = async (key, values) => {
    try {
      const response = await axiosInstance.put(`/projects/updateProject/${key}`, values);
      notify('Project updated successfully', 'success', 2000);
      return response.data;
    } catch (error) {
      notify(`Error updating project: ${error.response?.data || error.message}`, 'error', 3000);
      throw error;
    }
  };

  const deleteProject = async (key) => {
    try {
      await axiosInstance.delete(`/projects/deleteProject/${key}`);
      notify('Project deleted successfully', 'success', 2000);
    } catch (error) {
      notify(`Error deleting project: ${error.response?.data || error.message}`, 'error', 3000);
      throw error;
    }
  };

  const loadProjectMembers = async (projectId) => {
    try {
      const response = await axiosInstance.get(`/project-members/project/${projectId}`);
      const projectMembers = Array.isArray(response.data) ? response.data : [];
      
      return projectMembers.map(pm => ({
        id: pm.id,
        member: pm.member?.id || pm.member,
        designation: pm.designation?.id || pm.designation,
        project: projectId,
      }));
    } catch (error) {
      console.error('Error loading project members:', error);
      notify(`Error loading project members: ${error.message}`, 'error', 3000);
      return [];
    }
  };

  const insertProjectMember = async (projectId, values) => {
    try {
      const payload = {
        project: projectId,
        member: values.member,
        designation: values.designation,
      };
      
      const response = await axiosInstance.post('/project-members/createProjectMember', payload);
      notify('Member added to project successfully', 'success', 2000);
      
      return {
        id: response.data.id,
        project: projectId,
        member: response.data.member?.id || response.data.member,
        designation: response.data.designation?.id || response.data.designation,
      };
    } catch (error) {
      const errorMsg = error.response?.data || error.message;
      notify(`Error adding member: ${errorMsg}`, 'error', 3000);
      throw error;
    }
  };

  const deleteProjectMember = async (key) => {
    try {
      await axiosInstance.delete(`/project-members/deleteProjectMemberbyId/${key}`);
      notify('Member removed from project successfully', 'success', 2000);
    } catch (error) {
      notify(`Error removing member: ${error.response?.data || error.message}`, 'error', 3000);
      throw error;
    }
  };

  const projectsDataSource = new CustomStore({
    key: 'id',
    load: loadProjects,
    insert: insertProject,
    update: updateProject,
    remove: deleteProject,
  });

  const createProjectMemberStore = useCallback((projectId) => {
    return new CustomStore({
      key: 'id',
      load: () => loadProjectMembers(projectId),
      insert: (values) => insertProjectMember(projectId, values),
      remove: deleteProjectMember,
    });
  }, []);

  // Create lookup data sources
  const membersDataSource = {
    store: {
      type: 'array',
      data: members,
      key: 'id'
    }
  };

  const rolesDataSource = {
    store: {
      type: 'array',
      data: roles,
      key: 'id'
    }
  };

  const renderProjectMembers = useCallback((project) => {
    const projectId = project.data.data.id;
    
    // Only render if data is loaded
    if (!members.length && !roles.length) {
      return <div>Loading members and roles...</div>;
    }
    
    return (
      <DataGrid
        dataSource={createProjectMemberStore(projectId)}
        showBorders={true}
        repaintChangesOnly={true}
        showRowLines={true}
        columnAutoWidth={true}
      >
        <Editing
          mode="popup"
          allowAdding={true}
          allowDeleting={true}
          allowUpdating={false}
          useIcons={true}
          popup={{
            title: 'Manage Project Member',
            showTitle: true,
            width: 500,
            height: 300,
          }}
        />
        <Column 
          dataField="member" 
          caption="Member"
          width={200}
        >
          {/* {members.length > 0 && ( */}
            <Lookup
              dataSource={membersDataSource}
              valueExpr="id"
              displayExpr="userFullName"
            />
          {/* )} */}
        </Column>
        <Column 
          dataField="designation" 
          caption="Role"
          width={200}
        >
          {roles.length > 0 && (
            <Lookup
              dataSource={rolesDataSource}
              valueExpr="id"
              displayExpr="userDesignation"
            />
          )}
        </Column>
      </DataGrid>
    );
  }, [members, roles, createProjectMemberStore, membersDataSource, rolesDataSource]);

  // Don't render the grid until data is loaded
  if (isLoading) {
    return (
      <CCard>
        <CCardHeader>
          <h5>Project Registration</h5>
        </CCardHeader>
        <CCardBody>
          <div>Loading...</div>
        </CCardBody>
      </CCard>
    );
  }

  return (
    <CCard>
      <CCardHeader>
        <h5>Project Registration</h5>
      </CCardHeader>
      <CCardBody>
        <DataGrid
          dataSource={projectsDataSource}
          showBorders={true}
          showRowLines={true}
          ref={dataDetailGridRefA}
          allowColumnReordering={true}
          repaintChangesOnly={true}
          columnAutoWidth={true}
        >
          <Editing
            mode="row"
            allowAdding={true}
            allowDeleting={true}
            allowUpdating={true}
            useIcons={true}
            popup={{
              title: 'Project Details',
              showTitle: true,
              width: 600,
              height: 400,
            }}
          />
          <Column
            caption="S No"
            width={80}
            alignment="center"
            allowEditing={false}
            cellRender={(e) => getDetailSno(e, "A")}
          />
          <Column 
            dataField="project" 
            caption="Project Name"
            validationRules={[{ type: 'required', message: 'Project name is required' }]}
          />
          <Column 
            dataField="project_description" 
            caption="Description"
          />
          <Column 
              dataField="is_active" 
              caption="Active"
              dataType="boolean"
              width={120}
              alignment="center"
              />
          <Column 
              dataField="createdOn" 
              caption="Date Created"
              dataType="datetime"
              format="dd-MM-yyyy hh:mm a"
              alignment="center"
            />
          <MasterDetail
            enabled={true}
            component={renderProjectMembers}
          />
        </DataGrid>
      </CCardBody>
    </CCard>
  );
};

export default ProjectRegistration;