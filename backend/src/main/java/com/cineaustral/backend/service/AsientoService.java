package com.cineaustral.backend.service;

import com.cineaustral.backend.dto.asiento.AsientoEstadoRequest;
import com.cineaustral.backend.dto.asiento.AsientoResponse;
import com.cineaustral.backend.entity.Asiento;
import com.cineaustral.backend.enums.AsientoEstado;
import com.cineaustral.backend.repository.AsientoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AsientoService {

    private final AsientoRepository asientoRepository;

    public AsientoResponse cambiarEstado(Long id, AsientoEstadoRequest request){
        Asiento asiento = asientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asiento no encontrado"));

        asiento.setAsientoEstado(AsientoEstado.valueOf(request.getAsientoEstado()));
        asientoRepository.save(asiento);
        return new AsientoResponse(asiento.getId(), asiento.getFila(), asiento.getNumero(), asiento.getAsientoEstado().name());
    }
}
