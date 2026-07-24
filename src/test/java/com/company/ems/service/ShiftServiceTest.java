package com.company.ems.service;

import com.company.ems.dto.ShiftDto;
import com.company.ems.entity.Shift;
import com.company.ems.repository.ShiftRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ShiftServiceTest {

    @Mock
    private ShiftRepository shiftRepository;

    @InjectMocks
    private ShiftServiceImpl shiftService;

    private Shift shift;
    private ShiftDto shiftDto;

    @BeforeEach
    void setUp() {
        shift = Shift.builder()
                .id(1L)
                .name("Morning Shift")
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(18, 0))
                .gracePeriodMinutes(15)
                .active(true)
                .build();

        shiftDto = ShiftDto.builder()
                .id(1L)
                .name("Morning Shift")
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(18, 0))
                .gracePeriodMinutes(15)
                .active(true)
                .build();
    }

    @Test
    void testCreateShift_Success() {
        when(shiftRepository.existsByName("Morning Shift")).thenReturn(false);
        when(shiftRepository.save(any(Shift.class))).thenReturn(shift);

        ShiftDto created = shiftService.createShift(shiftDto);

        assertNotNull(created);
        assertEquals("Morning Shift", created.getName());
        verify(shiftRepository, times(1)).save(any(Shift.class));
    }

    @Test
    void testGetAllShifts_Success() {
        when(shiftRepository.findAll()).thenReturn(Arrays.asList(shift));

        List<ShiftDto> list = shiftService.getAllShifts();

        assertNotNull(list);
        assertEquals(1, list.size());
    }

    @Test
    void testGetShiftById_Success() {
        when(shiftRepository.findById(1L)).thenReturn(Optional.of(shift));

        ShiftDto result = shiftService.getShiftById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Morning Shift", result.getName());
    }
}
