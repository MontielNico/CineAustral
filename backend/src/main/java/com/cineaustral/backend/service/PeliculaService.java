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
        if(imagen != null && !imagen.isEmpty()) {
            imagenUrl = imagenService.guardar(imagen);
        }
        Pelicula pelicula = Pelicula.builder()
                .titulo(request.getTitulo())
                .genero(request.getGenero())
                .sinopsis(request.getSinopsis())
                .duracionMinutos(request.getDuracionMinutos())
                .puntuacion(request.getPuntuacion())
                .imagenUrl(imagenUrl)
                .enCartelera(request.getEnCartelera() != null ? request.getEnCartelera() : true)
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
        if (request.getEnCartelera() != null) {
            pelicula.setEnCartelera(request.getEnCartelera());
        }
        if(imagen != null && !imagen.isEmpty()) {
            imagenService.eliminar(pelicula.getImagenUrl());
            pelicula.setImagenUrl(imagenService.guardar(imagen));
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
                pelicula.isEnCartelera()
        );
    }
}
