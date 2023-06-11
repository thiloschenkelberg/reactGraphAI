import axios, { AxiosInstance } from 'axios';

const API_URL = 'http://localhost:8080/api';

class Client {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,

    });
  }

  async signin(username: string, password: string) {
    try {
      const token = await this.client.post("/users/signin", {
        username,
        password
      });
      if (token) {
        document.cookie = `token=${token}`
      }
      return response.data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async signup(username: string, email: string, password: string) {
    try {
      const response = await this.client.post("/users/signup", {
        username,
        email,
        password
      });
      return response.data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async getAdminBoard() {
    try {
      const response = await this.client.get("/users/adminboard");
      return response.data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async updateUser(id: number, user: any) {
    try {
      const response = await this.client.put(`/users/${id}`, user);
      return response.data;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}

const client = new Client();

export default client;