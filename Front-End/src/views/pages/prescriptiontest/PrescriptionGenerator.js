import React, { Component } from 'react';
import { CCard, CCardBody, CRow, CCol, CButton } from '@coreui/react';
import SelectBox from 'devextreme-react/select-box';

const medicineList = [
  { id: 1, name: 'Dio Plus 10/160mg' },
  { id: 2, name: 'Tagipmet 50/500mg' },
  { id: 3, name: 'Risek 40mg' },
  { id: 4, name: 'Panadol 500mg' },
  { id: 5, name: 'Augmentin 625mg' },
  { id: 6, name: 'Calpol Syrup 120mg' },
];

class PrescriptionGenerator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedMedicine: null,
      prescriptionList: [],
    };
  }

  handleMedicineSelect = (medicine) => {
    if (medicine && !this.state.prescriptionList.find(m => m.id === medicine.id)) {
      this.setState((prev) => ({
        prescriptionList: [
          ...prev.prescriptionList,
          { ...medicine, morning: false, afternoon: false, evening: false },
        ],
        selectedMedicine: null,
      }));
    }
  };

  handleDosageChange = (id, field) => {
    this.setState((prev) => ({
      prescriptionList: prev.prescriptionList.map((m) =>
        m.id === id ? { ...m, [field]: !m[field] } : m
      ),
    }));
  };

  renderDosage = (med) => {
    const dosage = [
      med.morning ? 1 : 0,
      med.afternoon ? 1 : 0,
      med.evening ? 1 : 0,
    ].join('+');
    return dosage;
  };

  render() {
    return (
      <div className="p-4" style={{ backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
        <CCard
          style={{
            width: '210mm',
            minHeight: '297mm',
            margin: '0 auto',
            padding: '20mm',
            backgroundColor: 'white',
            boxShadow: '0 0 5px rgba(0,0,0,0.3)',
          }}
        >
          <CCardBody>
            <h4 className="text-center mb-4">Doctor's Prescription</h4>

            <CRow className="mb-3">
              <CCol md="8">
                <SelectBox
                  dataSource={medicineList}
                  displayExpr="name"
                  valueExpr={null} // ensures full object is returned
                  value={this.state.selectedMedicine}
                  placeholder="Search medicine..."
                  showClearButton={true}
                  searchEnabled={true}
                  searchExpr="name"
                  searchMode="contains"
                  onSelectionChanged={(e) => {
                    if (e.selectedItem) {
                      this.handleMedicineSelect(e.selectedItem);
                    }
                  }}
                />
              </CCol>
            </CRow>

            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Medicine Name</th>
                  <th>Morning</th>
                  <th>Afternoon</th>
                  <th>Evening</th>
                  <th>Dosage (1+0+1)</th>
                </tr>
              </thead>
              <tbody>
                {this.state.prescriptionList.map((med) => (
                  <tr key={med.id}>
                    <td>{med.name}</td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={med.morning}
                        onChange={() => this.handleDosageChange(med.id, 'morning')}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={med.afternoon}
                        onChange={() => this.handleDosageChange(med.id, 'afternoon')}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={med.evening}
                        onChange={() => this.handleDosageChange(med.id, 'evening')}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>{this.renderDosage(med)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {this.state.prescriptionList.length > 0 && (
              <CRow className="mt-4">
                <CCol className="text-end">
                  <CButton color="success">Save / Print Prescription</CButton>
                </CCol>
              </CRow>
            )}
          </CCardBody>
        </CCard>
      </div>
    );
  }
}

export default PrescriptionGenerator;
