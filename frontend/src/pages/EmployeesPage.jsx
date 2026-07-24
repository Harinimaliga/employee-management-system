import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, TableSortLabel, Chip, TextField, MenuItem, Button, CircularProgress,
  IconButton, Snackbar, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useThemeMode } from '../context/ThemeContext';

const EmployeesPage = () => {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const isDarkMode = mode === 'dark';

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');

  // Pagination & Sorting state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [orderBy, setOrderBy] = useState('firstName');
  const [order, setOrder] = useState('asc');

  // Notification state
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      setEmployees(res.data || []);
    } catch (err) {
      showToast('Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee profile?')) {
      try {
        await api.delete(`/employees/${id}`);
        showToast('Employee deleted successfully!');
        fetchEmployees();
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to delete employee', 'error');
      }
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const filtered = employees.filter((e) => {
    const matchesSearch = `${e.firstName} ${e.lastName} ${e.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesDept = department ? e.department === department : true;
    return matchesSearch && matchesDept;
  });

  const sorted = filtered.sort((a, b) => {
    const valA = (a[orderBy] || '').toString().toLowerCase();
    const valB = (b[orderBy] || '').toString().toLowerCase();
    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const paginated = sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
          {!isDarkMode && <i className="bi bi-people-fill text-primary"></i>}
          Employee Directory
        </Typography>
        <Typography variant="body1" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mt: 0.5 }}>
          Comprehensive employee staff profiles, department allocation, and record actions.
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<i className="bi bi-person-plus-fill"></i>}
        onClick={() => navigate('/employees/add')}
        sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)', fontWeight: 'bold', px: 3, py: 1 }}
      >
        Add New Employee
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: isDarkMode ? '#090d16' : '#f1f5f9', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
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

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              label="Search Name or Email"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ ...inputStyles, width: 280 }}
            />
            <TextField
              select
              label="Filter Department"
              variant="outlined"
              size="small"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              sx={{ ...inputStyles, width: 200 }}
            >
              <MenuItem value="">All Departments</MenuItem>
              <MenuItem value="Engineering">Engineering</MenuItem>
              <MenuItem value="HR">HR</MenuItem>
              <MenuItem value="Sales">Sales</MenuItem>
              <MenuItem value="Finance">Finance</MenuItem>
              <MenuItem value="Management">Management</MenuItem>
              <MenuItem value="Data Science">Data Science</MenuItem>
            </TextField>
          </Box>

          {loading ? (
            <CircularProgress sx={{ display: 'block', mx: 'auto', my: 5, color: '#0284c7' }} />
          ) : (
            <Paper sx={{ borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
              <TableContainer>
                <Table>
                  <TableHead sx={{ backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>
                        <TableSortLabel active={orderBy === 'firstName'} direction={order} onClick={() => handleSort('firstName')} sx={{ color: '#0284c7 !important' }}>
                          Name
                        </TableSortLabel>
                      </TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Department</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Designation</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Phone</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginated.map((emp) => (
                      <TableRow key={emp.id} sx={{ '&:hover': { backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc' } }}>
                        <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>#{emp.id}</TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }}>{`${emp.firstName} ${emp.lastName}`}</TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>{emp.email}</TableCell>
                        <TableCell><Chip label={emp.department} variant="outlined" size="small" sx={{ borderColor: '#0284c7', color: '#0284c7' }} /></TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>{emp.designation || 'Staff'}</TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>{emp.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <IconButton size="small" sx={{ color: '#0284c7' }} onClick={() => navigate(`/employees/edit/${emp.id}`)}>
                            <i className="bi bi-pencil-square"></i>
                          </IconButton>
                          <IconButton size="small" sx={{ color: '#ef4444' }} onClick={() => handleDelete(emp.id)}>
                            <i className="bi bi-trash-fill"></i>
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filtered.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', borderTop: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0' }}
              />
            </Paper>
          )}

          <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({ ...toast, open: false })}>
            <Alert severity={toast.severity} sx={{ width: '100%' }}>{toast.message}</Alert>
          </Snackbar>
        </Box>
      </Box>
    </Box>
  );
};

export default EmployeesPage;
