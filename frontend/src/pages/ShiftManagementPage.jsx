import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, TextField, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress
} from '@mui/material';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext';

const ShiftManagementPage = () => {
  const { user } = useAuth();
  const { mode } = useThemeMode();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isDarkMode = mode === 'dark';

  const [shifts, setShifts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', text: '' });

  // Create / Edit Shift Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '09:00',
    endTime: '18:00',
    gracePeriodMinutes: 15,
    active: true,
    description: '',
  });

  // Assign Shift Modal State
  const [openAssignModal, setOpenAssignModal] = useState(false);
  const [assignData, setAssignData] = useState({ shiftId: '', employeeId: '' });

  // Delete Confirm Modal State
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    fetchShifts();
    fetchEmployees();
  }, []);

  const fetchShifts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/shifts');
      setShifts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch shifts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setCurrentId(null);
    setFormData({
      name: '',
      startTime: '09:00',
      endTime: '18:00',
      gracePeriodMinutes: 15,
      active: true,
      description: '',
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (shift) => {
    setEditMode(true);
    setCurrentId(shift.id);
    setFormData({
      name: shift.name || '',
      startTime: shift.startTime ? shift.startTime.substring(0, 5) : '09:00',
      endTime: shift.endTime ? shift.endTime.substring(0, 5) : '18:00',
      gracePeriodMinutes: shift.gracePeriodMinutes || 15,
      active: shift.active !== undefined ? shift.active : true,
      description: shift.description || '',
    });
    setOpenModal(true);
  };

  const handleSaveShift = async (e) => {
    e.preventDefault();
    setNotification({ type: '', text: '' });

    try {
      const payload = {
        ...formData,
        startTime: `${formData.startTime}:00`,
        endTime: `${formData.endTime}:00`,
      };

      if (editMode) {
        await api.put(`/shifts/${currentId}`, payload);
        setNotification({ type: 'success', text: 'Shift updated successfully!' });
      } else {
        await api.post('/shifts', payload);
        setNotification({ type: 'success', text: 'Shift created successfully!' });
      }

      setOpenModal(false);
      fetchShifts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save shift details.';
      setNotification({ type: 'error', text: msg });
    }
  };

  const handleDeleteShift = async () => {
    try {
      await api.delete(`/shifts/${deleteTargetId}`);
      setNotification({ type: 'success', text: 'Shift deleted successfully!' });
      setOpenDeleteDialog(false);
      fetchShifts();
    } catch (err) {
      setNotification({ type: 'error', text: 'Failed to delete shift.' });
    }
  };

  const handleAssignShift = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/shifts/${assignData.shiftId}/assign/${assignData.employeeId}`);
      setNotification({ type: 'success', text: 'Shift assigned successfully to employee!' });
      setOpenAssignModal(false);
    } catch (err) {
      setNotification({ type: 'error', text: 'Failed to assign shift.' });
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
          {!isDarkMode && <i className="bi bi-stopwatch-fill text-primary"></i>}
          Shift Management & Scheduling
        </Typography>
        <Typography variant="body1" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mt: 0.5 }}>
          Configure work shifts (Morning, Afternoon, Night, General), grace periods, and employee assignments.
        </Typography>
      </Box>

      {isAdmin && (
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<i className="bi bi-plus-circle-fill"></i>}
            onClick={handleOpenAdd}
            sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)', fontWeight: 'bold' }}
          >
            Create New Shift
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<i className="bi bi-person-check-fill"></i>}
            onClick={() => { setAssignData({ shiftId: shifts[0]?.id || '', employeeId: employees[0]?.id || '' }); setOpenAssignModal(true); }}
            sx={{ fontWeight: 'bold' }}
          >
            Assign Shift
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: isDarkMode ? '#090d16' : '#f1f5f9', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, overflowX: 'hidden' }}>
        <Navbar />
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          
          {/* Header: Dark Banner Card in Dark Mode, Clean Header in Light Mode */}
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

          {/* Shift Telemetry Cards Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {shifts.map((s) => (
              <Grid item xs={12} sm={6} md={3} key={s.id}>
                <Card sx={{ borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderLeft: '5px solid #0284c7', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>{s.name}</Typography>
                      <Chip label={s.active ? 'ACTIVE' : 'INACTIVE'} color={s.active ? 'success' : 'default'} size="small" sx={{ fontWeight: 'bold' }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#0284c7', fontWeight: 'bold', my: 1 }}>
                      <i className="bi bi-clock me-1"></i> {s.startTime} - {s.endTime}
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', display: 'block' }}>
                      Grace Period: {s.gracePeriodMinutes || 15} mins
                    </Typography>
                    <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                      {s.description || 'Standard corporate work shift.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Shifts Data Table */}
          <Paper sx={{ borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
            {loading ? (
              <Box align="center" sx={{ p: 5 }}>
                <CircularProgress sx={{ color: '#0284c7' }} />
              </Box>
            ) : (
              <Table>
                <TableHead sx={{ backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
                  <TableRow>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Shift Name</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Start Time</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>End Time</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Grace Period</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Description</TableCell>
                    {isAdmin && <TableCell align="center" sx={{ color: '#0284c7', fontWeight: 'bold' }}>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shifts.map((s) => (
                    <TableRow key={s.id} sx={{ '&:hover': { backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc' } }}>
                      <TableCell sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}>{s.id}</TableCell>
                      <TableCell sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }}>{s.name}</TableCell>
                      <TableCell sx={{ color: '#22c55e', fontWeight: 'bold' }}>{s.startTime}</TableCell>
                      <TableCell sx={{ color: '#ef4444', fontWeight: 'bold' }}>{s.endTime}</TableCell>
                      <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>{s.gracePeriodMinutes || 15} Mins</TableCell>
                      <TableCell>
                        <Chip label={s.active ? 'ACTIVE' : 'INACTIVE'} color={s.active ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>{s.description || '-'}</TableCell>
                      {isAdmin && (
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => handleOpenEdit(s)} sx={{ color: '#0284c7' }}>
                            <i className="bi bi-pencil-square"></i>
                          </IconButton>
                          <IconButton size="small" onClick={() => { setDeleteTargetId(s.id); setOpenDeleteDialog(true); }} sx={{ color: '#ef4444' }}>
                            <i className="bi bi-trash-fill"></i>
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>

          {/* Create / Edit Shift Modal */}
          <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#f8fafc' : '#0f172a', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 'bold', color: '#0284c7', borderBottom: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0' }}>
              {editMode ? 'Edit Shift Parameters' : 'Create New Shift'}
            </DialogTitle>
            <Box component="form" onSubmit={handleSaveShift}>
              <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Shift Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  sx={inputStyles}
                  required
                />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Start Time *"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      sx={inputStyles}
                      required
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="End Time *"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      sx={inputStyles}
                      required
                    />
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  type="number"
                  label="Grace Period (Minutes)"
                  value={formData.gracePeriodMinutes}
                  onChange={(e) => setFormData({ ...formData, gracePeriodMinutes: parseInt(e.target.value, 10) })}
                  sx={inputStyles}
                />

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  sx={inputStyles}
                />
              </DialogContent>
              <DialogActions sx={{ borderTop: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0', p: 2 }}>
                <Button onClick={() => setOpenModal(false)} sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Cancel</Button>
                <Button type="submit" variant="contained" sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)', fontWeight: 'bold' }}>
                  {editMode ? 'Save Changes' : 'Create Shift'}
                </Button>
              </DialogActions>
            </Box>
          </Dialog>

          {/* Assign Shift Modal */}
          <Dialog open={openAssignModal} onClose={() => setOpenAssignModal(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#f8fafc' : '#0f172a', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 'bold', color: '#0284c7' }}>Assign Shift to Employee</DialogTitle>
            <Box component="form" onSubmit={handleAssignShift}>
              <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Select Shift *"
                  value={assignData.shiftId}
                  onChange={(e) => setAssignData({ ...assignData, shiftId: e.target.value })}
                  sx={inputStyles}
                  required
                >
                  {shifts.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Select Employee *"
                  value={assignData.employeeId}
                  onChange={(e) => setAssignData({ ...assignData, employeeId: e.target.value })}
                  sx={inputStyles}
                  required
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.department || 'Engineering'})</MenuItem>
                  ))}
                </TextField>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setOpenAssignModal(false)} sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Cancel</Button>
                <Button type="submit" variant="contained" sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)', fontWeight: 'bold' }}>
                  Assign Shift
                </Button>
              </DialogActions>
            </Box>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} PaperProps={{ sx: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#f8fafc' : '#0f172a', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderRadius: 3 } }}>
            <DialogTitle sx={{ color: '#ef4444', fontWeight: 'bold' }}>Confirm Shift Deletion</DialogTitle>
            <DialogContent>
              <Typography variant="body1">Are you sure you want to delete this shift? This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenDeleteDialog(false)} sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Cancel</Button>
              <Button onClick={handleDeleteShift} variant="contained" color="error" sx={{ fontWeight: 'bold' }}>Delete</Button>
            </DialogActions>
          </Dialog>

        </Box>
      </Box>
    </Box>
  );
};

export default ShiftManagementPage;
