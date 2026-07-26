import api, { setAuthToken } from "./Api";

export class AuthService {
  static async register(userData) {
    return api.post("/auth/register", userData);
  }

  static async login(credentials) {
    const response = await api.post("/auth/login", credentials);

    if (response.data.accessToken) {

      sessionStorage.setItem("accessToken", response.data.accessToken);
      sessionStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      setAuthToken(response.data.accessToken);
    }
    return response.data;
  }

  /**
   * Exchange the current refresh token for a new access + refresh token pair
   * (backend rotates and revokes the old refresh token on every call). Used
   * by TokenRefresher to keep the session alive automatically — the access
   * token expires after 15 minutes, and the refresh token itself is revoked
   * server-side if it goes unused for 5 minutes, so this must be called well
   * inside that 5-minute window for as long as the user stays logged in.
   */
  static async refreshTokens() {
    const refreshToken = sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await api.post("/auth/refresh", { refreshToken });
    const { accessToken, refreshToken: newRefreshToken } = response.data;

    sessionStorage.setItem("accessToken", accessToken);
    sessionStorage.setItem("refreshToken", newRefreshToken);
    localStorage.setItem("refreshToken", newRefreshToken);
    setAuthToken(accessToken);

    return accessToken;
  }

  /**
   * Decode a JWT's `exp` claim without any library — used by TokenRefresher
   * to schedule the refresh call relative to the access token's real expiry
   * instead of polling on a fixed interval. Returns the expiry as epoch
   * milliseconds, or null if the token can't be decoded.
   */
  static getAccessTokenExpiryMs(token) {
    try {
      const payload = token.split(".")[1];
      const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
      const decoded = JSON.parse(atob(padded));
      return typeof decoded.exp === "number" ? decoded.exp * 1000 : null;
    } catch (error) {
      return null;
    }
  }

  static logout() {
    const accessToken = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken") || localStorage.getItem("refreshToken");
    const logoutUrl = `${process.env.REACT_APP_API_URL}/api/auth/logout`;

    if (!refreshToken) {
      this.clearAllStorage();
      return;
    }

    this.clearAllStorage();

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
        console.error("Logout failed:", err);
        window.location.href = "/#/login";
      });
  }

 
  static clearAllStorage() {
    
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("userUniqueId");
    sessionStorage.removeItem("adminUser");
    sessionStorage.removeItem("UserID");
    sessionStorage.removeItem("sessionActive");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userUniqueId");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("UserID");
    
    setAuthToken(null);
  }
}