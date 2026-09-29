package com.cineaustral.backend.dto.tmdb;

public record TmdbDetalleResponse(
        int id,
        String titulo,
        String sinopsis,
        String posterUrl,
        Double puntuacion,
        int duracionMinutos,
        String genero
) {}
