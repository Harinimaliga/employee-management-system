package com.company.ems.service;

import com.company.ems.dto.EmployeeDto;
import com.company.ems.entity.Employee;
import com.company.ems.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Employee employee;
    private EmployeeDto employeeDto;

    @BeforeEach
    void setUp() {
        employee = Employee.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@company.com")
                .department("Engineering")
                .designation("Senior Developer")
                .salary(80000.0)
                .build();

        employeeDto = EmployeeDto.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john.doe@company.com")
                .department("Engineering")
                .designation("Senior Developer")
                .salary(80000.0)
                .build();
    }

    @Test
    void testSaveEmployee_Success() {
        when(employeeRepository.save(any(Employee.class))).thenReturn(employee);

        EmployeeDto savedDto = employeeService.saveEmployee(employeeDto);

        assertNotNull(savedDto);
        assertEquals("John", savedDto.getFirstName());
        assertEquals("john.doe@company.com", savedDto.getEmail());
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    void testGetEmployeeById_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));

        EmployeeDto result = employeeService.getEmployeeById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Engineering", result.getDepartment());
    }

    @Test
    void testGetAllEmployees_Success() {
        when(employeeRepository.findAll()).thenReturn(Arrays.asList(employee));

        List<EmployeeDto> list = employeeService.getAllEmployees();

        assertNotNull(list);
        assertEquals(1, list.size());
    }

    @Test
    void testDeleteEmployee_Success() {
        when(employeeRepository.existsById(1L)).thenReturn(true);
        doNothing().when(employeeRepository).deleteById(1L);

        assertDoesNotThrow(() -> employeeService.deleteEmployee(1L));

        verify(employeeRepository, times(1)).deleteById(1L);
    }
}
