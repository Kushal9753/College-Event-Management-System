import api from './api';
import { setToken, removeToken, setUserData } from '../utils/tokenHandler';

class AuthService {
  async login(enrollmentNumber, password) {
    const response = await api.post('/auth/login', {
      enrollmentNumber,
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
    
    return response.data;
  }
}

export default new AuthService();
