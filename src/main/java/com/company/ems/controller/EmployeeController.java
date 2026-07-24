package com.company.ems.controller;

import com.company.ems.dto.EmployeeDto;
import com.company.ems.service.EmployeeService;
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
@RequestMapping("/api/employees")
@Tag(name = "Employee Management", description = "Employee Directory CRUD, Search & Pagination APIs")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping
    @Operation(summary = "Get All Employees", description = "Retrieves a list of all employee records.")
    public ResponseEntity<List<EmployeeDto>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/page")
    @Operation(summary = "Paginated Employee Search", description = "Search employees by name/email and filter by department.")
    public ResponseEntity<Page<EmployeeDto>> getEmployeesPaginated(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String department,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(employeeService.getEmployees(search, department, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Employee by ID", description = "Fetches single employee details by ID.")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Create Employee", description = "Adds a new employee to the system.")
    public ResponseEntity<EmployeeDto> createEmployee(@Valid @RequestBody EmployeeDto employeeDto) {
        return ResponseEntity.ok(employeeService.saveEmployee(employeeDto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Update Employee", description = "Modifies an existing employee record.")
    public ResponseEntity<EmployeeDto> updateEmployee(@PathVariable Long id, @Valid @RequestBody EmployeeDto employeeDto) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, employeeDto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Delete Employee", description = "Deletes an employee by ID.")
    public ResponseEntity<String> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.ok("Employee deleted successfully!");
    }
}