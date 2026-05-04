package com.cineaustral.backend.dto.reserva;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DetalleReservaResponse {
    private Long id;
    private String fila;
    private int numero;
}
