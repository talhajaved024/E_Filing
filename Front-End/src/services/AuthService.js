import api, { setAuthToken } from "./Api";

export class AuthService {
  static async register(userData) {
    return api.post("/auth/register", userData);
  }

  static async login(credentials) {
    const response = await api.post("/auth/login", credentials);
    
    if (response.data.accessToken) {
      // Use sessionStorage instead of localStorage
      // This ensures tokens are cleared when browser closes
      sessionStorage.setItem("accessToken", response.data.accessToken);
      sessionStorage.setItem("refreshToken", response.data.refreshToken);
      sessionStorage.setItem("sessionActive", "true");
      
      // Also store in localStorage for refresh token rotation
      // (but don't use it for authentication check)
      localStorage.setItem("refreshToken", response.data.refreshToken);
      
      setAuthToken(response.data.accessToken);
    }
    return response.data;
  }

  /**
   * Logout user
   * @param {boolean} triggeredByClose - true if logout is triggered by browser/tab close
   */
  static logout(triggeredByClose = false) {
    const accessToken = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");
    const logoutUrl = `${process.env.REACT_APP_API_URL}/api/auth/logout`;

    if (!refreshToken) {
      this.clearAllStorage();
      return;
    }

    if (triggeredByClose) {
      // Browser/tab is closing - use synchronous request
      const payload = JSON.stringify({ refreshToken: refreshToken });
      
      try {
        // Use synchronous XHR - most reliable for browser close
        const xhr = new XMLHttpRequest();
        xhr.open('POST', logoutUrl, false); // false = synchronous
        xhr.setRequestHeader('Content-Type', 'application/json');
        if (accessToken) {
          xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
        }
        xhr.send(payload);
      } catch (err) {
        console.error("Logout on close failed:", err);
      }
      
      // Clear all storage
      this.clearAllStorage();
      
    } else {
      // Manual logout - clear storage first, then make async request
      this.clearAllStorage();
      
      // Make async logout request
      fetch(logoutUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      })
        .then(() => {
          window.location.href = "/#/login";
        })
        .catch((err) => {
          console.error("Manual logout failed:", err);
          window.location.href = "/#/login";
        });
    }
  }

  /**
   * Clear all authentication data from both sessionStorage and localStorage
   */
  static clearAllStorage() {
    // Clear sessionStorage (active session tokens)
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("userUniqueId");
    sessionStorage.removeItem("adminUser");
    sessionStorage.removeItem("UserID");
    sessionStorage.removeItem("sessionActive");
    
    // Clear localStorage (persistent data)
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userUniqueId");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("UserID");
    
    setAuthToken(null);
  }
}