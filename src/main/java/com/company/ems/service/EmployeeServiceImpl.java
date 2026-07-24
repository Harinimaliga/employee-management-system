package com.company.ems.service;

import com.company.ems.dto.EmployeeDto;
import com.company.ems.entity.Employee;
import com.company.ems.exception.ResourceNotFoundException;
import com.company.ems.repository.EmployeeRepository;
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
public class EmployeeServiceImpl implements EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    private EmployeeDto mapToDto(Employee employee) {
        return EmployeeDto.builder()
                .id(employee.getId())
                .firstName(employee.getFirstName())
                .lastName(employee.getLastName())
                .email(employee.getEmail())
                .phone(employee.getPhone())
                .department(employee.getDepartment())
                .designation(employee.getDesignation())
                .salary(employee.getSalary())
                .dateOfJoining(employee.getDateOfJoining())
                .profileImage(employee.getProfileImage())
                .userId(employee.getUser() != null ? employee.getUser().getId() : null)
                .build();
    }

    private Employee mapToEntity(EmployeeDto dto) {
        return Employee.builder()
                .id(dto.getId())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .designation(dto.getDesignation())
                .salary(dto.getSalary())
                .dateOfJoining(dto.getDateOfJoining())
                .profileImage(dto.getProfileImage())
                .build();
    }

    @Override
    public EmployeeDto saveEmployee(EmployeeDto employeeDto) {
        Employee employee = mapToEntity(employeeDto);
        Employee saved = employeeRepository.save(employee);
        return mapToDto(saved);
    }

    @Override
    public List<EmployeeDto> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<EmployeeDto> getEmployees(String search, String department, Pageable pageable) {
        Specification<Employee> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (StringUtils.hasText(search)) {
                String searchLike = "%" + search.toLowerCase() + "%";
                Predicate firstNameMatch = cb.like(cb.lower(root.get("firstName")), searchLike);
                Predicate lastNameMatch = cb.like(cb.lower(root.get("lastName")), searchLike);
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), searchLike);
                predicates.add(cb.or(firstNameMatch, lastNameMatch, emailMatch));
            }
            if (StringUtils.hasText(department)) {
                predicates.add(cb.equal(cb.lower(root.get("department")), department.toLowerCase()));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return employeeRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    @Override
    public EmployeeDto getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));
        return mapToDto(employee);
    }

    @Override
    public EmployeeDto updateEmployee(Long id, EmployeeDto employeeDto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + id));

        employee.setFirstName(employeeDto.getFirstName());
        employee.setLastName(employeeDto.getLastName());
        employee.setEmail(employeeDto.getEmail());
        if (employeeDto.getPhone() != null) employee.setPhone(employeeDto.getPhone());
        if (employeeDto.getDepartment() != null) employee.setDepartment(employeeDto.getDepartment());
        if (employeeDto.getDesignation() != null) employee.setDesignation(employeeDto.getDesignation());
        if (employeeDto.getSalary() != null) employee.setSalary(employeeDto.getSalary());

        Employee updated = employeeRepository.save(employee);
        return mapToDto(updated);
    }

    @Override
    public void deleteEmployee(Long id) {
        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
    }
}
