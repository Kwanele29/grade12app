// src/components/tutor/Material.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Material.css';

const availableSubjects = [
  { id: 1, name: 'Mathematics', icon: '📐' },
  { id: 2, name: 'Physical Science', icon: '⚛️' },
  { id: 3, name: 'English', icon: '📝' },
  { id: 4, name: 'Mathematical Literacy', icon: '📊' },
  { id: 5, name: 'Life Sciences', icon: '🧬' },
  { id: 6, name: 'Geography', icon: '🌍' },
  { id: 7, name: 'History', icon: '📜' },
  { id: 8, name: 'Accounting', icon: '💰' },
  { id: 9, name: 'Business Studies', icon: '💼' },
  { id: 10, name: 'Economics', icon: '📈' },
  { id: 11, name: 'Agricultural Sciences', icon: '🌾' },
  { id: 12, name: 'Tourism', icon: '✈️' },
  { id: 13, name: 'isiZulu Home Language', icon: '🗣️' },
  { id: 14, name: 'isiXhosa Home Language', icon: '🗣️' },
  { id: 15, name: 'siSwati Home Language', icon: '🗣️' },
  { id: 16, name: 'isiNdebele Home Language', icon: '🗣️' },
  { id: 17, name: 'Sesotho Home Language', icon: '🗣️' },
  { id: 18, name: 'Setswana Home Language', icon: '🗣️' },
  { id: 19, name: 'Sepedi Home Language', icon: '🗣️' },
  { id: 20, name: 'Tshivenda Home Language', icon: '🗣️' },
  { id: 21, name: 'Xitsonga Home Language', icon: '🗣️' },
];

const Material = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [materials, setMaterials] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subjectName: '',
    file: null
  });

  const API_BASE_URL = 'http://localhost:8080/api';

  // Load user
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMaterials = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/materials/tutor/${user.id}`);
      setMaterials(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'subjectName') {
      setShowDropdown(true);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 100 * 1024 * 1024) {
      alert('File must be under 100MB');
      return;
    }
    setFormData(prev => ({ ...prev, file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.subjectName || !formData.file) {
      alert('Fill all required fields');
      return;
    }

    setUploading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('subjectName', formData.subjectName);
    data.append('file', formData.file);
    data.append('tutorId', user?.id || 1);

    try {
      await axios.post(`${API_BASE_URL}/materials/upload`, data);
      alert('Uploaded successfully');

      setFormData({
        title: '',
        subjectName: '',
        file: null
      });

      setShowUploadForm(false);
      fetchMaterials();

      document.getElementById('file-input').value = '';
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/materials/${id}`);
      fetchMaterials();
    } catch (err) {
      alert('Delete failed');
    }
  };

  // Toggle dropdown function - prevent event bubbling
  const toggleDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  // Select subject function
  const selectSubject = (subjectName) => {
    setFormData(prev => ({
      ...prev,
      subjectName: subjectName
    }));
    setShowDropdown(false);
  };

  // Get filtered subjects based on input
  const getFilteredSubjects = () => {
    if (!formData.subjectName) {
      return availableSubjects;
    }
    return availableSubjects.filter(s =>
      s.name.toLowerCase().includes(formData.subjectName.toLowerCase())
    );
  };

  return (
    <div className="container">

      <div className="header">
        <button onClick={() => navigate('/tutor-dashboard')}>← Back</button>
        <button onClick={() => setShowUploadForm(!showUploadForm)}>
          {showUploadForm ? 'Cancel' : '+ Upload'}
        </button>
      </div>

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

          {/* SUBJECT INPUT WITH DROPDOWN ARROW */}
          <div className="subject-box" ref={dropdownRef}>
            <div className="subject-input-wrapper">
              <input
                type="text"
                name="subjectName"
                placeholder="Subject *"
                value={formData.subjectName}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
                className="subject-input"
              />
              <button 
                type="button" 
                className="dropdown-arrow-btn"
                onClick={toggleDropdown}
                aria-label="Show subjects"
              >
                ▼
              </button>
            </div>

            {showDropdown && (
              <div className="dropdown">
                {getFilteredSubjects().map(s => (
                  <div
                    key={s.id}
                    className="dropdown-item"
                    onClick={() => selectSubject(s.name)}
                  >
                    {s.icon} {s.name}
                  </div>
                ))}
                {getFilteredSubjects().length === 0 && (
                  <div className="dropdown-item no-results">
                    No subjects found
                  </div>
                )}
              </div>
            )}
          </div>

          <input type="file" id="file-input" onChange={handleFileChange} required />

          <button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      )}

      <div className="materials">
        {materials.map(m => (
          <div key={m.id} className="card">
            <h3>{m.title}</h3>
            <span className="badge">{m.subjectName}</span>
            <div className="actions">
              <a href={`${API_BASE_URL}${m.fileUrl}`} target="_blank" rel="noopener noreferrer">View</a>
              <button onClick={() => handleDeleteMaterial(m.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Material;