import Message from '../models/Message.js';

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

    // Populate sender and receiver details before returning
    const populated = await newMessage.populate([
      { path: 'sender', select: 'name enrollmentNumber' },
      { path: 'receivers', select: 'name email department' },
    ]);

    res.status(201).json({ success: true, data: populated });
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
      type,
      receiver,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    // Only show messages sent by the logged-in user (admin)
    query.sender = req.user._id;

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
        .populate('sender', 'name enrollmentNumber')
        .populate('receivers', 'name email department')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Message.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};
