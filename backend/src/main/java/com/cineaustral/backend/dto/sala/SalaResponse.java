package com.cineaustral.backend.dto.sala;

import com.cineaustral.backend.dto.asiento.AsientoResponse;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class SalaResponse {
    private int id;
    private String nombre;
    private String estado;
    private List<AsientoResponse> asientos;
}
