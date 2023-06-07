import axios from 'axios';
import authHeader from './auth-header';

const API_URL = 'http://localhost:8080/api/test/';

const userServiceInstance = axios.create({
  baseURL: API_URL,
  headers: authHeader()
});

class UserService {
  getPublicContent() {
    return userServiceInstance.get('all');
  }

  getUserBoard() {
    return userServiceInstance.get('user');
  }

  getModeratorBoard() {
    return userServiceInstance.get('mod');
  }

  getAdminBoard() {
    return userServiceInstance.get('admin');
  }
}

const userService = new UserService();

export default userService;
