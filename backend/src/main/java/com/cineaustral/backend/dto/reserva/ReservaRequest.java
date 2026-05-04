package com.cineaustral.backend.dto.reserva;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservaRequest {
    private Long funcionId;
    private List<Long> asientoIds;
    private Long clienteId;
}
