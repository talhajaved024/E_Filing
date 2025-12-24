import React, { Component } from 'react';
import axios from 'axios';
import DateBox from 'devextreme-react/date-box';
import SelectBox from 'devextreme-react/select-box'; // Added SelectBox
import 'devextreme/dist/css/dx.light.css';
import { CCard, CCardHeader, CCardBody } from '@coreui/react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Custom Tooltip Animation
const CustomTooltip = ({ active, payload, label }) => {
  return (
    <div
      style={{
        opacity: active ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: 'none',
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
        borderRadius: '12px',
        padding: '10px',
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {active && payload && payload.length ? (
        <>
          <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  display: 'inline-block',
                  backgroundColor: entry.color,
                  marginRight: 6,
                  borderRadius: 2,
                }}
              ></span>
              <span>{`${entry.name}: ${entry.value}`}</span>
            </div>
          ))}
        </>
      ) : null}
    </div>
  );
};

const API_URL = 'http://localhost:8080/api/bugs-reporting';

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
  if (error?.response?.status === 401) {
    console.error('Session expired. Please login again.');
  }
  return Promise.reject(error);
});

class AdminUserBugAssignment extends Component {
  constructor(props) {
    super(props);

    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);

    this.state = {
      memberId: parseInt(sessionStorage.getItem("UserID")),
      selectedMonth: currentMonth,
      selectedDate: currentDate,
      selectedProject: null, // New state for dropdown selection
      projects: [], // Array to hold project options
      chartData: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.fetchProjects(); // Fetch projects first
    this.fetchSummary();
  }

  componentDidUpdate(prevProps, prevState) {
    // Refetch when memberId, selectedMonth, OR selectedProject changes
    if (prevProps.memberId !== this.props.memberId || 
        prevState.selectedMonth !== this.state.selectedMonth ||
        prevState.selectedProject !== this.state.selectedProject) {
      this.fetchSummary();
    }
  }

  // Fetch available projects for dropdown
  fetchProjects = async () => {
    try {
      // Replace with your actual API endpoint to fetch projects
      const response = await axiosInstance.get('http://localhost:8080/api/projects/getAllProjects');
      const projectsData = response.data.map(project => ({
        id: project.id,
        name: project.projectName
      }));
      
      this.setState({ 
        projects: projectsData,
        selectedProject: projectsData.length > 0 ? projectsData[0].id : null 
      });
    } catch (error) {
      console.error("Error fetching projects:", error);
      this.setState({ projects: [] });
    }
  };

  fetchSummary = async () => {
    const {  selectedMonth, selectedProject } = this.state;
    
    // Don't fetch if no project selected
    if (!selectedProject) return;
    
    this.setState({ loading: true });
    
    try {
        // Updated API call to include projectId
        const response = await axiosInstance.get(
          `/getAllSummaryByProjectIdAndMonthYear/${selectedProject}/${selectedMonth}`
        );
        const backendData = response.data;

        const chartFormatted = backendData.map((item) => ({
          name: item.userName,
          total: item.totalBugs,
          open: item.openBugs,
          inprogress: item.inProgress,
          onhold: item.onHold,
           closed: item.closed,
          overdue: item.bugssOverdue,
        }));

        this.setState({ chartData: chartFormatted, loading: false });
    } catch (error) {
        console.error("Error fetching chart:", error);
        this.setState({ loading: false, chartData: [] });
    }
  };

  handleMonthChange = (e) => {
    if (e.value) {
      const selected = new Date(e.value);
      const year = selected.getFullYear();
      const month = String(selected.getMonth() + 1).padStart(2, '0');
      const selectedMonth = `${year}-${month}`;
      
      this.setState({ 
        selectedDate: selected,
        selectedMonth: selectedMonth 
      });
    }
  };

  // Handler for project selection change
  handleProjectChange = (e) => {
    this.setState({ selectedProject: e.value });
  };

  render() {
    const { selectedDate, selectedProject, projects, chartData, loading } = this.state;

    return (
      <CCard>
        <CCardHeader>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <h5 style={{ margin: 0 }}>Bugs Detail</h5>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              flexWrap: 'wrap' 
            }}>
              {/* Project Dropdown */}
              <div style={{ width: 200 }}>
                <SelectBox
                  dataSource={projects}
                  valueExpr="id"
                  displayExpr="name"
                  value={selectedProject}
                  onValueChanged={this.handleProjectChange}
                  placeholder="Select Project"
                  searchEnabled={true}
                  showClearButton={true}
                />
              </div>
              
              {/* Month/Year Date Filter */}
              <div style={{ width: 200 }}>
                <DateBox
                  type="date"
                  displayFormat="yyyy-MM"
                  value={selectedDate}
                  onValueChanged={this.handleMonthChange}
                  placeholder="Select Month"
                  calendarOptions={{
                    zoomLevel: 'year',
                    maxZoomLevel: 'year',
                    minZoomLevel: 'year'
                  }}
                />
              </div>
            </div>
          </div>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div style={{ 
              height: 400, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <p>Loading...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div style={{ 
              height: 400, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <p>No data available for the selected criteria</p>
            </div>
          ) : (
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  <Bar dataKey="total" fill="#007bff" name="Total" />
                  <Bar dataKey="open" fill="#257709ff" name="Open" />
                  <Bar dataKey="inprogress" fill="#17a2b8" name="In-Progress" />
                  <Bar dataKey="onhold" fill="#ffc107" name="On Hold" />
                  <Bar dataKey="closed" fill="#b8b3b36b" name="Closed" />
                  <Bar dataKey="overdue" fill="#bb706dff" name="Overdue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CCardBody>
      </CCard>
    );
  }
}

export default AdminUserBugAssignment;