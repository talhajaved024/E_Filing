import React, { Component, Suspense } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import './scss/style.scss';
import '@coreui/coreui/dist/css/coreui.min.css';
import 'simplebar-react/dist/simplebar.min.css';

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
);

// Lazy-loaded components with proper prop types
const Login = React.lazy(() => import('./views/pages/login/Login')) as React.LazyExoticComponent<React.ComponentType<{ onLoginSuccess: () => void }>>;
const Register = React.lazy(() => import('./views/pages/register/Register'));
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout')) as React.LazyExoticComponent<React.ComponentType<{ onLogout: () => void }>>;
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));

// App state interface
interface AppState {
  isAuthenticated: boolean;
}

class App extends Component<{}, AppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      isAuthenticated: !!localStorage.getItem("accessToken")
    };
  }

  handleLoginSuccess = () => {
    this.setState({ isAuthenticated: true });
  }

  handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    this.setState({ isAuthenticated: false });
  }

  render() {
    const { isAuthenticated } = this.state;

    return (
      <HashRouter>
        <Suspense fallback={loading}>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={isAuthenticated ? <Navigate to="/" /> : <Login onLoginSuccess={this.handleLoginSuccess} />}
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
              element={isAuthenticated ? <DefaultLayout onLogout={this.handleLogout} /> : <Navigate to="/login" />}
            />
          </Routes>
        </Suspense>
      </HashRouter>
    );
  }
}

export default App;
