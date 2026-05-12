const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const CateringInquiry = require('../models/CateringInquiry');
const EventBooking = require('../models/EventBooking');
const ContactMessage = require('../models/ContactMessage');

// Middleware: Verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// GET /api/admin/stats - Real data from database
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const [cateringCount, eventCount, contactCount] = await Promise.all([
      CateringInquiry.countDocuments(),
      EventBooking.countDocuments(),
      ContactMessage.countDocuments()
    ]);

    // Calculate total revenue from confirmed bookings only
    const confirmedEvents = await EventBooking.find({ status: 'confirmed' });
    const totalRevenue = confirmedEvents.reduce((sum, booking) => {
      // Estimate revenue based on guest count (you can adjust this logic)
      return sum + (booking.guestCount * 500); // ₹500 per guest estimate
    }, 0);

    const newInquiries = await CateringInquiry.countDocuments({ status: 'new' }) +
                        await EventBooking.countDocuments({ status: 'new' }) +
                        await ContactMessage.countDocuments({ status: 'new' });

    res.json({
      totalBookings: cateringCount + eventCount,
      totalRevenue,
      activeEvents: confirmedEvents.length,
      newInquiries
    });
  } catch (error) {
    console.error('❌ [ADMIN STATS] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// GET /api/admin/bookings - Real bookings from database
router.get('/bookings', verifyAdmin, async (req, res) => {
  try {
    const [catering, events] = await Promise.all([
      CateringInquiry.find().sort({ createdAt: -1 }).limit(50),
      EventBooking.find().sort({ createdAt: -1 }).limit(50)
    ]);

    // Combine and format for frontend
    const bookings = [
      ...catering.map(c => ({
        id: c._id,
        type: 'catering',
        client: c.name,
        email: c.email,
        phone: c.phone,
        event: c.eventType,
        date: c.eventDate,
        guests: c.guestCount,
        amount: c.guestCount * 500, // Estimated
        status: c.status,
        message: c.message,
        createdAt: c.createdAt
      })),
      ...events.map(e => ({
        id: e._id,
        type: 'event',
        client: e.name,
        email: e.email,
        phone: e.phone,
        event: e.eventType,
        date: e.eventDate,
        guests: e.guestCount,
        amount: e.guestCount * 500, // Estimated
        status: e.status,
        message: e.message,
        createdAt: e.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(bookings);
  } catch (error) {
    console.error('❌ [ADMIN BOOKINGS] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// GET /api/admin/inquiries - All inquiries with filtering
router.get('/inquiries', verifyAdmin, async (req, res) => {
  try {
    const { type, status, limit = 50 } = req.query;
    
    let query = {};
    if (status && status !== 'all') query.status = status;

    let results = [];
    
    if (!type || type === 'catering') {
      const catering = await CateringInquiry.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('-__v');
      results.push(...catering.map(c => ({ ...c.toObject(), inquiryType: 'catering' })));
    }
    
    if (!type || type === 'event') {
      const events = await EventBooking.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('-__v');
      results.push(...events.map(e => ({ ...e.toObject(), inquiryType: 'event' })));
    }
    
    if (!type || type === 'contact') {
      const contacts = await ContactMessage.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .select('-__v');
      results.push(...contacts.map(c => ({ ...c.toObject(), inquiryType: 'contact' })));
    }

    // Sort by createdAt descending
    results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json(results.slice(0, limit));
  } catch (error) {
    console.error('❌ [ADMIN INQUIRIES] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch inquiries' });
  }
});

// PATCH /api/admin/bookings/:id/status - Update booking status
router.patch('/bookings/:id/status', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['new', 'contacted', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    // Try to update in both collections
    let updated = await CateringInquiry.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      updated = await EventBooking.findByIdAndUpdate(
        id, 
        { status }, 
        { new: true, runValidators: true }
      );
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    console.log(`✅ [ADMIN] Updated ${id} status to: ${status}`);
    res.json({ success: true, message: 'Status updated', booking: updated });
  } catch (error) {
    console.error('❌ [ADMIN UPDATE STATUS] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// DELETE /api/admin/bookings/:id - Delete a booking
router.delete('/bookings/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try to delete from both collections
    let deleted = await CateringInquiry.findByIdAndDelete(id);
    if (!deleted) {
      deleted = await EventBooking.findByIdAndDelete(id);
    }
    if (!deleted) {
      deleted = await ContactMessage.findByIdAndDelete(id);
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    console.log(`✅ [ADMIN] Deleted record: ${id}`);
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    console.error('❌ [ADMIN DELETE] Error:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete record' });
  }
});

module.exports = router;