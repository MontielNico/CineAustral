package com.cineaustral.backend.service;

import com.cineaustral.backend.dto.pelicula.PeliculaRequest;
import com.cineaustral.backend.dto.pelicula.PeliculaResponse;
import com.cineaustral.backend.entity.Pelicula;
import com.cineaustral.backend.repository.PeliculaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PeliculaService {

    private final PeliculaRepository peliculaRepository;
    private final ImagenService imagenService;

    public List<PeliculaResponse> listarPeliculas() {
        return peliculaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public PeliculaResponse obtenerPelicula(Long id) {
        return toResponse(peliculaRepository.findById(id).
                orElseThrow(()-> new RuntimeException("Pelicula no encontrada")));
    }

    public PeliculaResponse registrarPelicula(PeliculaRequest request, MultipartFile imagen) throws IOException {
        String imagenUrl = null;
        if (imagen != null && !imagen.isEmpty()) {
            // Prioridad 1: archivo subido manualmente
            imagenUrl = imagenService.guardar(imagen);
        } else if (request.getImagenUrlExterna() != null && !request.getImagenUrlExterna().isBlank()) {
            // Prioridad 2: URL externa (poster de TMDB) → se descarga y guarda localmente
            imagenUrl = imagenService.guardarDesdeUrl(request.getImagenUrlExterna());
        }
        Pelicula pelicula = Pelicula.builder()
                .titulo(request.getTitulo())
                .genero(request.getGenero())
                .sinopsis(request.getSinopsis())
                .duracionMinutos(request.getDuracionMinutos())
                .puntuacion(request.getPuntuacion())
                .imagenUrl(imagenUrl)
                .enCartelera(request.getEnCartelera() != null ? request.getEnCartelera() : true)
                .clasificacion(request.getClasificacion())
                .build();
        return toResponse(peliculaRepository.save(pelicula));
    }

    public PeliculaResponse actualizarPelicula(Long id, PeliculaRequest request, MultipartFile imagen) throws IOException {
        Pelicula pelicula = peliculaRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("Pelicula no encontrada"));

        pelicula.setTitulo(request.getTitulo());
        pelicula.setGenero(request.getGenero());
        pelicula.setSinopsis(request.getSinopsis());
        pelicula.setDuracionMinutos(request.getDuracionMinutos());
        pelicula.setPuntuacion(request.getPuntuacion());
        pelicula.setClasificacion(request.getClasificacion());
        if (request.getEnCartelera() != null) {
            pelicula.setEnCartelera(request.getEnCartelera());
        }
        if (imagen != null && !imagen.isEmpty()) {
            // Prioridad 1: archivo subido manualmente
            imagenService.eliminar(pelicula.getImagenUrl());
            pelicula.setImagenUrl(imagenService.guardar(imagen));
        } else if (request.getImagenUrlExterna() != null && !request.getImagenUrlExterna().isBlank()) {
            // Prioridad 2: URL externa (poster de TMDB)
            imagenService.eliminar(pelicula.getImagenUrl());
            pelicula.setImagenUrl(imagenService.guardarDesdeUrl(request.getImagenUrlExterna()));
        }
        return toResponse(peliculaRepository.save(pelicula));
    }

    public void eliminarPelicula(Long id) {
        peliculaRepository.deleteById(id);
    }

    //Convertir a responses
    private PeliculaResponse toResponse(Pelicula pelicula) {
        return new PeliculaResponse(
                pelicula.getId(),
                pelicula.getTitulo(),
                pelicula.getGenero(),
                pelicula.getSinopsis(),
                pelicula.getDuracionMinutos(),
                pelicula.getPuntuacion(),
                pelicula.getImagenUrl(),
                pelicula.isEnCartelera(),
                pelicula.getClasificacion()
        );
    }
}
