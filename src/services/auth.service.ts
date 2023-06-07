import axios from "axios";

const API_URL = "http://localhost:8080/api/auth/";

const authServiceInstance = axios.create({
  baseURL: API_URL,
});

class AuthService {
  login(username: string, password: string) {
    return authServiceInstance
      .post("signin", {
        username,
        password
      })
      .then(response => {
        if (response.data.accessToken) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }

        return response.data;
      });
  }

  logout() {
    localStorage.removeItem("user");
  }

  register(username: string, email: string, password: string) {
    return authServiceInstance.post("signup", {
      username,
      email,
      password
    });
  }

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (userStr) return JSON.parse(userStr);

    return null;
  }
}

const authService = new AuthService();

export default authService;
