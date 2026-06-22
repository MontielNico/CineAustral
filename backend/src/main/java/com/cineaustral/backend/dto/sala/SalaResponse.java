package com.cineaustral.backend.dto.sala;

import com.cineaustral.backend.dto.asiento.AsientoResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalaResponse {
    private Long id;
    private String nombre;
    private String estado;
    private List<AsientoResponse> asientos;
    private Integer reservasCanceladasCount;

    public SalaResponse(Long id, String nombre, String estado, List<AsientoResponse> asientos) {
        this.id = id;
        this.nombre = nombre;
        this.estado = estado;
        this.asientos = asientos;
        this.reservasCanceladasCount = 0;
    }
}
