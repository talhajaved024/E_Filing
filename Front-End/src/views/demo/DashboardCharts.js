import React, { Component } from 'react';
import {
  CRow,
  CCol,
  CCard,
  CCardHeader,
  CCardBody
} from '@coreui/react';
import ReChartsExmpl from './ReChartsExmpl'
import AreaReExample from './AreaReExample'
import RePieChart from './RePieChart'
import SyncChartExample from './SyncChartExample'
import {
  Chart,
  Series,
  ArgumentAxis,
  ValueAxis,
  Legend,
  Export,
  Tooltip,
  Label
} from 'devextreme-react/chart';

import 'devextreme/dist/css/dx.light.css';

// Sample data
const salesData = [
  { month: 'Jan', sales: 42000 },
  { month: 'Feb', sales: 38000 },
  { month: 'Mar', sales: 50000 },
  { month: 'Apr', sales: 61000 },
  { month: 'May', sales: 57000 },
  { month: 'Jun', sales: 68000 },
];

const deptDistribution = [
  { dept: 'Engineering', employees: 40 },
  { dept: 'HR', employees: 10 },
  { dept: 'Marketing', employees: 25 },
  { dept: 'Finance', employees: 15 },
  { dept: 'Product', employees: 10 },
];

const performanceData = [
  { month: 'Jan', productivity: 70 },
  { month: 'Feb', productivity: 72 },
  { month: 'Mar', productivity: 74 },
  { month: 'Apr', productivity: 78 },
  { month: 'May', productivity: 75 },
  { month: 'Jun', productivity: 80 },
];

class DashboardCharts extends Component {
  render() {
    return (
      <React.Fragment>
      <CRow className="mt-4">
        <CCol md={12} style={{marginBottom:'10px'}}>
        <CCard className="mt-4">
        <CCardHeader style={{textAlign:'center'}}>
          Below Is the Chart Example from DevExtreme Dependency
        </CCardHeader>
        </CCard>
        </CCol>
        {/* Sales Bar Chart */}
        <CCol md={6}>
          <CCard>
            <CCardHeader>📊 Monthly Sales (Bar Chart)</CCardHeader>
            <CCardBody>
              <Chart dataSource={salesData} title="Monthly Sales Overview">
                <ArgumentAxis />
                <ValueAxis />
                <Series valueField="sales" argumentField="month" type="bar" color="#3399ff" />
                <Legend visible={false} />
                <Tooltip enabled={true} />
                <Export enabled={true} />
              </Chart>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Department Pie Chart */}
        <CCol md={6}>
          <CCard>
            <CCardHeader>📈 Department Distribution (Pie Chart)</CCardHeader>
            <CCardBody>
              <Chart dataSource={deptDistribution} type="pie" title="Employees by Department">
                <Series
                  argumentField="dept"
                  valueField="employees"
                  type="pie"
                >
                  <Label visible={true} format="fixedPoint" customizeText={(e) => `${e.argumentText}: ${e.valueText}`} />
                </Series>
                <Legend horizontalAlignment="center" verticalAlignment="bottom" />
                <Tooltip enabled={true} />
                <Export enabled={true} />
              </Chart>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Productivity Line Chart */}
        <CCol md={6}>
          <CCard className="mt-4">
            <CCardHeader>📉 Productivity Trend (Line Chart)</CCardHeader>
            <CCardBody>
              <Chart dataSource={performanceData} title="Team Productivity (%)">
                <ArgumentAxis />
                <ValueAxis />
                <Series valueField="productivity" argumentField="month" type="line" color="#33cc33" />
                <Tooltip enabled={true} />
                <Legend visible={false} />
                <Export enabled={true} />
              </Chart>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Sales Area Chart */}
        <CCol md={6}>
          <CCard className="mt-4">
            <CCardHeader>📈 Sales Growth (Area Chart)</CCardHeader>
            <CCardBody>
              <Chart dataSource={salesData} title="Sales Growth Over Months">
                <ArgumentAxis />
                <ValueAxis />
                <Series valueField="sales" argumentField="month" type="area" color="#ffaa00" />
                <Tooltip enabled={true} />
                <Export enabled={true} />
              </Chart>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={12}>
        <CCard className="mt-4">
        <CCardHeader style={{textAlign:'center'}}>
          Below Is the Chart Example from RECHART Dependency
        </CCardHeader>
        </CCard>
        </CCol>
        <CCol md={6}>
          <CCard className="mt-4">
            {/* <CCardHeader>📈 Re Chart BarChart</CCardHeader> */}
            <CCardBody>
             <ReChartsExmpl/>
            </CCardBody>
          </CCard>
        </CCol>
         <CCol md={6}>
          <CCard className="mt-4">
            {/* <CCardHeader>📈 Re Chart BarChart</CCardHeader> */}
            <CCardBody>
             <AreaReExample/>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard className="mt-4">
            <CCardHeader style={{textAlign:'center'}}>
          RECHART PIE
        </CCardHeader>
            {/* <CCardHeader>📈 Re Chart BarChart</CCardHeader> */}
            <CCardBody>
             <RePieChart/>
            </CCardBody>
          </CCard>
        </CCol>

        
       
      </CRow>
      <CRow>
         <CCol md={6}>
          <CCard className="mt-4">
            <CCardHeader style={{textAlign:'center'}}>
          RECHART PIE
        </CCardHeader>
            {/* <CCardHeader>📈 Re Chart BarChart</CCardHeader> */}
            <CCardBody>
             <SyncChartExample/>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
     </React.Fragment>
    );
  }
}

export default DashboardCharts;
