package com.cineaustral.backend.dto.pelicula;

import lombok.Data;

@Data
public class PeliculaRequest {
    private String titulo;
    private String genero;
    private String sinopsis;
    private int duracionMinutos;
    private Double puntuacion;
}
