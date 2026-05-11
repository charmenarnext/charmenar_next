import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiUsers, FiCalendar, FiDollarSign, FiPackage, FiLogOut, FiRefreshCw, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import './AdminDashboard.css';

// ✅ API Base URL - Direct definition (no config import needed)
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

  // ✅ Check admin access on mount
  useEffect(() => {
    if (!isAdmin) {
      toast.error('Access denied. Admins only.');
      navigate('/');
      return;
    }
    
    fetchDashboardData();
  }, [isAdmin, navigate]);

  // ✅ Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    if (refreshing) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching admin dashboard data...');
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch stats
      try {
        const statsResponse = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats(statsData);
          console.log('✅ Stats loaded:', statsData);
        } else if (statsResponse.status === 404) {
          console.log('⚠️ Stats endpoint not found, using mock data');
          setStats(getMockStats());
        } else {
          throw new Error(`Stats API error: ${statsResponse.status}`);
        }
      } catch (statsError) {
        console.warn('⚠️ Failed to fetch stats, using mock data:', statsError.message);
        setStats(getMockStats());
      }

      // Fetch bookings
      try {
        const bookingsResponse = await fetch(`${API_BASE_URL}/admin/bookings`, { headers });
        
        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings(bookingsData);
          console.log('✅ Bookings loaded:', bookingsData.length, 'items');
        } else if (bookingsResponse.status === 404) {
          console.log('⚠️ Bookings endpoint not found, using mock data');
          setBookings(getMockBookings());
        } else {
          throw new Error(`Bookings API error: ${bookingsResponse.status}`);
        }
      } catch (bookingsError) {
        console.warn('⚠️ Failed to fetch bookings, using mock data:', bookingsError.message);
        setBookings(getMockBookings());
      }
      
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error);
      setError('Failed to load dashboard data. Using demo mode.');
      toast.warning('Using demo data - backend endpoints not available');
      
      // Fallback to mock data
      setStats(getMockStats());
      setBookings(getMockBookings());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ Mock data functions for demo mode
  const getMockStats = () => ({
    totalBookings: 24,
    totalRevenue: 125000,
    activeEvents: 8,
    newInquiries: 5
  });

  const getMockBookings = () => [
    { id: 1, client: 'Priya Sharma', event: 'Wedding', date: '2024-06-15', status: 'confirmed', amount: 45000, guests: 150 },
    { id: 2, client: 'Rajesh Kumar', event: 'Corporate Event', date: '2024-06-20', status: 'pending', amount: 28000, guests: 80 },
    { id: 3, client: 'Anita Reddy', event: 'Birthday Party', date: '2024-06-25', status: 'confirmed', amount: 15000, guests: 40 },
    { id: 4, client: 'Vikram Singh', event: 'Anniversary', date: '2024-07-01', status: 'pending', amount: 22000, guests: 60 },
    { id: 5, client: 'Meera Patel', event: 'Engagement', date: '2024-07-10', status: 'confirmed', amount: 35000, guests: 100 }
  ];

  // ✅ Handle manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
    toast.info('Refreshing data...');
  };

  // ✅ Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  // ✅ Get status badge class
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'status-confirmed';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  // ✅ Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // ✅ Handle view booking
  const handleViewBooking = (bookingId) => {
    toast.info(`Viewing booking #${bookingId}`);
    // TODO: Navigate to booking detail page
    // navigate(`/admin/bookings/${bookingId}`);
  };

  // ✅ Handle edit booking
  const handleEditBooking = (bookingId) => {
    toast.info(`Editing booking #${bookingId}`);
    // TODO: Navigate to edit page
  };

  // ✅ Handle delete booking
  const handleDeleteBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      toast.success(`Booking #${bookingId} deleted`);
      // TODO: Call API to delete
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    }
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="spinner-large"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>
              Admin <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="admin-subtitle">Manage your catering & events business</p>
          </div>
          <div className="admin-user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
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
        </div>
      )}

      {/* Stats Cards */}
      <section className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <FiCalendar className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalBookings}</h3>
            <p className="stat-label">Total Bookings</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <FiDollarSign className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{formatCurrency(stats.totalRevenue)}</h3>
            <p className="stat-label">Total Revenue</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <FiPackage className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.activeEvents}</h3>
            <p className="stat-label">Active Events</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <FiUsers className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.newInquiries}</h3>
            <p className="stat-label">New Inquiries</p>
          </div>
        </div>
      </section>

      {/* Bookings Section */}
      <section className="admin-bookings">
        <div className="bookings-header">
          <h2>Recent Bookings</h2>
          <button 
            onClick={handleRefresh} 
            className={`refresh-btn ${refreshing ? 'refreshing' : ''}`}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? 'spinning' : ''} /> 
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <div className="bookings-table-container">
          {bookings.length === 0 ? (
            <div className="empty-state">
              <FiPackage className="empty-icon" />
              <p>No bookings found</p>
              <button className="btn-primary">Add New Booking</button>
            </div>
          ) : (
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Event Type</th>
                  <th>Date</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="booking-row">
                    <td className="client-cell">
                      <div className="client-info">
                        <div className="client-avatar">
                          {booking.client?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="client-name">{booking.client}</span>
                      </div>
                    </td>
                    <td>{booking.event}</td>
                    <td>{formatDate(booking.date)}</td>
                    <td>{booking.guests || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="amount-cell">{formatCurrency(booking.amount)}</td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn view-btn" 
                        onClick={() => handleViewBooking(booking.id)}
                        title="View"
                      >
                        <FiEye />
                      </button>
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEditBooking(booking.id)}
                        title="Edit"
                      >
                        <FiEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeleteBooking(booking.id)}
                        title="Delete"
                      >
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

      {/* Quick Actions */}
      <section className="admin-quick-actions">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="action-card">
            <FiCalendar className="action-icon" />
            <span>Create New Event</span>
          </button>
          <button className="action-card">
            <FiUsers className="action-icon" />
            <span>View Inquiries</span>
          </button>
          <button className="action-card">
            <FiDollarSign className="action-icon" />
            <span>Generate Report</span>
          </button>
          <button className="action-card">
            <FiPackage className="action-icon" />
            <span>Manage Packages</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;