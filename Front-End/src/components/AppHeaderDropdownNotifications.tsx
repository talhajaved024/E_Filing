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
import { cilBell } from '@coreui/icons'

const AppHeaderDropdownNotifications = () => {
  const preventReload = (e: React.MouseEvent) => e.preventDefault()

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle caret={false} className="py-0">
        <CIcon icon={cilBell} size="lg" />
        <CBadge color="info" shape="rounded-pill" className="ms-1">
          5
        </CBadge>
      </CDropdownToggle>
      <CDropdownMenu placement="bottom-end" className="pt-0">
        <CDropdownHeader className="bg-light fw-semibold py-2">
          Notifications
        </CDropdownHeader>
        <CDropdownItem onClick={preventReload}>New user registered</CDropdownItem>
        <CDropdownItem onClick={preventReload}>Server overloaded</CDropdownItem>
        <CDropdownItem onClick={preventReload}>New comment</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdownNotifications
