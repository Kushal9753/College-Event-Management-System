import authService from '../services/authService.js';

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      res.status(400);
      throw new Error('Please provide an email/enrollment number and password');
    }
    const userData = await authService.loginUser(identifier, password);
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
