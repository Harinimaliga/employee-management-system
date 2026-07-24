package com.company.ems.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardStatsDto {
    private long totalEmployees;
    private long totalProjects;
    private long totalTasks;
    private long completedTasks;
    private long pendingTasks;
    private long inProgressTasks;

    private long activeProjects;
    private long completedProjects;

    private List<TaskDto> upcomingDeadlines;
    private List<TaskDto> myTasks;
}
