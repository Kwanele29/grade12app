import React, { useState, useEffect } from 'react';
import './AdminContent.css';

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('materials');
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    grade: '12',
    type: 'notes',
    description: '',
    fileUrl: '',
    status: 'published'
  });

  const subjects = [
    'Mathematics',
    'Physical Sciences',
    'English',
    'Life Sciences',
    'History',
    'Geography',
    'Accounting',
    'Business Studies',
    'Economics',
    'Information Technology'
  ];

  useEffect(() => {
    fetchContent();
  }, [activeTab]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'materials' 
        ? 'http://localhost:8080/api/admin/materials'
        : 'http://localhost:8080/api/admin/quizzes';
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (activeTab === 'materials') {
          setMaterials(data);
        } else {
          setQuizzes(data);
        }
      } else {
        // Mock data for demonstration
        loadMockData();
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    if (activeTab === 'materials') {
      setMaterials([
        {
          id: 1,
          title: 'Mathematics P1 Exam Paper 2023',
          subject: 'Mathematics',
          grade: '12',
          type: 'exam',
          description: 'Final examination paper with memo',
          fileUrl: '/files/math-p1-2023.pdf',
          status: 'published',
          uploadedBy: 'Sarah Johnson',
          uploadDate: '2024-01-15',
          downloads: 234
        },
        {
          id: 2,
          title: 'Physical Sciences Study Guide',
          subject: 'Physical Sciences',
          grade: '12',
          type: 'notes',
          description: 'Comprehensive study guide for Term 1',
          fileUrl: '/files/physics-guide.pdf',
          status: 'published',
          uploadedBy: 'Mike Smith',
          uploadDate: '2024-01-10',
          downloads: 156
        },
        {
          id: 3,
          title: 'English Literature Analysis',
          subject: 'English',
          grade: '12',
          type: 'notes',
          description: 'Poetry and novel analysis guides',
          fileUrl: '/files/english-lit.pdf',
          status: 'draft',
          uploadedBy: 'John Doe',
          uploadDate: '2024-01-20',
          downloads: 45
        },
        {
          id: 4,
          title: 'History Timeline Poster',
          subject: 'History',
          grade: '12',
          type: 'resource',
          description: 'Interactive timeline of major events',
          fileUrl: '/files/history-timeline.pdf',
          status: 'published',
          uploadedBy: 'Sarah Johnson',
          uploadDate: '2024-01-05',
          downloads: 89
        }
      ]);
    } else {
      setQuizzes([
        {
          id: 1,
          title: 'Algebra Fundamentals',
          subject: 'Mathematics',
          grade: '12',
          questions: 20,
          timeLimit: 30,
          status: 'published',
          createdBy: 'Sarah Johnson',
          createdAt: '2024-01-15',
          attempts: 156,
          avgScore: 78
        },
        {
          id: 2,
          title: 'Newton\'s Laws Quiz',
          subject: 'Physical Sciences',
          grade: '12',
          questions: 15,
          timeLimit: 25,
          status: 'published',
          createdBy: 'Mike Smith',
          createdAt: '2024-01-12',
          attempts: 98,
          avgScore: 72
        },
        {
          id: 3,
          title: 'Shakespeare Assessment',
          subject: 'English',
          grade: '12',
          questions: 25,
          timeLimit: 40,
          status: 'draft',
          createdBy: 'John Doe',
          createdAt: '2024-01-18',
          attempts: 0,
          avgScore: 0
        },
        {
          id: 4,
          title: 'World War II Quiz',
          subject: 'History',
          grade: '12',
          questions: 20,
          timeLimit: 30,
          status: 'published',
          createdBy: 'Sarah Johnson',
          createdAt: '2024-01-08',
          attempts: 67,
          avgScore: 82
        }
      ]);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('token');
        const endpoint = activeTab === 'materials' 
          ? `http://localhost:8080/api/admin/materials/${id}`
          : `http://localhost:8080/api/admin/quizzes/${id}`;
        
        const response = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          if (activeTab === 'materials') {
            setMaterials(materials.filter(m => m.id !== id));
          } else {
            setQuizzes(quizzes.filter(q => q.id !== id));
          }
        }
      } catch (error) {
        console.error('Error deleting:', error);
        // Remove from UI for demo
        if (activeTab === 'materials') {
          setMaterials(materials.filter(m => m.id !== id));
        } else {
          setQuizzes(quizzes.filter(q => q.id !== id));
        }
      }
    }
  };

  const handleStatusToggle = async (item) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'materials' 
        ? `http://localhost:8080/api/admin/materials/${item.id}/status`
        : `http://localhost:8080/api/admin/quizzes/${item.id}/status`;
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        if (activeTab === 'materials') {
          setMaterials(materials.map(m => 
            m.id === item.id ? { ...m, status: newStatus } : m
          ));
        } else {
          setQuizzes(quizzes.map(q => 
            q.id === item.id ? { ...q, status: newStatus } : q
          ));
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      // Update UI for demo
      if (activeTab === 'materials') {
        setMaterials(materials.map(m => 
          m.id === item.id ? { ...m, status: newStatus } : m
        ));
      } else {
        setQuizzes(quizzes.map(q => 
          q.id === item.id ? { ...q, status: newStatus } : q
        ));
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'materials' 
        ? 'http://localhost:8080/api/admin/materials'
        : 'http://localhost:8080/api/admin/quizzes';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const newItem = await response.json();
        if (activeTab === 'materials') {
          setMaterials([newItem, ...materials]);
        } else {
          setQuizzes([newItem, ...quizzes]);
        }
        setShowAddModal(false);
        setFormData({
          title: '',
          subject: '',
          grade: '12',
          type: 'notes',
          description: '',
          fileUrl: '',
          status: 'published'
        });
      }
    } catch (error) {
      console.error('Error adding:', error);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'exam': return '📝';
      case 'notes': return '📚';
      case 'resource': return '📎';
      default: return '📄';
    }
  };

  const getStatusBadge = (status) => {
    return status === 'published' 
      ? <span className="status-badge published">Published</span>
      : <span className="status-badge draft">Draft</span>;
  };

  const currentItems = activeTab === 'materials' ? materials : quizzes;

  return (
    <div className="admin-content-manager">
      {/* Tabs */}
      <div className="content-tabs">
        <button 
          className={`tab-btn ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          <span className="tab-icon">📚</span>
          Study Materials
        </button>
        <button 
          className={`tab-btn ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          <span className="tab-icon">✏️</span>
          Quizzes & Assessments
        </button>
      </div>

      {/* Header */}
      <div className="content-header">
        <div>
          <h2>
            {activeTab === 'materials' ? 'Study Materials' : 'Quizzes & Assessments'}
          </h2>
          <p>
            {activeTab === 'materials' 
              ? 'Manage educational resources, notes, and exam papers'
              : 'Create and manage quizzes and tests for students'}
          </p>
        </div>
        <button className="add-content-btn" onClick={() => setShowAddModal(true)}>
          <span>➕</span> 
          {activeTab === 'materials' ? 'Upload Material' : 'Create Quiz'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="content-stats">
        <div className="stat-card-mini">
          <div className="stat-icon-mini">📊</div>
          <div className="stat-info">
            <h4>Total {activeTab === 'materials' ? 'Materials' : 'Quizzes'}</h4>
            <p>{currentItems.length}</p>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-icon-mini">✅</div>
          <div className="stat-info">
            <h4>Published</h4>
            <p>{currentItems.filter(i => i.status === 'published').length}</p>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-icon-mini">📝</div>
          <div className="stat-info">
            <h4>Drafts</h4>
            <p>{currentItems.filter(i => i.status === 'draft').length}</p>
          </div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-icon-mini">👥</div>
          <div className="stat-info">
            <h4>Total Views</h4>
            <p>
              {activeTab === 'materials' 
                ? materials.reduce((sum, m) => sum + (m.downloads || 0), 0)
                : quizzes.reduce((sum, q) => sum + (q.attempts || 0), 0)
              }
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="loading-content">Loading content...</div>
      ) : (
        <div className="content-grid">
          {currentItems.map(item => (
            <div key={item.id} className="content-card">
              <div className="content-card-header">
                <div className="content-type-badge">
                  {activeTab === 'materials' ? getTypeIcon(item.type) : '📋'}
                  <span>{activeTab === 'materials' ? item.type : 'Quiz'}</span>
                </div>
                {getStatusBadge(item.status)}
              </div>
              
              <div className="content-card-body">
                <h3>{item.title}</h3>
                <p className="content-description">{item.description}</p>
                
                <div className="content-meta">
                  <div className="meta-item">
                    <span className="meta-label">Subject:</span>
                    <span className="meta-value">{item.subject}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Grade:</span>
                    <span className="meta-value">{item.grade}</span>
                  </div>
                  {activeTab === 'quizzes' && (
                    <>
                      <div className="meta-item">
                        <span className="meta-label">Questions:</span>
                        <span className="meta-value">{item.questions}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Time Limit:</span>
                        <span className="meta-value">{item.timeLimit} min</span>
                      </div>
                    </>
                  )}
                  {activeTab === 'materials' && (
                    <div className="meta-item">
                      <span className="meta-label">Downloads:</span>
                      <span className="meta-value">{item.downloads}</span>
                    </div>
                  )}
                </div>
                
                <div className="content-footer-info">
                  <span className="uploader">
                    👤 {item.uploadedBy || item.createdBy}
                  </span>
                  <span className="date">
                    📅 {new Date(item.uploadDate || item.createdAt).toLocaleDateString()}
                  </span>
                  {activeTab === 'quizzes' && item.avgScore > 0 && (
                    <span className="avg-score">
                      📊 Avg Score: {item.avgScore}%
                    </span>
                  )}
                </div>
              </div>
              
              <div className="content-card-actions">
                <button 
                  className="action-btn view"
                  onClick={() => window.open(item.fileUrl, '_blank')}
                  title="View"
                >
                  👁️
                </button>
                <button 
                  className="action-btn edit"
                  onClick={() => setSelectedItem(item)}
                  title="Edit"
                >
                  ✏️
                </button>
                <button 
                  className="action-btn status"
                  onClick={() => handleStatusToggle(item)}
                  title={item.status === 'published' ? 'Unpublish' : 'Publish'}
                >
                  {item.status === 'published' ? '🔒' : '🔓'}
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => handleDelete(item.id)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Content Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{activeTab === 'materials' ? 'Upload New Material' : 'Create New Quiz'}</h2>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Subject *</label>
                  <select
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Grade</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({...formData, grade: e.target.value})}
                  >
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                  </select>
                </div>
              </div>
              
              {activeTab === 'materials' && (
                <div className="form-group">
                  <label>Material Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="notes">Notes / Study Guide</option>
                    <option value="exam">Exam Paper</option>
                    <option value="resource">Resource / Reference</option>
                  </select>
                </div>
              )}
              
              {activeTab === 'quizzes' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Number of Questions</label>
                    <input
                      type="number"
                      value={formData.questions || ''}
                      onChange={(e) => setFormData({...formData, questions: e.target.value})}
                      placeholder="e.g., 20"
                    />
                  </div>
                  <div className="form-group">
                    <label>Time Limit (minutes)</label>
                    <input
                      type="number"
                      value={formData.timeLimit || ''}
                      onChange={(e) => setFormData({...formData, timeLimit: e.target.value})}
                      placeholder="e.g., 30"
                    />
                  </div>
                </div>
              )}
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief description of the content"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              {activeTab === 'materials' && (
                <div className="form-group">
                  <label>File URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/file.pdf"
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({...formData, fileUrl: e.target.value})}
                  />
                  <small>Link to the study material file</small>
                </div>
              )}
              
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="published">Published (Visible to students)</option>
                  <option value="draft">Draft (Hidden from students)</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit">
                  {activeTab === 'materials' ? 'Upload Material' : 'Create Quiz'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Content</h2>
              <button className="close-btn" onClick={() => setSelectedItem(null)}>✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              setSelectedItem(null);
            }}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={selectedItem.title}
                  onChange={(e) => setSelectedItem({...selectedItem, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  value={selectedItem.description}
                  onChange={(e) => setSelectedItem({...selectedItem, description: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setSelectedItem(null)}>Cancel</button>
                <button type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContent;