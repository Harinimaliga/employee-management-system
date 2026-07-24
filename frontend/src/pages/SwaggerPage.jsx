import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useThemeMode } from '../context/ThemeContext';

const SwaggerPage = () => {
  const { mode } = useThemeMode();
  const isDarkMode = mode === 'dark';

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: isDarkMode ? '#090d16' : '#f1f5f9', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #0284c7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <i className="bi bi-lightning-charge-fill text-primary"></i> OpenAPI & Swagger Documentation
              </Typography>
              <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mt: 0.5 }}>
                Interactive REST API playground, schema descriptors, and request execution.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<i className="bi bi-box-arrow-up-right"></i>}
              onClick={() => window.open('http://localhost:8080/swagger-ui.html', '_blank')}
              sx={{ borderColor: '#0284c7', color: '#0284c7', fontWeight: 'bold' }}
            >
              Open Fullscreen Swagger
            </Button>
          </Box>

          {/* Embedded iFrame displaying Swagger UI directly inside website */}
          <Paper sx={{ flexGrow: 1, minHeight: '75vh', borderRadius: 3, overflow: 'hidden', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
            <iframe
              src="http://localhost:8080/swagger-ui.html"
              title="Swagger API Documentation"
              style={{ width: '100%', height: '100%', border: 'none', minHeight: '75vh', backgroundColor: '#ffffff' }}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default SwaggerPage;
