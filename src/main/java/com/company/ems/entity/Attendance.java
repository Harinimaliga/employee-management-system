package com.company.ems.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
    name = "attendance",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"employee_id", "attendance_date"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "check_in_time")
    private LocalTime checkInTime;

    @Column(name = "check_out_time")
    private LocalTime checkOutTime;

    @Column(name = "working_hours")
    private Double workingHours;

    @Column(name = "overtime_hours")
    private Double overtimeHours;

    @Column(name = "late_arrival")
    private Boolean lateArrival;

    @Column(name = "early_departure")
    private Boolean earlyDeparture;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    @Column(length = 1000)
    private String remarks;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id")
    private Shift shift;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.lateArrival == null) this.lateArrival = false;
        if (this.earlyDeparture == null) this.earlyDeparture = false;
        if (this.workingHours == null) this.workingHours = 0.0;
        if (this.overtimeHours == null) this.overtimeHours = 0.0;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum AttendanceStatus {
        PRESENT, ABSENT, LATE, HALF_DAY, LEAVE, WORK_FROM_HOME
    }
}
