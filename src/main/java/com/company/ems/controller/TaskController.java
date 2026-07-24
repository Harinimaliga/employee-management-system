package com.company.ems.controller;

import com.company.ems.dto.TaskDto;
import com.company.ems.entity.Task.TaskStatus;
import com.company.ems.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/tasks")
@Tag(name = "Task Management", description = "Task CRUD, Progress Tracking, Status & Remarks APIs")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping
    @Operation(summary = "Get All Tasks", description = "Retrieves a list of all system tasks.")
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    @GetMapping("/page")
    @Operation(summary = "Paginated Task Search", description = "Filter tasks by search term, status, priority, employee ID, and project ID.")
    public ResponseEntity<Page<TaskDto>> getTasksPaginated(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(taskService.getTasks(search, status, priority, employeeId, projectId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Task by ID", description = "Fetches single task details by ID.")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create & Assign Task (Admin Only)", description = "Creates a new task and assigns it to an employee and project.")
    public ResponseEntity<TaskDto> createTask(@Valid @RequestBody TaskDto taskDto) {
        return ResponseEntity.ok(taskService.createTask(taskDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update Task Details (Admin Only)", description = "Modifies existing task details.")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long id, @Valid @RequestBody TaskDto taskDto) {
        return ResponseEntity.ok(taskService.updateTask(id, taskDto));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update Task Status & Remarks", description = "Updates task status (TODO, IN_PROGRESS, COMPLETED) and employee remarks.")
    public ResponseEntity<TaskDto> updateTaskStatusAndRemarks(
            @PathVariable Long id,
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) String remarks) {
        return ResponseEntity.ok(taskService.updateTaskStatusAndRemarks(id, status, remarks));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Task (Admin Only)", description = "Deletes a task by ID.")
    public ResponseEntity<String> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok("Task deleted successfully!");
    }
}
