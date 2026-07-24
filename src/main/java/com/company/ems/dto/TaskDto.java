package com.company.ems.dto;

import com.company.ems.entity.Task.TaskPriority;
import com.company.ems.entity.Task.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDto {
    private Long id;

    @NotBlank(message = "Task title is required")
    private String title;

    private String description;
    private LocalDate dueDate;
    private LocalDate deadline;
    private Integer progress;
    private TaskPriority priority;
    private TaskStatus status;
    private String remarks;

    private Long projectId;
    private String projectName;

    private Long assignedToId;
    private String assignedToName;
}
