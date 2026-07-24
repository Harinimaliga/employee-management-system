import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, CircularProgress, Button, Paper, Chip, TextField, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext';
import { TaskDistributionChart, TaskPieChart, DepartmentOverviewChart, PriorityBarChart } from '../components/Charts';

const DashboardPage = () => {
  const { user } = useAuth();
  const { mode } = useThemeMode();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isDarkMode = mode === 'dark';

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Interactive Filter States
  const [selectedProjectId, setSelectedProjectId] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [empRes, projRes, taskRes] = await Promise.all([
        api.get('/employees').catch(() => ({ data: [] })),
        api.get('/projects').catch(() => ({ data: [] })),
        api.get('/tasks').catch(() => ({ data: [] })),
      ]);

      setEmployees(empRes.data || []);
      setProjects(projRes.data || []);
      setTasks(taskRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (type, format) => {
    setExporting(true);
    try {
      const endpoint = `${type}/${format}`;
      const ext = format === 'pdf' ? 'pdf' : 'xlsx';
      const response = await api.get(`/reports/${endpoint}`, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${type}_report.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Failed to download report:', err);
    } finally {
      setExporting(false);
    }
  };

  // Filter tasks based on role + selected project + selected status
  const baseTasks = isAdmin ? tasks : tasks.filter(t => t.assignedToId === user?.id || t.assignedToName?.includes(user?.username));
  const filteredTasks = baseTasks.filter(t => {
    const matchesProj = selectedProjectId === 'ALL' || t.projectId?.toString() === selectedProjectId.toString();
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesProj && matchesStatus;
  });

  const completedTasksCount = filteredTasks.filter(t => t.status === 'COMPLETED').length;
  const inProgressTasksCount = filteredTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const pendingTasksCount = filteredTasks.filter(t => t.status !== 'COMPLETED').length;
  const highPriorityTasksCount = filteredTasks.filter(t => t.priority === 'HIGH').length;

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
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
      <Box>
        {isDarkMode && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Chip label="Smart EMS Platform" variant="outlined" size="small" sx={{ borderColor: '#38bdf8', color: '#38bdf8', fontWeight: 'bold' }} />
            <Chip label={`Role: ${isAdmin ? 'ADMINISTRATOR' : 'EMPLOYEE'}`} size="small" sx={{ backgroundColor: '#312e81', color: '#a5b4fc', fontWeight: 'bold' }} />
          </Box>
        )}
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
          {!isDarkMode && <i className="bi bi-speedometer2 text-primary"></i>}
          {isAdmin ? 'Smart EMS & PMS Control Center' : 'Employee Task Portal'}
        </Typography>
        <Typography variant="body1" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mt: 0.5 }}>
          Enterprise workforce telemetry, project allocations, and task milestone tracking.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        {isAdmin && (
          <>
            <Button variant="contained" size="small" disabled={exporting} startIcon={<i className="bi bi-file-earmark-pdf"></i>} onClick={() => handleDownloadReport('tasks', 'pdf')} sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)', color: '#fff', fontWeight: 'bold', borderRadius: 2 }}>
              {exporting ? 'Exporting...' : 'PDF Report'}
            </Button>
            <Button variant="contained" size="small" disabled={exporting} startIcon={<i className="bi bi-file-earmark-excel"></i>} onClick={() => handleDownloadReport('tasks', 'excel')} sx={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', color: '#fff', fontWeight: 'bold', borderRadius: 2 }}>
              {exporting ? 'Exporting...' : 'Excel Export'}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: isDarkMode ? '#090d16' : '#f1f5f9', color: isDarkMode ? '#f8fafc' : '#0f172a', fontFamily: 'Inter, sans-serif' }}>
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

          {/* Interactive Telemetry Filters Bar */}
          <Paper sx={{ p: 2, mb: 4, borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
            <Typography variant="subtitle2" sx={{ color: '#0284c7', fontWeight: 'bold', mr: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="bi bi-funnel-fill"></i> Interactive Telemetry Filters:
            </Typography>

            <TextField
              select
              label="Filter by Project"
              variant="outlined"
              size="small"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              sx={{ ...inputStyles, width: 220 }}
            >
              <MenuItem value="ALL">All Projects ({projects.length})</MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Filter Task Status"
              variant="outlined"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ ...inputStyles, width: 200 }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="TODO">To Do</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
            </TextField>
          </Paper>

          {loading ? (
            <Box align="center" sx={{ mt: 5 }}>
              <CircularProgress size={60} sx={{ color: '#0284c7' }} />
            </Box>
          ) : (
            <>
              {/* Metric Cards Grid */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                
                {/* Employees Card */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    onClick={() => navigate('/employees')}
                    sx={{
                      borderRadius: 3,
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1',
                      borderLeft: '5px solid #38bdf8',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            TOTAL EMPLOYEES
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: '800', color: isDarkMode ? '#f8fafc' : '#0f172a', my: 1 }}>
                            {employees.length}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 'bold' }}>
                            ↗ 100% active workforce
                          </Typography>
                        </Box>
                        <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                          <i className="bi bi-people-fill fs-3"></i>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Projects Card */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    onClick={() => navigate('/projects')}
                    sx={{
                      borderRadius: 3,
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1',
                      borderLeft: '5px solid #a855f7',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            ACTIVE PROJECTS
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: '800', color: isDarkMode ? '#f8fafc' : '#0f172a', my: 1 }}>
                            {projects.length}
                          </Typography>
                          <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                            {projects.length} portfolio items
                          </Typography>
                        </Box>
                        <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                          <i className="bi bi-folder-fill fs-3"></i>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Total Tasks Card */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    onClick={() => navigate('/tasks')}
                    sx={{
                      borderRadius: 3,
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1',
                      borderLeft: '5px solid #f59e0b',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            TOTAL TASKS
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: '800', color: isDarkMode ? '#f8fafc' : '#0f172a', my: 1 }}>
                            {filteredTasks.length}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                            {highPriorityTasksCount} high priority
                          </Typography>
                        </Box>
                        <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                          <i className="bi bi-check2-square fs-3"></i>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Completed Tasks Card */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card
                    onClick={() => navigate('/tasks')}
                    sx={{
                      borderRadius: 3,
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                      border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1',
                      borderLeft: '5px solid #22c55e',
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                      '&:hover': { transform: 'translateY(-5px)' }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            COMPLETED TASKS
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: '800', color: isDarkMode ? '#f8fafc' : '#0f172a', my: 1 }}>
                            {completedTasksCount}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 'bold' }}>
                            ✔ Done & Verified
                          </Typography>
                        </Box>
                        <Box sx={{ width: 48, height: 48, borderRadius: 2.5, background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                          <i className="bi bi-check-circle-fill fs-3"></i>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

              </Grid>

              {/* Dynamic Telemetry Visualization Bar Charts Grid */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={6}>
                  <DepartmentOverviewChart employees={employees} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <PriorityBarChart tasks={filteredTasks} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TaskDistributionChart pending={pendingTasksCount} completed={completedTasksCount} inProgress={inProgressTasksCount} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TaskPieChart pending={pendingTasksCount} completed={completedTasksCount} inProgress={inProgressTasksCount} />
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
