package com.company.ems.service;

import com.company.ems.dto.EmployeeDto;
import com.company.ems.dto.ProjectDto;
import com.company.ems.entity.Employee;
import com.company.ems.entity.Project;
import com.company.ems.exception.ResourceNotFoundException;
import com.company.ems.repository.EmployeeRepository;
import com.company.ems.repository.ProjectRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ProjectServiceImpl implements ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private ProjectDto mapToDto(Project project) {
        Set<EmployeeDto> employeeDtos = project.getAssignedEmployees().stream()
                .map(e -> EmployeeDto.builder()
                        .id(e.getId())
                        .firstName(e.getFirstName())
                        .lastName(e.getLastName())
                        .email(e.getEmail())
                        .department(e.getDepartment())
                        .build())
                .collect(Collectors.toSet());

        Set<Long> employeeIds = project.getAssignedEmployees().stream()
                .map(Employee::getId)
                .collect(Collectors.toSet());

        return ProjectDto.builder()
                .id(project.getId())
                .name(project.getName())
                .description(project.getDescription())
                .startDate(project.getStartDate())
                .deadline(project.getDeadline())
                .priority(project.getPriority())
                .status(project.getStatus())
                .assignedEmployeeIds(employeeIds)
                .assignedEmployees(employeeDtos)
                .build();
    }

    @Override
    public ProjectDto createProject(ProjectDto dto) {
        Project project = Project.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .startDate(dto.getStartDate())
                .deadline(dto.getDeadline())
                .priority(dto.getPriority() != null ? dto.getPriority() : Project.Priority.MEDIUM)
                .status(dto.getStatus() != null ? dto.getStatus() : Project.ProjectStatus.NOT_STARTED)
                .build();

        if (dto.getAssignedEmployeeIds() != null && !dto.getAssignedEmployeeIds().isEmpty()) {
            List<Employee> employees = employeeRepository.findAllById(dto.getAssignedEmployeeIds());
            project.setAssignedEmployees(new HashSet<>(employees));
        }

        Project saved = projectRepository.save(project);
        return mapToDto(saved);
    }

    @Override
    public List<ProjectDto> getAllProjects() {
        return projectRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public Page<ProjectDto> getProjects(String search, String status, String priority, Pageable pageable) {
        Specification<Project> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(search)) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
            }
            if (StringUtils.hasText(status)) {
                predicates.add(cb.equal(root.get("status"), Project.ProjectStatus.valueOf(status.toUpperCase())));
            }
            if (StringUtils.hasText(priority)) {
                predicates.add(cb.equal(root.get("priority"), Project.Priority.valueOf(priority.toUpperCase())));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return projectRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    @Override
    public ProjectDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return mapToDto(project);
    }

    @Override
    public ProjectDto updateProject(Long id, ProjectDto dto) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        if (dto.getStartDate() != null) project.setStartDate(dto.getStartDate());
        if (dto.getDeadline() != null) project.setDeadline(dto.getDeadline());
        if (dto.getPriority() != null) project.setPriority(dto.getPriority());
        if (dto.getStatus() != null) project.setStatus(dto.getStatus());

        if (dto.getAssignedEmployeeIds() != null) {
            List<Employee> employees = employeeRepository.findAllById(dto.getAssignedEmployeeIds());
            project.setAssignedEmployees(new HashSet<>(employees));
        }

        Project updated = projectRepository.save(project);
        return mapToDto(updated);
    }

    @Override
    public void deleteProject(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
    }

    @Override
    public ProjectDto assignEmployeesToProject(Long projectId, List<Long> employeeIds) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        List<Employee> employees = employeeRepository.findAllById(employeeIds);
        project.getAssignedEmployees().addAll(employees);

        Project updated = projectRepository.save(project);
        return mapToDto(updated);
    }
}
