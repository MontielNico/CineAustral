package com.cineaustral.backend.dto.asiento;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AsientoResponse {
    private Long id;
    private String fila;
    private int numero;
    private String asientoEstado;
    private Integer reservasCanceladasCount;

    public AsientoResponse(Long id, String fila, int numero, String asientoEstado) {
        this.id = id;
        this.fila = fila;
        this.numero = numero;
        this.asientoEstado = asientoEstado;
        this.reservasCanceladasCount = 0;
    }
}
