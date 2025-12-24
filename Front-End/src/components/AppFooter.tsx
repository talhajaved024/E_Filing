import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter>
      <div>
        <a href="" target="_blank" rel="noopener noreferrer">
          SolTech
        </a>
        <span className="ms-1">&copy; 2025 solTechLabs.</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
          Soltech pvt ltd. &amp;
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
