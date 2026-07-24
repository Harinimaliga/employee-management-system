package com.company.ems.service;

import com.company.ems.dto.AttendanceDto;
import com.company.ems.entity.Attendance;
import com.company.ems.entity.Attendance.AttendanceStatus;
import com.company.ems.entity.Employee;
import com.company.ems.entity.Shift;
import com.company.ems.exception.ResourceNotFoundException;
import com.company.ems.exception.ValidationException;
import com.company.ems.repository.AttendanceRepository;
import com.company.ems.repository.EmployeeRepository;
import com.company.ems.repository.ShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ShiftRepository shiftRepository;

    private AttendanceDto mapToDto(Attendance att) {
        return AttendanceDto.builder()
                .id(att.getId())
                .attendanceDate(att.getAttendanceDate())
                .checkInTime(att.getCheckInTime())
                .checkOutTime(att.getCheckOutTime())
                .workingHours(att.getWorkingHours())
                .overtimeHours(att.getOvertimeHours())
                .lateArrival(att.getLateArrival())
                .earlyDeparture(att.getEarlyDeparture())
                .status(att.getStatus())
                .remarks(att.getRemarks())
                .employeeId(att.getEmployee().getId())
                .employeeName(att.getEmployee().getFirstName() + " " + att.getEmployee().getLastName())
                .employeeEmail(att.getEmployee().getEmail())
                .department(att.getEmployee().getDepartment())
                .shiftId(att.getShift() != null ? att.getShift().getId() : null)
                .shiftName(att.getShift() != null ? att.getShift().getName() : "General Shift")
                .createdAt(att.getCreatedAt())
                .updatedAt(att.getUpdatedAt())
                .build();
    }

    private void calculateAttendanceRules(Attendance att, LocalTime checkIn, LocalTime checkOut, Shift shift) {
        if (checkIn != null && checkOut != null) {
            long minutes;
            if (checkOut.isAfter(checkIn)) {
                minutes = Duration.between(checkIn, checkOut).toMinutes();
            } else {
                minutes = Duration.between(checkIn, LocalTime.MAX).toMinutes() + 1 + Duration.between(LocalTime.MIN, checkOut).toMinutes();
            }
            double hours = Math.round((minutes / 60.0) * 100.0) / 100.0;
            att.setWorkingHours(hours);

            double standardHours = 9.0;
            if (shift != null) {
                LocalTime sStart = shift.getStartTime();
                LocalTime sEnd = shift.getEndTime();
                long shiftMin = sEnd.isAfter(sStart) ? Duration.between(sStart, sEnd).toMinutes() : Duration.between(sStart, LocalTime.MAX).toMinutes() + 1 + Duration.between(LocalTime.MIN, sEnd).toMinutes();
                standardHours = shiftMin / 60.0;
            }

            if (hours > standardHours) {
                att.setOvertimeHours(Math.round((hours - standardHours) * 100.0) / 100.0);
            } else {
                att.setOvertimeHours(0.0);
            }

            if (hours < 4.0 && att.getStatus() == AttendanceStatus.PRESENT) {
                att.setStatus(AttendanceStatus.HALF_DAY);
            }
        }

        if (checkIn != null && shift != null) {
            int grace = shift.getGracePeriodMinutes() != null ? shift.getGracePeriodMinutes() : 15;
            LocalTime allowedCheckIn = shift.getStartTime().plusMinutes(grace);
            if (checkIn.isAfter(allowedCheckIn)) {
                att.setLateArrival(true);
                if (att.getStatus() == AttendanceStatus.PRESENT) {
                    att.setStatus(AttendanceStatus.LATE);
                }
            } else {
                att.setLateArrival(false);
            }
        }

        if (checkOut != null && shift != null) {
            if (checkOut.isBefore(shift.getEndTime())) {
                att.setEarlyDeparture(true);
            } else {
                att.setEarlyDeparture(false);
            }
        }
    }

    @Override
    @Transactional
    public AttendanceDto markAttendance(AttendanceDto dto) {
        if (dto.getAttendanceDate().isAfter(LocalDate.now())) {
            throw new ValidationException("Cannot mark attendance for future dates.");
        }

        if (dto.getCheckInTime() != null && dto.getCheckOutTime() != null && dto.getCheckInTime().isAfter(dto.getCheckOutTime())) {
            throw new ValidationException("Check-in time cannot be after check-out time.");
        }

        if (attendanceRepository.existsByEmployeeIdAndAttendanceDate(dto.getEmployeeId(), dto.getAttendanceDate())) {
            throw new ValidationException("An attendance record already exists for this employee on " + dto.getAttendanceDate());
        }

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with id: " + dto.getEmployeeId()));

        Shift shift = null;
        if (dto.getShiftId() != null) {
            shift = shiftRepository.findById(dto.getShiftId()).orElse(null);
        }
        if (shift == null) {
            shift = shiftRepository.findByName("General Shift").orElse(null);
        }

        Attendance attendance = Attendance.builder()
                .attendanceDate(dto.getAttendanceDate())
                .checkInTime(dto.getCheckInTime())
                .checkOutTime(dto.getCheckOutTime())
                .status(dto.getStatus())
                .remarks(dto.getRemarks())
                .employee(employee)
                .shift(shift)
                .build();

        calculateAttendanceRules(attendance, dto.getCheckInTime(), dto.getCheckOutTime(), shift);

        Attendance saved = attendanceRepository.save(attendance);
        return mapToDto(saved);
    }

    @Override
    public List<AttendanceDto> getAllAttendance() {
        return attendanceRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public Page<AttendanceDto> getAttendancePage(String search, String status, String department, Pageable pageable) {
        Specification<Attendance> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("employee").get("firstName")), lowerSearch),
                cb.like(cb.lower(root.get("employee").get("lastName")), lowerSearch),
                cb.like(cb.lower(root.get("remarks")), lowerSearch)
            ));
        }

        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            try {
                AttendanceStatus enumStatus = AttendanceStatus.valueOf(status.trim().toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), enumStatus));
            } catch (IllegalArgumentException e) {
                // Ignore invalid status enum
            }
        }

        if (department != null && !department.trim().isEmpty() && !department.equalsIgnoreCase("ALL")) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("employee").get("department"), department.trim()));
        }

        return attendanceRepository.findAll(spec, pageable).map(this::mapToDto);
    }

    @Override
    public Page<AttendanceDto> getAttendancePaginated(String search, String department, LocalDate date, AttendanceStatus status, Integer month, Integer year, Pageable pageable) {
        return getAttendancePage(search, status != null ? status.name() : null, department, pageable);
    }

    @Override
    public AttendanceDto getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));
        return mapToDto(attendance);
    }

    @Override
    public List<AttendanceDto> getAttendanceByEmployee(Long employeeId) {
        return getAttendanceByEmployeeId(employeeId);
    }

    @Override
    public List<AttendanceDto> getAttendanceByEmployeeId(Long employeeId) {
        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found with id: " + employeeId);
        }
        return attendanceRepository.findByEmployeeId(employeeId).stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AttendanceDto updateAttendance(Long id, AttendanceDto dto) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + id));

        if (dto.getCheckInTime() != null) attendance.setCheckInTime(dto.getCheckInTime());
        if (dto.getCheckOutTime() != null) attendance.setCheckOutTime(dto.getCheckOutTime());
        if (dto.getStatus() != null) attendance.setStatus(dto.getStatus());
        if (dto.getRemarks() != null) attendance.setRemarks(dto.getRemarks());

        if (dto.getShiftId() != null) {
            Shift shift = shiftRepository.findById(dto.getShiftId()).orElse(null);
            if (shift != null) attendance.setShift(shift);
        }

        calculateAttendanceRules(attendance, attendance.getCheckInTime(), attendance.getCheckOutTime(), attendance.getShift());

        Attendance updated = attendanceRepository.save(attendance);
        return mapToDto(updated);
    }

    @Override
    public void deleteAttendance(Long id) {
        if (!attendanceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Attendance record not found with id: " + id);
        }
        attendanceRepository.deleteById(id);
    }

    @Override
    public Map<String, Object> getTodayAttendanceStats() {
        LocalDate today = LocalDate.now();
        long totalEmployees = employeeRepository.count();
        long presentToday = attendanceRepository.countByAttendanceDateAndStatus(today, AttendanceStatus.PRESENT);
        long absentToday = attendanceRepository.countByAttendanceDateAndStatus(today, AttendanceStatus.ABSENT);
        long lateEmployees = attendanceRepository.countByAttendanceDateAndStatus(today, AttendanceStatus.LATE);
        long leaveCount = attendanceRepository.countByAttendanceDateAndStatus(today, AttendanceStatus.LEAVE);

        double pct = totalEmployees > 0 ? (presentToday * 100.0) / totalEmployees : 0.0;
        pct = Math.round(pct * 100.0) / 100.0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEmployees", totalEmployees);
        stats.put("presentToday", presentToday);
        stats.put("absentToday", absentToday);
        stats.put("lateEmployees", lateEmployees);
        stats.put("leaveCount", leaveCount);
        stats.put("attendancePercentage", pct);
        return stats;
    }
}
