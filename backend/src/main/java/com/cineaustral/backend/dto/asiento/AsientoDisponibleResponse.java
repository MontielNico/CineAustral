package com.cineaustral.backend.dto.asiento;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AsientoDisponibleResponse {
    private Long id;
    private String fila;
    private int numero;
}
