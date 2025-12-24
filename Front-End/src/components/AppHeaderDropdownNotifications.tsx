import React, { useEffect, useState, useCallback, useMemo } from 'react'
import axios from 'axios'
import {
  CBadge,
  CDropdown,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import notify from 'devextreme/ui/notify';
import CIcon from '@coreui/icons-react'
import { cilBell } from '@coreui/icons'

const API_URL = 'http://localhost:8080/api/notifications';

// Move axios instance outside component to prevent recreation
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // Add timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("refreshToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      notify('Session expired. Please login again.', 'error', 3000);
    }
    return Promise.reject(error);
  }
);

interface Notification {
  id: number
  receiverId: number
  senderId: number
  message: string
  type: string
  createdAt: string
  read?: boolean
}

const AppHeaderDropdownNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const UserID = useMemo(() => {
    const storedValue = sessionStorage.getItem("UserID");
    return storedValue ? parseInt(storedValue) : 0;
  }, [])

  // Memoized fetch function
  const fetchTodayNotifications = useCallback(async () => {
    if (!UserID) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await axiosInstance.get('/todayCustom', {
        params: { receiverId: UserID },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      setNotifications(response.data);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timeout');
        notify('Notification fetch timeout', 'error', 3000);
      } else if (err.response?.status === 401) {
        // Already handled by interceptor
      } else {
        setError('Failed to load notifications');
        console.error("Error fetching notifications:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [UserID])

  const markAsRead = useCallback(async (id: number) => {
    try {
      // Optimistic update
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );

      await axiosInstance.post(`/read/${id}?userId=${UserID}`);
    } catch (err) {
      // Revert on error
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: false } : n)
      );
      console.error("Error marking as read:", err);
      notify('Failed to mark notification as read', 'error', 3000);
    }
  }, [UserID])

  // Effect for initial load and polling
  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    const initializeNotifications = async () => {
      if (isMounted) {
        await fetchTodayNotifications();
        
        // Start polling only after initial load
        pollInterval = setInterval(() => {
          if (isMounted && document.visibilityState === 'visible') {
            fetchTodayNotifications();
          }
        }, 30000); // Increased to 30 seconds to reduce load
      }
    };

    initializeNotifications();

    // Handle tab visibility to prevent unnecessary calls when tab is hidden
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMounted) {
        fetchTodayNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchTodayNotifications]);

  const preventReload = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Memoized unread count calculation
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length, 
    [notifications]
  );

  // Memoized notification items
  const notificationItems = useMemo(() => {
    if (loading) {
      return <CDropdownItem disabled>Loading notifications...</CDropdownItem>;
    }

    if (error) {
      return (
        <CDropdownItem disabled style={{ color: 'red' }}>
          Failed to load notifications
        </CDropdownItem>
      );
    }

    if (notifications.length === 0) {
      return <CDropdownItem disabled>No notifications for today</CDropdownItem>;
    }

    return notifications.map((n) => (
      <CDropdownItem
        key={n.id}
        onClick={(e) => {
          preventReload(e);
          if (!n.read) {
            markAsRead(n.id);
          }
        }}
        style={{
          backgroundColor: n.read ? "white" : "#e8f2ff",
          fontWeight: n.read ? 400 : 600,
          cursor: n.read ? "default" : "pointer",
          borderBottom: '1px solid #f0f0f0',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          padding: '8px 12px'
        }}
      >
        <div className="d-flex justify-content-between align-items-start">
          <span style={{ flex: 1, fontSize: '0.9rem' }}>{n.message}</span>
          {!n.read && (
            <CBadge color="primary" shape="rounded-pill" className="ms-2 flex-shrink-0">
              New
            </CBadge>
          )}
        </div>
        <small className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
          {new Date(n.createdAt).toLocaleTimeString()}
        </small>
      </CDropdownItem>
    ));
  }, [notifications, loading, error, markAsRead, preventReload]);

  return (
    <CDropdown variant="nav-item" alignment="end">
      <CDropdownToggle caret={false} className="py-0">
        <CIcon icon={cilBell} size="lg" />
        {unreadCount > 0 && (
          <CBadge color="info" shape="rounded-pill" className="ms-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </CBadge>
        )}
      </CDropdownToggle>

      <CDropdownMenu 
        placement="bottom-end" 
        className="pt-0 notification-dropdown"
        style={{
          maxHeight: '400px',
          overflowY: 'auto',
          width: '300px',
          maxWidth: '90vw',
          right: 0,
          left: 'auto !important'
        }}
      >
        <CDropdownHeader 
          className="bg-light fw-semibold py-2" 
          style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 1,
            borderBottom: '1px solid #dee2e6'
          }}
        >
          Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </CDropdownHeader>

        {notificationItems}

        {!loading && !error && notifications.length > 8 && (
          <CDropdownItem 
            disabled 
            style={{ 
              textAlign: 'center', 
              fontStyle: 'italic',
              fontSize: '0.8rem',
              padding: '4px 12px'
            }}
          >
            Scroll for more...
          </CDropdownItem>
        )}
      </CDropdownMenu>
    </CDropdown>
  )
}

export default React.memo(AppHeaderDropdownNotifications);