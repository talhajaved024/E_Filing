import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  CHeaderDivider,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,

} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {cilList, cilMenu } from '@coreui/icons'

// Custom components
import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { logo } from '../../src/assets/brand/logo'

// Redux
import { RootState, AppDispatch } from '../store'
import { setSidebarState } from '../store'
import AppHeaderDropdownMessage from './AppHeaderDropDownMessage'
import AppHeaderDropdownNotifications from './AppHeaderDropdownNotifications'

const AppHeader: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const sidebarShow = useSelector((state: RootState) => state.sidebar.sidebarShow)
const preventReload = (e: React.MouseEvent) => e.preventDefault()
  return (
    <CHeader position="sticky" className="mb-4">
      <CContainer fluid>
        {/* Toggle Sidebar */}
        <CHeaderToggler
          className="ps-1"
          onClick={() => dispatch(setSidebarState({ sidebarShow: !sidebarShow }))}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        {/* Brand Logo (visible on mobile) */}
        <CHeaderBrand className="mx-auto d-md-none">
          <Link to="/">
            <CIcon icon={logo} height={48} />
          </Link>
        </CHeaderBrand>

        {/* Navigation links (desktop) */}

        {/* Below Commented for Excel to  XML Conversion Project*/}

        {/* <CHeaderNav className="d-none d-md-flex me-auto">
          <CNavItem>
            <CNavLink to="/dashboard" component={NavLink}>
              Dashboard
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">Users</CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">Settings</CNavLink>
          </CNavItem>
        </CHeaderNav> */}

        {/* Above Commented for Excel to  XML Conversion Project*/}

        {/* Header icons */}
        {/* <CHeaderNav>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilBell} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink href="#">
              <CIcon icon={cilList} size="lg" />
            </CNavLink>
          </CNavItem>
          <CNavItem> */}
            {/* <CDropdown variant="nav-item">
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
    </CDropdown> */}
          {/* </CNavItem>
        </CHeaderNav> */}

        {/* Profile Dropdown */}
        <CHeaderNav className="ms-2 align-items-center gap-1">
          {/* <AppHeaderDropdownNotifications></AppHeaderDropdownNotifications> */}
          {/* <CNavLink href="#">
              <CIcon icon={cilList} size="lg" />
            </CNavLink> */}
          {/* <AppHeaderDropdownMessage/> */}
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>

      {/* Breadcrumb */}
      <CHeaderDivider />
      <CContainer fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
