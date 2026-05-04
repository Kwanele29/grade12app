import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Material.css';

const Material = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    materialType: 'paper',
    file: null,
    videoLink: '',
  });

  // Auth guard
  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) { navigate('/login'); return; }
    const parsed = JSON.parse(userData);
    if (parsed.category !== 'tutor') { navigate('/login'); return; }
    setUser(parsed);
  }, [navigate]);

  // Fetch subjects (stable, doesn't depend on anything)
  const fetchSubjects = useCallback(async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load subjects');
    }
  }, []);

  // Fetch materials – depends on user.id
  const fetchMaterials = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/materials/tutor/${user.id}`);
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load materials');
    }
  }, [user?.id]);

  // Load subjects and materials when user is available
  useEffect(() => {
    if (user) {
      fetchSubjects();
      fetchMaterials();
    }
  }, [user, fetchSubjects, fetchMaterials]); // ✅ all dependencies included

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'subjectId') setShowDropdown(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 100 * 1024 * 1024) {
      setErrorMsg('File too big (max 100MB)');
      setTimeout(() => setErrorMsg(''), 3000);
      e.target.value = '';
      return;
    }
    setFormData(prev => ({ ...prev, file }));
  };

  const handleMaterialTypeChange = (e) => {
    const newType = e.target.value;
    setFormData(prev => ({
      ...prev,
      materialType: newType,
      file: null,
      videoLink: '',
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subjectId: '',
      materialType: 'paper',
      file: null,
      videoLink: '',
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.title.trim()) {
      setErrorMsg('Title is required');
      return;
    }
    if (!formData.subjectId) {
      setErrorMsg('Please select a subject');
      return;
    }

    if (formData.materialType === 'video') {
      if (!formData.videoLink.trim()) {
        setErrorMsg('Please enter a video link');
        return;
      }
    } else {
      if (!formData.file) {
        setErrorMsg('Please select a file');
        return;
      }
    }

    setUploading(true);
    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', '');
    data.append('subjectId', Number(formData.subjectId));
    data.append('topic', '');
    data.append('tags', '');
    data.append('tutorId', user.id);
    data.append('materialType', formData.materialType);

    if (formData.materialType === 'video') {
      data.append('videoLink', formData.videoLink.trim());
    } else {
      data.append('file', formData.file);
    }

    try {
      await api.post('/materials/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccessMsg('Material uploaded successfully!');
      resetForm();
      setShowUploadForm(false);
      fetchMaterials(); // now stable
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Upload failed';
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await api.delete(`/materials/${id}`);
      setSuccessMsg('Deleted');
      fetchMaterials();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Delete failed');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const getSubjectName = (id) => {
    if (!id) return '';
    const sub = subjects.find(s => s.id.toString() === id.toString());
    return sub ? sub.name : '';
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const selectSubject = (id) => {
    setFormData(prev => ({ ...prev, subjectId: id.toString() }));
    setShowDropdown(false);
  };

  // Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="container">
      <div className="header">
        <button onClick={() => navigate('/tutor-dashboard')}>← Back</button>
        <button onClick={() => {
          setShowUploadForm(!showUploadForm);
          setErrorMsg('');
          setSuccessMsg('');
          if (showUploadForm) resetForm();
        }}>
          {showUploadForm ? 'Cancel' : '+ Upload'}
        </button>
      </div>

      {errorMsg && <div className="error-msg">{errorMsg}</div>}
      {successMsg && <div className="success-msg">{successMsg}</div>}

      {showUploadForm && (
        <form className="form" onSubmit={handleSubmit}>
          <h3>Upload Material</h3>

          <input
            type="text"
            name="title"
            placeholder="Title *"
            value={formData.title}
            onChange={handleInputChange}
            required
          />

          <div className="subject-box" ref={dropdownRef}>
            <div className="subject-input-wrapper">
              <input
                type="text"
                placeholder="Subject *"
                value={getSubjectName(formData.subjectId)}
                onFocus={() => setShowDropdown(true)}
                readOnly
                className="subject-input"
              />
              <button type="button" className="dropdown-arrow-btn" onClick={toggleDropdown}>▼</button>
            </div>
            {showDropdown && (
              <div className="dropdown">
                {subjects.map(s => (
                  <div key={s.id} className="dropdown-item" onClick={() => selectSubject(s.id)}>
                    {s.icon} {s.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Material Type *</label>
            <select
              name="materialType"
              value={formData.materialType}
              onChange={handleMaterialTypeChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
            >
              <option value="paper">📄 Past Paper</option>
              <option value="note">📝 Study Note</option>
              <option value="video">🎥 Video Lesson</option>
            </select>
          </div>

          {formData.materialType === 'video' ? (
            <div className="link-input-group">
              <input
                type="url"
                name="videoLink"
                placeholder="https://youtube.com/watch?v=... *"
                value={formData.videoLink}
                onChange={handleInputChange}
              />
              <small>Paste a YouTube, Vimeo, or any public video URL</small>
            </div>
          ) : (
            <div className="file-input-group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx"
              />
              <small>PDF, DOC, DOCX, PPT, PPTX — max 100 MB</small>
            </div>
          )}

          <button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      )}

      <div className="materials">
        {materials.map(m => (
          <div key={m.id} className="card">
            <span className="material-type-icon">
              {m.materialType === 'video' ? '🎥' : (m.materialType === 'note' ? '📝' : '📄')}
            </span>
            <h3>{m.title}</h3>
            <span className="badge">{m.subject?.name || 'No subject'}</span>
            <div className="actions">
              {m.materialType === 'video' ? (
                <a href={m.videoLink} target="_blank" rel="noopener noreferrer">▶ Watch</a>
              ) : (
                <a href={`http://localhost:8080${m.fileUrl}`} target="_blank" rel="noopener noreferrer">View</a>
              )}
              <button onClick={() => handleDelete(m.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Material;