package com.cineaustral.backend.controller;

import com.cineaustral.backend.dto.tmdb.TmdbBusquedaResult;
import com.cineaustral.backend.dto.tmdb.TmdbDetalleResponse;
import com.cineaustral.backend.service.TmdbService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/tmdb")
public class TmdbController {

    private final TmdbService tmdbService;

    /**
     * Busca películas por título en TMDB.
     * Solo accesible para ADMIN (cubierto por SecurityConfig: /admin/** → ROLE_ADMIN).
     *
     * GET /admin/tmdb/buscar?query=inception
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<TmdbBusquedaResult>> buscar(@RequestParam String query) {
        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(tmdbService.buscar(query));
    }

    /**
     * Obtiene el detalle completo de una película por su ID de TMDB.
     * Incluye duración, géneros y poster.
     *
     * GET /admin/tmdb/detalle/27205
     */
    @GetMapping("/detalle/{tmdbId}")
    public ResponseEntity<TmdbDetalleResponse> detalle(@PathVariable int tmdbId) {
        return ResponseEntity.ok(tmdbService.obtenerDetalle(tmdbId));
    }
}
