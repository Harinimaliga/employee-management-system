import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, TextField, Button, Alert, Container, MenuItem, Chip, IconButton
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_ADMIN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, logout } = useAuth();
  const { mode, toggleThemeMode } = useThemeMode();
  const navigate = useNavigate();
  const isDarkMode = mode === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in both username and password.');
      return;
    }

    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (targetRole) => {
    logout();
    setError('');

    if (targetRole === 'ROLE_ADMIN') {
      setRole('ROLE_ADMIN');
      setUsername('admin');
      setPassword('admin123');
    } else {
      setRole('ROLE_EMPLOYEE');
      setUsername('harini');
      setPassword('password123');
    }
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      color: isDarkMode ? '#f8fafc' : '#0f172a',
      backgroundColor: isDarkMode ? 'transparent' : '#f8fafc',
      '& fieldset': { borderColor: isDarkMode ? '#334155' : '#cbd5e1' },
      '&:hover fieldset': { borderColor: '#38bdf8' },
      '&.Mui-focused fieldset': { borderColor: '#38bdf8' },
    },
    '& .MuiInputLabel-root': { color: isDarkMode ? '#94a3b8' : '#64748b' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#38bdf8' },
    '& .MuiSelect-icon': { color: isDarkMode ? '#94a3b8' : '#64748b' },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDarkMode ? '#090d16' : '#f1f5f9',
        backgroundImage: isDarkMode ? 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #090d16 70%)' : 'radial-gradient(circle at 50% 50%, #e0f2fe 0%, #f1f5f9 70%)',
        p: 2,
        position: 'relative',
      }}
    >
      {/* Light / Dark Mode Switcher at top right */}
      <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
        <IconButton onClick={toggleThemeMode} sx={{ color: isDarkMode ? '#f59e0b' : '#0284c7' }} title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}>
          {isDarkMode ? <i className="bi bi-sun-fill fs-4"></i> : <i className="bi bi-moon-stars-fill fs-4"></i>}
        </IconButton>
      </Box>

      <Container maxWidth="xs">
        <Card
          elevation={24}
          sx={{
            borderRadius: 4,
            backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
            border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1',
            boxShadow: isDarkMode ? '0 20px 40px rgba(0, 0, 0, 0.6)' : '0 15px 35px rgba(0, 0, 0, 0.08)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box textAlign="center" mb={3}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #0284c7, #6366f1)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Account Login
              </Typography>
              <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mt: 1 }}>
                Smart Employee & Project Management System
              </Typography>

              {/* 1-Click Role Selection Demo Chips */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
                <Chip
                  icon={<i className="bi bi-shield-lock-fill text-info"></i>}
                  label="Fill Admin"
                  onClick={() => handleQuickFill('ROLE_ADMIN')}
                  clickable
                  variant={role === 'ROLE_ADMIN' ? 'filled' : 'outlined'}
                  sx={{ borderColor: '#0284c7', color: '#0284c7', fontWeight: 'bold' }}
                />
                <Chip
                  icon={<i className="bi bi-person-fill text-success"></i>}
                  label="Fill Employee"
                  onClick={() => handleQuickFill('ROLE_EMPLOYEE')}
                  clickable
                  variant={role === 'ROLE_EMPLOYEE' ? 'filled' : 'outlined'}
                  sx={{ borderColor: '#22c55e', color: '#16a34a', fontWeight: 'bold' }}
                />
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                select
                fullWidth
                label="Select Account Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                margin="normal"
                sx={inputStyles}
              >
                <MenuItem value="ROLE_ADMIN">Administrator (ROLE_ADMIN)</MenuItem>
                <MenuItem value="ROLE_EMPLOYEE">Employee (ROLE_EMPLOYEE)</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Username *"
                variant="outlined"
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={inputStyles}
                required
              />

              <TextField
                fullWidth
                label="Password *"
                type="password"
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={inputStyles}
                required
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)',
                  boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0369a1 0%, #3730a3 100%)',
                  },
                }}
              >
                {loading ? 'SIGNING IN...' : `SIGN IN AS ${role === 'ROLE_ADMIN' ? 'ADMIN' : 'EMPLOYEE'}`}
              </Button>

              <Box textAlign="center" mt={2}>
                <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: '#0284c7', fontWeight: 'bold', textDecoration: 'none' }}>
                    Register Here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginPage;
