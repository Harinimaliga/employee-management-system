import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Alert, Box, MenuItem, IconButton } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'ROLE_EMPLOYEE',
    firstName: '',
    lastName: '',
    department: 'Engineering',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register, loading } = useAuth();
  const { mode, toggleThemeMode } = useThemeMode();
  const navigate = useNavigate();
  const isDarkMode = mode === 'dark';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    const res = await register(formData);
    if (res.success) {
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setError(res.message);
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
    <Box sx={{ minHeight: '100vh', backgroundColor: isDarkMode ? '#090d16' : '#f1f5f9', display: 'flex', alignItems: 'center', py: 5, position: 'relative' }}>
      {/* Light / Dark Mode Switcher at top right */}
      <Box sx={{ position: 'absolute', top: 20, right: 20 }}>
        <IconButton onClick={toggleThemeMode} sx={{ color: isDarkMode ? '#f59e0b' : '#0284c7' }} title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}>
          {isDarkMode ? <i className="bi bi-sun-fill fs-4"></i> : <i className="bi bi-moon-stars-fill fs-4"></i>}
        </IconButton>
      </Box>

      <Container maxWidth="xs">
        <Paper elevation={12} sx={{ p: 4, borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.5)' : '0 15px 35px rgba(0,0,0,0.08)' }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a', background: 'linear-gradient(to right, #0284c7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Create Account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField fullWidth label="Username" name="username" margin="normal" value={formData.username} onChange={handleChange} sx={inputStyles} required />
            <TextField fullWidth label="Email" name="email" type="email" margin="normal" value={formData.email} onChange={handleChange} sx={inputStyles} required />
            <TextField fullWidth label="Password" name="password" type="password" margin="normal" value={formData.password} onChange={handleChange} sx={inputStyles} required />
            
            <TextField fullWidth select label="Role" name="role" margin="normal" value={formData.role} onChange={handleChange} sx={inputStyles}>
              <MenuItem value="ROLE_EMPLOYEE">Employee</MenuItem>
              <MenuItem value="ROLE_ADMIN">Admin</MenuItem>
            </TextField>

            <TextField fullWidth label="First Name" name="firstName" margin="normal" value={formData.firstName} onChange={handleChange} sx={inputStyles} />
            <TextField fullWidth label="Last Name" name="lastName" margin="normal" value={formData.lastName} onChange={handleChange} sx={inputStyles} />
            <TextField fullWidth label="Department" name="department" margin="normal" value={formData.department} onChange={handleChange} sx={inputStyles} />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.3,
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
                '&:hover': { background: 'linear-gradient(135deg, #0369a1 0%, #3730a3 100%)' }
              }}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </Box>

          <Box align="center" sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
              Already have an account? <Link to="/login" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 'bold' }}>Sign In Here</Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
