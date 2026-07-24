package com.company.ems.service;

import com.company.ems.dto.ShiftDto;
import com.company.ems.entity.Shift;
import com.company.ems.exception.ResourceNotFoundException;
import com.company.ems.exception.ValidationException;
import com.company.ems.repository.ShiftRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ShiftServiceImpl implements ShiftService {

    @Autowired
    private ShiftRepository shiftRepository;

    private ShiftDto mapToDto(Shift shift) {
        return ShiftDto.builder()
                .id(shift.getId())
                .name(shift.getName())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .gracePeriodMinutes(shift.getGracePeriodMinutes())
                .active(shift.getActive())
                .description(shift.getDescription())
                .build();
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initDefaultShifts() {
        if (shiftRepository.count() == 0) {
            List<Shift> defaultShifts = List.of(
                Shift.builder().name("Morning Shift").startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(18, 0)).gracePeriodMinutes(15).active(true).description("Standard Morning Shift (09:00 AM - 06:00 PM)").build(),
                Shift.builder().name("Afternoon Shift").startTime(LocalTime.of(13, 0)).endTime(LocalTime.of(22, 0)).gracePeriodMinutes(15).active(true).description("Afternoon Shift (01:00 PM - 10:00 PM)").build(),
                Shift.builder().name("Night Shift").startTime(LocalTime.of(21, 0)).endTime(LocalTime.of(6, 0)).gracePeriodMinutes(15).active(true).description("Overnight Shift (09:00 PM - 06:00 AM)").build(),
                Shift.builder().name("General Shift").startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(19, 0)).gracePeriodMinutes(15).active(true).description("General Corporate Shift (10:00 AM - 07:00 PM)").build()
            );
            shiftRepository.saveAll(defaultShifts);
        }
    }

    @Override
    public ShiftDto createShift(ShiftDto dto) {
        if (shiftRepository.existsByName(dto.getName())) {
            throw new ValidationException("A shift with name '" + dto.getName() + "' already exists.");
        }

        Shift shift = Shift.builder()
                .name(dto.getName())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .gracePeriodMinutes(dto.getGracePeriodMinutes() != null ? dto.getGracePeriodMinutes() : 15)
                .active(dto.getActive() != null ? dto.getActive() : true)
                .description(dto.getDescription())
                .build();

        Shift saved = shiftRepository.save(shift);
        return mapToDto(saved);
    }

    @Override
    public List<ShiftDto> getAllShifts() {
        return shiftRepository.findAll().stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public ShiftDto getShiftById(Long id) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + id));
        return mapToDto(shift);
    }

    @Override
    public ShiftDto updateShift(Long id, ShiftDto dto) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + id));

        if (dto.getName() != null) shift.setName(dto.getName());
        if (dto.getStartTime() != null) shift.setStartTime(dto.getStartTime());
        if (dto.getEndTime() != null) shift.setEndTime(dto.getEndTime());
        if (dto.getGracePeriodMinutes() != null) shift.setGracePeriodMinutes(dto.getGracePeriodMinutes());
        if (dto.getActive() != null) shift.setActive(dto.getActive());
        if (dto.getDescription() != null) shift.setDescription(dto.getDescription());

        Shift updated = shiftRepository.save(shift);
        return mapToDto(updated);
    }

    @Override
    public void deleteShift(Long id) {
        if (!shiftRepository.existsById(id)) {
            throw new ResourceNotFoundException("Shift not found with id: " + id);
        }
        shiftRepository.deleteById(id);
    }

    @Override
    public void assignShiftToEmployee(Long shiftId, Long employeeId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + shiftId));
    }
}
