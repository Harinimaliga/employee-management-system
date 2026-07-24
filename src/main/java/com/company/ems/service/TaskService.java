package com.company.ems.service;

import com.company.ems.dto.TaskDto;
import com.company.ems.entity.Task.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface TaskService {
    TaskDto createTask(TaskDto taskDto);
    List<TaskDto> getAllTasks();
    Page<TaskDto> getTasks(String search, String status, String priority, Long employeeId, Long projectId, Pageable pageable);
    TaskDto getTaskById(Long id);
    TaskDto updateTask(Long id, TaskDto taskDto);
    TaskDto updateTaskStatusAndRemarks(Long id, TaskStatus status, String remarks);
    void deleteTask(Long id);
    List<TaskDto> getTasksByEmployee(Long employeeId);
}
