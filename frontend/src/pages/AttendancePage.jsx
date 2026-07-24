import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, Chip, TextField, MenuItem, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress
} from '@mui/material';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext';

const AttendancePage = () => {
  const { user } = useAuth();
  const { mode } = useThemeMode();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isDarkMode = mode === 'dark';

  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateEmployees: 0,
    leaveCount: 0,
    attendancePercentage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [notification, setNotification] = useState({ type: '', text: '' });

  // Pagination & Filters State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Form Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '',
    shiftId: '',
    attendanceDate: new Date().toISOString().split('T')[0],
    checkInTime: '09:00',
    checkOutTime: '17:30',
    status: 'PRESENT',
    remarks: '',
  });

  // Delete Confirm Dialog State
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchShifts();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchAttendanceData();
  }, [page, rowsPerPage, search, statusFilter, departmentFilter]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees');
      setEmployees(res.data || []);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchShifts = async () => {
    try {
      const res = await api.get('/shifts');
      setShifts(res.data || []);
    } catch (err) {
      console.error('Failed to fetch shifts:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/attendance/stats/today');
      setStats(res.data || {});
    } catch (err) {
      console.error('Failed to fetch attendance stats:', err);
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size: rowsPerPage,
        search: search || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        department: departmentFilter !== 'ALL' ? departmentFilter : undefined,
      };

      const res = await api.get('/attendance/page', { params });
      setAttendances(res.data?.content || []);
      setTotalElements(res.data?.totalElements || 0);
    } catch (err) {
      console.error('Failed to fetch attendance records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheckIn = async () => {
    try {
      await api.post('/attendance/check-in', {
        employeeId: user?.id || 2,
        shiftId: shifts[0]?.id || null,
      });
      setNotification({ type: 'success', text: 'Checked in successfully!' });
      fetchAttendanceData();
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to check in or already checked in for today.';
      setNotification({ type: 'error', text: msg });
    }
  };

  const handleQuickCheckOut = async (attId) => {
    try {
      await api.post(`/attendance/check-out/${attId}`);
      setNotification({ type: 'success', text: 'Checked out successfully!' });
      fetchAttendanceData();
      fetchStats();
    } catch (err) {
      setNotification({ type: 'error', text: 'Failed to check out.' });
    }
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setCurrentId(null);
    setFormData({
      employeeId: employees[0]?.id || '',
      shiftId: shifts[0]?.id || '',
      attendanceDate: new Date().toISOString().split('T')[0],
      checkInTime: '09:00',
      checkOutTime: '17:30',
      status: 'PRESENT',
      remarks: '',
    });
    setOpenModal(true);
  };

  const handleOpenEdit = (att) => {
    setEditMode(true);
    setCurrentId(att.id);
    setFormData({
      employeeId: att.employeeId || '',
      shiftId: att.shiftId || '',
      attendanceDate: att.attendanceDate || '',
      checkInTime: att.checkInTime ? att.checkInTime.substring(0, 5) : '09:00',
      checkOutTime: att.checkOutTime ? att.checkOutTime.substring(0, 5) : '17:30',
      status: att.status || 'PRESENT',
      remarks: att.remarks || '',
    });
    setOpenModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setNotification({ type: '', text: '' });

    if (formData.checkInTime && formData.checkOutTime && formData.checkInTime > formData.checkOutTime) {
      setNotification({ type: 'error', text: 'Check-in time cannot be after check-out time!' });
      return;
    }

    try {
      const payload = {
        ...formData,
        checkInTime: formData.checkInTime ? `${formData.checkInTime}:00` : null,
        checkOutTime: formData.checkOutTime ? `${formData.checkOutTime}:00` : null,
      };

      if (editMode) {
        await api.put(`/attendance/${currentId}`, payload);
        setNotification({ type: 'success', text: 'Attendance record updated successfully!' });
      } else {
        await api.post('/attendance', payload);
        setNotification({ type: 'success', text: 'Attendance record marked successfully!' });
      }

      setOpenModal(false);
      fetchAttendanceData();
      fetchStats();
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to save attendance record.';
      setNotification({ type: 'error', text: errMsg });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/attendance/${deleteTargetId}`);
      setNotification({ type: 'success', text: 'Attendance record deleted successfully!' });
      setOpenDeleteDialog(false);
      fetchAttendanceData();
      fetchStats();
    } catch (err) {
      setNotification({ type: 'error', text: 'Failed to delete attendance record.' });
    }
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const ext = format === 'pdf' ? 'pdf' : 'xlsx';
      const response = await api.get(`/reports/attendance/${format}`, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `attendance_report.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to export attendance report:', err);
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENT':
        return <Chip label="PRESENT" color="success" size="small" sx={{ fontWeight: 'bold' }} />;
      case 'LATE':
        return <Chip label="LATE" color="warning" size="small" sx={{ fontWeight: 'bold' }} />;
      case 'ABSENT':
        return <Chip label="ABSENT" color="error" size="small" sx={{ fontWeight: 'bold' }} />;
      case 'LEAVE':
        return <Chip label="LEAVE" sx={{ backgroundColor: '#9333ea', color: '#ffffff', fontWeight: 'bold' }} size="small" />;
      case 'WORK_FROM_HOME':
        return <Chip label="WORK FROM HOME" color="info" size="small" sx={{ fontWeight: 'bold' }} />;
      case 'HALF_DAY':
        return <Chip label="HALF DAY" variant="outlined" sx={{ borderColor: '#f59e0b', color: '#f59e0b', fontWeight: 'bold' }} size="small" />;
      default:
        return <Chip label={status} size="small" />;
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
          {!isDarkMode && <i className="bi bi-clock-history text-primary"></i>}
          Attendance Management & Telemetry
        </Typography>
        <Typography variant="body1" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mt: 0.5 }}>
          Real-time employee check-in/out logs, working hours, overtime detection, and shift calculations.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<i className="bi bi-box-arrow-in-right"></i>}
          onClick={handleQuickCheckIn}
          sx={{ fontWeight: 'bold' }}
        >
          1-Click Check In
        </Button>
        <Button
          variant="contained"
          startIcon={<i className="bi bi-plus-circle-fill"></i>}
          onClick={handleOpenAdd}
          sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)', fontWeight: 'bold' }}
        >
          Mark Attendance
        </Button>
        {isAdmin && (
          <>
            <Button variant="contained" size="small" disabled={exporting} startIcon={<i className="bi bi-file-earmark-pdf"></i>} onClick={() => handleExport('pdf')} sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)', color: '#fff', fontWeight: 'bold' }}>
              PDF Report
            </Button>
            <Button variant="contained" size="small" disabled={exporting} startIcon={<i className="bi bi-file-earmark-excel"></i>} onClick={() => handleExport('excel')} sx={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#fff', fontWeight: 'bold' }}>
              Excel Export
            </Button>
          </>
        )}
      </Box>
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

          {/* Today's Telemetry Metric Cards Grid */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderLeft: '5px solid #22c55e', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#22c55e' }}>PRESENT TODAY</Typography>
                  <Typography variant="h3" sx={{ fontWeight: '800', color: isDarkMode ? '#ffffff' : '#0f172a', my: 0.5 }}>
                    {stats.presentToday !== undefined ? stats.presentToday : 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: '500' }}>
                    {stats.attendancePercentage !== undefined ? stats.attendancePercentage : 0}% Attendance Rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderLeft: '5px solid #ef4444', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#ef4444' }}>ABSENT TODAY</Typography>
                  <Typography variant="h3" sx={{ fontWeight: '800', color: isDarkMode ? '#ffffff' : '#0f172a', my: 0.5 }}>
                    {stats.absentToday !== undefined ? stats.absentToday : 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: '500' }}>Unexcused absences</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderLeft: '5px solid #f59e0b', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#f59e0b' }}>LATE EMPLOYEES</Typography>
                  <Typography variant="h3" sx={{ fontWeight: '800', color: isDarkMode ? '#ffffff' : '#0f172a', my: 0.5 }}>
                    {stats.lateEmployees !== undefined ? stats.lateEmployees : 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: '500' }}>Delayed check-in</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderLeft: '5px solid #a855f7', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#a855f7' }}>ON LEAVE</Typography>
                  <Typography variant="h3" sx={{ fontWeight: '800', color: isDarkMode ? '#ffffff' : '#0f172a', my: 0.5 }}>
                    {stats.leaveCount !== undefined ? stats.leaveCount : 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: '500' }}>Approved leaves</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderLeft: '5px solid #0284c7', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#0284c7' }}>TOTAL WORKFORCE</Typography>
                  <Typography variant="h3" sx={{ fontWeight: '800', color: isDarkMode ? '#ffffff' : '#0f172a', my: 0.5 }}>
                    {stats.totalEmployees !== undefined ? stats.totalEmployees : 0}
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: '500' }}>Registered personnel</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search & Filters Toolbar */}
          <Paper sx={{ p: 2, mb: 3, borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', display: 'flex', gap: 2, flexWrap: 'wrap', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
            <TextField
              label="Search Employee..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ ...inputStyles, flexGrow: 1, minWidth: 200 }}
            />

            <TextField
              select
              label="Filter Status"
              variant="outlined"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ ...inputStyles, width: 180 }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="PRESENT">Present</MenuItem>
              <MenuItem value="LATE">Late</MenuItem>
              <MenuItem value="ABSENT">Absent</MenuItem>
              <MenuItem value="LEAVE">Leave</MenuItem>
              <MenuItem value="WORK_FROM_HOME">Work From Home</MenuItem>
              <MenuItem value="HALF_DAY">Half Day</MenuItem>
            </TextField>

            <TextField
              select
              label="Filter Department"
              variant="outlined"
              size="small"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              sx={{ ...inputStyles, width: 180 }}
            >
              <MenuItem value="ALL">All Departments</MenuItem>
              <MenuItem value="Engineering">Engineering</MenuItem>
              <MenuItem value="Human Resources">Human Resources</MenuItem>
              <MenuItem value="Product & Design">Product & Design</MenuItem>
              <MenuItem value="Finance">Finance</MenuItem>
            </TextField>
          </Paper>

          {/* Attendance Data Table */}
          <Paper sx={{ borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
            {loading ? (
              <Box align="center" sx={{ p: 5 }}>
                <CircularProgress sx={{ color: '#0284c7' }} />
              </Box>
            ) : (
              <>
                <Table>
                  <TableHead sx={{ backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Employee Name</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Shift</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Check-In</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Check-Out</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Hours</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Overtime</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell align="center" sx={{ color: '#0284c7', fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendances.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', py: 4 }}>
                          No attendance records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendances.map((att) => (
                        <TableRow key={att.id} sx={{ '&:hover': { backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc' } }}>
                          <TableCell sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}>{att.id}</TableCell>
                          <TableCell sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }}>{att.attendanceDate}</TableCell>
                          <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>{att.employeeName}</TableCell>
                          <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>{att.shiftName || 'General Shift'}</TableCell>
                          <TableCell sx={{ color: '#22c55e', fontWeight: 'bold' }}>
                            {att.checkInTime || '--:--'}
                            {att.lateArrival && <Chip label="LATE" size="small" color="warning" sx={{ ml: 1, fontSize: '0.65rem' }} />}
                          </TableCell>
                          <TableCell sx={{ color: '#ef4444', fontWeight: 'bold' }}>
                            {att.checkOutTime || '--:--'}
                            {att.earlyDeparture && <Chip label="EARLY" size="small" color="error" sx={{ ml: 1, fontSize: '0.65rem' }} />}
                          </TableCell>
                          <TableCell sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }}>
                            {att.workingHours ? `${att.workingHours} hrs` : '-'}
                          </TableCell>
                          <TableCell sx={{ color: '#22c55e', fontWeight: 'bold' }}>
                            {att.overtimeHours > 0 ? (
                              <Chip label={`+${att.overtimeHours} hrs OT`} color="success" size="small" sx={{ fontWeight: 'bold' }} />
                            ) : (
                              '0 hrs'
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(att.status)}</TableCell>
                          <TableCell align="center">
                            {!att.checkOutTime && (
                              <Button size="small" variant="outlined" color="error" onClick={() => handleQuickCheckOut(att.id)} sx={{ mr: 1, fontWeight: 'bold' }}>
                                Check Out
                              </Button>
                            )}
                            {isAdmin && (
                              <>
                                <IconButton size="small" onClick={() => handleOpenEdit(att)} sx={{ color: '#0284c7' }}>
                                  <i className="bi bi-pencil-square"></i>
                                </IconButton>
                                <IconButton size="small" onClick={() => { setDeleteTargetId(att.id); setOpenDeleteDialog(true); }} sx={{ color: '#ef4444' }}>
                                  <i className="bi bi-trash-fill"></i>
                                </IconButton>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={totalElements}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                  sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', borderTop: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0' }}
                />
              </>
            )}
          </Paper>

          {/* Mark / Edit Attendance Form Dialog */}
          <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#f8fafc' : '#0f172a', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 'bold', color: '#0284c7', borderBottom: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0' }}>
              {editMode ? 'Edit Attendance Record' : 'Mark Daily Attendance'}
            </DialogTitle>
            <Box component="form" onSubmit={handleSave}>
              <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  select
                  fullWidth
                  label="Select Employee *"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  sx={inputStyles}
                  required
                >
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.department || 'Engineering'})
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  fullWidth
                  label="Assigned Shift"
                  value={formData.shiftId}
                  onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                  sx={inputStyles}
                >
                  {shifts.map((s) => (
                    <MenuItem key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</MenuItem>
                  ))}
                </TextField>

                <TextField
                  fullWidth
                  type="date"
                  label="Attendance Date *"
                  value={formData.attendanceDate}
                  onChange={(e) => setFormData({ ...formData, attendanceDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={inputStyles}
                  required
                />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Check-In Time"
                      value={formData.checkInTime}
                      onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      sx={inputStyles}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      type="time"
                      label="Check-Out Time"
                      value={formData.checkOutTime}
                      onChange={(e) => setFormData({ ...formData, checkOutTime: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                      sx={inputStyles}
                    />
                  </Grid>
                </Grid>

                <TextField
                  select
                  fullWidth
                  label="Attendance Status *"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  sx={inputStyles}
                  required
                >
                  <MenuItem value="PRESENT">PRESENT</MenuItem>
                  <MenuItem value="LATE">LATE</MenuItem>
                  <MenuItem value="ABSENT">ABSENT</MenuItem>
                  <MenuItem value="LEAVE">LEAVE</MenuItem>
                  <MenuItem value="WORK_FROM_HOME">WORK FROM HOME</MenuItem>
                  <MenuItem value="HALF_DAY">HALF DAY</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Remarks & Notes"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  sx={inputStyles}
                />
              </DialogContent>
              <DialogActions sx={{ borderTop: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0', p: 2 }}>
                <Button onClick={() => setOpenModal(false)} sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Cancel</Button>
                <Button type="submit" variant="contained" sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)', fontWeight: 'bold' }}>
                  {editMode ? 'Save Changes' : 'Submit Attendance'}
                </Button>
              </DialogActions>
            </Box>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} PaperProps={{ sx: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#f8fafc' : '#0f172a', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderRadius: 3 } }}>
            <DialogTitle sx={{ color: '#ef4444', fontWeight: 'bold' }}>Confirm Attendance Deletion</DialogTitle>
            <DialogContent>
              <Typography variant="body1">Are you sure you want to delete this attendance record? This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenDeleteDialog(false)} sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Cancel</Button>
              <Button onClick={handleDelete} variant="contained" color="error" sx={{ fontWeight: 'bold' }}>Delete</Button>
            </DialogActions>
          </Dialog>

        </Box>
      </Box>
    </Box>
  );
};

export default AttendancePage;
