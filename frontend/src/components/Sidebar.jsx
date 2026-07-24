import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useThemeMode } from '../context/ThemeContext';

const drawerWidth = 240;

const Sidebar = () => {
  const { user } = useAuth();
  const { mode } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isDarkMode = mode === 'dark';

  const menuItems = [
    { text: 'Dashboard', icon: <i className="bi bi-speedometer2 fs-4"></i>, path: '/dashboard', adminOnly: false },
    { text: 'My Profile', icon: <i className="bi bi-person-circle fs-4"></i>, path: '/profile', adminOnly: false },
    { text: 'Employees', icon: <i className="bi bi-people-fill fs-4"></i>, path: '/employees', adminOnly: true },
    { text: 'Attendance', icon: <i className="bi bi-clock-history fs-4"></i>, path: '/attendance', adminOnly: false },
    { text: 'Shifts', icon: <i className="bi bi-calendar2-range-fill fs-4"></i>, path: '/shifts', adminOnly: false },
    { text: 'Projects', icon: <i className="bi bi-folder-fill fs-4"></i>, path: '/projects', adminOnly: false },
    { text: 'Tasks', icon: <i className="bi bi-check2-square fs-4"></i>, path: '/tasks', adminOnly: false },
    { text: 'Reports', icon: <i className="bi bi-file-earmark-bar-graph-fill fs-4"></i>, path: '/reports', adminOnly: false },
    { text: 'Audit Logs', icon: <i className="bi bi-journal-text fs-4"></i>, path: '/audit-logs', adminOnly: true },
    { text: 'Swagger Docs', icon: <i className="bi bi-code-slash fs-4"></i>, path: '/swagger', adminOnly: true },
    { text: 'Settings', icon: <i className="bi bi-gear-fill fs-4"></i>, path: '/settings', adminOnly: false },
  ];

  const visibleMenuItems = menuItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
          color: isDarkMode ? '#94a3b8' : '#475569',
          borderRight: isDarkMode ? '1px solid #1e293b' : '1px solid #e2e8f0',
        },
      }}
    >
      <Box sx={{ p: 2, textAlign: 'center', fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
        EMS & PMS MENU
      </Box>
      <Divider sx={{ borderColor: isDarkMode ? '#334155' : '#e2e8f0' }} />
      <List>
        {visibleMenuItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                backgroundColor: isSelected ? (isDarkMode ? '#1e293b' : '#e0f2fe') : 'transparent',
                color: isSelected ? '#0284c7' : 'inherit',
                '&:hover': { backgroundColor: isDarkMode ? '#334155' : '#f1f5f9', color: isSelected ? '#0284c7' : (isDarkMode ? '#f8fafc' : '#0f172a') },
                my: 0.5,
                mx: 1,
                borderRadius: 1,
              }}
            >
              <ListItemIcon sx={{ color: isSelected ? '#0284c7' : (isDarkMode ? '#94a3b8' : '#64748b') }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isSelected ? 'bold' : 'normal' }} />
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
