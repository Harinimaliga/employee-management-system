package com.company.ems.service;

import com.company.ems.dto.EmployeeDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface EmployeeService {
    EmployeeDto saveEmployee(EmployeeDto employeeDto);
    List<EmployeeDto> getAllEmployees();
    Page<EmployeeDto> getEmployees(String search, String department, Pageable pageable);
    EmployeeDto getEmployeeById(Long id);
    EmployeeDto updateEmployee(Long id, EmployeeDto employeeDto);
    void deleteEmployee(Long id);
}
