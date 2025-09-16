import React from 'react'
import {
  CBadge,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeOpen } from '@coreui/icons'

const AppHeaderDropdownMessage = () => {
  const preventReload = (e: React.MouseEvent) => e.preventDefault()

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle caret={false} className="py-0">
        <CIcon icon={cilEnvelopeOpen} size="lg" />
        <CBadge color="success" shape="rounded-pill" className="ms-1">
          3
        </CBadge>
      </CDropdownToggle>
      <CDropdownMenu placement="bottom-end" className="pt-0">
        <CDropdownHeader className="bg-light fw-semibold py-2">
          Messages
        </CDropdownHeader>
        <CDropdownItem onClick={preventReload}>Message from Alice</CDropdownItem>
        <CDropdownItem onClick={preventReload}>New project update</CDropdownItem>
        <CDropdownItem onClick={preventReload}>Weekly report</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdownMessage
