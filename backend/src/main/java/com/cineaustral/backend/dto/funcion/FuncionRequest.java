package com.cineaustral.backend.dto.funcion;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class FuncionRequest {
    private Long peliculaId;
    private Long salaId;
    private String fechaHoraInicio;
    private int duracionMinutos;
    private BigDecimal precioPorAsiento;
}
