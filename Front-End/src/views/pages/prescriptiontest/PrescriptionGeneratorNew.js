import React, { useState, useRef } from 'react';
import { Printer, Download, Plus, Trash2, Eye, Search } from 'lucide-react';
import {
  CContainer,
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CButton,
  CTable,
  CInputGroup,
  CInputGroupText
} from '@coreui/react';

// Dummy medicine database
const MEDICINE_DATABASE = [
  { name: 'Paracetamol', dosage: '500mg' },
  { name: 'Paracetamol', dosage: '650mg' },
  { name: 'Ibuprofen', dosage: '400mg' },
  { name: 'Ibuprofen', dosage: '600mg' },
  { name: 'Amoxicillin', dosage: '250mg' },
  { name: 'Amoxicillin', dosage: '500mg' },
  { name: 'Azithromycin', dosage: '250mg' },
  { name: 'Azithromycin', dosage: '500mg' },
  { name: 'Ciprofloxacin', dosage: '500mg' },
  { name: 'Ciprofloxacin', dosage: '750mg' },
  { name: 'Metformin', dosage: '500mg' },
  { name: 'Metformin', dosage: '850mg' },
  { name: 'Omeprazole', dosage: '20mg' },
  { name: 'Omeprazole', dosage: '40mg' },
  { name: 'Aspirin', dosage: '75mg' },
  { name: 'Aspirin', dosage: '100mg' },
  { name: 'Atorvastatin', dosage: '10mg' },
  { name: 'Atorvastatin', dosage: '20mg' },
  { name: 'Amlodipine', dosage: '5mg' },
  { name: 'Amlodipine', dosage: '10mg' },
  { name: 'Losartan', dosage: '25mg' },
  { name: 'Losartan', dosage: '50mg' },
  { name: 'Cetirizine', dosage: '10mg' },
  { name: 'Montelukast', dosage: '10mg' },
  { name: 'Salbutamol', dosage: '100mcg' },
];

