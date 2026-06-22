package com.cineaustral.backend.dto.sala;

import lombok.Data;

@Data
public class SalaEstadoRequest {
    private String estado;
    private String fechaFinMantenimiento;
}
