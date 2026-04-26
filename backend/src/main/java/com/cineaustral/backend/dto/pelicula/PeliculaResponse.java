package com.cineaustral.backend.dto.pelicula;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PeliculaResponse {
    private Long id;
    private String titulo;
    private String genero;
    private String sinopsis;
    private int duracionMinutos;
    private Double puntuacion;
    private String imagenUrl;
}
