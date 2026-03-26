import Faculty from '../models/Faculty.js';
import crypto from 'crypto';
import { sendEmail } from '../utils/emailService.js';
import { generateToken } from '../utils/jwt.js';

// @desc    Get all faculty (search + filter + pagination)
// @route   GET /api/faculty
// @access  Public (protect later as needed)
export const getAllFaculty = async (req, res, next) => {
  try {
    const {
      search,
      department,
      status,
      expertise,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // Full-text search on name / email / department
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    // Exact filters
    if (department) query.department = department;
    if (status) query.status = status;
    if (expertise) query.expertise = { $in: expertise.split(',') };

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [faculty, total] = await Promise.all([
      Faculty.find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit)),
      Faculty.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: faculty.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: faculty,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create faculty
// @route   POST /api/faculty
export const createFaculty = async (req, res, next) => {
  try {
    const { name, email, department, expertise, status } = req.body;

    if (!name || !email || !department) {
      res.status(400);
      throw new Error('name, email, and department are required');
    }

    const exists = await Faculty.findOne({ email });
    if (exists) {
      res.status(409);
      throw new Error('A faculty member with this email already exists');
    }

    // Generate a secure random token for invitation
    const inviteToken = crypto.randomBytes(32).toString('hex');
    const inviteTokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const faculty = await Faculty.create({
      name,
      email,
      department,
      expertise,
      status,
      inviteToken,
      inviteTokenExpire,
    });

    // Send invite email
    const resetUrl = `http://localhost:5173/set-password?token=${inviteToken}`;
    const message = `Dear ${faculty.name},\n\nYou are invited to join CDGI Event Management System as a Faculty member.\n\nPlease click the link below to set your password and access your dashboard:\n\n${resetUrl}\n\nThis link will expire in 24 hours.`;

    try {
      await sendEmail({
        email: faculty.email,
        subject: 'Welcome to CDGI Event Management - Set Your Password',
        message,
        html: `<p>Dear <strong>${faculty.name}</strong>,</p>
               <p>You are invited to join CDGI Event Management System as a Faculty member.</p>
               <p>Please click the button below to set your password and access your dashboard:</p>
               <a href="${resetUrl}" style="display:inline-block;padding:10px 20px;background-color:#4F46E5;color:white;text-decoration:none;border-radius:5px;margin:10px 0;">Set Password</a>
               <p>Or copy and paste this link in your browser:<br><a href="${resetUrl}">${resetUrl}</a></p>
               <p><small>This link will expire in 24 hours.</small></p>`,
      });
    } catch (err) {
      console.error('Email could not be sent', err);
      // Even if email fails, faculty is created. We could reset token or just log it.
      // Usually, an admin could resend the invite.
    }
    
    console.log(`\n======================================================`);
    console.log(`FACULTY CREATED: ${faculty.name}`);
    console.log(`SEND THIS INVITE LINK TO FACULTY:`);
    console.log(resetUrl);
    console.log(`======================================================\n`);

    res.status(201).json({ success: true, data: faculty });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(500);
    next(error);
  }
};

// @desc    Update faculty
// @route   PUT /api/faculty/:id
export const updateFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!faculty) {
      res.status(404);
      throw new Error('Faculty not found');
    }

    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(500);
    next(error);
  }
};

// @desc    Delete faculty
// @route   DELETE /api/faculty/:id
export const deleteFaculty = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);

    if (!faculty) {
      res.status(404);
      throw new Error('Faculty not found');
    }

    res.status(200).json({ success: true, message: 'Faculty deleted successfully' });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(500);
    next(error);
  }
};

// @desc    Toggle faculty status (active / inactive)
// @route   PATCH /api/faculty/:id/status
export const toggleFacultyStatus = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      res.status(404);
      throw new Error('Faculty not found');
    }

    faculty.status = faculty.status === 'active' ? 'inactive' : 'active';
    await faculty.save();

    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(500);
    next(error);
  }
};

// @desc    Faculty Login
// @route   POST /api/faculty/login
// @access  Public
export const facultyLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide an email and password');
    }

    // Find faculty and explicitly select password field
    const faculty = await Faculty.findOne({ email }).select('+password');

    if (!faculty) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    if (!faculty.password) {
      res.status(401);
      throw new Error('Password not set. Please complete your registration using the invite link');
    }

    if (faculty.status !== 'active') {
      res.status(403);
      throw new Error('Your account is inactive. Please contact the administrator.');
    }

    const isMatch = await faculty.matchPassword(password);

    if (!isMatch) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    // Return the JWT token
    res.status(200).json({
      success: true,
      data: {
        _id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        role: 'faculty',
        token: generateToken(faculty._id, 'faculty'),
      },
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(500);
    next(error);
  }
};
