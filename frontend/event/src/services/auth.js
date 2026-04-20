import api from './api';
import { setToken, removeToken, setUserData } from '../utils/tokenHandler';

class AuthService {
 /**
 * Login with role-specific portal validation.
 * @param {string} identifier - email or enrollment number
 * @param {string} password
 * @param {string} expectedRole - 'student' | 'faculty' | 'admin'
 */
 async login(identifier, password, expectedRole) {
 const response = await api.post('/auth/login', {
 identifier,
 password,
 expectedRole,
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

 async setPassword(token, password) {
 const response = await api.post('/auth/set-password', {
 token,
 password,
 });
 return response.data;
 }
}

export default new AuthService();
