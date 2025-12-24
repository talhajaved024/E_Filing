import React, {useRef,  useState, useEffect} from 'react';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import DataGrid, { Column, Editing, Lookup } from 'devextreme-react/data-grid';
import CustomStore from 'devextreme/data/custom_store';
import notify from 'devextreme/ui/notify';
import axios from 'axios';
import 'devextreme/dist/css/dx.light.css';

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

// Validation function
const validateIPAddress = (ip) => {
  if (!ip || ip.trim() === '') {
    return { isValid: true, message: '' }; // Allow empty if not required
  }

  // Regular expression for IPv4 validation
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  
  // Regular expression for IPv6 validation (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  
  if (ipv4Regex.test(ip) || ipv6Regex.test(ip)) {
    return { isValid: true, message: '' };
  }

  return { isValid: false, message: 'Please enter a valid IPv4 (e.g., 192.168.1.1) or IPv6 (e.g., 2001:db8::1) address' };
};

const User = () => {
  const [roles, setRoles] = useState([]);
  const [departments, setDepartment] = useState([]);
  const [organization, setOrganization] = useState([]);
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
    loadDepartment();
    loadOrganization();
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await axiosInstance.get('http://localhost:8080/Lookup/designation');
      setRoles(response.data || []);
    } catch (error) {
      notify(`Error loading roles: ${error.message}`, 'error', 3000);
      setRoles([]);
    }
  };

  const loadDepartment = async () => {
    try {
      const response = await axiosInstance.get('http://localhost:8080/Lookup/departments');
      setDepartment(response.data || []);
    } catch (error) {
      notify(`Error loading departments: ${error.message}`, 'error', 3000);
      setDepartment([]);
    }
  };

  const loadOrganization = async () => {
    try {
      const response = await axiosInstance.get('http://localhost:8080/Lookup/organizations');
      setOrganization(response.data || []);
    } catch (error) {
      notify(`Error loading organizations: ${error.message}`, 'error', 3000);
      setOrganization([]);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await axiosInstance.get('/users/getAllRegisteredUsers');
      //console.log(response.data);
      return response.data;
    } catch (error) {
      notify(`Error loading users: ${error.message}`, 'error', 3000);
      return [];
    }
  };

  const updateUser = async (key, values) => {
    //console.log(key, values);
    
    // Validate IP address before submitting
    if (values.user_device_ip) {
      const validation = validateIPAddress(values.user_device_ip);
      if (!validation.isValid) {
        notify(`Invalid IP address: ${validation.message}`, 'error', 3000);
        throw new Error(validation.message);
      }
    }
    
    try {
      const response = await axiosInstance.put(`/users/update/${key}`, values);
      notify('User updated successfully', 'success', 2000);
      return response.data;
    } catch (error) {
      notify(`Error updating user: ${error.response?.data || error.message}`, 'error', 3000);
      throw error;
    }
  };

  const deleteUser = async (key) => {
    try {
      await axiosInstance.delete(`/users/delete/${key}`);
      notify('User deleted successfully', 'success', 2000);
    } catch (error) {
      notify(`Error deleting user: ${error.response?.data || error.message}`, 'error', 3000);
      throw error;
    }
  };

  // Custom validation function for DataGrid
  const ipValidation = (params) => {
    const ip = params.value;
    if (!ip) return true; // Allow empty if not required
    
    const validation = validateIPAddress(ip);
    return validation.isValid;
  };

  const projectsDataSource = new CustomStore({
    key: 'id',
    load: loadUsers,
    update: updateUser,
    remove: deleteUser,
  });

  return (
    <CCard>
      <CCardHeader>
        <h5>User Management</h5>
      </CCardHeader>
      <CCardBody>
        <DataGrid
          dataSource={projectsDataSource}
          showBorders={true}
          showRowLines={true}
          ref={dataDetailGridRefA}
          allowColumnReordering={true}
          repaintChangesOnly={false}
          columnAutoWidth={true}
          keyExpr="id"
          onEditorPreparing={(e) => {
            // Add real-time validation for IP address field
            if (e.dataField === 'user_device_ip' && e.editorName === 'dxTextBox') {
              const originalOnValueChanged = e.editorOptions.onValueChanged;
              e.editorOptions.onValueChanged = function (args) {
                // Call original handler if it exists
                if (originalOnValueChanged) {
                  originalOnValueChanged.call(this, args);
                }
                
                // Perform real-time validation
                const validation = validateIPAddress(args.value);
                if (!validation.isValid && args.value) {
                  e.component.option('error', validation.message);
                } else {
                  e.component.option('error', null);
                }
              };
            }
          }}
        >
          <Editing
            mode="popup"
            allowDeleting={true}
            allowUpdating={true}
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
            formItem={{
              visible: false
            }}
          />
          <Column 
            dataField="user_full_name"  
            caption="Full Name"
            validationRules={[{ type: 'required' }]}
          />
          <Column  
            dataField="username"  
            caption="Username" 
            validationRules={[{ type: 'required' }]} 
          />
          <Column
            dataField="password"
            caption="Password"
            calculateCellValue={() => "********"}
            formItem={{
              visible: true,
              editorType: "dxTextBox",
              editorOptions: {
                mode: "password",
                placeholder: "Enter new password (leave empty to keep current)"
              }
            }}
          />
          <Column 
            dataField="email"  
            caption="Email"
            validationRules={[
              { type: 'required' },
              { type: 'email' }
            ]}
          />
          <Column 
            dataField="user_unique_id" 
            caption="User Unique Id"
            allowEditing={false}
          />
          <Column 
            dataField="organization_id" 
            caption="Organization" 
            width={200}
            validationRules={[{ type: 'required' }]} 
          >
            <Lookup 
              dataSource={organization} 
              valueExpr="id" 
              displayExpr="organizationName"
            />
          </Column>
          <Column 
            dataField="department_id" 
            caption="Department" 
            width={200}
            validationRules={[{ type: 'required' }]} 
          >
            <Lookup 
              dataSource={departments} 
              valueExpr="id" 
              displayExpr="userDepartment"
            />
          </Column>
          <Column 
            dataField="designation_id" 
            caption="Designation" 
            width={200}
            validationRules={[{ type: 'required' }]} 
          >
            <Lookup 
              dataSource={roles} 
              valueExpr="id" 
              displayExpr="userDesignation"
            />
          </Column>
          <Column 
            dataField="user_device_ip" 
            caption="User Device IP"
            validationRules={[
              {
                type: 'custom',
                validationCallback: ipValidation,
                message: 'Please enter a valid IPv4 (e.g., 192.168.1.1) or IPv6 (e.g., 2001:db8::1) address'
              }
            ]}
            editorOptions={{
              placeholder: "e.g., 192.168.1.1 or 2001:db8::1"
            }}
          />
          <Column 
            dataField="is_Admin_User" 
            caption="Admin User"
            dataType="boolean"
            width={120}
            alignment="center"
          />
        </DataGrid>
      </CCardBody>
    </CCard>
  );
};

export default User;