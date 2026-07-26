import React from 'react';
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index';

interface DefaultLayoutProps {
  onLogout: () => void;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ onLogout }) => {
  return (
    <div className="c-app d-flex">
  <AppSidebar />
  <div className="wrapper d-flex flex-column min-vh-100 bg-light">
    <AppHeader onLogout={onLogout} />
    <div className="body flex-grow-1 px-3">
      <AppContent />
    </div>
    <AppFooter />
  </div>
</div>
  );
};

export default DefaultLayout;
