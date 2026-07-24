package com.company.ems.dto;

import com.company.ems.entity.Attendance.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDto {

    private Long id;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    private LocalTime checkInTime;
    private LocalTime checkOutTime;
    private Double workingHours;
    private Double overtimeHours;
    private Boolean lateArrival;
    private Boolean earlyDeparture;

    @NotNull(message = "Attendance status is required")
    private AttendanceStatus status;

    private String remarks;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String department;

    private Long shiftId;
    private String shiftName;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
