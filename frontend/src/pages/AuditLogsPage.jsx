import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, TextField
} from '@mui/material';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useThemeMode } from '../context/ThemeContext';

const AuditLogsPage = () => {
  const { mode } = useThemeMode();
  const isDarkMode = mode === 'dark';

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/audit-logs').catch(() => ({ data: [] }));
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log =>
    `${log.action} ${log.performedBy} ${log.details}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #0284c7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <i className="bi bi-clipboard-data text-primary"></i> System Audit Trail & Event Logs
              </Typography>
              <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mt: 0.5 }}>
                Real-time security auditing, user authentication logs, and data mutation trails.
              </Typography>
            </Box>

            <TextField
              label="Filter Audit Events..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ ...inputStyles, width: 280 }}
            />
          </Box>

          {loading ? (
            <CircularProgress sx={{ display: 'block', mx: 'auto', my: 5, color: '#0284c7' }} />
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
              <Table>
                <TableHead sx={{ backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Log ID</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Timestamp</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>User</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Action</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Event Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', py: 4 }}>
                        No audit logs recorded yet. System activities will appear here automatically.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id} sx={{ '&:hover': { backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc' } }}>
                        <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>#{log.id}</TableCell>
                        <TableCell sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                        </TableCell>
                        <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>{log.performedBy || 'SYSTEM'}</TableCell>
                        <TableCell>
                          <Chip
                            label={log.action}
                            color={log.action?.includes('CREATE') || log.action?.includes('INIT') ? 'success' : log.action?.includes('DELETE') ? 'error' : 'info'}
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#cbd5e1' : '#334155', fontWeight: '500' }}>{log.details || 'Operation completed successfully'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default AuditLogsPage;
