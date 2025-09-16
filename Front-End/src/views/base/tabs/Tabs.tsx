import React, { useState } from 'react';
import {
    CTabContent,
    CTabPane,
    CNav,
    CNavItem,
    CNavLink,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CRow
} from '@coreui/react';

const Tabs = () => {
  const [activeTab, setActiveTab] = useState(0);

  const toggleTab = (tabIndex: number) => {
    if (activeTab !== tabIndex) {
      setActiveTab(tabIndex);
    }
  };

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>React Tabs</strong>
          </CCardHeader>
          <CCardBody>
            <CNav variant="tabs">
              <CNavItem>
                <CNavLink active={activeTab === 0} onClick={() => toggleTab(0)}>
                  Tab 1
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink active={activeTab === 1} onClick={() => toggleTab(1)}>
                  Tab 2
                </CNavLink>
              </CNavItem>
            </CNav>
            <CTabContent className="rounded-bottom">
              <CTabPane visible={activeTab === 0}>
                <h4>Tab 1 Content</h4>
                <p>This is the content for Tab 1.</p>
              </CTabPane>
              <CTabPane visible={activeTab === 1}>
                <h4>Tab 2 Content</h4>
                <p>This is the content for Tab 2.</p>
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Tabs;