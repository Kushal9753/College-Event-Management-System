import Message from '../models/Message.js';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';

// @desc    Get all possible message recipients (Admin + Faculty)
// @route   GET /api/messages/recipients
export const getRecipients = async (req, res, next) => {
  try {
    const faculties = await Faculty.find({ status: 'active' }).select('name email department role');
    const admins = await User.find({ role: 'admin' }).select('name email role collegeName');
    
    // Format to have unified fields
    const formattedFaculties = faculties.map(f => ({ ...f.toObject(), userType: 'Faculty' }));
    const formattedAdmins = admins.map(a => ({ ...a.toObject(), userType: 'Admin', department: 'Admin Office' }));
    
    res.status(200).json({ success: true, data: [...formattedFaculties, ...formattedAdmins] });
  } catch (error) {
    next(error);
  }
};

// @desc    Send a message
// @route   POST /api/messages/send
export const sendMessage = async (req, res, next) => {
  try {
    const { receivers, message, type } = req.body;

    if (!receivers || !message || !type) {
      res.status(400);
      throw new Error('receivers, message, and type are required');
    }

    const newMessage = await Message.create({
      sender: req.user._id, // from auth middleware
      receivers,
      message,
      type,
    });

    // Frontend doesn't need populated data immediately, so we can just return it
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(500);
    next(error);
  }
};

// @desc    Get message history (with filtering + pagination)
// @route   GET /api/messages/history
export const getMessageHistory = async (req, res, next) => {
  try {
    const {
      mode,
      type,
      receiver,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (mode === 'inbox') {
      query.$or = [
        { receivers: req.user._id },
        { type: 'broadcast' }
      ];
    } else {
      // Only show messages sent by the logged-in user
      query.sender = req.user._id;
    }

    if (type) query.type = type;
    if (receiver) query.receivers = receiver; // filter by a specific receiver ID

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [messages, total] = await Promise.all([
      Message.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Message.countDocuments(query),
    ]);

    const userIds = new Set();
    messages.forEach(m => {
      if (m.sender) userIds.add(m.sender.toString());
      if (m.receivers) m.receivers.forEach(r => userIds.add(r.toString()));
    });
    const idsArray = Array.from(userIds);

    const [faculties, users] = await Promise.all([
      Faculty.find({ _id: { $in: idsArray } }).select('name email department').lean(),
      User.find({ _id: { $in: idsArray } }).select('name email enrollmentNumber role').lean()
    ]);

    const userMap = {};
    faculties.forEach(f => userMap[f._id.toString()] = f);
    users.forEach(u => userMap[u._id.toString()] = u);

    const populatedMessages = messages.map(m => ({
      ...m,
      sender: userMap[m.sender?.toString()] || { name: 'Unknown' },
      receivers: m.receivers?.map(r => userMap[r.toString()] || { name: 'Unknown' }) || []
    }));

    res.status(200).json({
      success: true,
      count: populatedMessages.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: populatedMessages,
    });
  } catch (error) {
    next(error);
  }
};
