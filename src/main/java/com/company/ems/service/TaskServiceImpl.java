package com.company.ems.service;

import com.company.ems.dto.TaskDto;
import com.company.ems.entity.Employee;
import com.company.ems.entity.Project;
import com.company.ems.entity.Task;
import com.company.ems.exception.ResourceNotFoundException;
import com.company.ems.repository.EmployeeRepository;
import com.company.ems.repository.ProjectRepository;
import com.company.ems.repository.TaskRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private TaskDto mapToDto(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .dueDate(task.getDueDate() != null ? task.getDueDate() : task.getDeadline())
                .deadline(task.getDeadline() != null ? task.getDeadline() : task.getDueDate())
                .progress(task.getProgress() != null ? task.getProgress() : 0)
                .priority(task.getPriority())
                .status(task.getStatus())
                .remarks(task.getRemarks())
                .projectId(task.getProject() != null ? task.getProject().getId() : null)
                .projectName(task.getProject() != null ? task.getProject().getName() : null)
                .assignedToId(task.getAssignedTo() != null ? task.getAssignedTo().getId() : null)
                .assignedToName(task.getAssignedTo() != null ? task.getAssignedTo().getFirstName() + " " + task.getAssignedTo().getLastName() : "Unassigned")
                .build();
    }

    private void syncProjectStatusWithTasks(Project project) {
        if (project == null || project.getId() == null) return;
        List<Task> projectTasks = taskRepository.findByProjectId(project.getId());
        if (projectTasks.isEmpty()) return;

        boolean allCompleted = projectTasks.stream().allMatch(t -> t.getStatus() == Task.TaskStatus.COMPLETED);
        boolean anyInProgressOrDone = projectTasks.stream().anyMatch(t -> 
            t.getStatus() == Task.TaskStatus.IN_PROGRESS || 
            t.getStatus() == Task.TaskStatus.COMPLETED || 
            (t.getProgress() != null && t.getProgress() > 0)
        );

        if (allCompleted) {
            project.setStatus(Project.ProjectStatus.COMPLETED);
        } else if (anyInProgressOrDone) {
            project.setStatus(Project.ProjectStatus.IN_PROGRESS);
        } else {
            project.setStatus(Project.ProjectStatus.NOT_STARTED);
        }
        projectRepository.save(project);
    }

    @Override
    public TaskDto createTask(TaskDto dto) {
        Project project = projectRepository.findById(dto.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + dto.getProjectId()));

        Employee assignedTo = null;
        if (dto.getAssignedToId() != null) {
            assignedTo = employeeRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getAssignedToId()));
        }

        Task task = Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .dueDate(dto.getDueDate() != null ? dto.getDueDate() : dto.getDeadline())
                .deadline(dto.getDeadline() != null ? dto.getDeadline() : dto.getDueDate())
                .progress(dto.getProgress() != null ? dto.getProgress() : 0)
                .priority(dto.getPriority() != null ? dto.getPriority() : Task.TaskPriority.MEDIUM)
                .status(dto.getStatus() != null ? dto.getStatus() : Task.TaskStatus.TODO)
                .remarks(dto.getRemarks())
                .project(project)
                .assignedTo(assignedTo)
                .build();

        Task saved = taskRepository.save(task);
        syncProjectStatusWithTasks(saved.getProject());
        return mapToDto(saved);
    }

    @Override
    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public Page<TaskDto> getTasks(String search, String status, String priority, Long employeeId, Long projectId, Pageable pageable) {
        Specification<Task> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(search)) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"));
            }
            if (StringUtils.hasText(status)) {
                predicates.add(cb.equal(root.get("status"), Task.TaskStatus.valueOf(status.toUpperCase())));
            }
            if (StringUtils.hasText(priority)) {
                predicates.add(cb.equal(root.get("priority"), Task.TaskPriority.valueOf(priority.toUpperCase())));
            }
            if (employeeId != null) {
                predicates.add(cb.equal(root.get("assignedTo").get("id"), employeeId));
            }
            if (projectId != null) {
                predicates.add(cb.equal(root.get("project").get("id"), projectId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return taskRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    @Override
    public TaskDto getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return mapToDto(task);
    }

    @Override
    public TaskDto updateTask(Long id, TaskDto dto) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        if (dto.getDueDate() != null) task.setDueDate(dto.getDueDate());
        if (dto.getDeadline() != null) task.setDeadline(dto.getDeadline());
        if (dto.getProgress() != null) task.setProgress(dto.getProgress());
        if (dto.getPriority() != null) task.setPriority(dto.getPriority());
        if (dto.getStatus() != null) task.setStatus(dto.getStatus());
        if (dto.getRemarks() != null) task.setRemarks(dto.getRemarks());

        if (dto.getProjectId() != null && !dto.getProjectId().equals(task.getProject().getId())) {
            Project project = projectRepository.findById(dto.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + dto.getProjectId()));
            task.setProject(project);
        }

        if (dto.getAssignedToId() != null) {
            Employee assignedTo = employeeRepository.findById(dto.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getAssignedToId()));
            task.setAssignedTo(assignedTo);
        }

        Task updated = taskRepository.save(task);
        syncProjectStatusWithTasks(updated.getProject());
        return mapToDto(updated);
    }

    @Override
    public TaskDto updateTaskStatusAndRemarks(Long id, Task.TaskStatus status, String remarks) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        if (status != null) {
            task.setStatus(status);
            if (status == Task.TaskStatus.COMPLETED) {
                task.setProgress(100);
            } else if (status == Task.TaskStatus.IN_PROGRESS && (task.getProgress() == null || task.getProgress() == 0)) {
                task.setProgress(50);
            }
        }
        if (remarks != null) task.setRemarks(remarks);

        Task updated = taskRepository.save(task);
        syncProjectStatusWithTasks(updated.getProject());
        return mapToDto(updated);
    }

    @Override
    public void deleteTask(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        Project project = task.getProject();
        taskRepository.deleteById(id);
        syncProjectStatusWithTasks(project);
    }

    @Override
    public List<TaskDto> getTasksByEmployee(Long employeeId) {
        return taskRepository.findByAssignedToId(employeeId).stream().map(this::mapToDto).collect(Collectors.toList());
    }
}