export default function PrescriptionGenerator() {
  const [showPreview, setShowPreview] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState({
    name: 'Dr. John Smith',
    specialization: 'General Physician',
    qualification: 'MBBS, MD',
    registration: 'REG12345',
    contact: '+1 234-567-8900',
    clinic: 'City Medical Center',
    address: '123 Medical Street, New York, NY 10001'
  });

  const [patientInfo, setPatientInfo] = useState({
    name: '',
    age: '',
    gender: 'Male',
    contact: '',
    address: ''
  });

  const [medications, setMedications] = useState([
    { id: 1, name: '', dosage: '', frequency: '', duration: '', instructions: '', searchQuery: '', showSuggestions: false }
  ]);

  const [diagnosis, setDiagnosis] = useState('');
  const [advice, setAdvice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const printRef = useRef();

  const addMedication = () => {
    setMedications([...medications, {
      id: Date.now(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
      searchQuery: '',
      showSuggestions: false
    }]);
  };

  const removeMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  const updateMedication = (id, field, value) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, [field]: value } : med
    ));
  };

  const handleMedicineSearch = (id, query) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, searchQuery: query, showSuggestions: query.length > 0 } : med
    ));
  };

  const selectMedicine = (id, medicine) => {
    setMedications(medications.map(med =>
      med.id === id ? { 
        ...med, 
        name: medicine.name, 
        dosage: medicine.dosage,
        searchQuery: `${medicine.name} ${medicine.dosage}`,
        showSuggestions: false 
      } : med
    ));
  };

  const getFilteredMedicines = (query) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return MEDICINE_DATABASE.filter(med => 
      med.name.toLowerCase().includes(lowerQuery) ||
      med.dosage.toLowerCase().includes(lowerQuery)
    ).slice(0, 8);
  };

  // Simple print function - prints exactly what's on screen
  const handlePrint = () => {
    window.print();
  };

  const generatePreview = () => {
    setShowPreview(true);
  };

  return (
    <CContainer fluid className="min-vh-100 bg-light p-4">
      {!showPreview ? (
        // Form Section
        <CContainer>
          <CCard className="shadow">
            <CCardBody className="p-4">
              <h1 className="text-primary mb-4">Prescription Generator</h1>

              {/* Doctor Info */}
              <div className="mb-4">
                <h2 className="h4 mb-3">Doctor Information</h2>
                <CRow className="g-3">
                  <CCol md={6}>
                    <CFormInput
                      placeholder="Doctor Name"
                      value={doctorInfo.name}
                      onChange={(e) => setDoctorInfo({...doctorInfo, name: e.target.value})}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      placeholder="Specialization"
                      value={doctorInfo.specialization}
                      onChange={(e) => setDoctorInfo({...doctorInfo, specialization: e.target.value})}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      placeholder="Qualification"
                      value={doctorInfo.qualification}
                      onChange={(e) => setDoctorInfo({...doctorInfo, qualification: e.target.value})}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      placeholder="Registration Number"
                      value={doctorInfo.registration}
                      onChange={(e) => setDoctorInfo({...doctorInfo, registration: e.target.value})}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      placeholder="Contact Number"
                      value={doctorInfo.contact}
                      onChange={(e) => setDoctorInfo({...doctorInfo, contact: e.target.value})}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      placeholder="Clinic Name"
                      value={doctorInfo.clinic}
                      onChange={(e) => setDoctorInfo({...doctorInfo, clinic: e.target.value})}
                    />
                  </CCol>
                  <CCol md={12}>
                    <CFormInput
                      placeholder="Clinic Address"
                      value={doctorInfo.address}
                      onChange={(e) => setDoctorInfo({...doctorInfo, address: e.target.value})}
                    />
                  </CCol>
                </CRow>
              </div>

              {/* Patient Info */}
              <div className="mb-4">
                <h2 className="h4 mb-3">Patient Information</h2>
                <CRow className="g-3">
                  <CCol md={6}>
                    <CFormInput
                      placeholder="Patient Name"
                      value={patientInfo.name}
                      onChange={(e) => setPatientInfo({...patientInfo, name: e.target.value})}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      type="number"
                      placeholder="Age"
                      value={patientInfo.age}
                      onChange={(e) => setPatientInfo({...patientInfo, age: e.target.value})}
                    />
                  </CCol>
                  <CCol md={6}>
                    <CFormSelect
                      value={patientInfo.gender}
                      onChange={(e) => setPatientInfo({...patientInfo, gender: e.target.value})}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </CFormSelect>
                  </CCol>
                  <CCol md={6}>
                    <CFormInput
                      placeholder="Contact Number"
                      value={patientInfo.contact}
                      onChange={(e) => setPatientInfo({...patientInfo, contact: e.target.value})}
                    />
                  </CCol>
                </CRow>
              </div>

              {/* Diagnosis */}
              <div className="mb-4">
                <h2 className="h4 mb-3">Diagnosis</h2>
                <CFormTextarea
                  placeholder="Enter diagnosis..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Medications */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2 className="h4">Medications</h2>
                  <CButton color="primary" onClick={addMedication}>
                    <Plus size={20} /> Add Medicine
                  </CButton>
                </div>
                {medications.map((med) => (
                  <CCard key={med.id} className="mb-3 bg-light">
                    <CCardBody>
                      <CRow className="g-3">
                        {/* Medicine Search */}
                        <CCol md={12}>
                          <div className="position-relative">
                            <CInputGroup>
                              <CInputGroupText>
                                <Search size={20} />
                              </CInputGroupText>
                              <CFormInput
                                placeholder="Search medicine name..."
                                value={med.searchQuery}
                                onChange={(e) => handleMedicineSearch(med.id, e.target.value)}
                                onFocus={(e) => handleMedicineSearch(med.id, e.target.value)}
                              />
                            </CInputGroup>
                            {med.showSuggestions && (
                              <div className="position-absolute w-100 bg-white border rounded shadow-lg mt-1 max-h-48 overflow-y-auto z-10">
                                {getFilteredMedicines(med.searchQuery).length > 0 ? (
                                  getFilteredMedicines(med.searchQuery).map((medicine, idx) => (
                                    <div
                                      key={idx}
                                      onClick={() => selectMedicine(med.id, medicine)}
                                      className="px-4 py-2 hover-bg-light cursor-pointer border-bottom"
                                    >
                                      <span className="fw-medium">{medicine.name}</span>
                                      <span className="text-muted ms-2">{medicine.dosage}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-4 py-2 text-muted">No medicines found</div>
                                )}
                              </div>
                            )}
                          </div>
                        </CCol>
                        
                        <CCol md={6}>
                          <CFormInput
                            placeholder="Frequency (e.g., Twice daily)"
                            value={med.frequency}
                            onChange={(e) => updateMedication(med.id, 'frequency', e.target.value)}
                          />
                        </CCol>
                        <CCol md={6}>
                          <CFormInput
                            placeholder="Duration (e.g., 7 days)"
                            value={med.duration}
                            onChange={(e) => updateMedication(med.id, 'duration', e.target.value)}
                          />
                        </CCol>
                        <CCol md={12}>
                          <CFormInput
                            placeholder="Instructions (e.g., After meals)"
                            value={med.instructions}
                            onChange={(e) => updateMedication(med.id, 'instructions', e.target.value)}
                          />
                        </CCol>
                      </CRow>
                      {medications.length > 1 && (
                        <CButton
                          color="danger"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedication(med.id)}
                          className="mt-2"
                        >
                          <Trash2 size={16} /> Remove
                        </CButton>
                      )}
                    </CCardBody>
                  </CCard>
                ))}
              </div>

              {/* Advice */}
              <div className="mb-4">
                <h2 className="h4 mb-3">Additional Advice</h2>
                <CFormTextarea
                  placeholder="Enter additional advice or follow-up instructions..."
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Date */}
              <div className="mb-4">
                <h2 className="h4 mb-3">Date</h2>
                <CFormInput
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="d-flex gap-3">
                <CButton color="primary" onClick={generatePreview}>
                  <Eye size={20} /> Generate Prescription
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CContainer>
      ) : (
        // Prescription Preview
        <CContainer>
          <div className="mb-4 d-flex gap-3 no-print">
            <CButton color="secondary" onClick={() => setShowPreview(false)}>
              ← Back to Edit
            </CButton>
            <CButton color="success" onClick={handlePrint}>
              <Printer size={20} /> Print Prescription
            </CButton>
          </div>

          <div ref={printRef} id="prescription-content" className="bg-white p-5 shadow">
            {/* Header */}
            <div className="border-bottom border-4 border-primary pb-3 mb-4">
              <h1 className="text-primary fw-bold">{doctorInfo.name}</h1>
              <p className="h5 text-body">{doctorInfo.qualification}</p>
              <p className="text-body">{doctorInfo.specialization}</p>
              <p className="text-muted small mt-2">Reg. No: {doctorInfo.registration}</p>
              <p className="text-muted small">{doctorInfo.clinic}</p>
              <p className="text-muted small">{doctorInfo.address}</p>
              <p className="text-muted small">Contact: {doctorInfo.contact}</p>
            </div>

            {/* Date */}
            <div className="text-end mb-4">
              <p className="text-body">Date: {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Patient Info */}
            <div className="mb-4">
              <h2 className="h5 fw-semibold mb-2">Patient Details:</h2>
              <p><strong>Name:</strong> {patientInfo.name || 'N/A'}</p>
              <p><strong>Age/Gender:</strong> {patientInfo.age || 'N/A'} Years / {patientInfo.gender}</p>
              {patientInfo.contact && <p><strong>Contact:</strong> {patientInfo.contact}</p>}
            </div>

            {/* Diagnosis */}
            {diagnosis && (
              <div className="mb-4">
                <h2 className="h5 fw-semibold mb-2">Diagnosis:</h2>
                <p className="text-body">{diagnosis}</p>
              </div>
            )}

            {/* Rx Symbol */}
            <div className="mb-3">
              <h2 className="display-4 text-primary font-serif">℞</h2>
            </div>

            {/* Medications */}
            <div className="mb-4">
              <h2 className="h5 fw-semibold mb-3">Medications:</h2>
              <CTable responsive>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.filter(med => med.name).map((med, index) => (
                    <tr key={med.id}>
                      <td>
                        <p className="fw-medium mb-1">{index + 1}. {med.name} {med.dosage}</p>
                        {med.instructions && <p className="text-muted small fst-italic">{med.instructions}</p>}
                      </td>
                      <td>{med.frequency}</td>
                      <td>{med.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </CTable>
            </div>

            {/* Advice */}
            {advice && (
              <div className="mb-5">
                <h2 className="h5 fw-semibold mb-2">Advice:</h2>
                <p className="text-body">{advice}</p>
              </div>
            )}

            {/* Signature */}
            <div className="mt-5 pt-4 border-top">
              <div className="text-end">
                <div className="mb-5"></div>
                <p className="fw-semibold h5">{doctorInfo.name}</p>
                <p className="text-body">{doctorInfo.qualification}</p>
                <p className="text-muted small">Reg. No: {doctorInfo.registration}</p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-top text-center text-muted small">
              <p>This is a computer-generated prescription</p>
            </div>
          </div>
        </CContainer>
      )}

      {/* Simple Print Styles */}
      <style>{`
  @media print {
    /* Hide everything except the prescription content */
    body * {
      visibility: hidden;
    }
    
    #prescription-content,
    #prescription-content * {
      visibility: visible;
    }
    
    /* Position the prescription properly */
    #prescription-content {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      height: auto !important;
      max-height: 100vh !important;
      margin: 0 !important;
      padding: 20px !important;
      background: white !important;
      box-shadow: none !important;
      overflow: hidden !important;
    }
    
    /* Hide action buttons */
    .no-print {
      display: none !important;
    }
    
    /* Ensure single page printing */
    @page {
      size: A4 portrait;
      margin: 0.5cm;
    }
    
    /* Force single page */
    body {
      margin: 0 !important;
      padding: 0 !important;
      height: 100vh !important;
      overflow: hidden !important;
    }
    
    /* Prevent page breaks inside critical elements */
    #prescription-content > * {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* Ensure table doesn't break across pages */
    table {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    
    tr {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  }

  /* Screen styles - ensure compact design */
  #prescription-content {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`}</style>
    </CContainer>
  );
}