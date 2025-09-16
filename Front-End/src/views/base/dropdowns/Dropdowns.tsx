import React, { useState } from 'react';
import {
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem
} from '@coreui/react';

const Dropdowns = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [secondDropdownVisible, setSecondDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const toggleSecondDropdown = () => {
    setSecondDropdownVisible(!secondDropdownVisible);
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>React Dropdown</strong>
          </CCardHeader>
          <CCardBody>
            <CButton onClick={toggleDropdown}>Toggle Dropdown</CButton>
            <CDropdown variant="nav-item" visible={dropdownVisible}>
              <CDropdownToggle onClick={toggleDropdown} className="py-0" caret={false}>
                Dropdown
              </CDropdownToggle>
              <CDropdownMenu className="pt-0">
                <CDropdownItem>Action</CDropdownItem>
                <CDropdownItem>Another Action</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>

            <CButton onClick={toggleSecondDropdown}>Toggle Second Dropdown</CButton>
            <CDropdown variant="nav-item" visible={secondDropdownVisible}>
              <CDropdownToggle onClick={toggleSecondDropdown} className="py-0" caret={false}>
                Second Dropdown
              </CDropdownToggle>
              <CDropdownMenu className="pt-0">
                <CDropdownItem>Item 1</CDropdownItem>
                <CDropdownItem>Item 2</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Dropdowns;
