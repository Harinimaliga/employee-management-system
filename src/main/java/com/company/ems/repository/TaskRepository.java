package com.company.ems.repository;

import com.company.ems.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    List<Task> findByAssignedToId(Long employeeId);
    List<Task> findByProjectId(Long projectId);
    long countByStatus(Task.TaskStatus status);
    long countByAssignedToIdAndStatus(Long employeeId, Task.TaskStatus status);
}
