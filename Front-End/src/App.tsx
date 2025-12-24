import React, { Component, Suspense } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import './scss/style.scss';
import '@coreui/coreui/dist/css/coreui.min.css';
import 'simplebar-react/dist/simplebar.min.css';
import { AuthService } from './services/AuthService';
import IdleTimer from './services/IdleTimer';

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

const Login = React.lazy(() => import('./views/pages/login/Login')) as React.LazyExoticComponent<React.ComponentType<{ onLoginSuccess: () => void }>>;
const Register = React.lazy(() => import('./views/pages/register/Register'));
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout')) as React.LazyExoticComponent<React.ComponentType<{ onLogout: () => void }>>;
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));

interface AppState {
  isAuthenticated: boolean;
}

class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    
    // Check if there's an active session
    const hasSession = this.checkActiveSession();
    
    this.state = {
      isAuthenticated: hasSession
    };
  }

  /**
   * Check if there's a valid active session
   * Session is valid if:
   * 1. Tokens exist in sessionStorage
   * 2. Session was active OR this is a page refresh
   */
  private checkActiveSession = (): boolean => {
    const accessToken = sessionStorage.getItem("accessToken");
    const sessionActive = sessionStorage.getItem("sessionActive");
    const isRefreshing = sessionStorage.getItem("isRefreshing");
    
    // If this is a refresh and we have tokens, allow it
    if (isRefreshing === "true" && accessToken) {
      return true;
    }
    
    // If no tokens in sessionStorage, user must login again
    if (!accessToken || sessionActive !== "true") {
      // Clean up any stale data
      AuthService.clearAllStorage();
      return false;
    }
    
    return true;
  };

  componentDidMount(): void {
    // Check if this is a page refresh
    const isRefresh = sessionStorage.getItem("isRefreshing");
    if (isRefresh === "true") {
      // This was a refresh, restore the session flag
      sessionStorage.setItem("sessionActive", "true");
      sessionStorage.removeItem("isRefreshing");
    }

    // Handle browser/tab close
    window.addEventListener('beforeunload', this.handleBeforeUnload);
    window.addEventListener('pagehide', this.handlePageHide);
  }

  componentWillUnmount(): void {
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('pagehide', this.handlePageHide);
  }

  /**
   * Handle beforeunload - detect if it's a refresh or close
   */
  private handleBeforeUnload = (event: BeforeUnloadEvent): void => {
    // Check if this is a page refresh
    const navigation = (performance as any).getEntriesByType?.('navigation')?.[0];
    
    if (navigation?.type === 'reload') {
      // User is refreshing - mark it and keep session
      sessionStorage.setItem("isRefreshing", "true");
    } else {
      // User is closing - mark for logout
      sessionStorage.setItem("isClosing", "true");
    }
  };

  /**
   * Handle pagehide - perform logout if browser/tab is closing
   */
  private handlePageHide = (event: PageTransitionEvent): void => {
    const isClosing = sessionStorage.getItem("isClosing");
    const hasToken = sessionStorage.getItem("accessToken");
    
    // Only logout if it's a close (not a refresh) and user is logged in
    if (isClosing === "true" && hasToken) {
      AuthService.logout(true);
    }
    
    // Clean up the flag
    sessionStorage.removeItem("isClosing");
  };

  /**
   * Called after successful login
   */
  handleLoginSuccess = () => {
    // Mark session as active
    sessionStorage.setItem("sessionActive", "true");
    this.setState({ isAuthenticated: true });
  };

  /**
   * Handle manual logout (when user clicks logout button)
   */
  handleLogout = () => {
    AuthService.logout(false);
    this.setState({ isAuthenticated: false });
  };

  render() {
    const { isAuthenticated } = this.state;

    return (
      <>
        {/* Idle timer active only when logged in */}
        {isAuthenticated && <IdleTimer onIdle={this.handleLogout} />}

        <HashRouter>
          <Suspense fallback={loading}>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" />
                  ) : (
                    <Login onLoginSuccess={this.handleLoginSuccess} />
                  )
                }
              />
              <Route
                path="/register"
                element={isAuthenticated ? <Navigate to="/" /> : <Register />}
              />
              <Route path="/404" element={<Page404 />} />
              <Route path="/500" element={<Page500 />} />

              {/* Protected Routes */}
              <Route
                path="*"
                element={
                  isAuthenticated ? (
                    <DefaultLayout onLogout={this.handleLogout} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
            </Routes>
          </Suspense>
        </HashRouter>
      </>
    );
  }
}

export default App;