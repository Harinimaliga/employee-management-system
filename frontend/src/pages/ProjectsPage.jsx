import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip, CircularProgress, TextField, MenuItem, Paper, AvatarGroup, Avatar, Button, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress, Divider, IconButton, Alert, Checkbox, ListItemText, OutlinedInput, Select, FormControl, InputLabel
} from '@mui/material';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext';

const ProjectsPage = () => {
  const { user } = useAuth();
  const { mode } = useThemeMode();
  const isDarkMode = mode === 'dark';

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ type: '', text: '' });

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State for Project Details
  const [selectedProject, setSelectedProject] = useState(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);

  // Modal State for Create / Edit Project
  const [openProjectFormModal, setOpenProjectFormModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    deadline: new Date().toISOString().split('T')[0],
    assignedEmployeeIds: [],
  });

  // Delete Confirm Modal State
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, taskRes, empRes] = await Promise.all([
        api.get('/projects').catch(() => ({ data: [] })),
        api.get('/tasks').catch(() => ({ data: [] })),
        api.get('/employees').catch(() => ({ data: [] })),
      ]);
      setProjects(projRes.data || []);
      setTasks(taskRes.data || []);
      setEmployees(empRes.data || []);
    } catch (err) {
      console.error('Failed to fetch project data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditMode(false);
    setCurrentId(null);
    setFormData({
      name: '',
      description: '',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      deadline: new Date().toISOString().split('T')[0],
      assignedEmployeeIds: [],
    });
    setOpenProjectFormModal(true);
  };

  const handleOpenEdit = (proj) => {
    setEditMode(true);
    setCurrentId(proj.id);
    const assignedIds = proj.assignedEmployees ? proj.assignedEmployees.map(e => e.id) : (proj.assignedEmployeeIds || []);
    setFormData({
      name: proj.name || '',
      description: proj.description || '',
      status: proj.status || 'IN_PROGRESS',
      priority: proj.priority || 'MEDIUM',
      deadline: proj.deadline || new Date().toISOString().split('T')[0],
      assignedEmployeeIds: assignedIds,
    });
    setOpenProjectFormModal(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setNotification({ type: '', text: '' });

    try {
      if (editMode) {
        await api.put(`/projects/${currentId}`, formData);
        setNotification({ type: 'success', text: 'Project updated successfully! 📂' });
      } else {
        await api.post('/projects', formData);
        setNotification({ type: 'success', text: 'Project created successfully! 📂' });
      }

      setOpenProjectFormModal(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save project details.';
      setNotification({ type: 'error', text: msg });
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${deleteTargetId}`);
      setNotification({ type: 'success', text: 'Project deleted successfully!' });
      setOpenDeleteDialog(false);
      fetchData();
    } catch (err) {
      setNotification({ type: 'error', text: 'Failed to delete project.' });
    }
  };

  const getPriorityColor = (p) => {
    if (p === 'HIGH') return 'error';
    if (p === 'MEDIUM') return 'warning';
    return 'info';
  };

  // Filter projects based on search + priority + status
  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPriority = priorityFilter === 'ALL' || p.priority === priorityFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesPriority && matchesStatus;
  });

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

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: isDarkMode ? '#090d16' : '#f1f5f9', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Navbar />
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {/* Header Banner */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', background: 'linear-gradient(to right, #0284c7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Project Management & Portfolio 📂
              </Typography>
              <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mt: 0.5 }}>
                Create, update, delete projects, manage priorities, deadlines, and assign team members.
              </Typography>
            </Box>

            {/* Create Project Button ALWAYS Visible */}
            <Button
              variant="contained"
              startIcon={<i className="bi bi-plus-circle-fill"></i>}
              onClick={handleOpenAdd}
              sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)', fontWeight: 'bold', px: 3, py: 1 }}
            >
              + Create New Project
            </Button>
          </Box>

          {notification.text && (
            <Alert severity={notification.type} sx={{ mb: 3 }} onClose={() => setNotification({ type: '', text: '' })}>
              {notification.text}
            </Alert>
          )}

          {/* Search & Filter Toolbar */}
          <Paper sx={{ p: 2, mb: 4, borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              label="Search Portfolio..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ ...inputStyles, flexGrow: 1, minWidth: 220 }}
            />

            <TextField
              select
              label="Priority Filter"
              variant="outlined"
              size="small"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              sx={{ ...inputStyles, width: 160 }}
            >
              <MenuItem value="ALL">All Priorities</MenuItem>
              <MenuItem value="HIGH">High Priority</MenuItem>
              <MenuItem value="MEDIUM">Medium Priority</MenuItem>
              <MenuItem value="LOW">Low Priority</MenuItem>
            </TextField>

            <TextField
              select
              label="Status Filter"
              variant="outlined"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ ...inputStyles, width: 170 }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="NOT_STARTED">Not Started</MenuItem>
              <MenuItem value="ON_HOLD">On Hold</MenuItem>
            </TextField>
          </Paper>

          {loading ? (
            <CircularProgress sx={{ display: 'block', mx: 'auto', my: 5, color: '#0284c7' }} />
          ) : filteredProjects.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1' }}>
              <Typography variant="h6" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>No matching projects found in portfolio.</Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {filteredProjects.map((proj) => {
                const projTasks = tasks.filter(t => t.projectId === proj.id);
                const completedCount = projTasks.filter(t => t.status === 'COMPLETED').length;
                const progressPct = projTasks.length > 0 ? Math.round((completedCount / projTasks.length) * 100) : (proj.status === 'COMPLETED' ? 100 : 45);
                const assignedEmployees = proj.assignedEmployees || [];

                return (
                  <Grid item xs={12} sm={6} md={4} key={proj.id}>
                    <Card
                      sx={{
                        borderRadius: 3,
                        backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                        border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          borderColor: '#0284c7',
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                          <Typography variant="h6" onClick={() => { setSelectedProject(proj); setOpenDetailsModal(true); }} sx={{ fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a', lineHeight: 1.3, cursor: 'pointer', '&:hover': { color: '#0284c7' } }}>
                            {proj.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Chip label={proj.priority} color={getPriorityColor(proj.priority)} size="small" sx={{ fontWeight: 'bold' }} />
                            {/* Edit & Delete Action Buttons ALWAYS Visible */}
                            <IconButton size="small" title="Edit Project" onClick={() => handleOpenEdit(proj)} sx={{ color: '#0284c7' }}>
                              <i className="bi bi-pencil-square"></i>
                            </IconButton>
                            <IconButton size="small" title="Delete Project" onClick={() => { setDeleteTargetId(proj.id); setOpenDeleteDialog(true); }} sx={{ color: '#ef4444' }}>
                              <i className="bi bi-trash-fill"></i>
                            </IconButton>
                          </Box>
                        </Box>

                        <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mb: 2, height: 40, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                          {proj.description || 'Enterprise project milestone and deliverables allocation.'}
                        </Typography>

                        {/* Progress Bar */}
                        <Box sx={{ mb: 2.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                            <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 'bold' }}>Progress Velocity</Typography>
                            <Typography variant="caption" sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: 'bold' }}>{progressPct}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={progressPct} sx={{ height: 8, borderRadius: 4, backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #0284c7 0%, #6366f1 100%)' } }} />
                        </Box>

                        <Divider sx={{ borderColor: isDarkMode ? '#1e293b' : '#e2e8f0', mb: 2 }} />

                        {/* Footer Badges */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem', borderColor: isDarkMode ? '#0f172a' : '#ffffff' } }}>
                            {assignedEmployees.length > 0 ? (
                              assignedEmployees.map(emp => (
                                <Avatar key={emp.id} alt={emp.firstName} src={emp.profileImage}>
                                  {emp.firstName ? emp.firstName[0] : 'E'}
                                </Avatar>
                              ))
                            ) : (
                              <Avatar sx={{ backgroundColor: '#0284c7' }}>E</Avatar>
                            )}
                          </AvatarGroup>

                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip label={proj.status || 'IN_PROGRESS'} size="small" variant="outlined" sx={{ borderColor: '#0284c7', color: '#0284c7' }} />
                            <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>
                              Due: {proj.deadline || 'Soon'}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Create / Edit Project Modal */}
          <Dialog open={openProjectFormModal} onClose={() => setOpenProjectFormModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#f8fafc' : '#0f172a', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 'bold', color: '#0284c7', borderBottom: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0' }}>
              {editMode ? 'Edit Project Details 📂' : 'Create New Project 📂'}
            </DialogTitle>
            <Box component="form" onSubmit={handleSaveProject}>
              <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Project Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  sx={inputStyles}
                  required
                />

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  sx={inputStyles}
                />

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      select
                      fullWidth
                      label="Status *"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      sx={inputStyles}
                      required
                    >
                      <MenuItem value="NOT_STARTED">NOT_STARTED</MenuItem>
                      <MenuItem value="IN_PROGRESS">IN_PROGRESS</MenuItem>
                      <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                      <MenuItem value="ON_HOLD">ON_HOLD</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      select
                      fullWidth
                      label="Priority *"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      sx={inputStyles}
                      required
                    >
                      <MenuItem value="HIGH">HIGH</MenuItem>
                      <MenuItem value="MEDIUM">MEDIUM</MenuItem>
                      <MenuItem value="LOW">LOW</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  type="date"
                  label="Target Deadline *"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={inputStyles}
                  required
                />

                {/* Multi-Select Assigned Employees */}
                <FormControl fullWidth sx={inputStyles}>
                  <InputLabel id="assign-emp-label">Assign Team Members</InputLabel>
                  <Select
                    labelId="assign-emp-label"
                    multiple
                    value={formData.assignedEmployeeIds}
                    onChange={(e) => setFormData({ ...formData, assignedEmployeeIds: e.target.value })}
                    input={<OutlinedInput label="Assign Team Members" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const emp = employees.find(e => e.id === value);
                          return <Chip key={value} label={emp ? `${emp.firstName} ${emp.lastName}` : value} size="small" />;
                        })}
                      </Box>
                    )}
                  >
                    {employees.map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        <Checkbox checked={formData.assignedEmployeeIds.indexOf(emp.id) > -1} />
                        <ListItemText primary={`${emp.firstName} ${emp.lastName} (${emp.department || 'Engineering'})`} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

              </DialogContent>
              <DialogActions sx={{ borderTop: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0', p: 2 }}>
                <Button onClick={() => setOpenProjectFormModal(false)} sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Cancel</Button>
                <Button type="submit" variant="contained" sx={{ background: 'linear-gradient(135deg, #0284c7 0%, #4338ca 100%)', fontWeight: 'bold' }}>
                  {editMode ? 'Save Changes' : 'Create Project'}
                </Button>
              </DialogActions>
            </Box>
          </Dialog>

          {/* Interactive Project Details Modal */}
          {selectedProject && (
            <Dialog
              open={openDetailsModal}
              onClose={() => setOpenDetailsModal(false)}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#f8fafc' : '#0f172a', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderRadius: 3 }
              }}
            >
              <DialogTitle sx={{ fontWeight: 'bold', color: '#0284c7', borderBottom: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0' }}>
                📂 {selectedProject.name}
              </DialogTitle>
              <DialogContent sx={{ pt: 3 }}>
                <Typography variant="subtitle2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', mb: 1 }}>Description:</Typography>
                <Typography variant="body1" sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', mb: 2 }}>
                  {selectedProject.description || 'Enterprise project milestone and deliverables allocation.'}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Chip label={`Priority: ${selectedProject.priority}`} color={getPriorityColor(selectedProject.priority)} size="small" />
                  <Chip label={`Status: ${selectedProject.status || 'IN_PROGRESS'}`} variant="outlined" sx={{ borderColor: '#0284c7', color: '#0284c7' }} size="small" />
                  <Chip label={`Target Deadline: ${selectedProject.deadline || 'N/A'}`} size="small" sx={{ backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', color: isDarkMode ? '#f8fafc' : '#0f172a' }} />
                </Box>

                <Typography variant="subtitle2" sx={{ color: '#0284c7', mb: 1, fontWeight: 'bold' }}>
                  Assigned Team Members ({selectedProject.assignedEmployees?.length || 0}):
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                  {selectedProject.assignedEmployees && selectedProject.assignedEmployees.length > 0 ? (
                    selectedProject.assignedEmployees.map(emp => (
                      <Chip key={emp.id} avatar={<Avatar src={emp.profileImage}>{emp.firstName[0]}</Avatar>} label={`${emp.firstName} ${emp.lastName} (${emp.department || 'Engineering'})`} sx={{ backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', color: isDarkMode ? '#f8fafc' : '#0f172a' }} />
                    ))
                  ) : (
                    <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>No team members assigned yet.</Typography>
                  )}
                </Box>
              </DialogContent>
              <DialogActions sx={{ borderTop: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0', p: 2 }}>
                <Button variant="outlined" onClick={() => setOpenDetailsModal(false)} sx={{ borderColor: '#0284c7', color: '#0284c7' }}>
                  Close Modal
                </Button>
              </DialogActions>
            </Dialog>
          )}

          {/* Delete Confirmation Dialog */}
          <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)} PaperProps={{ sx: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', color: isDarkMode ? '#f8fafc' : '#0f172a', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', borderRadius: 3 } }}>
            <DialogTitle sx={{ color: '#ef4444', fontWeight: 'bold' }}>Confirm Project Deletion</DialogTitle>
            <DialogContent>
              <Typography variant="body1">Are you sure you want to delete this project? All associated milestone references will be unlinked. This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setOpenDeleteDialog(false)} sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Cancel</Button>
              <Button onClick={handleDeleteProject} variant="contained" color="error" sx={{ fontWeight: 'bold' }}>Delete Project</Button>
            </DialogActions>
          </Dialog>

        </Box>
      </Box>
    </Box>
  );
};

export default ProjectsPage;
