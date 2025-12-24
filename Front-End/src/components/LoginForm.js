import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import {
  CForm,
  CFormInput,
  CButton,
  CCol,
  CRow,
} from "@coreui/react";
import notify from 'devextreme/ui/notify';
import 'devextreme/dist/css/dx.light.css';

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      loading: false,
      redirectToHome: false
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = this.state;

    // Basic validation
    if (!username.trim() || !password.trim()) {
      notify('Please enter both username and password', 'warning', 3000);
      return;
    }

    this.setState({ loading: true });

    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", { 
        username: username.trim(), 
        password: password.trim()
      });
     
      
      const { accessToken, refreshToken, userUniqueId, adminUser, userID ,userName} = response.data;

      // Save tokens to sessionStorage (not localStorage)
      // This ensures they're cleared when browser closes
      sessionStorage.setItem("accessToken", accessToken);
      sessionStorage.setItem("refreshToken", refreshToken);
      sessionStorage.setItem("userUniqueId", userUniqueId);
      sessionStorage.setItem("adminUser", adminUser);
      sessionStorage.setItem("UserID", userID);
      sessionStorage.setItem("userName", userName);
      sessionStorage.setItem("sessionActive", "true");
      
      // Save refresh token to localStorage for token rotation
      localStorage.setItem("refreshToken", refreshToken);

      if (this.props.onLoginSuccess) this.props.onLoginSuccess();

      this.setState({ redirectToHome: true });
    } catch (err) {
      let errorMessage = "Invalid username or password. Please try again.";
      
      if (err.response && err.response.data) {
        const errorData = err.response.data;
        
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData && typeof errorData === 'object' && errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      }

      notify(errorMessage, 'error', 5000);
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { username, password, loading, redirectToHome } = this.state;

    if (redirectToHome) return <Navigate to="/" />;

    return (
      <div className="login-container">
        <CForm onSubmit={this.handleSubmit}>
          <CRow className="mb-3">
            <CCol>
              <CFormInput
                type="text"
                id="username"
                name="username"
                label="Username"
                value={username}
                onChange={this.handleChange}
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol>
              <CFormInput
                type="password"
                id="password"
                name="password"
                label="Password"
                value={password}
                onChange={this.handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </CCol>
          </CRow>

          <CRow>
            <CCol>
              <CButton 
                type="submit" 
                color="primary" 
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? "Logging in..." : "Login"}
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </div>
    );
  }
}

export default LoginForm;