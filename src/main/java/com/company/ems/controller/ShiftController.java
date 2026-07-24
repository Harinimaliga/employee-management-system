package com.company.ems.controller;

import com.company.ems.dto.MessageResponse;
import com.company.ems.dto.ShiftDto;
import com.company.ems.service.ShiftService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shifts")
@CrossOrigin(origins = "*")
@Tag(name = "Shift Management API", description = "Endpoints for managing corporate work shifts, timings, and employee shift assignments.")
public class ShiftController {

    @Autowired
    private ShiftService shiftService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Shift", description = "Create a new work shift with start time, end time, and grace period.")
    public ResponseEntity<ShiftDto> createShift(@Valid @RequestBody ShiftDto dto) {
        ShiftDto created = shiftService.createShift(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get All Shifts", description = "Retrieve all active work shifts.")
    public ResponseEntity<List<ShiftDto>> getAllShifts() {
        List<ShiftDto> list = shiftService.getAllShifts();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Shift By ID", description = "Fetch a specific shift by its ID.")
    public ResponseEntity<ShiftDto> getShiftById(@PathVariable Long id) {
        ShiftDto dto = shiftService.getShiftById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update Shift", description = "Update existing shift parameters.")
    public ResponseEntity<ShiftDto> updateShift(@PathVariable Long id, @RequestBody ShiftDto dto) {
        ShiftDto updated = shiftService.updateShift(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Shift", description = "Remove a shift from the system.")
    public ResponseEntity<MessageResponse> deleteShift(@PathVariable Long id) {
        shiftService.deleteShift(id);
        return ResponseEntity.ok(new MessageResponse("Shift deleted successfully!"));
    }

    @PutMapping("/{shiftId}/assign/{employeeId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign Shift to Employee", description = "Assign a specific work shift to an employee.")
    public ResponseEntity<MessageResponse> assignShiftToEmployee(@PathVariable Long shiftId, @PathVariable Long employeeId) {
        shiftService.assignShiftToEmployee(shiftId, employeeId);
        return ResponseEntity.ok(new MessageResponse("Shift assigned successfully to employee!"));
    }
}
