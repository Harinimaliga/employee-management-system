package com.company.ems.controller;

import com.company.ems.dto.AttendanceDto;
import com.company.ems.dto.MessageResponse;
import com.company.ems.entity.Attendance.AttendanceStatus;
import com.company.ems.service.AttendanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "*")
@Tag(name = "Attendance Management API", description = "Endpoints for employee check-in, check-out, working hours calculation, and shift telemetry.")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping
    @Operation(summary = "Mark Attendance", description = "Record check-in, check-out, and attendance status.")
    public ResponseEntity<AttendanceDto> markAttendance(@Valid @RequestBody AttendanceDto dto) {
        AttendanceDto saved = attendanceService.markAttendance(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @PostMapping("/check-in")
    @Operation(summary = "1-Click Employee Check-In", description = "Mark check-in for an employee for today.")
    public ResponseEntity<AttendanceDto> checkIn(@RequestBody Map<String, Object> body) {
        Long employeeId = Long.parseLong(body.get("employeeId").toString());
        Long shiftId = body.get("shiftId") != null ? Long.parseLong(body.get("shiftId").toString()) : null;

        AttendanceDto dto = AttendanceDto.builder()
                .employeeId(employeeId)
                .shiftId(shiftId)
                .attendanceDate(LocalDate.now())
                .checkInTime(LocalTime.now())
                .status(AttendanceStatus.PRESENT)
                .remarks("Checked in via Employee Web Portal")
                .build();

        AttendanceDto saved = attendanceService.markAttendance(dto);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/check-out/{id}")
    @Operation(summary = "1-Click Employee Check-Out", description = "Mark check-out for today's attendance record.")
    public ResponseEntity<AttendanceDto> checkOut(@PathVariable Long id) {
        AttendanceDto dto = new AttendanceDto();
        dto.setCheckOutTime(LocalTime.now());
        AttendanceDto updated = attendanceService.updateAttendance(id, dto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    @Operation(summary = "Get All Attendance Records", description = "Retrieve all employee attendance records.")
    public ResponseEntity<List<AttendanceDto>> getAllAttendance() {
        List<AttendanceDto> list = attendanceService.getAllAttendance();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/page")
    @Operation(summary = "Get Paginated Attendance Records", description = "Filter, search, and paginate attendance records.")
    public ResponseEntity<Page<AttendanceDto>> getAttendancePage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String department
    ) {
        Page<AttendanceDto> pageResult = attendanceService.getAttendancePage(
                search, status, department,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "attendanceDate"))
        );
        return ResponseEntity.ok(pageResult);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Attendance By ID", description = "Retrieve a specific attendance record by its ID.")
    public ResponseEntity<AttendanceDto> getAttendanceById(@PathVariable Long id) {
        AttendanceDto dto = attendanceService.getAttendanceById(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "Get Attendance By Employee", description = "Retrieve attendance logs for a specific employee.")
    public ResponseEntity<List<AttendanceDto>> getAttendanceByEmployeeId(@PathVariable Long employeeId) {
        List<AttendanceDto> list = attendanceService.getAttendanceByEmployeeId(employeeId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/date/{date}")
    @Operation(summary = "Get Attendance By Date", description = "Retrieve attendance logs for a specific date (YYYY-MM-DD).")
    public ResponseEntity<List<AttendanceDto>> getAttendanceByDate(@PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        List<AttendanceDto> list = attendanceService.getAllAttendance().stream()
                .filter(a -> a.getAttendanceDate().equals(localDate))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get Attendance By Status", description = "Retrieve attendance logs by status.")
    public ResponseEntity<List<AttendanceDto>> getAttendanceByStatus(@PathVariable String status) {
        List<AttendanceDto> list = attendanceService.getAllAttendance().stream()
                .filter(a -> a.getStatus().name().equalsIgnoreCase(status))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update Attendance", description = "Modify an attendance record.")
    public ResponseEntity<AttendanceDto> updateAttendance(@PathVariable Long id, @RequestBody AttendanceDto dto) {
        AttendanceDto updated = attendanceService.updateAttendance(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Attendance", description = "Delete an attendance record.")
    public ResponseEntity<MessageResponse> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.ok(new MessageResponse("Attendance record deleted successfully!"));
    }

    @GetMapping("/stats/today")
    @Operation(summary = "Get Today's Attendance Statistics", description = "Returns total present, absent, late, leave counts, and attendance percentage for today.")
    public ResponseEntity<Map<String, Object>> getTodayAttendanceStats() {
        Map<String, Object> stats = attendanceService.getTodayAttendanceStats();
        return ResponseEntity.ok(stats);
    }
}
