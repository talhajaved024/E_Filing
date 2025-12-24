import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from "react-redux";
//import { AuthService } from './services/AuthService';
import App from './App';
import store from '../src/store';
import reportWebVitals from './reportWebVitals';
import '@coreui/coreui/dist/css/coreui.min.css';
import './index.css';
import 'simplebar-react/dist/simplebar.min.css'

// window.addEventListener("unload", () => {
//   try {
//     const refreshToken = localStorage.getItem("refreshToken");
//     if (refreshToken) {
//       const logoutUrl = "http://localhost:8080/api/auth/logout";
//       // Beacon sends plain text — backend handles both formats
//       const data = JSON.stringify({ refreshToken });
//       navigator.sendBeacon(logoutUrl, data);
//     }
//   } catch (err) {
//     console.error("Beacon logout error:", err);
//   } finally {
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//     localStorage.removeItem("userUniqueId");
//   }
// });


ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
