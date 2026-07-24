package com.company.ems.config;

import com.company.ems.entity.*;
import com.company.ems.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private ShiftRepository shiftRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Ensure Default Users & Employees
        User adminUser = userRepository.findByUsername("admin").orElse(null);
        if (adminUser == null) {
            adminUser = User.builder()
                    .username("admin")
                    .email("admin@company.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .build();
            userRepository.save(adminUser);
        }

        Employee adminEmp = employeeRepository.findByEmail("admin@company.com").orElse(null);
        if (adminEmp == null) {
            adminEmp = Employee.builder()
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
        }

        User empUser = userRepository.findByUsername("harini").orElse(null);
        if (empUser == null) {
            empUser = User.builder()
                    .username("harini")
                    .email("harini@gmail.com")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ROLE_EMPLOYEE)
                    .build();
            userRepository.save(empUser);
        }

        Employee hariniEmp = employeeRepository.findByEmail("harini@gmail.com").orElse(null);
        if (hariniEmp == null) {
            hariniEmp = Employee.builder()
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
            employeeRepository.save(hariniEmp);
        }

        // 2. Ensure Default Shifts if empty
        if (shiftRepository.count() == 0) {
            List<Shift> shifts = Arrays.asList(
                    Shift.builder().name("Morning Shift").startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(18, 0)).gracePeriodMinutes(15).active(true).description("Standard Morning Shift (09:00 AM - 06:00 PM)").build(),
                    Shift.builder().name("Afternoon Shift").startTime(LocalTime.of(13, 0)).endTime(LocalTime.of(22, 0)).gracePeriodMinutes(15).active(true).description("Afternoon Shift (01:00 PM - 10:00 PM)").build(),
                    Shift.builder().name("Night Shift").startTime(LocalTime.of(21, 0)).endTime(LocalTime.of(6, 0)).gracePeriodMinutes(15).active(true).description("Overnight Shift (09:00 PM - 06:00 AM)").build(),
                    Shift.builder().name("General Shift").startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(19, 0)).gracePeriodMinutes(15).active(true).description("General Corporate Shift (10:00 AM - 07:00 PM)").build()
            );
            shiftRepository.saveAll(shifts);
        }

        // 3. Ensure Default Projects if empty
        if (projectRepository.count() == 0) {
            Set<Employee> assignedTeam = new HashSet<>();
            if (hariniEmp != null) assignedTeam.add(hariniEmp);
            if (adminEmp != null) assignedTeam.add(adminEmp);

            Project p1 = Project.builder()
                    .name("Smart Employee Management Platform")
                    .description("Enterprise Full Stack Java & React Management Application")
                    .startDate(LocalDate.now())
                    .deadline(LocalDate.now().plusDays(30))
                    .priority(Project.Priority.HIGH)
                    .status(Project.ProjectStatus.IN_PROGRESS)
                    .assignedEmployees(assignedTeam)
                    .build();

            Project p2 = Project.builder()
                    .name("AI Analytics & Automated Reporting")
                    .description("Predictive employee workload analytics module")
                    .startDate(LocalDate.now())
                    .deadline(LocalDate.now().plusDays(40))
                    .priority(Project.Priority.MEDIUM)
                    .status(Project.ProjectStatus.IN_PROGRESS)
                    .assignedEmployees(assignedTeam)
                    .build();

            Project p3 = Project.builder()
                    .name("AI Telemetry Suite v3.0")
                    .description("Next-Gen real-time employee tracking and project automation")
                    .startDate(LocalDate.now())
                    .deadline(LocalDate.now().plusDays(60))
                    .priority(Project.Priority.HIGH)
                    .status(Project.ProjectStatus.IN_PROGRESS)
                    .assignedEmployees(assignedTeam)
                    .build();

            projectRepository.saveAll(Arrays.asList(p1, p2, p3));
            System.out.println("✅ Sample Projects Seeded Successfully!");
        }

        // 4. Ensure Default Tasks if empty
        if (taskRepository.count() == 0) {
            List<Project> allProjs = projectRepository.findAll();
            Project targetProj = allProjs.isEmpty() ? null : allProjs.get(0);

            if (targetProj != null && hariniEmp != null) {
                Task t1 = Task.builder()
                        .title("Setup React Dashboard & JWT Authentication")
                        .description("Configure JWT interceptors, router protection, and responsive sidebar UI")
                        .dueDate(LocalDate.now().plusDays(5))
                        .priority(Task.TaskPriority.HIGH)
                        .status(Task.TaskStatus.IN_PROGRESS)
                        .remarks("Initial component layout initialized")
                        .project(targetProj)
                        .assignedTo(hariniEmp)
                        .build();

                Task t2 = Task.builder()
                        .title("Implement PDF & Excel Report Exports")
                        .description("Add backend Jasper/OpenPDF & POI handlers for task and project reports")
                        .dueDate(LocalDate.now().plusDays(10))
                        .priority(Task.TaskPriority.MEDIUM)
                        .status(Task.TaskStatus.COMPLETED)
                        .remarks("Verified report export handlers")
                        .project(targetProj)
                        .assignedTo(hariniEmp)
                        .build();

                Task t3 = Task.builder()
                        .title("Configure Shift & Attendance Telemetry")
                        .description("Build check-in/out logic and working hours calculation")
                        .dueDate(LocalDate.now().plusDays(15))
                        .priority(Task.TaskPriority.HIGH)
                        .status(Task.TaskStatus.IN_PROGRESS)
                        .remarks("Overtime and midnight logic verified")
                        .project(targetProj)
                        .assignedTo(hariniEmp)
                        .build();

                taskRepository.saveAll(Arrays.asList(t1, t2, t3));
                System.out.println("✅ Sample Tasks Seeded Successfully!");
            }
        }

        // 5. Ensure Audit Logs if empty
        if (auditLogRepository.count() == 0) {
            List<AuditLog> initialLogs = Arrays.asList(
                    AuditLog.builder().action("SYSTEM_INIT").performedBy("SYSTEM").timestamp(LocalDateTime.now().minusHours(5)).details("Database schema initialized and security roles loaded.").build(),
                    AuditLog.builder().action("USER_LOGIN").performedBy("admin").timestamp(LocalDateTime.now().minusHours(4)).details("Administrator authenticated successfully via JWT.").build(),
                    AuditLog.builder().action("CREATE_PROJECT").performedBy("admin").timestamp(LocalDateTime.now().minusHours(3)).details("New project 'Smart Employee Management Platform' created.").build(),
                    AuditLog.builder().action("ASSIGN_TASK").performedBy("admin").timestamp(LocalDateTime.now().minusHours(2)).details("Task 'Setup React Dashboard' assigned to Harini Maliga.").build(),
                    AuditLog.builder().action("CHECK_IN").performedBy("harini").timestamp(LocalDateTime.now().minusHours(1)).details("Daily attendance check-in recorded at 09:00:00 (Morning Shift).").build()
            );
            auditLogRepository.saveAll(initialLogs);
            System.out.println("✅ Audit Logs Initialized!");
        }
    }
}
