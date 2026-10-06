package com.cineaustral.backend.service;

import com.cineaustral.backend.dto.asiento.AsientoResponse;
import com.cineaustral.backend.dto.sala.SalaEstadoRequest;
import com.cineaustral.backend.dto.sala.SalaResponse;
import com.cineaustral.backend.entity.Sala;
import com.cineaustral.backend.enums.SalaEstado;
import com.cineaustral.backend.repository.SalaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

import com.cineaustral.backend.entity.Funcion;
import com.cineaustral.backend.entity.Reserva;
import com.cineaustral.backend.repository.FuncionRepository;
import com.cineaustral.backend.repository.ReservaRepository;
import java.time.LocalDateTime;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SalaService {

    private final SalaRepository salaRepository;
    private final FuncionRepository funcionRepository;
    private final ReservaRepository reservaRepository;
    private final ReservaService reservaService;

    public List<SalaResponse> listarSalas(){
        return salaRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SalaResponse cambiarEstado(Long id, SalaEstadoRequest request){
        Sala sala = salaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sala no encontrado"));
        
        SalaEstado nuevoEstado = SalaEstado.valueOf(request.getEstado());
        sala.setEstado(nuevoEstado);
        
        int reservasCanceladasCount = 0;
        if (nuevoEstado == SalaEstado.NO_DISPONIBLE && request.getFechaFinMantenimiento() != null) {
            LocalDateTime finMantenimiento = LocalDateTime.parse(request.getFechaFinMantenimiento());
            List<Funcion> funcionesAfectadas = funcionRepository.findBySalaAndFechaHoraInicioBetween(
                    sala, LocalDateTime.now(), finMantenimiento);
            
            if (!funcionesAfectadas.isEmpty()) {
                List<Reserva> reservasAfectadas = reservaRepository.findByFuncionIn(funcionesAfectadas);
                reservasCanceladasCount = (int) reservasAfectadas.stream()
                        .filter(r -> r.getReservaEstado() == com.cineaustral.backend.enums.ReservaEstado.ACTIVA)
                        .count();
                reservaService.cancelarReservasPorFuerzaMayor(reservasAfectadas);
            }
        }
        
        return toResponse(salaRepository.save(sala), reservasCanceladasCount);
    }

    private SalaResponse toResponse(Sala sala) {
        return toResponse(sala, 0);
    }

    private SalaResponse toResponse(Sala sala, int reservasCanceladasCount) {
        List<AsientoResponse> asientos = sala.getAsientos().stream()
                .map(a -> new AsientoResponse(a.getId(), a.getFila(), a.getNumero(), a.getAsientoEstado().name()))
                .toList();
        return new SalaResponse(sala.getId(), sala.getNombre(), sala.getEstado().name(), asientos, reservasCanceladasCount);
    }
}
