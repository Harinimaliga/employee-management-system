import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, Switch, FormControlLabel, TextField, Button, Alert, Divider } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext';

const SettingsPage = () => {
  const { user } = useAuth();
  const { mode } = useThemeMode();
  const isDarkMode = mode === 'dark';

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New password and confirmation password do not match!' });
      return;
    }
    setMessage({ type: 'success', text: 'Settings & Security preferences updated successfully!' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: isDarkMode ? '#090d16' : '#f1f5f9', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Navbar />
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #0284c7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <i className="bi bi-gear-fill text-primary"></i> System Settings & Preferences
            </Typography>
            <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mt: 0.5 }}>
              Manage notification delivery triggers, security passwords, and account preferences.
            </Typography>
          </Box>

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 3 }}>
              {message.text}
            </Alert>
          )}

          <Grid container spacing={4}>
            {/* Email & Notification Settings */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0284c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className="bi bi-envelope-fill me-1"></i> Notification & Email Preferences
                </Typography>
                <Divider sx={{ borderColor: isDarkMode ? '#334155' : '#e2e8f0', mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailAlerts}
                        onChange={(e) => setEmailAlerts(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={<Typography variant="body1" sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: '500' }}>Task Assignment Email Notifications</Typography>}
                  />
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mt: -1.5, ml: 4 }}>
                    Dispatches instant email alerts when an administrator assigns a task to you.
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={weeklyDigest}
                        onChange={(e) => setWeeklyDigest(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={<Typography variant="body1" sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: '500' }}>Weekly Telemetry Summary Email</Typography>}
                  />
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mt: -1.5, ml: 4 }}>
                    Receive a weekly PDF report summarizing project milestones and completed tasks.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Profile & Password Security Settings */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#0284c7', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <i className="bi bi-shield-lock-fill me-1"></i> Account & Security Settings
                </Typography>
                <Divider sx={{ borderColor: isDarkMode ? '#334155' : '#e2e8f0', mb: 2 }} />

                <Box component="form" onSubmit={handlePasswordChange} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Current User"
                    value={`${user?.username || ''} (${user?.role || ''})`}
                    disabled
                    sx={inputStyles}
                  />

                  <TextField
                    fullWidth
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    sx={inputStyles}
                  />

                  <TextField
                    fullWidth
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={inputStyles}
                  />

                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    sx={inputStyles}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      mt: 1,
                      py: 1.2,
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)',
                    }}
                  >
                    Save Preferences
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default SettingsPage;
