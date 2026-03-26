import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import { generateToken } from '../utils/jwt.js';

class AuthService {
  async loginUser(identifier, password) {
    // 1. Try to find in User collection (Student/Admin)
    const user = await User.findOne({
      $or: [{ enrollmentNumber: identifier }, { email: identifier }]
    }).select('+password');

    // If found in User, check password
    if (user) {
      const isMatch = await user.matchPassword(password);
      if (isMatch) {
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user._id, user.role),
          collegeName: user.collegeName,
        };
      }
      // If password doesn't match, we DON'T throw yet, 
      // as they might be trying to log in as Faculty with the same email.
    }

    // 2. Try to find in Faculty collection (Email only)
    const faculty = await Faculty.findOne({ email: identifier }).select('+password');

    if (faculty) {
      const isMatch = await faculty.matchPassword(password);
      if (isMatch) {
        if (faculty.status !== 'active') {
          throw new Error('Your faculty account is inactive. Please contact the administrator.');
        }
        return {
          _id: faculty._id,
          name: faculty.name,
          email: faculty.email,
          role: 'faculty',
          token: generateToken(faculty._id, 'faculty'),
          department: faculty.department,
        };
      } else {
        // If they exist in faculty but password fails
        throw new Error('Invalid credentials');
      }
    }

    // If neither matched or was found
    throw new Error('Invalid credentials');
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
  async setPassword(token, newPassword) {
    // 1. Check User collection (for Students/Admins password reset)
    let account = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');

    let isFaculty = false;

    // 2. Check Faculty collection (for Faculty invite logic)
    if (!account) {
      account = await Faculty.findOne({
        inviteToken: token,
        inviteTokenExpire: { $gt: Date.now() },
      }).select('+password');
      isFaculty = true;
    }

    if (!account) {
      throw new Error('Invalid or expired token');
    }

    // Set new password (the model's pre-save hook will hash it)
    account.password = newPassword;
    
    // Invalidate the token based on the collection
    if (isFaculty) {
      account.inviteToken = undefined;
      account.inviteTokenExpire = undefined;
    } else {
      account.resetPasswordToken = undefined;
      account.resetPasswordExpire = undefined;
    }
    
    await account.save();

    return { success: true, message: 'Password has been updated successfully' };
  }
}

export default new AuthService();
