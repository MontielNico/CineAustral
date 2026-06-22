package com.cineaustral.backend.service;

import com.cineaustral.backend.dto.asiento.AsientoEstadoRequest;
import com.cineaustral.backend.dto.asiento.AsientoResponse;
import com.cineaustral.backend.entity.Asiento;
import com.cineaustral.backend.entity.Reserva;
import com.cineaustral.backend.enums.AsientoEstado;
import com.cineaustral.backend.repository.AsientoRepository;
import com.cineaustral.backend.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AsientoService {

    private final AsientoRepository asientoRepository;
    private final ReservaRepository reservaRepository;
    private final ReservaService reservaService;

    @Transactional
    public AsientoResponse cambiarEstado(Long id, AsientoEstadoRequest request){
        Asiento asiento = asientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asiento no encontrado"));

        AsientoEstado nuevoEstado = AsientoEstado.valueOf(request.getAsientoEstado());
        asiento.setAsientoEstado(nuevoEstado);
        
        int reservasCanceladasCount = 0;
        if (nuevoEstado == AsientoEstado.MANTENIMIENTO) {
            List<Reserva> reservasAfectadas = reservaRepository.findActivasPorAsientoYFechaPosterior(id, LocalDateTime.now());
            if (!reservasAfectadas.isEmpty()) {
                reservasCanceladasCount = reservasAfectadas.size();
                reservaService.cancelarReservasPorFuerzaMayor(reservasAfectadas);
            }
        }

        asientoRepository.save(asiento);
        return new AsientoResponse(asiento.getId(), asiento.getFila(), asiento.getNumero(), asiento.getAsientoEstado().name(), reservasCanceladasCount);
    }
}
