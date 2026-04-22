import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Material.css';

const Material = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [user, setUser] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ title: '', subjectId: '', file: null });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!userData || !token) { navigate('/login'); return; }
    const parsed = JSON.parse(userData);
    if (parsed.category !== 'tutor') { navigate('/login'); return; }
    setUser(parsed);
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchSubjects();
      fetchMaterials();
    }
  }, [user]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/subjects');
      setSubjects(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMaterials = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/materials/tutor/${user.id}`);
      setMaterials(res.data);
    } catch (err) { console.error(err); }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'subjectId') setShowDropdown(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 100*1024*1024) { alert('File too big'); return; }
    setFormData(prev => ({ ...prev, file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.subjectId || !formData.file) {
      alert('Please fill all required fields');
      return;
    }
    setUploading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', '');
    data.append('subjectId', formData.subjectId);
    data.append('topic', '');
    data.append('tags', '');
    data.append('file', formData.file);
    data.append('tutorId', user.id);
    try {
      await api.post('/materials/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Uploaded successfully');
      setFormData({ title: '', subjectId: '', file: null });
      setShowUploadForm(false);
      fetchMaterials();
      document.getElementById('file-input').value = '';
    } catch (err) { alert(err.response?.data?.error || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try {
      await api.delete(`/materials/${id}`);
      fetchMaterials();
    } catch (err) { alert('Delete failed'); }
  };

  const getSubjectName = (id) => {
    const sub = subjects.find(s => s.id.toString() === id);
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

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="container">
      <div className="header">
        <button onClick={() => navigate('/tutor-dashboard')}>← Back</button>
        <button onClick={() => setShowUploadForm(!showUploadForm)}>{showUploadForm ? 'Cancel' : '+ Upload'}</button>
      </div>

      {showUploadForm && (
        <form className="form" onSubmit={handleSubmit}>
          <h3>Upload Material</h3>
          <input type="text" name="title" placeholder="Title *" value={formData.title} onChange={handleInputChange} required />
          <div className="subject-box" ref={dropdownRef}>
            <div className="subject-input-wrapper">
              <input type="text" placeholder="Subject *" value={getSubjectName(formData.subjectId)} onFocus={() => setShowDropdown(true)} readOnly className="subject-input" />
              <button type="button" className="dropdown-arrow-btn" onClick={toggleDropdown}>▼</button>
            </div>
            {showDropdown && (
              <div className="dropdown">
                {subjects.map(s => (
                  <div key={s.id} className="dropdown-item" onClick={() => selectSubject(s.id)}>{s.icon} {s.name}</div>
                ))}
              </div>
            )}
          </div>
          <input type="file" id="file-input" onChange={handleFileChange} required />
          <button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
        </form>
      )}

      <div className="materials">
        {materials.map(m => (
          <div key={m.id} className="card">
            <h3>{m.title}</h3>
            <span className="badge">{m.subject?.name || 'No subject'}</span>
            <div className="actions">
              <a href={`http://localhost:8080${m.fileUrl}`} target="_blank" rel="noopener noreferrer">View</a>
              <button onClick={() => handleDelete(m.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Material;