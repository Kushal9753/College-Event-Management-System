import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';
import Faculty from '../models/Faculty.js';
import EventLog from '../models/EventLog.js';

// @desc    Get comprehensive report data for admin dashboard
// @route   GET /api/admin/reports
// @access  Private/Admin
export const getReportData = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        },
      };
    }

    let reportData;

    switch (type) {
      case 'events':
        reportData = await generateEventReport(dateFilter);
        break;
      case 'registrations':
        reportData = await generateRegistrationReport(dateFilter);
        break;
      case 'revenue':
        reportData = await generateRevenueReport(dateFilter);
        break;
      case 'students':
        reportData = await generateStudentReport(dateFilter);
        break;
      case 'faculty':
        reportData = await generateFacultyReport(dateFilter);
        break;
      case 'activity':
        reportData = await generateActivityReport(dateFilter);
        break;
      case 'summary':
      default:
        reportData = await generateSummaryReport(dateFilter);
        break;
    }

    res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    next(error);
  }
};

// @desc    Download report as CSV
// @route   GET /api/admin/reports/download
// @access  Private/Admin
export const downloadReport = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
        },
      };
    }

    let csv = '';
    let filename = '';

    switch (type) {
      case 'events': {
        const events = await Event.find(dateFilter)
          .populate('createdBy', 'name email')
          .populate('assignedFaculty', 'name')
          .sort({ createdAt: -1 });
        const regCounts = await Registration.aggregate([
          { $group: { _id: '$eventId', count: { $sum: 1 }, totalRevenue: { $sum: '$amount' }, paidCount: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } } } },
        ]);
        const regMap = {};
        regCounts.forEach(r => { regMap[r._id.toString()] = r; });

        csv = 'Event Title,Category,Date,Venue,Status,Fee,Created By,Registrations,Revenue Collected,Faculty Assigned\n';
        events.forEach(e => {
          const r = regMap[e._id.toString()] || { count: 0, totalRevenue: 0 };
          csv += `"${e.title}","${e.category || ''}","${new Date(e.date).toLocaleDateString()}","${e.venue}","${e.status}","₹${e.registrationFees || 0}","${e.createdBy?.name || ''}","${r.count}","₹${r.totalRevenue}","${(e.assignedFaculty || []).map(f => f.name).join('; ')}"\n`;
        });
        filename = 'events_report.csv';
        break;
      }

      case 'registrations': {
        const regs = await Registration.find(dateFilter)
          .populate('eventId', 'title category date')
          .sort({ createdAt: -1 });
        csv = 'Student Name,Email,Phone,Event,Category,Amount,Payment Status,Payment Method,Transaction ID,Registered On\n';
        regs.forEach(r => {
          csv += `"${r.studentName || ''}","${r.email || ''}","${r.phone || ''}","${r.eventId?.title || ''}","${r.eventId?.category || ''}","₹${r.amount}","${r.paymentStatus}","${r.paymentMethod || 'N/A'}","${r.transactionId || ''}","${new Date(r.createdAt).toLocaleDateString()}"\n`;
        });
        filename = 'registrations_report.csv';
        break;
      }

      case 'revenue': {
        const paidRegs = await Registration.find({ ...dateFilter, paymentStatus: 'paid' })
          .populate('eventId', 'title category')
          .sort({ paymentDate: -1 });
        csv = 'Transaction ID,Student,Event,Category,Amount,Payment Method,Payment Date\n';
        paidRegs.forEach(r => {
          csv += `"${r.transactionId || ''}","${r.studentName || ''}","${r.eventId?.title || ''}","${r.eventId?.category || ''}","₹${r.amount}","${r.paymentMethod || 'N/A'}","${r.paymentDate ? new Date(r.paymentDate).toLocaleDateString() : ''}"\n`;
        });
        filename = 'revenue_report.csv';
        break;
      }

      case 'students': {
        const students = await User.find({ role: 'student', ...dateFilter }).sort({ createdAt: -1 });
        csv = 'Name,Email,Phone,College,Enrollment Number,Registered On\n';
        students.forEach(s => {
          csv += `"${s.name}","${s.email}","${s.phone || ''}","${s.collegeName || ''}","${s.enrollmentNumber || ''}","${new Date(s.createdAt).toLocaleDateString()}"\n`;
        });
        filename = 'students_report.csv';
        break;
      }

      case 'faculty': {
        const faculty = await Faculty.find(dateFilter).sort({ createdAt: -1 });
        csv = 'Name,Email,Phone,Department,Designation,College\n';
        faculty.forEach(f => {
          csv += `"${f.name}","${f.email}","${f.phone || ''}","${f.department || ''}","${f.designation || ''}","${f.collegeName || ''}"\n`;
        });
        filename = 'faculty_report.csv';
        break;
      }

      case 'activity': {
        const logs = await EventLog.find(dateFilter)
          .populate('event', 'title')
          .populate('performedBy', 'name email')
          .sort({ createdAt: -1 })
          .limit(500);
        csv = 'Action,Event,Performed By,Details,Timestamp\n';
        logs.forEach(l => {
          csv += `"${l.action}","${l.event?.title || ''}","${l.performedBy?.name || ''}","${(l.details || '').replace(/"/g, "'")}","${new Date(l.createdAt).toLocaleString()}"\n`;
        });
        filename = 'activity_report.csv';
        break;
      }

      default: {
        return res.status(400).json({ success: false, message: 'Invalid report type' });
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// ── Helper Functions ──────────────────────────────────

async function generateSummaryReport(dateFilter) {
  const [
    totalEvents,
    approvedEvents,
    pendingEvents,
    rejectedEvents,
    totalStudents,
    totalFaculty,
    registrations,
    revenueData,
    categoryBreakdown,
    recentActivity,
  ] = await Promise.all([
    Event.countDocuments(dateFilter),
    Event.countDocuments({ ...dateFilter, status: 'approved' }),
    Event.countDocuments({ ...dateFilter, status: 'pending' }),
    Event.countDocuments({ ...dateFilter, status: 'rejected' }),
    User.countDocuments({ role: 'student', ...dateFilter }),
    Faculty.countDocuments(dateFilter),
    Registration.countDocuments(dateFilter),
    Registration.aggregate([
      { $match: { paymentStatus: 'paid', ...dateFilter } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Event.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    EventLog.find(dateFilter)
      .populate('event', 'title')
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10),
  ]);

  const revenue = revenueData[0] || { total: 0, count: 0 };

  return {
    overview: {
      totalEvents,
      approvedEvents,
      pendingEvents,
      rejectedEvents,
      totalStudents,
      totalFaculty,
      totalRegistrations: registrations,
      totalRevenue: revenue.total,
      paidRegistrations: revenue.count,
    },
    categoryBreakdown,
    recentActivity,
  };
}

async function generateEventReport(dateFilter) {
  const events = await Event.find(dateFilter)
    .populate('createdBy', 'name')
    .populate('assignedFaculty', 'name')
    .sort({ date: -1 });

  const regCounts = await Registration.aggregate([
    { $group: { _id: '$eventId', count: { $sum: 1 }, revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$amount', 0] } } } },
  ]);
  const regMap = {};
  regCounts.forEach(r => { regMap[r._id.toString()] = r; });

  return events.map(e => {
    const reg = regMap[e._id.toString()] || { count: 0, revenue: 0 };
    return {
      _id: e._id,
      title: e.title,
      category: e.category,
      date: e.date,
      venue: e.venue,
      status: e.status,
      fee: e.registrationFees,
      createdBy: e.createdBy?.name,
      faculty: (e.assignedFaculty || []).map(f => f.name),
      registrations: reg.count,
      revenue: reg.revenue,
    };
  });
}

async function generateRegistrationReport(dateFilter) {
  return Registration.find(dateFilter)
    .populate('eventId', 'title category date')
    .populate('studentId', 'name email enrollmentNumber')
    .sort({ createdAt: -1 });
}

async function generateRevenueReport(dateFilter) {
  const [monthlyRevenue, methodBreakdown, topEvents, totalStats] = await Promise.all([
    Registration.aggregate([
      { $match: { paymentStatus: 'paid', ...dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paymentDate' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Registration.aggregate([
      { $match: { paymentStatus: 'paid', ...dateFilter } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Registration.aggregate([
      { $match: { paymentStatus: 'paid', ...dateFilter } },
      { $group: { _id: '$eventId', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event',
        },
      },
      { $unwind: { path: '$event', preserveNullAndEmptyArrays: true } },
      { $project: { eventTitle: '$event.title', total: 1, count: 1 } },
    ]),
    Registration.aggregate([
      { $match: { paymentStatus: 'paid', ...dateFilter } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' }, totalPaid: { $sum: 1 } } },
    ]),
  ]);

  const pendingPayments = await Registration.aggregate([
    { $match: { paymentStatus: 'pending', ...dateFilter } },
    { $group: { _id: null, totalPending: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

  return {
    totalRevenue: totalStats[0]?.totalRevenue || 0,
    totalPaid: totalStats[0]?.totalPaid || 0,
    pendingAmount: pendingPayments[0]?.totalPending || 0,
    pendingCount: pendingPayments[0]?.count || 0,
    monthlyRevenue,
    methodBreakdown,
    topEvents,
  };
}

async function generateStudentReport(dateFilter) {
  const students = await User.find({ role: 'student', ...dateFilter })
    .select('-password')
    .sort({ createdAt: -1 });

  // Get registration counts per student
  const regCounts = await Registration.aggregate([
    { $group: { _id: '$studentId', eventCount: { $sum: 1 }, totalSpent: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$amount', 0] } } } },
  ]);
  const regMap = {};
  regCounts.forEach(r => { regMap[r._id.toString()] = r; });

  return students.map(s => ({
    _id: s._id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    collegeName: s.collegeName,
    enrollmentNumber: s.enrollmentNumber,
    joinedOn: s.createdAt,
    eventsRegistered: regMap[s._id.toString()]?.eventCount || 0,
    totalSpent: regMap[s._id.toString()]?.totalSpent || 0,
  }));
}

async function generateFacultyReport(dateFilter) {
  const faculty = await Faculty.find(dateFilter).sort({ createdAt: -1 });

  // Get event assignments per faculty
  const assignmentCounts = await Event.aggregate([
    { $unwind: '$assignedFaculty' },
    { $group: { _id: '$assignedFaculty', eventCount: { $sum: 1 } } },
  ]);
  const assignMap = {};
  assignmentCounts.forEach(a => { assignMap[a._id.toString()] = a.eventCount; });

  return faculty.map(f => ({
    _id: f._id,
    name: f.name,
    email: f.email,
    phone: f.phone,
    department: f.department,
    designation: f.designation,
    collegeName: f.collegeName,
    joinedOn: f.createdAt,
    eventsAssigned: assignMap[f._id.toString()] || 0,
  }));
}

async function generateActivityReport(dateFilter) {
  return EventLog.find(dateFilter)
    .populate('event', 'title')
    .populate('performedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(200);
}
