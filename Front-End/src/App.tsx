import React, { Component, Suspense } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import './scss/style.scss';
import '@coreui/coreui/dist/css/coreui.min.css';
import 'simplebar-react/dist/simplebar.min.css';
import './App.css';
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
  isIdleWarningVisible: boolean;
}

class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);

    // sessionStorage already gives us the exact behavior we want here: it
    // survives a page refresh and is cleared automatically by the browser
    // when the tab/window is actually closed, so no manual close-detection
    // is needed — just check whether a token is present in this tab.
    this.state = {
      isAuthenticated: !!sessionStorage.getItem("accessToken"),
      isIdleWarningVisible: false,
    };
  }

  /**
   * Called after successful login
   */
  handleLoginSuccess = () => {
    this.setState({ isAuthenticated: true });
  };

  /**
   * Handle logout (manual, or triggered by the idle timer)
   */
  handleLogout = () => {
    AuthService.logout();
    this.setState({ isAuthenticated: false });
  };

  /**
   * The idle-timeout warning modal renders via a React portal straight to
   * document.body (CoreUI's CModal), so dimming this wrapper doesn't touch
   * the modal itself — only everything behind it.
   */
  handleIdleWarningVisibility = (visible: boolean) => {
    this.setState({ isIdleWarningVisible: visible });
  };

  render() {
    const { isAuthenticated, isIdleWarningVisible } = this.state;

    return (
      <>
        {/* Idle timer active only when logged in */}
        {isAuthenticated && (
          <IdleTimer onIdle={this.handleLogout} onVisibilityChange={this.handleIdleWarningVisibility} />
        )}

        <div className={`app-shell${isIdleWarningVisible ? ' app-shell--dimmed' : ''}`}>
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
        </div>
      </>
    );
  }
}

export default App;