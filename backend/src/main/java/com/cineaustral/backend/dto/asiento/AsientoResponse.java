package com.cineaustral.backend.dto.asiento;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AsientoResponse {
    private Long id;
    private String fila;
    private int numero;
    private String asientoEstado;
}
