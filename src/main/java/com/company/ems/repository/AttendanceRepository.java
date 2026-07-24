package com.company.ems.repository;

import com.company.ems.entity.Attendance;
import com.company.ems.entity.Attendance.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long>, JpaSpecificationExecutor<Attendance> {

    List<Attendance> findByEmployeeId(Long employeeId);

    List<Attendance> findByAttendanceDate(LocalDate date);

    Optional<Attendance> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);

    boolean existsByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);

    long countByAttendanceDateAndStatus(LocalDate date, AttendanceStatus status);

    long countByAttendanceDate(LocalDate date);

    long countByEmployeeIdAndStatus(Long employeeId, AttendanceStatus status);
}
