package com.company.ems.controller;

import com.company.ems.dto.ProjectDto;
import com.company.ems.service.ProjectService;
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
@RequestMapping("/api/projects")
@Tag(name = "Project Management", description = "Project Portfolio CRUD, Status, Priority & Employee Allocation APIs")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    @Operation(summary = "Get All Projects", description = "Retrieves a list of all active projects.")
    public ResponseEntity<List<ProjectDto>> getAllProjects() {
        return ResponseEntity.ok(projectService.getAllProjects());
    }

    @GetMapping("/page")
    @Operation(summary = "Paginated Project Search", description = "Filter projects by search term, status, and priority.")
    public ResponseEntity<Page<ProjectDto>> getProjectsPaginated(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(projectService.getProjects(search, status, priority, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Project by ID", description = "Fetches details of a single project by ID.")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Create Project", description = "Creates a new project record.")
    public ResponseEntity<ProjectDto> createProject(@Valid @RequestBody ProjectDto projectDto) {
        return ResponseEntity.ok(projectService.createProject(projectDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Update Project", description = "Updates an existing project record.")
    public ResponseEntity<ProjectDto> updateProject(@PathVariable Long id, @Valid @RequestBody ProjectDto projectDto) {
        return ResponseEntity.ok(projectService.updateProject(id, projectDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Delete Project", description = "Deletes a project by ID.")
    public ResponseEntity<String> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok("Project deleted successfully!");
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Assign Employees to Project", description = "Allocates a list of employee IDs to a project.")
    public ResponseEntity<ProjectDto> assignEmployees(@PathVariable Long id, @RequestBody List<Long> employeeIds) {
        return ResponseEntity.ok(projectService.assignEmployeesToProject(id, employeeIds));
    }
}
