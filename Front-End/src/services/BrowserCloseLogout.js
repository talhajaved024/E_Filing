// hooks/useBrowserCloseLogout.js
import { useEffect } from 'react';
import { AuthService } from './AuthService';

export const useBrowserCloseLogout = () => {
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Check if user is logged in (has tokens)
      const hasToken = localStorage.getItem("accessToken");
      
      if (hasToken) {
        // Call your existing logout method
        AuthService.logout();
      }
    };

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};