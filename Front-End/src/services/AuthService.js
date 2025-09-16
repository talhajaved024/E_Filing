import api, { setAuthToken } from "./Api";
import axios from "axios";

export class AuthService {
  static async register(userData) {
    return api.post("/auth/register", userData);
  }

  static async login(credentials) {
    const response = await api.post("/auth/login", credentials);

    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      setAuthToken(response.data.accessToken);
    }

    return response.data;
  }

//   static async logout() {
//     const refreshToken = localStorage.getItem("refreshToken");
//     if (refreshToken) {
//       await api.post("/auth/logout", { refreshToken });
//     }
//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("refreshToken");
//     setAuthToken(null);
//   }

// static async logout() {
//   const accessToken = localStorage.getItem("accessToken");
//   const refreshToken = localStorage.getItem("refreshToken");
//     console.log("Access Token",accessToken);
//     console.log("Refresh Token",refreshToken);
    
    
//   if (refreshToken) {
//     await api.post(
//       "/auth/logout",
//       refreshToken, // body
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`, // auth header
//         },
//       }
//     );
//   }

//   // Clear local storage and auth header
//   localStorage.removeItem("accessToken");
//   localStorage.removeItem("refreshToken");
//   setAuthToken(null);
// }

// static async api.post("/auth/logout", { refreshToken }, {
//   headers: { 
//     Authorization: `Bearer ${accessToken}`,
//     'Content-Type': 'application/json'
//   },
//   withCredentials: true
// });
static async logout() {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  // if (!accessToken || !refreshToken) {
  //   console.error("No tokens found in storage.");
  //   return;
  // }
    //console.log(accessToken+"| | |"+refreshToken);
    
  axios.post(
    "http://localhost:8080/api/auth/logout",
    {refreshToken}, // body
    {
      headers: {
        "Authorization": `Bearer ${refreshToken}`,
        "Content-Type": "application/json"
      }
    }
  )
  .then((response) => {
    console.log("Logout successful:", response.data);

    // Clear tokens from storage after backend confirms revocation
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Redirect user (optional)
    window.location.href = "/login";
  })
  .catch((error) => {
    console.error("Logout failed:", error.response ? error.response.data : error.message);
  });
  }

  // ✅ Always clear local storage (even if API call fails)
  // localStorage.removeItem("accessToken");
  // localStorage.removeItem("refreshToken");

  // ✅ Reset auth header for axios
  // setAuthToken(null);

  // ✅ Optional: redirect user to login page
  // window.location.href = "/login";
}

