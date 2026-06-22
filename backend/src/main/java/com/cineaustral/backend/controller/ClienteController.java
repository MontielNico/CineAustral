package com.cineaustral.backend.controller;

import com.cineaustral.backend.dto.funcion.FuncionResponse;
import com.cineaustral.backend.dto.pelicula.PeliculaResponse;
import com.cineaustral.backend.service.FuncionService;
import com.cineaustral.backend.service.PeliculaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ClienteController {

    private final PeliculaService peliculaService;
    private final FuncionService funcionService;

    @GetMapping("/peliculas")
    public ResponseEntity<List<PeliculaResponse>> listarPeliculas() {
        return ResponseEntity.ok(peliculaService.listarPeliculas());
    }

    @GetMapping("/funciones/pelicula/{peliculaId}")
    public ResponseEntity<List<FuncionResponse>> listarFuncionesPorPelicula(@PathVariable Long peliculaId) {
        return ResponseEntity.ok(funcionService.listarFuncionesFuturasPorPelicula(peliculaId));
    }
}
