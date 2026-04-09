import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import EventLog from '../models/EventLog.js';
import BankDetails from '../models/BankDetails.js';
import Registration from '../models/Registration.js';
import QRCode from 'qrcode';
import { getIO } from '../socket.js';

// @desc    Create a new event
// @route   POST /api/events/create
// @access  Private (Admin or Faculty)
export const createEvent = async (req, res, next) => {
  try {
    const { title, name, venue, location, date, time, duration, category, description, assignedFaculty, registrationFees, prize } = req.body;

    const eventTitle = title || name;
    const eventVenue = venue || location;

    // Validate required fields
    if (!eventTitle || !eventVenue || !date || !description || registrationFees === undefined || !prize) {
      res.status(400);
      throw new Error('Please provide all required fields: title, venue, date, description, registrationFees, prize');
    }

    // Set status based on role: admin → approved, faculty → pending
    let status = 'pending';
    if (req.user.role === 'admin') {
      status = 'approved';
    } else if (req.user.role === 'faculty') {
      status = 'pending';
    } else {
      res.status(403);
      throw new Error('Not authorized to create events');
    }

    let assignedFaculties = Array.isArray(assignedFaculty) ? assignedFaculty : (assignedFaculty ? [assignedFaculty] : []);
    if (req.user.role === 'faculty' && !assignedFaculties.includes(req.user._id.toString())) {
      assignedFaculties.push(req.user._id);
    }

    const event = await Event.create({
      title: eventTitle,
      venue: eventVenue,
      date,
      time,
      duration,
      category,
      description,
      registrationFees,
      prize,
      createdBy: req.user._id,
      role: req.user.role,
      assignedFaculty: assignedFaculties,
      status,
    });

    // Emit real-time event
    getIO().emit('event_created', event);

    await EventLog.create({
      event: event._id,
      action: 'created',
      performedBy: req.user._id,
      details: `Event "${event.title}" created`,
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Get all events created by logged in user
// @route   GET /api/events/my-events
// @access  Private
export const getMyEvents = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    let query = { createdBy: req.user._id };

    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (status) query.status = status;

    const events = await Event.find(query)
      .populate('assignedFaculty', 'name email')
      .populate('registrations', 'name email')
      .sort({ createdAt: -1 });

    // Enrich with registrationCount
    const data = events.map(event => {
      const obj = event.toObject();
      obj.registrationCount = event.registrations.length;
      return obj;
    });

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations for the logged-in student
// @route   GET /api/events/my-registrations
// @access  Private (Student only)
export const getMyRegistrations = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      res.status(403);
      throw new Error('Only students can view their registrations');
    }

    const registrations = await Registration.find({ studentId: req.user._id })
      .populate('eventId', 'title name venue date time duration category description registrationFees prize')
      .sort({ createdAt: -1 });

    const responseData = registrations.map(reg => {
      const regObj = reg.toObject();
      regObj.event = regObj.eventId;
      delete regObj.eventId;
      return regObj;
    });

    res.status(200).json({ success: true, count: responseData.length, data: responseData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get event by ID with student-specific status
// @route   GET /api/events/:id
// @access  Private (Authenticated users)
export const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email enrollmentNumber')
      .populate('assignedFaculty', 'name email');

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    const eventObj = event.toObject();
    eventObj.registrationCount = event.registrations.length;

    // Default status values
    let isRegistered = false;
    let paymentStatus = null;
    let qrCode = null;

    // Enrichment for students
    if (req.user.role === 'student') {
      const registration = await Registration.findOne({
        studentId: req.user._id,
        eventId: event._id,
      });

      if (registration) {
        isRegistered = true;
        paymentStatus = registration.paymentStatus;
        qrCode = registration.qrCode;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...eventObj,
        isRegistered,
        paymentStatus,
        qrCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events (filtered by role)
// @route   GET /api/events
// @access  Private
export const getAllEvents = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    let query = {};

    // Apply role-based filtering
    if (req.user.role === 'faculty') {
      // Faculty → only their created events
      query = { createdBy: req.user._id };
    } else if (req.user.role === 'student') {
      // Student → only approved events (unless a specific status is queried, but limit to approved/completed/ongoing normally)
      query = { status: status || { $in: ['approved', 'ongoing', 'completed'] } };
    }

    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;
    if (req.user.role !== 'student' && status) query.status = status;

    const events = await Event.find(query)
      .populate('createdBy', 'name email enrollmentNumber')
      .populate('assignedFaculty', 'name email')
      .populate('registrations', 'name email')
      .sort({ date: 1 }); // Sorted by earliest date first

    // Add role-specific enrichment
    let responseData = events.map(event => {
      const eventObj = event.toObject();
      eventObj.registrationCount = event.registrations.length;
      return eventObj;
    });

    if (req.user.role === 'student') {
      responseData = await Promise.all(responseData.map(async (eventObj) => {
        const registration = await Registration.findOne({
          studentId: req.user._id,
          eventId: eventObj._id,
        });

        return {
          ...eventObj,
          isRegistered: !!registration,
          paymentStatus: registration ? registration.paymentStatus : null,
          qrCode: (registration && registration.paymentStatus === 'pending') ? registration.qrCode : null,
        };
      }));
    }
      
    res.status(200).json({ success: true, count: responseData.length, data: responseData });
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
      .populate('createdBy', 'name enrollmentNumber')
      .populate('assignedFaculty', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve an event
// @route   PATCH /api/events/:id/approve
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

    // Emit real-time update
    getIO().emit('event_updated', event);

    await EventLog.create({
      event: event._id,
      action: 'approved',
      performedBy: req.user._id,
      details: 'Event approved by admin',
    });

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Reject an event
// @route   PATCH /api/events/:id/reject
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

    // Emit real-time update
    getIO().emit('event_updated', event);

    await EventLog.create({
      event: event._id,
      action: 'rejected',
      performedBy: req.user._id,
      details: `Event rejected by admin. Reason: ${rejection_reason}`,
    });

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Register a student for an event
// @route   POST /api/events/:id/register
// @access  Private (Student only)
export const registerForEvent = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      res.status(403);
      throw new Error('Only students can register for events');
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    if (event.status !== 'approved') {
      res.status(400);
      throw new Error('Cannot register for events that are not approved');
    }

    // Check for existing registration in Registration model
    const existingRegistration = await Registration.findOne({
      studentId: req.user._id,
      eventId: event._id,
    });
    if (existingRegistration) {
      res.status(400);
      throw new Error('You are already registered for this event');
    }

    // Check capacity
    const currentRegs = await Registration.countDocuments({ eventId: event._id });
    if (event.maxParticipants > 0 && currentRegs >= event.maxParticipants) {
      res.status(400);
      throw new Error('Event has reached maximum capacity');
    }

    const amount = event.registrationFees || 0;
    let qrCode = null;
    let paymentStatus = amount > 0 ? 'pending' : 'paid';

    // Generate dynamic payment QR if fee > 0
    if (amount > 0) {
      const bankDetails = await BankDetails.findOne();
      if (!bankDetails || !bankDetails.upiId) {
        res.status(400);
        throw new Error('Payment system is not configured by the administrator (No UPI ID found)');
      }

      // Extract details
      const upiId = bankDetails.upiId;
      const accountHolder = bankDetails.accountHolderName;
      
      // Standard UPI Payment URL: upi://pay?pa=<ADDRESS>&pn=<NAME>&am=<AMOUNT>&cu=INR&tn=<NOTE>
      // Using 'pn' for Payee Name and 'tn' for Transaction Note (Event Name)
      const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(accountHolder)}&am=${amount}&cu=INR&tn=${encodeURIComponent('Reg: ' + event.title.substring(0, 20))}`;
      
      // Generate QR data URI (Base64 image)
      qrCode = await QRCode.toDataURL(upiString);
    }

    // Create the registration record
    const registration = await Registration.create({
      studentName: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      studentId: req.user._id,
      eventId: event._id,
      amount,
      paymentStatus,
      qrCode,
      transactionId: '', // Initial empty string as per request field
    });

    // Also update the event's registrations array for backward compatibility counting
    event.registrations.push(req.user._id);
    await event.save();

    const registrationCount = event.registrations.length;

    // Emit real-time events — global broadcast + room-specific for faculty monitoring
    const registrationPayload = {
      eventId: event._id,
      eventName: event.title,
      registrationCount,
      maxParticipants: event.maxParticipants,
      action: 'registered',
      studentName: req.user.name,
      paymentStatus,
    };
    getIO().emit('event_updated', event);
    getIO().emit('registration_update', registrationPayload);
    // Targeted emit to faculty/admin subscribed to this specific event room
    getIO().to(`event_${event._id}`).emit('registration_update', registrationPayload);

    await EventLog.create({
      event: event._id,
      action: 'registered',
      performedBy: req.user._id,
      details: `Student ${req.user.name} registered for ${event.title}. Amount: ${amount}, Status: ${paymentStatus}`,
    });

    res.status(200).json({
      success: true,
      message: amount > 0 ? 'Registration pending payment' : 'Registered successfully',
      data: registration,
      event: event,
      registrationCount,
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Cancel student registration for an event
// @route   DELETE /api/events/:id/register
// @access  Private (Student only)
export const cancelEventRegistration = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      res.status(403);
      throw new Error('Only students can cancel event registrations');
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    // Check if registered
    const regIndex = event.registrations.findIndex(
      (id) => id.toString() === req.user._id.toString()
    );
    if (regIndex === -1) {
      res.status(400);
      throw new Error('You are not registered for this event');
    }

    event.registrations.splice(regIndex, 1);
    await event.save();

    const registrationCount = event.registrations.length;

    // Emit real-time events — global broadcast + room-specific
    const registrationPayload = {
      eventId: event._id,
      eventName: event.title,
      registrationCount,
      maxParticipants: event.maxParticipants,
      action: 'cancelled',
      studentName: req.user.name,
    };
    getIO().emit('event_updated', event);
    getIO().emit('registration_update', registrationPayload);
    getIO().to(`event_${event._id}`).emit('registration_update', registrationPayload);

    await EventLog.create({
      event: event._id,
      action: 'registration_cancelled',
      performedBy: req.user._id,
      details: `Student ${req.user.name} cancelled their registration`,
    });

    res.status(200).json({
      success: true,
      message: 'Registration cancelled',
      data: event,
      registrationCount,
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Get participants list for an event
// @route   GET /api/events/:id/participants
// @access  Private (Admin or Faculty who created/is assigned to the event)
export const getEventParticipants = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registrations', 'name email phone collegeName enrollmentNumber')
      .populate('createdBy', 'name email');

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    // Authorization: admin can see all; faculty can see if they created or are assigned
    if (req.user.role === 'faculty') {
      const isCreator = event.createdBy._id.toString() === req.user._id.toString();
      const isAssigned = event.assignedFaculty.some(
        (id) => id.toString() === req.user._id.toString()
      );
      if (!isCreator && !isAssigned) {
        res.status(403);
        throw new Error('Not authorized to view participants for this event');
      }
    } else if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view participants');
    }

    // Pagination support
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const startIndex = (page - 1) * limit;
    const total = event.registrations.length;
    const participants = event.registrations.slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      data: {
        eventId: event._id,
        eventName: event.title,
        totalRegistered: total,
        maxParticipants: event.maxParticipants,
        participants,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Get registration count for an event (lightweight)
// @route   GET /api/events/:id/registration-count
// @access  Private (Admin or Faculty)
export const getEventRegistrationCount = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id).select('title registrations maxParticipants');

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    res.status(200).json({
      success: true,
      data: {
        eventId: event._id,
        eventName: event.title,
        totalRegistered: event.registrations.length,
        maxParticipants: event.maxParticipants,
        spotsRemaining: event.maxParticipants > 0
          ? Math.max(0, event.maxParticipants - event.registrations.length)
          : null, // null = unlimited
      },
    });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};


// @desc    Get events assigned to logged-in faculty
// @route   GET /api/events/assigned
// @access  Private (Faculty)
export const getAssignedEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ assignedFaculty: req.user._id })
      .populate('createdBy', 'name email')
      .populate('assignedFaculty', 'name email')
      .sort({ date: 1 });

    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign faculty to an event
// @route   PATCH /api/events/:id/assign-faculty
// @access  Private (Admin only)
export const assignFaculty = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized as admin');
    }

    const { facultyIds } = req.body;
    if (!facultyIds || !Array.isArray(facultyIds)) {
      res.status(400);
      throw new Error('Please provide an array of faculty IDs');
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    event.assignedFaculty = facultyIds;
    await event.save();

    const populated = await Event.findById(event._id)
      .populate('createdBy', 'name email')
      .populate('assignedFaculty', 'name email');

    getIO().emit('event_updated', populated);

    await EventLog.create({
      event: event._id,
      action: 'assigned',
      performedBy: req.user._id,
      details: `Faculty members assigned to the event`,
    });

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Mark event as completed
// @route   PATCH /api/events/:id/complete
// @access  Private (Assigned Faculty or Admin)
export const markEventCompleted = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    // Check authorization: Admin or Assigned Faculty
    if (req.user.role === 'faculty') {
      const isAssigned = event.assignedFaculty.some(
        (id) => id.toString() === req.user._id.toString()
      );
      if (!isAssigned) {
        res.status(403);
        throw new Error('Not authorized to modify this event. Only assigned faculty can.');
      }
    } else if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized');
    }

    event.status = 'completed';
    await event.save();

    getIO().emit('event_updated', event);

    await EventLog.create({
      event: event._id,
      action: 'updated',
      performedBy: req.user._id,
      details: 'Event marked as completed',
    });

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Add winners to a completed event
// @route   POST /api/events/:id/winners
// @access  Private (Assigned Faculty or Admin)
export const addWinners = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    // Check authorization: Admin or Assigned Faculty
    if (req.user.role === 'faculty') {
      const isAssigned = event.assignedFaculty.some(
        (id) => id.toString() === req.user._id.toString()
      );
      if (!isAssigned) {
        res.status(403);
        throw new Error('Not authorized to modify this event. Only assigned faculty can.');
      }
    } else if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized');
    }

    // Validation: Only if completed
    if (event.status !== 'completed' && event.status !== 'pending_approval') {
      res.status(400);
      throw new Error('Winners can only be added when event status is "completed".');
    }

    const { winners } = req.body;
    if (!winners || !Array.isArray(winners)) {
      res.status(400);
      throw new Error('Please provide an array of winners');
    }

    // Replace winners
    event.winners = winners;
    // Set status to pending_approval for admin validation
    event.status = 'pending_approval';
    await event.save();

    const populated = await Event.findById(event._id)
      .populate('createdBy', 'name email')
      .populate('assignedFaculty', 'name email')
      .populate('winners.student', 'name email enrollmentNumber');

    // Real-Time notification to admins
    getIO().to('admin_room').emit('winners_added', {
      eventId: event._id,
      eventName: event.title,
      winners: populated.winners
    });
    
    // Also broadcast update globally so ui refreshes
    getIO().emit('event_updated', populated);

    await EventLog.create({
      event: event._id,
      action: 'winners_added',
      performedBy: req.user._id,
      details: 'Winners added and submitted for approval',
    });

    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Approve event results (winners)
// @route   PATCH /api/events/:id/results/approve
// @access  Private (Admin only)
export const approveResults = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized as admin');
    }

    const event = await Event.findById(req.params.id)
      .populate('registrations', '_id')
      .populate('assignedFaculty', '_id')
      .populate('createdBy', '_id');

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    if (event.status !== 'pending_approval') {
      res.status(400);
      throw new Error('Event results are not pending approval');
    }

    event.status = 'published';
    await event.save();

    // Create notifications for all registered students
    const notifications = event.registrations.map((studentId) => ({
      recipient: studentId._id,
      type: 'result_published',
      message: `Results for ${event.title} have been published!`,
      relatedEvent: event._id,
    }));

    // Notify assigned faculty
    event.assignedFaculty.forEach((faculty) => {
      notifications.push({
        recipient: faculty._id,
        type: 'result_approved',
        message: `Your submitted results for ${event.title} were approved.`,
        relatedEvent: event._id,
      });
    });

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      // Emit socket events to individual users
      notifications.forEach((note) => {
        getIO().to(`user_${note.recipient}`).emit('notification', note);
      });
    }

    // Global emit for event update
    getIO().emit('event_updated', event);

    await EventLog.create({
      event: event._id,
      action: 'approved',
      performedBy: req.user._id,
      details: 'Event results/winners approved and published',
    });

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Reject event results (winners)
// @route   PATCH /api/events/:id/results/reject
// @access  Private (Admin only)
export const rejectResults = async (req, res, next) => {
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

    const event = await Event.findById(req.params.id)
      .populate('assignedFaculty', '_id');

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    if (event.status !== 'pending_approval') {
      res.status(400);
      throw new Error('Event results are not pending approval');
    }

    event.status = 'completed'; // Revert back to completed so faculty can resubmit
    event.rejectionReason = rejection_reason;
    await event.save();

    // Note: Notification creation for assigned faculty
    const notifications = [];
    event.assignedFaculty.forEach((faculty) => {
      notifications.push({
        recipient: faculty._id,
        type: 'result_rejected',
        message: `Your submitted results for ${event.title} were rejected. Reason: ${rejection_reason}`,
        relatedEvent: event._id,
      });
    });

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      notifications.forEach((note) => {
        getIO().to(`user_${note.recipient}`).emit('notification', note);
      });
    }

    // Global emit for event update
    getIO().emit('event_updated', event);

    await EventLog.create({
      event: event._id,
      action: 'rejected',
      performedBy: req.user._id,
      details: `Event results rejected. Reason: ${rejection_reason}`,
    });

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Archive an event
// @route   PATCH /api/events/:id/archive
// @access  Private (Admin or Creator Faculty)
export const archiveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    if (req.user.role === 'faculty') {
      const isCreator = event.createdBy.toString() === req.user._id.toString();
      if (!isCreator) {
        res.status(403);
        throw new Error('Only the creator or admin can archive this event');
      }
    } else if (req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized');
    }

    event.status = 'archived';
    await event.save();

    await EventLog.create({
      event: event._id,
      action: 'archived',
      performedBy: req.user._id,
      details: 'Event was archived',
    });

    getIO().emit('event_archived', event);
    getIO().emit('event_updated', event);

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};

// @desc    Export event participants to CSV
// @route   GET /api/events/:id/export
// @access  Private (Admin or Assigned Faculty)
export const exportEventData = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('registrations', 'name email phone collegeName enrollmentNumber');

    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    if (req.user.role === 'faculty') {
      const isCreator = event.createdBy.toString() === req.user._id.toString();
      const isAssigned = event.assignedFaculty.some((id) => id.toString() === req.user._id.toString());
      if (!isCreator && !isAssigned) {
        res.status(403);
        throw new Error('Not authorized to export data for this event');
      }
    }

    const exportData = event.registrations.map(user => ({
      'Name': user.name || '',
      'Email': user.email || '',
      'Phone': user.phone || '',
      'College': user.collegeName || '',
      'Enrollment': user.enrollmentNumber || '',
      'Attended': event.attended.includes(user._id) ? 'Yes' : 'No'
    }));

    if (exportData.length === 0) {
      res.status(400);
      throw new Error('No registrations to export');
    }

    const { Parser } = await import('json2csv');
    const json2csvParser = new Parser({ fields: Object.keys(exportData[0]) });
    const csv = json2csvParser.parse(exportData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`${event.title.replace(/\s+/g, '_')}_participants.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance for an event
// @route   PATCH /api/events/:id/attendance
// @access  Private (Admin or Assigned Faculty)
export const markAttendance = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404);
      throw new Error('Event not found');
    }

    if (req.user.role === 'faculty') {
      const isAssigned = event.assignedFaculty.some((id) => id.toString() === req.user._id.toString());
      if (!isAssigned) {
        res.status(403);
        throw new Error('Not authorized. Only assigned faculty can mark attendance.');
      }
    }

    const { attendedIds } = req.body;
    if (!Array.isArray(attendedIds)) {
      res.status(400);
      throw new Error('Please provide an array of attended user IDs');
    }

    event.attended = attendedIds;
    await event.save();

    await EventLog.create({
      event: event._id,
      action: 'attendance_marked',
      performedBy: req.user._id,
      details: `Attendance marked for ${attendedIds.length} students`,
    });

    getIO().emit('event_updated', event);

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) res.status(400);
    next(error);
  }
};
