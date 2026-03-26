import Event from '../models/Event.js';

// @desc    Create a new event
// @route   POST /api/events/create
// @access  Private
export const createEvent = async (req, res, next) => {
  try {
    const { title, description, date, location } = req.body;
    
    let status = 'pending';
    if (req.user.role === 'admin') {
      status = 'approved';
    } else if (req.user.role === 'faculty') {
      status = 'pending';
    }
    
    // Create event with appropriate status and set organizer to current user
    const event = await Event.create({
      title,
      description,
      date,
      location,
      organizer: req.user._id,
      status,
    });
    
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Get all events created by logged in user (faculty)
// @route   GET /api/events/my-events
// @access  Private
export const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user._id })
      .sort({ createdAt: -1 });
      
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};


// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getAllEvents = async (req, res, next) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name enrollmentNumber')
      .sort({ date: 1 }); // Sorted by earliest date first
      
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pending events
// @route   GET /api/events/pending
// @access  Private (Admin only)
export const getPendingEvents = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized as admin');
    }

    const events = await Event.find({ status: 'pending' })
      .populate('organizer', 'name enrollmentNumber')
      .sort({ createdAt: -1 }); // Newest requests first
      
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve an event
// @route   PUT /api/events/:id/approve
// @access  Private (Admin only)
export const approveEvent = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized as admin');
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    
    event.status = 'approved';
    await event.save();
    
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Reject an event
// @route   PUT /api/events/:id/reject
// @access  Private (Admin only)
export const rejectEvent = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized as admin');
    }

    const { rejection_reason } = req.body;
    if (!rejection_reason) {
      res.status(400);
      throw new Error('Please provide a rejection reason');
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }
    
    event.status = 'rejected';
    event.rejectionReason = rejection_reason;
    await event.save();
    
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};
