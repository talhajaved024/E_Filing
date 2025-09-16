import React, { Component } from 'react';
import { DataGrid, Column, Editing, FilterRow, HeaderFilter, Paging, Pager, SearchPanel, Sorting, Grouping, GroupPanel, Export, ColumnChooser, Summary, TotalItem, Lookup } from 'devextreme-react/data-grid';
import 'devextreme/dist/css/dx.light.css';
import { CCard, CCardBody, CCardHeader} from '@coreui/react';
import { CButton } from '@coreui/react';
//import VideoPlayer from './VideoPlayer';
import CIcon from '@coreui/icons-react';
import { cilPrint } from '@coreui/icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faVideo } from '@fortawesome/free-solid-svg-icons';
import DateBox from 'devextreme-react/date-box';
import moment from 'moment';
// import 'lenis/dist/lenis.css'
// import Lenis from '@studio-freight/lenis'

import VideoPlayerBasic from './VideoPlayerBasic';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];
// Sample lookup data
const departmentLookup = [
  { id: 1, name: 'Engineering' },
  { id: 2, name: 'Marketing' },
  { id: 3, name: 'HR' },
  { id: 4, name: 'Finance' },
];

// Generate 100+ rows of sample data
const generateMockData = () => {
  const names = ['Ali', 'Sara', 'John', 'Maya', 'Bilal', 'Linda'];
  const roles = ['Engineer', 'Manager', 'Intern', 'Director'];
  const data = [];

  for (let i = 1; i <= 120; i++) {
    data.push({
      id: i,
      name: names[i % names.length],
      role: roles[i % roles.length],
      salary: Math.floor(30000 + Math.random() * 70000),
      deptId: (i % 4) + 1,
      hireDate: new Date(2020, i % 12, (i % 28) + 1),
    });
  }

  return data;
};



