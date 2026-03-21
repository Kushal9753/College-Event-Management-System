import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

class AuthService {
  async loginUser(enrollmentNumber, password) {
    const user = await User.findOne({ enrollmentNumber }).select('+password');
    if (!user) throw new Error('Invalid credentials');

    const isMatch = await user.matchPassword(password);
    if (!isMatch) throw new Error('Invalid credentials');

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      collegeName: user.collegeName,
      role: user.role,
      token: generateToken(user._id, user.role),
    };
  }

  async registerUser(userData) {
    const { name, email, phone, collegeName, enrollmentNumber, password, role } = userData;

    const userExists = await User.findOne({ email });
    if (userExists) throw new Error('User already exists with this email');

    const user = await User.create({ name, email, phone, collegeName, enrollmentNumber, password, role: role || 'student' });

    if (user) {
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        collegeName: user.collegeName,
        enrollmentNumber: user.enrollmentNumber,
        role: user.role,
        token: generateToken(user._id, user.role),
      };
    } else {
      throw new Error('Invalid user data');
    }
  }
}

export default new AuthService();
