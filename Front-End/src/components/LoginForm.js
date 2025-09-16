import React, { Component } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import {
  CForm,
  CFormInput,
  CButton,
  CCol,
  CRow,
  CAlert,
} from "@coreui/react";

class LoginForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: "",
      loading: false,
      error: null,
      redirectToHome: false
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleSubmit = async (e) => {
    console.log(e);
    
    e.preventDefault();
    const { username, password } = this.state;

    this.setState({ loading: true, error: null });

    try {
      const response = await axios.post("http://localhost:8080/api/auth/login", { username, password });

      const { accessToken, refreshToken } = response.data;
      console.log(response.data);
      
      // Save tokens to localStorage
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Call parent callback if provided
      if (this.props.onLoginSuccess) this.props.onLoginSuccess();

      // Redirect to home
      this.setState({ redirectToHome: true });
    } catch (err) {
      let msg = "Login failed";
      if (err.response && err.response.data) msg = err.response.data;
      this.setState({ error: msg });
    } finally {
      this.setState({ loading: false });
    }
  }

  render() {
    const { username, password, loading, error, redirectToHome } = this.state;

    if (redirectToHome) return <Navigate to="/" />;

    return (
      <div className="login-container">
        {/* <h2>Login</h2> */}
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
                required
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
                required
              />
            </CCol>
          </CRow>

          {error && (
            <CRow className="mb-3">
              <CCol>
                <CAlert color="danger">{error}</CAlert>
              </CCol>
            </CRow>
          )}

          <CRow>
            <CCol>
              <CButton type="submit" color="primary" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </CButton>
            </CCol>
          </CRow>
        </CForm>
      </div>
    );
  }
}
export default LoginForm
