import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiFilter, FiX, FiSearch, FiRefreshCw, FiLogOut, FiEye, FiTrash2 } from 'react-icons/fi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    eventType: 'All',
    status: 'All',
    bookingType: 'All',
    startDate: '',
    endDate: '',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async (filterParams = {}) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('No authentication token found');
        navigate('/admin/login');
        return;
      }

      const queryParams = new URLSearchParams();
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value && value !== 'All') {
          queryParams.append(key, value);
        }
      });

      const res = await axios.get(
        `${config.API_URL}/events/admin/all-bookings?${queryParams}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const bookingsList = res.data.data || res.data.bookings || [];
      setBookings(bookingsList);
      
      setStats({
        total: bookingsList.length,
        pending: bookingsList.filter(b => b.status === 'Pending').length,
        confirmed: bookingsList.filter(b => b.status === 'Confirmed').length,
        completed: bookingsList.filter(b => b.status === 'Completed').length
      });
    } catch (error) {
      console.error('Fetch bookings error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch bookings');
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const activeFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'All' && value !== '') {
        activeFilters[key] = value;
      }
    });
    fetchBookings(activeFilters);
    setShowFilters(false);
    toast.success(`Filters applied: ${Object.keys(activeFilters).length} active`);
  };

  const clearFilters = () => {
    setFilters({
      eventType: 'All',
      status: 'All',
      bookingType: 'All',
      startDate: '',
      endDate: '',
      search: ''
    });
    fetchBookings();
    toast.success('Filters cleared');
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${config.API_URL}/events/admin/update-booking/${id}`, 
        { status },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success('Status updated successfully');
      fetchBookings(filters);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${config.API_URL}/events/admin/delete-booking/${id}`, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      toast.success('Booking deleted successfully');
      fetchBookings(filters);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete booking');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'All' && v !== '').length;

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Find this section in the return statement and update it:

return (
  <div className="admin-dashboard">
    {/* Header - REMOVE LOGOUT BUTTON */}
    <div className="admin-header">
      <div className="header-left">
        <h1>Admin Dashboard</h1>
        <p>Manage all event and catering bookings</p>
      </div>
      <div className="header-right">
        {/* Only Filters button, removed Logout */}
        <button onClick={() => setShowFilters(!showFilters)} className="filter-btn">
          <FiFilter /> Filters
          {activeFiltersCount > 0 && <span className="filter-badge">{activeFiltersCount}</span>}
        </button>
      </div>
    </div>

    {/* Rest of the code remains the same... */}

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-header">
            <h3><FiFilter /> Filter Bookings</h3>
            <button onClick={() => setShowFilters(false)} className="close-filter"><FiX /></button>
          </div>
          
          <div className="filter-grid">
            <div className="filter-group">
              <label>Search</label>
              <div className="search-input">
                <FiSearch />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Event name, customer, venue..."
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Booking Type</label>
              <select name="bookingType" value={filters.bookingType} onChange={handleFilterChange}>
                <option value="All">All Bookings</option>
                <option value="Catering">Catering Only</option>
                <option value="Events">Events Only</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Event Type</label>
              <select name="eventType" value={filters.eventType} onChange={handleFilterChange}>
                <option value="All">All Types</option>
                <option value="Wedding">Wedding</option>
                <option value="Corporate">Corporate</option>
                <option value="Birthday">Birthday</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Baby Shower">Baby Shower</option>
                <option value="Catering">Catering</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Start Date</label>
              <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
            </div>

            <div className="filter-group">
              <label>End Date</label>
              <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
            </div>
          </div>

          <div className="filter-actions">
            <button onClick={clearFilters} className="clear-btn"><FiRefreshCw /> Clear All</button>
            <button onClick={applyFilters} className="apply-btn">Apply Filters</button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="admin-container">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p className="stat-number">{stats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p className="stat-number pending">{stats.pending}</p>
          </div>
          <div className="stat-card">
            <h3>Confirmed</h3>
            <p className="stat-number confirmed">{stats.confirmed}</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <p className="stat-number completed">{stats.completed}</p>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bookings-table-container">
          <div className="table-header">
            <h2>All Bookings</h2>
            {activeFiltersCount > 0 && (
              <span className="active-filters-info">{activeFiltersCount} filter(s) active</span>
            )}
          </div>
          
          {bookings.length === 0 ? (
            <div className="no-bookings">
              <p>No bookings found</p>
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="clear-filters-btn">Clear Filters</button>
              )}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Type</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Guests</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td data-label="Event Name">{booking.eventName}</td>
                      <td data-label="Type">
                        <span className={`type-badge ${booking.eventType?.toLowerCase().replace(' ', '-')}`}>
                          {booking.eventType}
                        </span>
                      </td>
                      <td data-label="Customer">
                        <div className="customer-info">
                          <span className="customer-name">{booking.userId?.name || 'N/A'}</span>
                          <span className="customer-email">{booking.userId?.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td data-label="Date">{new Date(booking.eventDate).toLocaleDateString()}</td>
                      <td data-label="Guests">{booking.numberOfGuests}</td>
                      <td data-label="Status">
                        <select 
                          value={booking.status}
                          onChange={(e) => updateStatus(booking._id, e.target.value)}
                          className={`status-select ${booking.status.toLowerCase()}`}
                        >
                          <option>Pending</option>
                          <option>Confirmed</option>
                          <option>In Progress</option>
                          <option>Completed</option>
                          <option>Cancelled</option>
                        </select>
                      </td>
                      <td data-label="Actions">
                        <div className="action-buttons">
                          <button onClick={() => setSelectedBooking(booking)} className="btn-view" title="View">
                            <FiEye />
                          </button>
                          <button onClick={() => deleteBooking(booking._id)} className="btn-delete" title="Delete">
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Booking Details</h2>
              <button onClick={() => setSelectedBooking(null)} className="modal-close">×</button>
            </div>
            <div className="booking-details">
              <div className="detail-section">
                <h3>Event Information</h3>
                <div className="detail-grid">
                  <div className="detail-item"><strong>Event Name:</strong> {selectedBooking.eventName}</div>
                  <div className="detail-item"><strong>Type:</strong> {selectedBooking.eventType}</div>
                  <div className="detail-item"><strong>Date:</strong> {new Date(selectedBooking.eventDate).toLocaleDateString()}</div>
                  <div className="detail-item"><strong>Time:</strong> {selectedBooking.eventTime}</div>
                  <div className="detail-item"><strong>Venue:</strong> {selectedBooking.venue}</div>
                  <div className="detail-item"><strong>Guests:</strong> {selectedBooking.numberOfGuests}</div>
                  <div className="detail-item"><strong>Budget:</strong> {selectedBooking.budget}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Menu & Preferences</h3>
                <div className="detail-grid">
                  <div className="detail-item"><strong>Menu:</strong> {selectedBooking.menuPreferences}</div>
                  <div className="detail-item"><strong>Special Requests:</strong> {selectedBooking.specialRequests || 'None'}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Customer Information</h3>
                <div className="detail-grid">
                  <div className="detail-item"><strong>Name:</strong> {selectedBooking.userId?.name || 'N/A'}</div>
                  <div className="detail-item"><strong>Email:</strong> {selectedBooking.userId?.email || 'N/A'}</div>
                  <div className="detail-item"><strong>Phone:</strong> {selectedBooking.userId?.phone || 'N/A'}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Booking Status</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <strong>Current Status:</strong> 
                    <span className={`status-badge ${selectedBooking.status.toLowerCase()}`}>{selectedBooking.status}</span>
                  </div>
                  <div className="detail-item"><strong>Created:</strong> {new Date(selectedBooking.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
            <button onClick={() => setSelectedBooking(null)} className="premium-btn modal-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;