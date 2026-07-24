import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, CircularProgress, LinearProgress
} from '@mui/material';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useThemeMode } from '../context/ThemeContext';

const ReportsPage = () => {
  const { mode } = useThemeMode();
  const isDarkMode = mode === 'dark';

  const [activeTab, setActiveTab] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
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
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (endpoint, defaultFilename) => {
    setExporting(true);
    try {
      const response = await api.get(`/reports/${endpoint}`, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', defaultFilename);
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

  const employeeTaskReports = employees.map(emp => {
    const empTasks = tasks.filter(t => {
      if (t.assignedToId && t.assignedToId === emp.id) return true;
      if (t.assignedToName && emp.firstName && t.assignedToName.toLowerCase().includes(emp.firstName.trim().toLowerCase())) return true;
      return false;
    });

    const completed = empTasks.filter(t => t.status === 'COMPLETED').length;
    const pending = empTasks.filter(t => t.status !== 'COMPLETED').length;
    return {
      ...emp,
      totalTasks: empTasks.length,
      completedTasks: completed,
      pendingTasks: pending,
    };
  });

  const projectProgressReports = projects.map(proj => {
    const projTasks = tasks.filter(t => t.projectId === proj.id || t.projectName === proj.name);
    const completed = projTasks.filter(t => t.status === 'COMPLETED').length;
    const pct = projTasks.length > 0 ? Math.round((completed / projTasks.length) * 100) : 0;
    return {
      ...proj,
      totalTasks: projTasks.length,
      completedTasks: completed,
      progressPct: pct,
    };
  });

  const pendingTasksReport = tasks.filter(t => t.status !== 'COMPLETED');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: isDarkMode ? '#090d16' : '#f1f5f9', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Navbar />
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {/* Header & Export Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #0284c7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <i className="bi bi-bar-chart-line-fill text-primary"></i> Management Reports & Analytics
              </Typography>
              <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mt: 0.5 }}>
                1-Click PDF & Excel dataset export suite for executive reviews.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                disabled={exporting}
                startIcon={<i className="bi bi-file-earmark-pdf"></i>}
                onClick={() => handleExport(activeTab === 1 ? 'projects/pdf' : 'tasks/pdf', activeTab === 1 ? 'project_summary_report.pdf' : 'task_summary_report.pdf')}
                sx={{ borderColor: '#0284c7', color: '#0284c7', fontWeight: 'bold' }}
              >
                {exporting ? 'Exporting...' : 'Export PDF'}
              </Button>
              <Button
                variant="outlined"
                disabled={exporting}
                startIcon={<i className="bi bi-file-earmark-excel"></i>}
                onClick={() => handleExport('tasks/excel', 'task_dataset.xlsx')}
                sx={{ borderColor: '#22c55e', color: '#22c55e', fontWeight: 'bold' }}
              >
                {exporting ? 'Exporting...' : 'Export Excel'}
              </Button>
            </Box>
          </Box>

          {/* Navigation Tabs */}
          <Paper sx={{ backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderRadius: 3, mb: 3 }}>
            <Tabs
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              textColor="inherit"
              indicatorColor="primary"
              sx={{
                '& .MuiTab-root': { color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold' },
                '& .Mui-selected': { color: '#0284c7 !important' },
                '& .MuiTabs-indicator': { backgroundColor: '#0284c7' }
              }}
            >
              <Tab icon={<i className="bi bi-person-badge me-2"></i>} label="1. Employee-wise Task Report" iconPosition="start" />
              <Tab icon={<i className="bi bi-folder-check me-2"></i>} label="2. Project Progress Report" iconPosition="start" />
              <Tab icon={<i className="bi bi-clock-history me-2"></i>} label="3. Pending Task Report" iconPosition="start" />
            </Tabs>
          </Paper>

          {loading ? (
            <CircularProgress sx={{ display: 'block', mx: 'auto', my: 5, color: '#0284c7' }} />
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
              {/* TAB 1: EMPLOYEE-WISE TASK REPORT */}
              {activeTab === 0 && (
                <Table>
                  <TableHead sx={{ backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Emp ID</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Employee Name</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Department</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Total Assigned</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Completed</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Pending</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employeeTaskReports.map((row) => (
                      <TableRow key={row.id} sx={{ '&:hover': { backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc' } }}>
                        <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>#{row.id}</TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }}>{`${row.firstName} ${row.lastName}`}</TableCell>
                        <TableCell><Chip label={row.department} variant="outlined" size="small" sx={{ borderColor: '#0284c7', color: '#0284c7' }} /></TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }}>{row.totalTasks}</TableCell>
                        <TableCell sx={{ color: '#22c55e', fontWeight: 'bold' }}>{row.completedTasks}</TableCell>
                        <TableCell sx={{ color: '#f59e0b', fontWeight: 'bold' }}>{row.pendingTasks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* TAB 2: PROJECT PROGRESS REPORT */}
              {activeTab === 1 && (
                <Table>
                  <TableHead sx={{ backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Project Name</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Priority</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Total Tasks</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Completed</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold', width: 200 }}>Progress %</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {projectProgressReports.map((proj) => (
                      <TableRow key={proj.id} sx={{ '&:hover': { backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc' } }}>
                        <TableCell sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }}>{proj.name}</TableCell>
                        <TableCell><Chip label={proj.priority} color={proj.priority === 'HIGH' ? 'error' : 'warning'} size="small" /></TableCell>
                        <TableCell><Chip label={proj.status} variant="outlined" size="small" sx={{ borderColor: '#0284c7', color: '#0284c7' }} /></TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a' }}>{proj.totalTasks}</TableCell>
                        <TableCell sx={{ color: '#22c55e', fontWeight: 'bold' }}>{proj.completedTasks}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress variant="determinate" value={proj.progressPct} sx={{ flexGrow: 1, height: 8, borderRadius: 4, backgroundColor: isDarkMode ? '#334155' : '#e2e8f0', '& .MuiLinearProgress-bar': { backgroundColor: '#22c55e' } }} />
                            <Typography variant="caption" sx={{ color: '#22c55e', fontWeight: 'bold' }}>{proj.progressPct}%</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* TAB 3: PENDING TASK REPORT */}
              {activeTab === 2 && (
                <Table>
                  <TableHead sx={{ backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
                    <TableRow>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Task ID</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Task Title</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Assigned Employee</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Project</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Due Date</TableCell>
                      <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>Priority</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingTasksReport.map((task) => (
                      <TableRow key={task.id} sx={{ '&:hover': { backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc' } }}>
                        <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>#{task.id}</TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }}>{task.title}</TableCell>
                        <TableCell sx={{ color: '#0284c7', fontWeight: 'bold' }}>{task.assignedToName || 'Unassigned'}</TableCell>
                        <TableCell sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>{task.projectName || 'General'}</TableCell>
                        <TableCell sx={{ color: '#f59e0b', fontWeight: 'bold' }}>{task.dueDate || 'N/A'}</TableCell>
                        <TableCell><Chip label={task.priority || 'MEDIUM'} color={task.priority === 'HIGH' ? 'error' : 'warning'} size="small" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TableContainer>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ReportsPage;
