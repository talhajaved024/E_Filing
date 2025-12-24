import React from 'react'
//import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CRow,
} from '@coreui/react'
import LoginForm from '../../../components/LoginForm' // your class-based login form

const Login: React.FC<{ onLoginSuccess: (data: any) => void }> = ({ onLoginSuccess }) => {
  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={4}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  {/* <h1>Login</h1> */}
                  <p className="text-medium-emphasis">Sign In to your account</p>
                  {/* Render the actual login form */}
                  <LoginForm onLoginSuccess={onLoginSuccess} />
                </CCardBody>
              </CCard>
              {/* <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Only if you don't already have an account. 
                    </p>
                     <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link> 
                  </div>
                </CCardBody>
              </CCard> */}
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
