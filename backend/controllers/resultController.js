import Result from '../models/Result.js';
import Event from '../models/Event.js';
import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';

/**
 * @desc    Add a result for an event
 * @route   POST /api/results
 * @access  Admin / Faculty
 */
export const addResult = async (req, res, next) => {
  try {
    const { eventId, eventName, winners } = req.body;

    // --- basic validation ---
    if (!eventId || !eventName || !winners || !Array.isArray(winners) || winners.length === 0) {
      res.status(400);
      return next(new Error('eventId, eventName, and a non-empty winners array are required'));
    }

    // Verify the event exists
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404);
      return next(new Error('Event not found'));
    }

    // Check for duplicate positions within the request payload
    const positions = winners.map((w) => w.position);
    if (positions.length !== new Set(positions).size) {
      res.status(400);
      return next(new Error('Duplicate positions are not allowed for the same event'));
    }

    // Check if a result already exists for this event
    const existingResult = await Result.findOne({ eventId });
    if (existingResult) {
      res.status(409);
      return next(new Error('A result already exists for this event. Delete it first to re-add.'));
    }

    const result = await Result.create({
      eventId,
      eventName,
      winners,
      createdBy: req.user._id,
      createdByModel: req.user.role === 'faculty' ? 'Faculty' : 'User',
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    // Handle Mongoose unique-index violation gracefully
    if (error.code === 11000) {
      res.status(409);
      return next(new Error('A result already exists for this event'));
    }
    next(error);
  }
};

/**
 * @desc    Get all results
 * @route   GET /api/results
 * @access  Public (or Protected — adjust middleware as needed)
 */
export const getAllResults = async (_req, res, next) => {
  try {
    const results = await Result.find()
      .populate('eventId', 'title date category status')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get result for a specific event
 * @route   GET /api/results/:eventId
 * @access  Public (or Protected)
 */
export const getResultByEvent = async (req, res, next) => {
  try {
    const result = await Result.findOne({ eventId: req.params.eventId }).populate(
      'eventId',
      'title date category status'
    );

    if (!result) {
      res.status(404);
      return next(new Error('No result found for this event'));
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a result by its _id
 * @route   DELETE /api/results/:id
 * @access  Admin / Faculty
 */
export const deleteResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id);

    if (!result) {
      res.status(404);
      return next(new Error('Result not found'));
    }

    await result.deleteOne();

    res.status(200).json({ success: true, message: 'Result deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Download result in PDF or CSV format
 * @route   GET /api/results/:eventId/download
 * @access  Admin / Faculty
 */
export const downloadResult = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { format } = req.query; // 'pdf' or 'csv'

    const result = await Result.findOne({ eventId }).populate('eventId');
    if (!result) {
      res.status(404);
      return next(new Error('No result found for this event'));
    }

    const event = result.eventId;
    const eventTitle = event ? event.title : result.eventName;
    const filename = `${eventTitle.replace(/\s+/g, '_')}_Results`;

    if (format === 'csv') {
      const fields = [
        'position',
        'name',
        'rollNumber',
        'branch',
        'year',
        'email',
        'phone',
        'prize',
        'score',
      ];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(result.winners);

      res.header('Content-Type', 'text/csv');
      res.attachment(`${filename}.csv`);
      return res.status(200).send(csv);
    } 
    
    // Default to PDF
    const doc = new PDFDocument({ margin: 50 });
    
    res.header('Content-Type', 'application/pdf');
    res.attachment(`${filename}.pdf`);
    doc.pipe(res);

    // Header
    doc.fillColor('#444444').fontSize(20).text('EVENT RESULT REPORT', { align: 'center' });
    doc.moveDown();
    
    // Event Details
    doc.fillColor('#000000').fontSize(14).text(`Event: ${eventTitle}`, { bold: true });
    if (event && event.date) {
      doc.fontSize(12).text(`Date: ${new Date(event.date).toLocaleDateString()}`);
    }
    doc.text(`Category: ${event?.category || 'N/A'}`);
    doc.text(`Venue: ${event?.venue || 'N/A'}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Winners List', { underline: true });
    doc.moveDown();

    // Table Header
    const tableTop = doc.y;
    const itemHeight = 25;
    
    doc.fontSize(10).fillColor('#444444');
    doc.text('Pos', 50, tableTop);
    doc.text('Name', 100, tableTop);
    doc.text('Roll Number', 250, tableTop);
    doc.text('Branch', 350, tableTop);
    doc.text('Prize', 450, tableTop);
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    
    // Table Rows
    let currentY = tableTop + 25;
    result.winners.forEach(winner => {
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
      
      doc.fillColor('#000000');
      doc.text(winner.position, 50, currentY);
      doc.text(winner.name, 100, currentY);
      doc.text(winner.rollNumber, 250, currentY);
      doc.text(winner.branch, 350, currentY);
      doc.text(winner.prize, 450, currentY);
      
      currentY += itemHeight;
    });

    // Signature Area
    const footerTop = 750;
    doc.moveTo(50, footerTop).lineTo(200, footerTop).stroke();
    doc.moveTo(400, footerTop).lineTo(550, footerTop).stroke();
    
    doc.fontSize(10).text('Co-ordinator Signature', 50, footerTop + 5);
    doc.text('Admin Signature', 400, footerTop + 5);
    
    doc.end();

  } catch (error) {
    next(error);
  }
};
