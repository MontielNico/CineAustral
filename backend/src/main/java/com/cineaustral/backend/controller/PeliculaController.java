package com.cineaustral.backend.controller;

import com.cineaustral.backend.dto.pelicula.PeliculaRequest;
import com.cineaustral.backend.dto.pelicula.PeliculaResponse;
import com.cineaustral.backend.entity.Pelicula;
import com.cineaustral.backend.service.PeliculaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/peliculas")
public class PeliculaController {

    private final PeliculaService peliculaService;

    @GetMapping
    public ResponseEntity<List<PeliculaResponse>> listarPeliculas() {
        return ResponseEntity.ok(peliculaService.listarPeliculas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PeliculaResponse> obtenerPelicula(@PathVariable Long id) {
        return ResponseEntity.ok(peliculaService.obtenerPelicula(id));
    }

    @PostMapping
    public ResponseEntity<PeliculaResponse> registrarPelicula(@RequestPart("pelicula") PeliculaRequest request, @RequestPart(value = "imagen", required = false) MultipartFile imagen) throws IOException {
        return ResponseEntity.ok(peliculaService.registrarPelicula(request, imagen));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PeliculaResponse> actualizarPelicula(
            @PathVariable Long id,
            @RequestPart("pelicula") PeliculaRequest request,
            @RequestPart("imagen")  MultipartFile imagen) throws IOException {
        return ResponseEntity.ok(peliculaService.actualizarPelicula(id, request, imagen));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>  eliminarPelicula(@PathVariable Long id) {
        peliculaService.eliminarPelicula(id);
        return ResponseEntity.noContent().build();
    }

}
