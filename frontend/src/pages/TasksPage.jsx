import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, LinearProgress, CircularProgress } from '@mui/material';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useThemeMode } from '../context/ThemeContext';

const TasksPage = () => {
  const { mode } = useThemeMode();
  const isDarkMode = mode === 'dark';
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (s) => {
    if (s === 'COMPLETED') return 'success';
    if (s === 'IN_PROGRESS') return 'warning';
    return 'default';
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: isDarkMode ? '#090d16' : '#f1f5f9', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Navbar />
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #0284c7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <i className="bi bi-list-check text-primary"></i> Task Management & Tracking
            </Typography>
            <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mt: 0.5 }}>
              Task assignments, real-time progress meters, and milestone sync with parent projects.
            </Typography>
          </Box>

          {loading ? (
            <CircularProgress sx={{ display: 'block', mx: 'auto', my: 5, color: '#0284c7' }} />
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
              <Table>
                <TableHead sx={{ backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Title</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Assigned Employee</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Project</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Progress %</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Remarks</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id} sx={{ '&:hover': { backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc' } }}>
                      <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>#{task.id}</TableCell>
                      <TableCell sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }}>{task.title}</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>{task.assignedToName || 'Unassigned'}</TableCell>
                      <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>{task.projectName || 'General'}</TableCell>
                      <TableCell><Chip label={task.status} color={getStatusColor(task.status)} size="small" sx={{ fontWeight: 'bold' }} /></TableCell>
                      <TableCell sx={{ width: 180 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant="determinate" value={task.progress || 0} sx={{ flexGrow: 1, height: 8, borderRadius: 4, backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #0284c7 0%, #6366f1 100%)' } }} />
                          <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 'bold' }}>{`${task.progress || 0}%`}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>{task.remarks || 'No remarks'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TasksPage;
