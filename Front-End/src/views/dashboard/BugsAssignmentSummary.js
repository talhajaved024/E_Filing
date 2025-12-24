import React, { Component } from 'react';
import axios from 'axios';
import DateBox from 'devextreme-react/date-box';
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
//const UserID = parseInt(localStorage.getItem("UserID"));
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
    // notify('Session expired. Please login again.', 'error', 3000);
    console.error('Session expired. Please login again.');
  }
  return Promise.reject(error);
});

class BugsAssignmentSummary extends Component {
  constructor(props) {
    super(props);

    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM

    this.state = {
      memberId: parseInt(sessionStorage.getItem("UserID")),
      selectedMonth: currentMonth,
      selectedDate: currentDate, // Store as Date object for DateBox
      chartData: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.fetchSummary();
  }

  componentDidUpdate(prevProps) {
    // If memberId prop changes, refetch data
    if (prevProps.memberId !== this.props.memberId) {
      this.setState({ memberId: this.props.memberId }, () => {
        this.fetchSummary();
      });
    }
  }

  fetchSummary = async () => {
    const { memberId, selectedMonth } = this.state;
    
    this.setState({ loading: true });
    
    try {
        const response = await axiosInstance.get(`/getAllSummaryBy/${memberId}/${selectedMonth}`);
        const backendData = response.data;

        // Map backend → Rechart format
        const chartFormatted = backendData.map((item) => ({
          name: item.projectName,
          total: item.totalBugs,
          open: item.openBugs,
          inprogress: item.inProgress,
          onhold: item.onHold,
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
      // Use getFullYear and getMonth to avoid timezone issues
      const year = selected.getFullYear();
      const month = String(selected.getMonth() + 1).padStart(2, '0'); // getMonth() is 0-indexed
      const selectedMonth = `${year}-${month}`;
      
      console.log('Selected date:', selected);
      console.log('Formatted month:', selectedMonth);
      
      this.setState({ 
        selectedDate: selected,
        selectedMonth: selectedMonth 
      }, () => {
        this.fetchSummary();
      });
    }
  };

  render() {
    const { selectedDate, chartData, loading } = this.state;

    return (
        // <div style={{ padding: '0 15px' }}>
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
              <p>No data available for the selected month</p>
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
                   <Bar dataKey="overdue" fill="#bb706dff" name="Overdue" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CCardBody>
      </CCard>
    //   </div>
    );
  }
}

export default BugsAssignmentSummary;