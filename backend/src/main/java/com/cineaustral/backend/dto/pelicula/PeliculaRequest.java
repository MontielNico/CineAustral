package com.cineaustral.backend.dto.pelicula;

import lombok.Data;

@Data
public class PeliculaRequest {
    private String titulo;
    private String genero;
    private String sinopsis;
    private int duracionMinutos;
    private Double puntuacion;
    private Boolean enCartelera;
    private String clasificacion;
    /** URL externa del poster (ej: de TMDB). Se descarga y guarda localmente si no se sube un archivo. */
    private String imagenUrlExterna;
}

