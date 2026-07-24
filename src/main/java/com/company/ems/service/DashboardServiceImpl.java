package com.company.ems.service;

import com.company.ems.dto.DashboardStatsDto;
import com.company.ems.dto.TaskDto;
import com.company.ems.entity.Employee;
import com.company.ems.entity.Project;
import com.company.ems.entity.Task;
import com.company.ems.repository.EmployeeRepository;
import com.company.ems.repository.ProjectRepository;
import com.company.ems.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private TaskService taskService;

    @Override
    public DashboardStatsDto getAdminDashboardStats() {
        long totalEmployees = employeeRepository.count();
        long totalProjects = projectRepository.count();
        long totalTasks = taskRepository.count();

        long completedTasks = taskRepository.countByStatus(Task.TaskStatus.COMPLETED);
        long pendingTasks = taskRepository.countByStatus(Task.TaskStatus.PENDING);
        long inProgressTasks = taskRepository.countByStatus(Task.TaskStatus.IN_PROGRESS);

        long activeProjects = projectRepository.countByStatus(Project.ProjectStatus.IN_PROGRESS);
        long completedProjects = projectRepository.countByStatus(Project.ProjectStatus.COMPLETED);

        List<TaskDto> upcomingTasks = taskService.getAllTasks().stream()
                .filter(t -> t.getStatus() != Task.TaskStatus.COMPLETED)
                .limit(5)
                .collect(Collectors.toList());

        return DashboardStatsDto.builder()
                .totalEmployees(totalEmployees)
                .totalProjects(totalProjects)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .inProgressTasks(inProgressTasks)
                .activeProjects(activeProjects)
                .completedProjects(completedProjects)
                .upcomingDeadlines(upcomingTasks)
                .build();
    }

    @Override
    public DashboardStatsDto getEmployeeDashboardStats(Long userId) {
        Optional<Employee> empOpt = employeeRepository.findByUserId(userId);
        if (empOpt.isEmpty()) {
            return DashboardStatsDto.builder()
                    .myTasks(Collections.emptyList())
                    .build();
        }

        Long empId = empOpt.get().getId();
        List<TaskDto> empTasks = taskService.getTasksByEmployee(empId);

        long completed = taskRepository.countByAssignedToIdAndStatus(empId, Task.TaskStatus.COMPLETED);
        long pending = taskRepository.countByAssignedToIdAndStatus(empId, Task.TaskStatus.PENDING);
        long inProgress = taskRepository.countByAssignedToIdAndStatus(empId, Task.TaskStatus.IN_PROGRESS);

        return DashboardStatsDto.builder()
                .totalTasks(empTasks.size())
                .completedTasks(completed)
                .pendingTasks(pending)
                .inProgressTasks(inProgress)
                .myTasks(empTasks)
                .build();
    }
}
