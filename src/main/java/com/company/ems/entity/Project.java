package com.company.ems.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "projects")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    private LocalDate startDate;

    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "project_employees",
        joinColumns = @JoinColumn(name = "project_id"),
        inverseJoinColumns = @JoinColumn(name = "employee_id")
    )
    @Builder.Default
    private Set<Employee> assignedEmployees = new HashSet<>();

    public enum Priority {
        LOW, MEDIUM, HIGH
    }

    public enum ProjectStatus {
        STARTED, NOT_STARTED, IN_PROGRESS, COMPLETED, ON_HOLD
    }
}
