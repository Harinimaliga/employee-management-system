package com.company.ems.config;

import com.company.ems.entity.*;
import com.company.ems.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Seed Admin User
            User adminUser = User.builder()
                    .username("admin")
                    .email("admin@company.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .build();
            userRepository.save(adminUser);

            Employee adminEmp = Employee.builder()
                    .firstName("System")
                    .lastName("Admin")
                    .email("admin@company.com")
                    .phone("+1 555-0100")
                    .department("Management")
                    .designation("Director of IT")
                    .salary(120000.0)
                    .dateOfJoining(LocalDate.now().minusYears(3))
                    .user(adminUser)
                    .build();
            employeeRepository.save(adminEmp);

            // Seed Sample Employee User
            User empUser = User.builder()
                    .username("harini")
                    .email("harini@gmail.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ROLE_EMPLOYEE)
                    .build();
            userRepository.save(empUser);

            Employee emp = Employee.builder()
                    .firstName("Harini")
                    .lastName("Maliga")
                    .email("harini@gmail.com")
                    .phone("+1 555-0199")
                    .department("CSE-DS")
                    .designation("Full Stack Engineer")
                    .salary(85000.0)
                    .dateOfJoining(LocalDate.now().minusYears(1))
                    .user(empUser)
                    .build();
            employeeRepository.save(emp);

            // Seed Sample Project
            Set<Employee> assigned = new HashSet<>();
            assigned.add(emp);

            Project project = Project.builder()
                    .name("Smart Employee & Project Management System")
                    .description("Full stack Enterprise Management Web Application with Spring Boot and React")
                    .startDate(LocalDate.now())
                    .deadline(LocalDate.now().plusDays(30))
                    .priority(Project.Priority.HIGH)
                    .status(Project.ProjectStatus.IN_PROGRESS)
                    .assignedEmployees(assigned)
                    .build();
            projectRepository.save(project);

            // Seed Sample Task
            Task task1 = Task.builder()
                    .title("Setup React Dashboard & JWT Authentication")
                    .description("Configure JWT interceptors, router protection, and responsive sidebar UI")
                    .dueDate(LocalDate.now().plusDays(5))
                    .priority(Task.TaskPriority.HIGH)
                    .status(Task.TaskStatus.IN_PROGRESS)
                    .remarks("Initial component layout initialized")
                    .project(project)
                    .assignedTo(emp)
                    .build();
            taskRepository.save(task1);

            Task task2 = Task.builder()
                    .title("Implement PDF & Excel Report Exports")
                    .description("Add backend Jasper/OpenPDF & POI handlers for task and project reports")
                    .dueDate(LocalDate.now().plusDays(10))
                    .priority(Task.TaskPriority.MEDIUM)
                    .status(Task.TaskStatus.PENDING)
                    .remarks("Awaiting database test compilation")
                    .project(project)
                    .assignedTo(emp)
                    .build();
            taskRepository.save(task2);

            System.out.println("✅ Database Seed Completed Successfully!");
        }

        // Seed Audit Logs if empty
        if (auditLogRepository.count() == 0) {
            List<AuditLog> initialLogs = Arrays.asList(
                AuditLog.builder().action("SYSTEM_INIT").performedBy("SYSTEM").timestamp(LocalDateTime.now().minusHours(5)).details("Database schema initialized and security roles loaded.").build(),
                AuditLog.builder().action("USER_LOGIN").performedBy("admin").timestamp(LocalDateTime.now().minusHours(4)).details("Administrator authenticated successfully via JWT.").build(),
                AuditLog.builder().action("CREATE_PROJECT").performedBy("admin").timestamp(LocalDateTime.now().minusHours(3)).details("New project 'Smart Employee & Project Management System' created.").build(),
                AuditLog.builder().action("ASSIGN_TASK").performedBy("admin").timestamp(LocalDateTime.now().minusHours(2)).details("Task 'Setup React Dashboard' assigned to Harini Maliga.").build(),
                AuditLog.builder().action("CHECK_IN").performedBy("harini").timestamp(LocalDateTime.now().minusHours(1)).details("Daily attendance check-in recorded at 09:00:00 (Morning Shift).").build(),
                AuditLog.builder().action("EMPLOYEE_UPDATE").performedBy("admin").timestamp(LocalDateTime.now().minusMinutes(30)).details("Employee profile ID 4 (Swathi Kadalury) updated successfully.").build()
            );
            auditLogRepository.saveAll(initialLogs);
            System.out.println("✅ Audit Logs Initialized!");
        }
    }
}
