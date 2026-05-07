import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminUsers.css';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    category: 'student',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching users with token:', token ? 'Token exists' : 'No token');
      
      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Users data received:', data);
        
        // Handle different response formats
        let usersData = [];
        if (Array.isArray(data)) {
          usersData = data;
        } else if (data.users && Array.isArray(data.users)) {
          usersData = data.users;
        } else if (data.data && Array.isArray(data.data)) {
          usersData = data.data;
        }
        
        setUsers(usersData);
        console.log(`✅ Loaded ${usersData.length} users from database`);
      } else {
        console.error('Failed to fetch users, status:', response.status);
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('⚠️ Are you sure you want to permanently delete this user? This action cannot be undone!')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      console.log(`🗑️ Attempting to delete user ID: ${userId}`);
      
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Delete result:', result);
        
        // Remove user from state immediately
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        alert('✅ User deleted successfully from database');
        
        // Optionally refresh the list to confirm
        await fetchUsers();
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
        alert(`❌ Failed to delete user: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('❌ Network error while deleting user');
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await fetchUsers(); // Refresh the list
        setShowAddModal(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          category: 'student',
          password: ''
        });
        alert('✅ User added successfully');
      } else {
        const error = await response.json();
        alert(`❌ Failed to add user: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('❌ Error adding user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: selectedUser.firstName,
          lastName: selectedUser.lastName,
          email: selectedUser.email,
          category: selectedUser.category
        })
      });
      
      if (response.ok) {
        await fetchUsers(); // Refresh the list
        setSelectedUser(null);
        alert('✅ User updated successfully');
      } else {
        const error = await response.json();
        alert(`❌ Failed to update user: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('❌ Error updating user');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const getFilteredUsers = () => {
    let filtered = users;
    
    if (filter !== 'all') {
      filtered = filtered.filter(user => user.category === filter);
    }
    
    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user => {
        const firstName = (user.firstName || '').toLowerCase();
        const lastName = (user.lastName || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const fullName = (firstName + ' ' + lastName).toLowerCase();
        
        return firstName.includes(searchLower) ||
               lastName.includes(searchLower) ||
               fullName.includes(searchLower) ||
               email.includes(searchLower);
      });
    }
    
    return filtered;
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'student': return '👨‍🎓';
      case 'tutor': return '👨‍🏫';
      case 'admin': return '👑';
      default: return '👤';
    }
  };

  const goToAdminDashboard = () => {
    navigate('/admin-dashboard');
  };

  if (loading) {
    return <div className="loading-users">Loading users from database...</div>;
  }

  return (
    <div className="admin-users">
      {/* BACK BUTTON */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px 0',
        position: 'relative',
        zIndex: 100
      }}>
        <button 
          onClick={goToAdminDashboard}
          style={{
            backgroundColor: '#1F2833',
            border: '2px solid #66FCF1',
            color: '#66FCF1',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#66FCF1';
            e.target.style.color = '#0B0C10';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#1F2833';
            e.target.style.color = '#66FCF1';
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="users-header">
        <div>
          <h1>User Management</h1>
          <p>Manage students, tutors, and administrators</p>
        </div>
        <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
          <span>➕</span> Add New User
        </button>
      </div>

      <div className="users-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Users ({users.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'student' ? 'active' : ''}`}
            onClick={() => setFilter('student')}
          >
            Students ({users.filter(u => u.category === 'student').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'tutor' ? 'active' : ''}`}
            onClick={() => setFilter('tutor')}
          >
            Tutors ({users.filter(u => u.category === 'tutor').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'admin' ? 'active' : ''}`}
            onClick={() => setFilter('admin')}
          >
            Admins ({users.filter(u => u.category === 'admin').length})
          </button>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Category</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredUsers().length > 0 ? (
              getFilteredUsers().map(user => (
                <tr key={user.id}>
                  <td className="user-cell">
                    <div className="user-avatar">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div className="user-info">
                      <div className="user-name">{user.firstName} {user.lastName}</div>
                      <div className="user-id">ID: {user.id}</div>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className="category-badge">
                      {getCategoryIcon(user.category)} {user.category}
                    </span>
                  </td>
                  <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td className="actions-cell">
                    <button 
                      className="action-btn edit"
                      onClick={() => setSelectedUser(user)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="action-btn delete"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}>
                  {searchTerm ? `No users found matching "${searchTerm}"` : 'No users found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New User</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddUser}>
              <div className="form-group">
                <label>First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit">Add User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit User</h2>
              <button className="close-btn" onClick={() => setSelectedUser(null)}>✕</button>
            </div>
            <form onSubmit={handleUpdateUser}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  required
                  value={selectedUser.firstName || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  required
                  value={selectedUser.lastName || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={selectedUser.email || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={selectedUser.category || 'student'}
                  onChange={(e) => setSelectedUser({...selectedUser, category: e.target.value})}
                >
                  <option value="student">Student</option>
                  <option value="tutor">Tutor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setSelectedUser(null)}>Cancel</button>
                <button type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;