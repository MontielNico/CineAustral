package com.cineaustral.backend.dto.funcion;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class FuncionResponse {
    private Long id;
    private String pelicula;
    private String sala;
    private String fechaHoraInicio;
    private String fechaHoraFin;
    private int duracionMinutos;
    private BigDecimal precioPorAsiento;
}
