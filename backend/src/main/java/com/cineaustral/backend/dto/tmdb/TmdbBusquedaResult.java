package com.cineaustral.backend.dto.tmdb;

public record TmdbBusquedaResult(
        int id,
        String titulo,
        String sinopsis,
        String posterUrl,
        Double puntuacion,
        String fechaLanzamiento
) {}
