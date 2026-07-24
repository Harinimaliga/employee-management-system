import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, MenuItem, Button, Container, Grid, Alert, Snackbar, CircularProgress, Avatar
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useThemeMode } from '../context/ThemeContext';

const EmployeeFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const isEdit = Boolean(id);
  const isDarkMode = mode === 'dark';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: 'Software Engineer',
    salary: 60000,
    dateOfJoining: new Date().toISOString().split('T')[0],
    profileImage: '',
  });

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (isEdit) {
      fetchEmployeeDetails();
    }
  }, [id]);

  const fetchEmployeeDetails = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      if (res.data) {
        setFormData({
          firstName: res.data.firstName || '',
          lastName: res.data.lastName || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          department: res.data.department || 'Engineering',
          designation: res.data.designation || '',
          salary: res.data.salary || 0,
          dateOfJoining: res.data.dateOfJoining || new Date().toISOString().split('T')[0],
          profileImage: res.data.profileImage || '',
        });
      }
    } catch (err) {
      showToast('Failed to load employee details', 'error');
    } finally {
      setFetching(false);
    }
  };

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await api.post('/upload/profile-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.imageUrl) {
        setFormData(prev => ({ ...prev, profileImage: res.data.imageUrl }));
        showToast('Profile image uploaded successfully! 📷');
      }
    } catch (err) {
      showToast('Failed to upload profile image.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email) {
      showToast('Please fill in all required fields (First Name, Last Name, Email).', 'error');
      return;
    }

    const payload = {
      ...formData,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      dateOfJoining: formData.dateOfJoining ? formData.dateOfJoining : null,
      profileImage: formData.profileImage || null
    };

    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/employees/${id}`, payload);
        showToast('Employee profile updated successfully!');
      } else {
        await api.post('/employees', payload);
        showToast('New employee added successfully!');
      }
      setTimeout(() => navigate('/employees'), 1200);
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || 'Failed to save employee profile';
      showToast(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg), 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      color: isDarkMode ? '#f8fafc' : '#0f172a',
      '& fieldset': { borderColor: isDarkMode ? '#334155' : '#cbd5e1' },
      '&:hover fieldset': { borderColor: '#38bdf8' },
      '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
    },
    '& .MuiInputLabel-root': { color: isDarkMode ? '#94a3b8' : '#64748b' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' },
    '& .MuiSelect-icon': { color: isDarkMode ? '#94a3b8' : '#64748b' },
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: isDarkMode ? '#090d16' : '#f1f5f9', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Navbar />
        <Container maxWidth="md" sx={{ py: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<i className="bi bi-arrow-left"></i>}
              onClick={() => navigate('/employees')}
              sx={{ borderColor: isDarkMode ? '#334155' : '#cbd5e1', color: isDarkMode ? '#94a3b8' : '#64748b', mr: 2 }}
            >
              Back to List
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a', background: 'linear-gradient(to right, #0284c7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {isEdit ? 'Edit Employee Profile Form' : 'Add New Employee Form'}
            </Typography>
          </Box>

          {fetching ? (
            <CircularProgress sx={{ display: 'block', mx: 'auto', my: 5, color: '#0284c7' }} />
          ) : (
            <Paper elevation={12} sx={{ p: 4, borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
              
              {/* Profile Picture Upload Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4, pb: 3, borderBottom: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0' }}>
                <Avatar
                  src={formData.profileImage}
                  sx={{ width: 84, height: 84, border: '3px solid #0284c7', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}
                >
                  {formData.firstName ? formData.firstName[0] : 'E'}
                </Avatar>

                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a', mb: 0.5 }}>
                    Profile Photo Upload 📷
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', display: 'block', mb: 1.5 }}>
                    Upload JPG, PNG, or GIF profile picture for employee identity.
                  </Typography>

                  <Button
                    variant="contained"
                    component="label"
                    size="small"
                    startIcon={uploadingImage ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <i className="bi bi-upload"></i>}
                    disabled={uploadingImage}
                    sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)', fontWeight: 'bold' }}
                  >
                    {uploadingImage ? 'Uploading Image...' : 'Choose File & Upload'}
                    <input type="file" hidden accept="image/*" onChange={handleImageFileChange} />
                  </Button>
                </Box>
              </Box>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="First Name *" name="firstName" value={formData.firstName} onChange={handleChange} sx={inputStyles} required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Last Name *" name="lastName" value={formData.lastName} onChange={handleChange} sx={inputStyles} required />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Email Address *" name="email" type="email" value={formData.email} onChange={handleChange} sx={inputStyles} required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} sx={inputStyles} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth select label="Department" name="department" value={formData.department} onChange={handleChange} sx={inputStyles}>
                      <MenuItem value="Engineering">Engineering</MenuItem>
                      <MenuItem value="HR">HR</MenuItem>
                      <MenuItem value="Sales">Sales</MenuItem>
                      <MenuItem value="Finance">Finance</MenuItem>
                      <MenuItem value="Management">Management</MenuItem>
                      <MenuItem value="Data Science">Data Science</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Designation" name="designation" value={formData.designation} onChange={handleChange} sx={inputStyles} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Salary ($ / yr)" name="salary" type="number" value={formData.salary} onChange={handleChange} sx={inputStyles} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth label="Date of Joining" name="dateOfJoining" type="date" value={formData.dateOfJoining} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={inputStyles} />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField fullWidth label="Profile Image URL" name="profileImage" value={formData.profileImage} onChange={handleChange} sx={inputStyles} placeholder="https://example.com/avatar.jpg or uploaded URL" />
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                  <Button variant="outlined" onClick={() => navigate('/employees')} sx={{ borderColor: isDarkMode ? '#334155' : '#cbd5e1', color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<i className="bi bi-check-circle-fill"></i>}
                    disabled={loading}
                    sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)', fontWeight: 'bold', px: 4, py: 1.2 }}
                  >
                    {loading ? 'Saving Profile...' : isEdit ? 'Update Employee' : 'Save Employee'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}

          <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
            <Alert severity={toast.severity} sx={{ width: '100%' }}>{toast.message}</Alert>
          </Snackbar>
        </Container>
      </Box>
    </Box>
  );
};

export default EmployeeFormPage;
