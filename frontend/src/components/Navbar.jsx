import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Box, Chip, IconButton, Badge, Menu, MenuItem, ListItemText, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { mode, toggleThemeMode } = useThemeMode();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const openNotifications = Boolean(anchorEl);

  const notifications = [
    { id: 1, title: 'New Task Assignment 📋', body: 'You have been assigned: Develop Analytics Dashboard', time: '10 mins ago', type: 'task' },
    { id: 2, title: 'Email Notification Sent 📧', body: 'Task update summary dispatched to your email', time: '1 hr ago', type: 'email' },
    { id: 3, title: 'System Maintenance 📢', body: 'Database optimization scheduled for Saturday', time: '3 hrs ago', type: 'system' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenNotifications = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorEl(null);
  };

  const isDarkMode = mode === 'dark';

  return (
    <AppBar position="sticky" sx={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderBottom: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <Toolbar>
        <Typography variant="h6" component="div" onClick={() => navigate('/dashboard')} sx={{ flexGrow: 1, fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a', background: 'linear-gradient(to right, #0284c7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', cursor: 'pointer' }}>
          ⚡ Smart EMS & PMS
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Light / Dark Mode Toggle Button */}
          <IconButton onClick={toggleThemeMode} sx={{ color: isDarkMode ? '#f59e0b' : '#0284c7' }} title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}>
            {isDarkMode ? <i className="bi bi-sun-fill fs-5"></i> : <i className="bi bi-moon-stars-fill fs-5"></i>}
          </IconButton>

          {user ? (
            <>
              {/* Interactive Notifications Bell Icon */}
              <IconButton onClick={handleOpenNotifications} sx={{ color: isDarkMode ? '#38bdf8' : '#0284c7' }}>
                <Badge badgeContent={notifications.length} color="error">
                  <i className="bi bi-bell-fill fs-5"></i>
                </Badge>
              </IconButton>

              {/* Notifications Dropdown Menu */}
              <Menu
                anchorEl={anchorEl}
                open={openNotifications}
                onClose={handleCloseNotifications}
                PaperProps={{
                  sx: {
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    color: isDarkMode ? '#f8fafc' : '#0f172a',
                    border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1',
                    width: 340,
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    mt: 1.5,
                  }
                }}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#0284c7' }}>
                    Notifications & Email Alerts 🔔
                  </Typography>
                  <Chip label="Live ON" size="small" color="success" />
                </Box>
                <Divider sx={{ borderColor: isDarkMode ? '#334155' : '#e2e8f0' }} />
                {notifications.map((n) => (
                  <MenuItem key={n.id} onClick={handleCloseNotifications} sx={{ py: 1.5, borderBottom: isDarkMode ? '1px solid #1e293b' : '1px solid #f1f5f9', '&:hover': { backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc' } }}>
                    <ListItemText
                      primary={<Typography variant="body2" sx={{ fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>{n.title}</Typography>}
                      secondary={
                        <React.Fragment>
                          <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', display: 'block' }}>{n.body}</Typography>
                          <Typography variant="caption" sx={{ color: '#0284c7', fontSize: '0.7rem' }}>{n.time}</Typography>
                        </React.Fragment>
                      }
                    />
                  </MenuItem>
                ))}
              </Menu>

              {/* User Profile Badge (Clickable to open /profile) */}
              <Chip
                label={`${user.username} (${user.role === 'ROLE_ADMIN' ? 'ADMIN' : 'EMPLOYEE'})`}
                variant="outlined"
                onClick={() => navigate('/profile')}
                avatar={<i className="bi bi-person-fill text-primary ms-1"></i>}
                sx={{ color: isDarkMode ? '#fff' : '#0f172a', borderColor: '#0284c7', fontWeight: 'bold', backgroundColor: isDarkMode ? '#1e293b' : '#e0f2fe', cursor: 'pointer', '&:hover': { opacity: 0.9 } }}
              />

              <Button size="small" variant="outlined" startIcon={<i className="bi bi-person-circle"></i>} onClick={() => navigate('/profile')} sx={{ borderColor: '#0284c7', color: '#0284c7', fontWeight: 'bold' }}>
                Profile
              </Button>

              {/* Logout Button */}
              <Button color="error" variant="contained" size="small" onClick={handleLogout} sx={{ fontWeight: 'bold' }}>
                Logout
              </Button>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" onClick={() => navigate('/login')}>Login</Button>
              <Button variant="contained" color="primary" onClick={() => navigate('/register')}>Register</Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
