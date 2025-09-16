import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { library } from '@fortawesome/fontawesome-svg-core'
import { CCard, CCardBody, CCardHeader, CCol, CContainer, CRow, CButton } from '@coreui/react'

library.add(fas)

class FontAwesomeGrid extends Component {
  state = {
    currentPage: 1,
    iconsPerPage: 100,  // Render only 50 icons per page
  }

  getIconKeys = () => {
    return Object.keys(fas).filter((key) => key.startsWith('fa'))
  }

  renderIcons = (icons) => {
    return icons.map((iconKey, index) => {
      const iconName = iconKey.replace('fa', '').toLowerCase()
      return (
        <CCol key={index} xs={6} sm={4} md={3} lg={2} className="text-center mb-4">
          <FontAwesomeIcon icon={fas[iconKey]} size="2x" />
          <div className="mt-2" style={{ fontSize: '12px' }}>{iconName}</div>
        </CCol>
      )
    })
  }

  render() {
    const { currentPage, iconsPerPage } = this.state
    const allIcons = this.getIconKeys()
    const totalPages = Math.ceil(allIcons.length / iconsPerPage)

    const startIndex = (currentPage - 1) * iconsPerPage
    const selectedIcons = allIcons.slice(startIndex, startIndex + iconsPerPage)

    return (
      <CContainer fluid className="p-4">
        <CCard>
          <CCardHeader>
            <h5>Font Awesome Free Icons</h5>
          </CCardHeader>
          <CCardBody>
            <CRow>{this.renderIcons(selectedIcons)}</CRow>
            <div className="d-flex justify-content-between mt-3">
              <CButton
                color="primary"
                disabled={currentPage === 1}
                onClick={() => this.setState({ currentPage: currentPage - 1 })}
              >
                Previous
              </CButton>
              <span>Page {currentPage} of {totalPages}</span>
              <CButton
                color="primary"
                disabled={currentPage === totalPages}
                onClick={() => this.setState({ currentPage: currentPage + 1 })}
              >
                Next
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CContainer>
    )
  }
}

export default FontAwesomeGrid