class DemoGrid extends Component {
  constructor(props) {
    super(props);
    // this.lenis = null
    // this.rafId = null
    this.state = {
      employees: generateMockData(),
      selectedDate:  moment().startOf('month').format('YYYY-MM-DD')
    };
  }


// componentDidMount(){
//    this.lenis = new Lenis({
//       duration: 1.2,       // Adjust scroll speed
//       smooth: true,        // Enable smooth scroll
//       direction: 'vertical', // 'vertical' or 'horizontal'
//     })

//     const raf = (time) => {
//       this.lenis.raf(time)
//       this.rafId = requestAnimationFrame(raf)
//     }
//     this.rafId = requestAnimationFrame(raf)
  
// }

//  componentWillUnmount() {
//     // Cancel RAF loop
//     if (this.rafId) cancelAnimationFrame(this.rafId)
//     // Destroy lenis instance
//     if (this.lenis) this.lenis.destroy()
//   }
handleDateChange = (e) => {
    this.setState({ selectedDate: e.value });
  }



handlePrint = () => {
  if (this.dataGridRef && this.dataGridRef.instance) {
    const grid = this.dataGridRef.instance;
    const dataSource = grid.getDataSource();
    const items = dataSource.items();
    const columns = grid.getVisibleColumns();

    // Check if editing (add/update/delete) is enabled
    const isEditingEnabled = grid.option('editing') && (
      grid.option('editing').allowUpdating ||
      grid.option('editing').allowAdding ||
      grid.option('editing').allowDeleting
    );

    // Build HTML table
    let tableHTML = "<table>";
    tableHTML += "<thead><tr>";

    // Build headers
    columns.forEach((col, index) => {
      if (isEditingEnabled && index === columns.length - 1) return;
      tableHTML += `<th>${col.caption}</th>`;
    });
    tableHTML += "</tr></thead><tbody>";

    // Build rows
    items.forEach((row) => {
      tableHTML += "<tr>";
      columns.forEach((col, index) => {
        if (isEditingEnabled && index === columns.length - 1) return;

        let cellValue = row[col.dataField];

        // If column has a lookup, get display text
        if (col.lookup && Array.isArray(col.lookup.dataSource)) {
          const lookupItem = col.lookup.dataSource.find(
            item => item[col.lookup.valueExpr] === cellValue
          );
          cellValue = lookupItem ? lookupItem[col.lookup.displayExpr] : cellValue;
        }

        tableHTML += `<td>${cellValue !== undefined ? cellValue : ''}</td>`;
      });
      tableHTML += "</tr>";
    });
    tableHTML += "</tbody></table>";

    // Open print window
    const printWindow = window.open("", "", "width=900,height=650");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(`
        <html>
          <head>
            <title>DataGrid Print Preview</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h3 { text-align: center; margin-bottom: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 1px solid #000; padding: 8px; text-align: left; }
              th { background-color: #f0f0f0; }
            </style>
          </head>
          <body>
            <h3>DataGrid Preview</h3>
            ${tableHTML}
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      alert("Failed to open print window. Please allow pop-ups for this site.");
    }
  }
};
  render() {
    return (
        
      <div>
        <CCard>
        

        <style>
          {`
            .dx-header-row > td {
              background-color: #3d473dff !important; /* Light green */
              color: white
              
            }
          `}
        </style>
            <CCardHeader>
                <h3>DevExtreme DataGrid Demo</h3>
                <CButton color="primary" onClick={this.handlePrint}>
                <CIcon icon={cilPrint} className="me-2" />
                Print DataGrid
              </CButton>
              <div style={{float:'right'}}>
                <DateBox
                  value={this.state.selectedDate}
                  onValueChanged={this.handleDateChange}
                  type="date"
                  displayFormat="dd-MM-yyyy"
                />
              </div>
            </CCardHeader>
            <CCardBody>
        <DataGrid
         ref={(ref) => { this.dataGridRef = ref; }}
          dataSource={this.state.employees}
          keyExpr="id"
          showBorders={true}
          columnAutoWidth={true}
          allowColumnResizing={true}
          rowAlternationEnabled={true}
          focusedRowEnabled={true}
          hoverStateEnabled={true}
        >
          <Sorting mode="multiple" />
          <SearchPanel visible={true} width={240} placeholder="Search..." />
          <FilterRow visible={true} />
          <HeaderFilter visible={true} />
          <Grouping autoExpandAll={false} />
          <GroupPanel visible={true} />
          <Paging defaultPageSize={10} />
          <Pager
            showPageSizeSelector={true}
            allowedPageSizes={[10, 20, 50, 100]}
            showInfo={true}
          />
          <Editing
            mode="popup"
            allowUpdating={true}
            allowAdding={true}
            allowDeleting={true}
          />
          <Export enabled={true} allowExportSelectedData={true} />
          <ColumnChooser enabled={true} mode="select" />

          <Column dataField="id" caption="ID" width={70} />
          <Column dataField="name" caption="Full Name" />
          <Column dataField="role" caption="Role" />
          <Column
            dataField="deptId"
            caption="Department"
          >
            <Lookup dataSource={departmentLookup} valueExpr="id" displayExpr="name" />
          </Column>
          <Column
            dataField="salary"
            caption="Salary"
            dataType="number"
            format="currency"
          />
          <Column
            dataField="hireDate"
            caption="Hire Date"
            dataType="date"
            format={'dd-MM-yyyy'}
          />

          <Summary>
            <TotalItem column="salary" summaryType="sum" valueFormat="currency" />
            <TotalItem column="id" summaryType="count" />
          </Summary>
        </DataGrid>
        </CCardBody>
        </CCard>
        <CCard>
          <CCardHeader>
           
           <h2 style={{ display: "flex", alignItems: "center", gap: "10px", color: "#333" }}>
            <FontAwesomeIcon icon={faVideo} size="xs" color="#02152aff" />
            Video Player Integration Demo With React Library
          </h2>
          </CCardHeader>
          <CCardBody>
              <VideoPlayerBasic/>
          </CCardBody>
        </CCard>
        <CCard>
           <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    width={500}
                    height={300}
                    data={data}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pv" stackId="a" fill="#8884d8" />
                    <Bar dataKey="amt" stackId="a" fill="#82ca9d" />
                    <Bar dataKey="uv" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
        </CCard>
      </div>
    );
  }
}

export default DemoGrid;
