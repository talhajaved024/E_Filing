import React, { FC, useState, useEffect } from 'react';
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react';
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
} from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import axios from 'axios';

import none_avatar from './../../assets/images/avatars/10.png';

const API_BASE_URL = `${process.env.REACT_APP_API_URL}/api/images`;
const userName = sessionStorage.getItem("userName");

interface AppHeaderDropdownProps {
  onLogout: () => void;
}

const AppHeaderDropdown: FC<AppHeaderDropdownProps> = ({ onLogout }) => {
  const [imageUrl, setImageUrl] = useState<string>(none_avatar);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    //console.log(userName);
    
    const loadUserImage = async () => {
      const userUniqueId = sessionStorage.getItem('userUniqueId');
      const accessToken = sessionStorage.getItem('refreshToken');
      
      //console.log(userUniqueId,+"--------------"+accessToken);
      
      if (!userUniqueId || !accessToken) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/user/${userUniqueId}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
          responseType: 'blob',
        });

        const imageObjectUrl = URL.createObjectURL(response.data);
        //console.log(imageObjectUrl);
        
        setImageUrl(imageObjectUrl);
      } catch (error) {
        console.error('Error loading user image:', error);
      }
    };

    loadUserImage();

    return () => {
      if (imageUrl !== none_avatar && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, []);

  const handleLogout = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (isLoggingOut) return; // Prevent multiple clicks

    setIsLoggingOut(true);

    // Delegate to App.tsx's handleLogout — it's the single source of truth
    // for auth state (AuthService.logout() + isAuthenticated = false), which
    // re-renders <Routes> to the login screen immediately. No local storage
    // clearing or hard window.location redirect needed here anymore.
    onLogout();
  };

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle {...({ placement: 'bottom-end', className: 'py-0', caret: false } as any)}>
        <CAvatar src={imageUrl} size="md" />
      </CDropdownToggle>
      <CDropdownMenu {...({ placement: 'bottom-end', className: 'pt-0', caret: false } as any)}>
        <CDropdownHeader className="bg-light fw-semibold py-2">{userName}</CDropdownHeader>
        {/* <CDropdownItem href="#">
          <CIcon icon={cilBell} className="me-2" />
          Updates
          <CBadge color="info" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilEnvelopeOpen} className="me-2" />
          Messages
          <CBadge color="success" className="ms-2">
            42
          </CBadge>
        </CDropdownItem> */}
        {/* <CDropdownItem href="#">
          <CIcon icon={cilTask} className="me-2" />
          Tasks
          <CBadge color="danger" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilCommentSquare} className="me-2" />
          Comments
          <CBadge color="warning" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>

        <CDropdownHeader className="bg-light fw-semibold py-2">Settings</CDropdownHeader>
        <CDropdownItem href="#">
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem> */}
        {/* <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilCreditCard} className="me-2" />
          Payments
          <CBadge color="secondary" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilFile} className="me-2" />
          Projects
          <CBadge color="primary" className="ms-2">
            42
          </CBadge>
        </CDropdownItem> */}

        <CDropdownDivider />
        <CDropdownItem 
          onClick={handleLogout} 
          style={{ cursor: 'pointer' }}
          disabled={isLoggingOut}
        >
          <CIcon icon={cilLockLocked} className="me-2" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  );
};

export default AppHeaderDropdown;