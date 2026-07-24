package com.company.ems.service;

import com.company.ems.dto.AttendanceDto;
import com.company.ems.entity.Attendance.AttendanceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AttendanceService {
    AttendanceDto markAttendance(AttendanceDto dto);
    List<AttendanceDto> getAllAttendance();
    AttendanceDto getAttendanceById(Long id);
    List<AttendanceDto> getAttendanceByEmployee(Long employeeId);
    List<AttendanceDto> getAttendanceByEmployeeId(Long employeeId);
    Page<AttendanceDto> getAttendancePage(String search, String status, String department, Pageable pageable);
    Page<AttendanceDto> getAttendancePaginated(
            String search, String department, LocalDate date,
            AttendanceStatus status, Integer month, Integer year,
            Pageable pageable
    );
    AttendanceDto updateAttendance(Long id, AttendanceDto dto);
    void deleteAttendance(Long id);
    Map<String, Object> getTodayAttendanceStats();
}
