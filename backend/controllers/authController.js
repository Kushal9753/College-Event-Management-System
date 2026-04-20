import authService from '../services/authService.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { identifier, password, expectedRole } = req.body;
    if (!identifier || !password) {
      res.status(400);
      throw new Error('Please provide an email/enrollment number and password');
    }
    const userData = await authService.loginUser(identifier, password, expectedRole);
    res.status(200).json(userData);
  } catch (error) {
    res.status(401);
    next(error);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, phone, collegeName, enrollmentNumber, password, role } = req.body;
    if (!name || !email || !phone || !collegeName || !enrollmentNumber || !password) {
      res.status(400);
      throw new Error('Please add all required fields');
    }
    const userData = await authService.registerUser({ name, email, phone, collegeName, enrollmentNumber, password, role });
    res.status(201).json(userData);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    next(error);
  }
};

// @desc    Set new password using a token
// @route   POST /api/auth/set-password
// @access  Public
export const setPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      res.status(400);
      throw new Error('Please provide both token and new password');
    }

    const result = await authService.setPassword(token, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(400);
    // Let the centralized errorHandler format it
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    let account = null;
    let expectedRole = req.user.role; // Attached during token verify

    if (expectedRole === 'faculty') {
      const Faculty = (await import('../models/Faculty.js')).default;
      account = await Faculty.findById(req.user._id);
    } else {
      const User = (await import('../models/User.js')).default;
      account = await User.findById(req.user._id);
    }

    if (account) {
      account.name = req.body.name || account.name;
      account.phone = req.body.phone || account.phone;
      
      if (expectedRole === 'faculty') {
        account.department = req.body.collegeName || account.department; // Match faculty schema
      } else {
        account.collegeName = req.body.collegeName || account.collegeName; 
      }
      
      if (req.body.password) {
        account.password = req.body.password;
      }

      const updatedAccount = await account.save();

      res.status(200).json({
        _id: updatedAccount._id,
        name: updatedAccount.name,
        email: updatedAccount.email,
        phone: updatedAccount.phone,
        collegeName: expectedRole === 'faculty' ? updatedAccount.department : updatedAccount.collegeName,
        enrollmentNumber: updatedAccount.enrollmentNumber,
        role: expectedRole, // explicitly send correct role
      });
    } else {
      res.status(404);
      throw new Error('Account not found');
    }
  } catch (error) {
    next(error);
  }
};
