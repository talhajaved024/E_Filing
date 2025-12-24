import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { CSidebar, CSidebarBrand, CSidebarNav, CSidebarToggler } from '@coreui/react'
import CIcon from '@coreui/icons-react';
import SimpleBar from 'simplebar-react';
import { Link } from 'react-router-dom';
import _staffNav from '../_staffNav';

// Navigation
import { AppSidebarNav } from './AppSidebarNav'
import navigation from '../_nav'
import regularUserNav from '../_navRegularUser'
import ExcelToXmlConverter from '../_navExceltoXml';

// Brand Icons
import { logoNegative } from '../assets/brand/logo-negative'
import { sygnet } from '../assets/brand/sygnet'

// Redux
import { RootState, AppDispatch } from '../store'
import { setSidebarState } from '../store'
import '@coreui/coreui/dist/css/coreui.min.css'
import 'simplebar-react/dist/simplebar.min.css';
import { User } from 'lucide-react';

const AppSidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const UserID = sessionStorage.getItem("UserID");
  
  // ✅ Typed state from RootState
  const unfoldable = useSelector((state: RootState) => state.sidebar.sidebarUnfoldable)
  const sidebarShow = useSelector((state: RootState) => state.sidebar.sidebarShow)

  const adminUser = sessionStorage.getItem("adminUser");

  //console.log(adminUser);
  
  // Fixed logic with proper condition order
  let navItems;

  if (adminUser === "true" && UserID!=="51") {
    navItems = navigation; // Admin users
  } else if (UserID === "33") {
    navItems = _staffNav; // Specific staff user
  } else if (UserID === "51") {
    navItems = ExcelToXmlConverter; // Specific staff user
  } else {
    navItems = regularUserNav; // Regular users
  }

  return (
    <CSidebar
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      className="sidebar sidebar-fixed"
      onVisibleChange={(visible: boolean) => {
        dispatch(setSidebarState({ sidebarShow: visible }))
      }}
    >
      {/* Brand Logo */}
      <CSidebarBrand className="d-none d-md-flex">
        <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
          {/* <CIcon className="sidebar-brand-full" icon={logoNegative} height={35} />
          <CIcon className="sidebar-brand-narrow" icon={sygnet} height={35} /> */}
        </Link>
      </CSidebarBrand>

      {/* Navigation */}
      <CSidebarNav>
        <SimpleBar>
          <AppSidebarNav items={navItems} />
        </SimpleBar>
      </CSidebarNav>

      {/* Minimize Button */}
      <CSidebarToggler
        className="d-none d-lg-flex"
        onClick={() => dispatch(setSidebarState({ sidebarUnfoldable: !unfoldable }))}
      />
    </CSidebar>
  )
}

export default React.memo(AppSidebar)