package com.company.ems.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftDto {

    private Long id;

    @NotBlank(message = "Shift name is required")
    private String name;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private Integer gracePeriodMinutes;
    private Boolean active;
    private String description;
}
