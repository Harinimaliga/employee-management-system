package com.company.ems.service;

import com.company.ems.dto.ShiftDto;
import java.util.List;

public interface ShiftService {
    ShiftDto createShift(ShiftDto dto);
    List<ShiftDto> getAllShifts();
    ShiftDto getShiftById(Long id);
    ShiftDto updateShift(Long id, ShiftDto dto);
    void deleteShift(Long id);
    void assignShiftToEmployee(Long shiftId, Long employeeId);
}
