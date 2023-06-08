import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/test'; // Replace with your backend server URL

export async function getUserById(id: number) {
  try {
    const response = await axios.get(`${BASE_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user');
  }
}

export async function createUser(user: any) {
  try {
    const response = await axios.post(`${BASE_URL}/users`, user);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Failed to create user');
  }
}

// Additional repository functions for updating, deleting users, etc.
