package com.cineaustral.backend.service;

import com.cineaustral.backend.dto.asiento.AsientoResponse;
import com.cineaustral.backend.dto.sala.SalaEstadoRequest;
import com.cineaustral.backend.dto.sala.SalaResponse;
import com.cineaustral.backend.entity.Sala;
import com.cineaustral.backend.enums.SalaEstado;
import com.cineaustral.backend.repository.SalaRepository;
import jakarta.persistence.Id;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SalaService {

    private final SalaRepository salaRepository;

    public List<SalaResponse> listarSalas(){
        return salaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public SalaResponse cambiarEstado(Integer id, SalaEstadoRequest request){
        Sala sala = salaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sala no encontrado"));
        sala.setEstado(SalaEstado.valueOf(request.getEstado()));
        return toResponse(salaRepository.save(sala));
    }

    private SalaResponse toResponse(Sala sala) {
        List<AsientoResponse> asientos = sala.getAsientos().stream()
                .map(a -> new AsientoResponse(a.getId(),a.getFila(), a.getNumero(), a.getAsientoEstado().name()))
                .toList();
        return new SalaResponse(sala.getId(), sala.getNombre(), sala.getEstado().name(), asientos);
    }
}
