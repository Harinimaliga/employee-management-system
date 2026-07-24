package com.company.ems.dto;

import com.company.ems.entity.Project.Priority;
import com.company.ems.entity.Project.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {
    private Long id;

    @NotBlank(message = "Project name is required")
    private String name;

    private String description;
    private LocalDate startDate;
    private LocalDate deadline;
    private Priority priority;
    private ProjectStatus status;
    private Set<Long> assignedEmployeeIds;
    private Set<EmployeeDto> assignedEmployees;
}
