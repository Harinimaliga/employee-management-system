package com.company.ems.controller;

import com.company.ems.dto.DashboardStatsDto;
import com.company.ems.security.UserDetailsImpl;
import com.company.ems.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardStatsDto> getAdminDashboard() {
        return ResponseEntity.ok(dashboardService.getAdminDashboardStats());
    }

    @GetMapping("/employee")
    public ResponseEntity<DashboardStatsDto> getEmployeeDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return ResponseEntity.ok(dashboardService.getEmployeeDashboardStats(userDetails.getId()));
    }
}
