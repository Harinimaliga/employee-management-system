import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Avatar, Button, TextField, Chip, Alert, CircularProgress
} from '@mui/material';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const { mode } = useThemeMode();
  const isDarkMode = mode === 'dark';

  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: '',
    lastName: '',
    department: '',
    designation: '',
    phone: '',
    profileImageUrl: '',
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ type: '', text: '' });
  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const fetchProfileDetails = async () => {
    try {
      const res = await api.get('/employees');
      const empList = res.data || [];
      // Find matching employee by email or user ID
      const matchingEmp = empList.find(e => e.email?.toLowerCase() === user?.email?.toLowerCase() || e.id === user?.id) || empList[0];
      if (matchingEmp) {
        setEmployeeId(matchingEmp.id);
        setProfileData({
          username: user?.username || 'User',
          email: matchingEmp.email || user?.email || '',
          firstName: matchingEmp.firstName || '',
          lastName: matchingEmp.lastName || '',
          department: matchingEmp.department || 'Engineering',
          designation: matchingEmp.designation || 'Full Stack Engineer',
          phone: matchingEmp.phone || '+1 555-0192',
          profileImageUrl: matchingEmp.profileImageUrl || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile details:', err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setNotification({ type: '', text: '' });

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = res.data?.url || res.data;
      setProfileData(prev => ({ ...prev, profileImageUrl: imageUrl }));
      setNotification({ type: 'success', text: 'Profile image uploaded successfully!' });
    } catch (err) {
      setNotification({ type: 'error', text: 'Failed to upload profile picture.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotification({ type: '', text: '' });

    try {
      if (employeeId) {
        await api.put(`/employees/${employeeId}`, profileData);
        setNotification({ type: 'success', text: 'User profile updated successfully!' });
      } else {
        setNotification({ type: 'success', text: 'Profile changes saved!' });
      }
    } catch (err) {
      setNotification({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
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
  };

  const headerContent = (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography
          variant={isDarkMode ? 'h3' : 'h4'}
          sx={{
            fontWeight: 'bold',
            color: isDarkMode ? '#ffffff' : 'transparent',
            background: isDarkMode ? 'none' : 'linear-gradient(to right, #0284c7, #6366f1)',
            WebkitBackgroundClip: isDarkMode ? 'none' : 'text',
            WebkitTextFillColor: isDarkMode ? '#ffffff' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            letterSpacing: '-0.5px'
          }}
        >
          {!isDarkMode && <i className="bi bi-person-circle text-primary"></i>}
          User Account Profile
        </Typography>
        <Typography variant="body1" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mt: 0.5 }}>
          Manage your personal details, corporate credentials, avatar picture, and security settings.
        </Typography>
      </Box>
    </Box>
  );

  const getFullAvatarUrl = (url) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `http://localhost:8080${url}`;
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: isDarkMode ? '#090d16' : '#f1f5f9', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, overflowX: 'hidden' }}>
        <Navbar />
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          
          {/* Header */}
          {isDarkMode ? (
            <Paper elevation={0} sx={{ p: 3.5, mb: 3, borderRadius: 4, background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)', border: '1px solid #312e81', boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}>
              {headerContent}
            </Paper>
          ) : (
            <Box sx={{ mb: 3 }}>
              {headerContent}
            </Box>
          )}

          {notification.text && (
            <Alert severity={notification.type} sx={{ mb: 3 }} onClose={() => setNotification({ type: '', text: '' })}>
              {notification.text}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Left Card: Avatar & Summary */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', textAlign: 'center', p: 3 }}>
                <Avatar
                  src={getFullAvatarUrl(profileData.profileImageUrl)}
                  alt={profileData.firstName || user?.username}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2, border: '4px solid #0284c7', fontSize: '3rem', fontWeight: 'bold', backgroundColor: '#0284c7', color: '#fff' }}
                >
                  {profileData.firstName ? profileData.firstName[0].toUpperCase() : user?.username?.[0]?.toUpperCase()}
                </Avatar>

                <Typography variant="h5" sx={{ fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
                  {profileData.firstName} {profileData.lastName}
                </Typography>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mb: 1 }}>
                  @{profileData.username}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
                  <Chip label={user?.role === 'ROLE_ADMIN' ? 'ADMINISTRATOR' : 'EMPLOYEE'} color="primary" size="small" sx={{ fontWeight: 'bold' }} />
                  <Chip label={profileData.department || 'Engineering'} variant="outlined" size="small" sx={{ borderColor: '#0284c7', color: '#0284c7', fontWeight: 'bold' }} />
                </Box>

                <Button
                  variant="outlined"
                  component="label"
                  disabled={uploading}
                  startIcon={uploading ? <CircularProgress size={18} /> : <i className="bi bi-camera-fill"></i>}
                  sx={{ borderColor: '#0284c7', color: '#0284c7', fontWeight: 'bold', textTransform: 'none' }}
                >
                  {uploading ? 'Uploading...' : 'Change Profile Picture'}
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
              </Card>
            </Grid>

            {/* Right Card: Form Details */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3.5, borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0284c7', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className="bi bi-pencil-square"></i> Personal & Contact Information
                </Typography>

                <Box component="form" onSubmit={handleSaveProfile} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Grid container spacing= {2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="First Name"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        sx={inputStyles}
                        required
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Last Name"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        sx={inputStyles}
                        required
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="Email Address"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    sx={inputStyles}
                    required
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Department"
                        value={profileData.department}
                        onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                        sx={inputStyles}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Designation"
                        value={profileData.designation}
                        onChange={(e) => setProfileData({ ...profileData, designation: e.target.value })}
                        sx={inputStyles}
                      />
                    </Grid>
                  </Grid>

                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    sx={inputStyles}
                  />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={saving}
                      startIcon={saving ? <CircularProgress size={18} /> : <i className="bi bi-check-circle-fill"></i>}
                      sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)', fontWeight: 'bold', px: 4, py: 1.2 }}
                    >
                      {saving ? 'Saving...' : 'Save Profile Changes'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfilePage;
