import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUsers, FiCalendar, FiDollarSign, FiPackage, FiLogOut, FiRefreshCw, FiEye, FiEdit, FiTrash2, FiFilter } from 'react-icons/fi';
import './AdminDashboard.css';

// API Base URL
const API_BASE_URL = 'https://charmenar-next-api.onrender.com/api';

const AdminDashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    activeEvents: 0,
    newInquiries: 0
  });
  
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // Check admin access
  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admins only.');
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, navigate]);

  // Fetch real data from backend
  const fetchDashboardData = async () => {
    if (refreshing) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching real admin dashboard data...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch stats
      const statsResponse = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
        console.log('✅ Stats loaded:', statsData);
      } else {
        throw new Error(`Stats API error: ${statsResponse.status}`);
      }

      // Fetch bookings
      const bookingsResponse = await fetch(`${API_BASE_URL}/admin/bookings`, { headers });
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
        console.log('✅ Bookings loaded:', bookingsData.length, 'items');
      } else {
        throw new Error(`Bookings API error: ${bookingsResponse.status}`);
      }
      
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
      setError('Failed to load dashboard data. Please check your connection.');
      toast.error('Failed to fetch real data from server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    toast.info('Refreshing data...');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'contacted': return 'status-contacted';
      case 'pending': 
      case 'new': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-new';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const handleViewBooking = async (booking) => {
    const details = `
Client: ${booking.client}
Email: ${booking.email}
Phone: ${booking.phone}
Event: ${booking.event}
Date: ${formatDate(booking.date)}
Guests: ${booking.guests}
Status: ${booking.status}
Message: ${booking.message || 'None'}
    `.trim();
    
    alert(details);
    // TODO: Navigate to detail page in future
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        toast.success('Status updated successfully');
        fetchDashboardData(); // Refresh data
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success('Booking deleted successfully');
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        fetchDashboardData(); // Refresh stats
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete booking');
    }
  };

  // Filter bookings by status
  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading real data from server...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>Admin <span className="gradient-text">Dashboard</span></h1>
            <p className="admin-subtitle">Manage real bookings & inquiries</p>
          </div>
          <div className="admin-user-info">
            <div className="user-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'A'}</div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">Administrator</span>
            </div>
            <button onClick={handleLogout} className="admin-logout-btn" title="Logout">
              <FiLogOut />
            </button>
          </div>
        </div>
      </header>

      {/* Error Banner */}
      {error && (
        <div className="error-banner">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-btn">Retry</button>
        </div>
      )}

      {/* Stats Cards - REAL DATA */}
      <section className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper"><FiCalendar className="stat-icon" /></div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalBookings}</h3>
            <p className="stat-label">Total Bookings</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper"><FiDollarSign className="stat-icon" /></div>
          <div className="stat-content">
            <h3 className="stat-value">{formatCurrency(stats.totalRevenue)}</h3>
            <p className="stat-label">Estimated Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper"><FiPackage className="stat-icon" /></div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.activeEvents}</h3>
            <p className="stat-label">Confirmed Events</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper"><FiUsers className="stat-icon" /></div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.newInquiries}</h3>
            <p className="stat-label">New Inquiries</p>
          </div>
        </div>
      </section>

      {/* Bookings Section - REAL DATA */}
      <section className="admin-bookings">
        <div className="bookings-header">
          <h2>Recent Bookings ({filteredBookings.length})</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button 
              onClick={handleRefresh} 
              className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? 'spinning' : ''} /> 
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        
        <div className="bookings-table-container">
          {filteredBookings.length === 0 ? (
            <div className="empty-state">
              <FiPackage className="empty-icon" />
              <p>No bookings found</p>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Bookings will appear here when users submit forms</p>
            </div>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Type</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="booking-row">
                    <td className="client-cell">
                      <div className="client-info">
                        <div className="client-avatar">{booking.client?.charAt(0)?.toUpperCase()}</div>
                        <div>
                          <span className="client-name">{booking.client}</span>
                          <span className="client-email" style={{ fontSize: '0.8rem', opacity: 0.7 }}>{booking.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="type-badge">{booking.type}</span>
                    </td>
                    <td>{booking.event}</td>
                    <td>{formatDate(booking.date)}</td>
                    <td>{booking.guests}</td>
                    <td>
                      <select 
                        className={`status-select ${getStatusClass(booking.status)}`}
                        value={booking.status}
                        onChange={(e) => handleUpdateStatus(booking.id, e.target.value)}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="amount-cell">{formatCurrency(booking.amount)}</td>
                    <td className="actions-cell">
                      <button className="action-btn view-btn" onClick={() => handleViewBooking(booking)} title="View">
                        <FiEye />
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDeleteBooking(booking.id)} title="Delete">
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;