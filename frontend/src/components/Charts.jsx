import React, { useState } from 'react';
import { Box, Typography, Paper, Tooltip, Chip } from '@mui/material';
import { useThemeMode } from '../context/ThemeContext';

// 1. Task Progress Bar Breakdown
export const TaskDistributionChart = ({ pending, completed, inProgress }) => {
  const { mode } = useThemeMode();
  const isDarkMode = mode === 'dark';
  const total = (pending + completed + inProgress) || 1;
  const compPct = Math.round((completed / total) * 100);
  const progPct = Math.round((inProgress / total) * 100);
  const pendPct = Math.round((pending / total) * 100);

  return (
    <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a', mb: 3 }}>
        Task Status Breakdown
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
            <Typography variant="body2" sx={{ color: '#22c55e', fontWeight: 'bold' }}>Completed ({completed})</Typography>
            <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold' }}>{compPct}%</Typography>
          </Box>
          <Box sx={{ height: 14, borderRadius: 7, backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', overflow: 'hidden' }}>
            <Box sx={{ width: `${compPct}%`, height: '100%', backgroundColor: '#22c55e', borderRadius: 7, transition: 'width 0.8s ease-in-out' }} />
          </Box>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
            <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>In Progress ({inProgress})</Typography>
            <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold' }}>{progPct}%</Typography>
          </Box>
          <Box sx={{ height: 14, borderRadius: 7, backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', overflow: 'hidden' }}>
            <Box sx={{ width: `${progPct}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: 7, transition: 'width 0.8s ease-in-out' }} />
          </Box>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
            <Typography variant="body2" sx={{ color: '#0284c7', fontWeight: 'bold' }}>To Do / Pending ({pending})</Typography>
            <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold' }}>{pendPct}%</Typography>
          </Box>
          <Box sx={{ height: 14, borderRadius: 7, backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', overflow: 'hidden' }}>
            <Box sx={{ width: `${pendPct}%`, height: '100%', backgroundColor: '#0284c7', borderRadius: 7, transition: 'width 0.8s ease-in-out' }} />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

// 2. Interactive SVG Pie Chart Component
export const TaskPieChart = ({ pending, completed, inProgress }) => {
  const { mode } = useThemeMode();
  const isDarkMode = mode === 'dark';
  const total = (pending + completed + inProgress) || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const compStroke = (completed / total) * circumference;
  const progStroke = (inProgress / total) * circumference;
  const pendStroke = (pending / total) * circumference;

  const progOffset = -compStroke;
  const pendOffset = -(compStroke + progStroke);

  return (
    <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a', mb: 2 }}>
        Task Distribution (Pie Chart)
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', pt: 1 }}>
        <Box sx={{ position: 'relative', width: 150, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="150" height="150" viewBox="0 0 160 160">
            <g transform="rotate(-90 80 80)">
              <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#22c55e" strokeWidth="22" strokeDasharray={`${compStroke} ${circumference}`} strokeDashoffset={0} />
              <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#f59e0b" strokeWidth="22" strokeDasharray={`${progStroke} ${circumference}`} strokeDashoffset={progOffset} />
              <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#0284c7" strokeWidth="22" strokeDasharray={`${pendStroke} ${circumference}`} strokeDashoffset={pendOffset} />
            </g>
          </svg>
          <Box sx={{ position: 'absolute', textAlign: 'center' }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>{total}</Typography>
            <Typography variant="caption" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}>Tasks</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#22c55e' }} />
            <Typography variant="body2" sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: '500' }}>Completed: {completed}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            <Typography variant="body2" sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: '500' }}>In Progress: {inProgress}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#0284c7' }} />
            <Typography variant="body2" sx={{ color: isDarkMode ? '#f8fafc' : '#0f172a', fontWeight: '500' }}>Pending: {pending}</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

// 3. Tall Vertical Department Allocation Bar Chart
export const DepartmentOverviewChart = ({ employees = [] }) => {
  const { mode } = useThemeMode();
  const isDarkMode = mode === 'dark';
  const [activeDept, setActiveDept] = useState(null);

  const depts = employees.reduce((acc, emp) => {
    const d = emp.department || 'General';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const maxVal = Math.max(...Object.values(depts), 1);
  const containerHeight = 220;

  return (
    <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a' }}>
          Department Employee Allocation
        </Typography>
        {activeDept && <Chip label={activeDept} size="small" color="primary" onDelete={() => setActiveDept(null)} />}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: containerHeight, pt: 2, borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
        {Object.entries(depts).map(([dept, count]) => {
          const barPx = Math.max(Math.round((count / maxVal) * 170), 40);
          const isSelected = activeDept === dept;
          return (
            <Tooltip key={dept} title={`${dept}: ${count} Employee(s)`} arrow placement="top">
              <Box
                onClick={() => setActiveDept(isSelected ? null : dept)}
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 65, cursor: 'pointer' }}
              >
                <Typography variant="body1" sx={{ color: isSelected ? '#0284c7' : (isDarkMode ? '#cbd5e1' : '#0f172a'), fontWeight: 'bold', mb: 0.8 }}>
                  {count}
                </Typography>
                <Box
                  sx={{
                    width: isSelected ? 48 : 42,
                    height: `${barPx}px`,
                    background: 'linear-gradient(180deg, #0284c7 0%, #6366f1 50%, #4338ca 100%)',
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scaleY(1.08)',
                    }
                  }}
                />
                <Typography variant="caption" sx={{ color: isSelected ? '#0284c7' : (isDarkMode ? '#94a3b8' : '#64748b'), mt: 1.5, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 70, textAlign: 'center', fontWeight: '600' }}>
                  {dept}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Paper>
  );
};

// 4. Interactive Task Priority Distribution Horizontal Bar Chart
export const PriorityBarChart = ({ tasks = [] }) => {
  const { mode } = useThemeMode();
  const isDarkMode = mode === 'dark';
  const high = tasks.filter(t => t.priority === 'HIGH').length;
  const medium = tasks.filter(t => t.priority === 'MEDIUM').length;
  const low = tasks.filter(t => t.priority === 'LOW').length;
  const total = (high + medium + low) || 1;

  return (
    <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', border: isDarkMode ? '1px solid #1e293b' : '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: isDarkMode ? '#f8fafc' : '#0f172a', mb: 3 }}>
        Task Priority Breakdown (Bar Chart)
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
            <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 'bold' }}>HIGH Priority ({high})</Typography>
            <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold' }}>{Math.round((high / total) * 100)}%</Typography>
          </Box>
          <Box sx={{ height: 16, borderRadius: 8, backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', overflow: 'hidden', p: 0.2 }}>
            <Box sx={{ width: `${(high / total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #ef4444 0%, #f43f5e 100%)', borderRadius: 8, transition: 'width 0.8s ease-in-out' }} />
          </Box>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
            <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>MEDIUM Priority ({medium})</Typography>
            <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold' }}>{Math.round((medium / total) * 100)}%</Typography>
          </Box>
          <Box sx={{ height: 16, borderRadius: 8, backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', overflow: 'hidden', p: 0.2 }}>
            <Box sx={{ width: `${(medium / total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)', borderRadius: 8, transition: 'width 0.8s ease-in-out' }} />
          </Box>
        </Box>

        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
            <Typography variant="body2" sx={{ color: '#0284c7', fontWeight: 'bold' }}>LOW Priority ({low})</Typography>
            <Typography variant="body2" sx={{ color: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold' }}>{Math.round((low / total) * 100)}%</Typography>
          </Box>
          <Box sx={{ height: 16, borderRadius: 8, backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9', overflow: 'hidden', p: 0.2 }}>
            <Box sx={{ width: `${(low / total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7 0%, #0369a1 100%)', borderRadius: 8, transition: 'width 0.8s ease-in-out' }} />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};
