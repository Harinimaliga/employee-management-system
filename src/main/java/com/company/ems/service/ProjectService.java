package com.company.ems.service;

import com.company.ems.dto.ProjectDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProjectService {
    ProjectDto createProject(ProjectDto projectDto);
    List<ProjectDto> getAllProjects();
    Page<ProjectDto> getProjects(String search, String status, String priority, Pageable pageable);
    ProjectDto getProjectById(Long id);
    ProjectDto updateProject(Long id, ProjectDto projectDto);
    void deleteProject(Long id);
    ProjectDto assignEmployeesToProject(Long projectId, List<Long> employeeIds);
}
