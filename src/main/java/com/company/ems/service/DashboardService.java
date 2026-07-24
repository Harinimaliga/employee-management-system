package com.company.ems.service;

import com.company.ems.dto.DashboardStatsDto;

public interface DashboardService {
    DashboardStatsDto getAdminDashboardStats();
    DashboardStatsDto getEmployeeDashboardStats(Long userId);
}
