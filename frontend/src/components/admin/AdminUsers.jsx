import React, { useState, useEffect } from 'react';
import './AdminUsers.css';

const AdminUsers = () => {
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
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        // Mock data for demonstration
        setUsers(mockUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          setUsers(users.filter(user => user.id !== userId));
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
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
        const newUser = await response.json();
        setUsers([...users, newUser]);
        setShowAddModal(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          category: 'student',
          password: ''
        });
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleUpdateStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getFilteredUsers = () => {
    let filtered = users;
    
    if (filter !== 'all') {
      filtered = filtered.filter(user => user.category === filter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? <span className="status-badge active">Active</span>
      : <span className="status-badge suspended">Suspended</span>;
  };

  if (loading) {
    return <div className="loading-users">Loading users...</div>;
  }

  return (
    <div className="admin-users">
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
            onChange={(e) => setSearchTerm(e.target.value)}
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
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getFilteredUsers().map(user => (
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
                <td>{getStatusBadge(user.status)}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button 
                    className="action-btn edit"
                    onClick={() => setSelectedUser(user)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-btn status"
                    onClick={() => handleUpdateStatus(user.id, user.status)}
                    title={user.status === 'active' ? 'Suspend' : 'Activate'}
                  >
                    {user.status === 'active' ? '🔒' : '🔓'}
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
            ))}
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
                <label>First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Category</label>
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
                <label>Password</label>
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
            <form onSubmit={(e) => {
              e.preventDefault();
              // Handle update
              setSelectedUser(null);
            }}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={selectedUser.firstName}
                  onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={selectedUser.lastName}
                  onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                />
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

// Mock data for demonstration
const mockUsers = [
  {
    id: 1,
    firstName: 'Thabo',
    lastName: 'Mokoena',
    email: 'thabo.mokoena@example.com',
    category: 'student',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    category: 'tutor',
    status: 'active',
    createdAt: '2024-01-10T09:00:00Z'
  },
  {
    id: 3,
    firstName: 'Mike',
    lastName: 'Smith',
    email: 'mike.smith@example.com',
    category: 'admin',
    status: 'active',
    createdAt: '2024-01-05T08:00:00Z'
  },
  {
    id: 4,
    firstName: 'Lerato',
    lastName: 'Ndlovu',
    email: 'lerato.ndlovu@example.com',
    category: 'student',
    status: 'suspended',
    createdAt: '2024-01-20T11:00:00Z'
  }
];

export default AdminUsers;