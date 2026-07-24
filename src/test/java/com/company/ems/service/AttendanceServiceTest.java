package com.company.ems.service;

import com.company.ems.dto.AttendanceDto;
import com.company.ems.entity.Attendance;
import com.company.ems.entity.Attendance.AttendanceStatus;
import com.company.ems.entity.Employee;
import com.company.ems.entity.Shift;
import com.company.ems.repository.AttendanceRepository;
import com.company.ems.repository.EmployeeRepository;
import com.company.ems.repository.ShiftRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ShiftRepository shiftRepository;

    @InjectMocks
    private AttendanceServiceImpl attendanceService;

    private Employee employee;
    private Shift shift;
    private Attendance attendance;
    private AttendanceDto attendanceDto;

    @BeforeEach
    void setUp() {
        employee = Employee.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("john@company.com")
                .department("Engineering")
                .build();

        shift = Shift.builder()
                .id(1L)
                .name("Morning Shift")
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(18, 0))
                .gracePeriodMinutes(15)
                .active(true)
                .build();

        attendance = Attendance.builder()
                .id(100L)
                .attendanceDate(LocalDate.now())
                .checkInTime(LocalTime.of(9, 0))
                .checkOutTime(LocalTime.of(18, 0))
                .status(AttendanceStatus.PRESENT)
                .employee(employee)
                .shift(shift)
                .workingHours(9.0)
                .overtimeHours(0.0)
                .lateArrival(false)
                .earlyDeparture(false)
                .build();

        attendanceDto = AttendanceDto.builder()
                .employeeId(1L)
                .shiftId(1L)
                .attendanceDate(LocalDate.now())
                .checkInTime(LocalTime.of(9, 0))
                .checkOutTime(LocalTime.of(18, 0))
                .status(AttendanceStatus.PRESENT)
                .build();
    }

    @Test
    void testMarkAttendance_Success() {
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(shift));
        when(attendanceRepository.existsByEmployeeIdAndAttendanceDate(anyLong(), any(LocalDate.class))).thenReturn(false);
        when(attendanceRepository.save(any(Attendance.class))).thenReturn(attendance);

        AttendanceDto result = attendanceService.markAttendance(attendanceDto);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals(AttendanceStatus.PRESENT, result.getStatus());
        verify(attendanceRepository, times(1)).save(any(Attendance.class));
    }

    @Test
    void testGetAttendanceById_Success() {
        when(attendanceRepository.findById(100L)).thenReturn(Optional.of(attendance));

        AttendanceDto result = attendanceService.getAttendanceById(100L);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals("John Doe", result.getEmployeeName());
    }

    @Test
    void testGetAllAttendance_Success() {
        when(attendanceRepository.findAll()).thenReturn(Arrays.asList(attendance));

        List<AttendanceDto> list = attendanceService.getAllAttendance();

        assertNotNull(list);
        assertEquals(1, list.size());
    }
}
