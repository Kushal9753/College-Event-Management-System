import api from './api';
import { setToken, removeToken, setUserData } from '../utils/tokenHandler';

class AuthService {
  async login(identifier, password) {
    const response = await api.post('/auth/login', {
      identifier,
      password,
    });
    
    if (response.data.token) {
      setToken(response.data.token);
      setUserData(response.data);
    }
    
    return response.data;
  }


  logout() {
    removeToken();
  }

  async register({ name, email, phone, collegeName, enrollmentNumber, password }) {
    const response = await api.post('/auth/register', {
      name,
      email,
      phone,
      collegeName,
      enrollmentNumber,
      password,
      role: 'student'
    });

    if (response.data.token) {
      setToken(response.data.token);
      setUserData(response.data);
    }
    return response.data;}

  async setPassword(token, password) {
    // Sending token normally in body or as a query. Assuming body based on standard setups:
    const response = await api.post('/auth/set-password', {
      token,
      password,
    });
    return response.data;
  }
}


export default new AuthService();
