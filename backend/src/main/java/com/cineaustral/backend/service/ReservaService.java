package com.cineaustral.backend.service;

import com.cineaustral.backend.dto.asiento.AsientoDisponibleResponse;
import com.cineaustral.backend.dto.reserva.DetalleReservaResponse;
import com.cineaustral.backend.dto.reserva.ReservaRequest;
import com.cineaustral.backend.dto.reserva.ReservaResponse;
import com.cineaustral.backend.entity.*;
import com.cineaustral.backend.enums.AsientoEstado;
import com.cineaustral.backend.enums.ReservaEstado;
import com.cineaustral.backend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final FuncionRepository funcionRepository;
    private final AsientoRepository asientoRepository;
    private final DetalleReservaRepository detalleRepository;
    private final UsuarioRepository usuarioRepository;
    private final ReservaRepository reservaRepository;

    public List<AsientoDisponibleResponse> getAsientosDisponibles(Long funcionId) {
        Funcion funcion = funcionRepository.findById(funcionId).orElseThrow();

        List<Asiento> todos = asientoRepository.findBySalaAndAsientoEstado(funcion.getSala(), AsientoEstado.DISPONIBLE);

        List<Asiento> ocupados = detalleRepository.
                findAsientosOcupadosByFuncion(funcion, ReservaEstado.ACTIVA);

        todos.removeAll(ocupados);

        return todos.stream()
                .map(a -> new AsientoDisponibleResponse(a.getId(), a.getFila(), a.getNumero()))
                .toList();
    }

    @Transactional
    public ReservaResponse crearReserva(ReservaRequest request) {
        Funcion funcion = funcionRepository.findById(request.getFuncionId()).orElseThrow();

        //Validación de asientos
        List<Asiento> asientos = asientoRepository.findAllById(request.getAsientoIds());
        List<Asiento> ocupados = detalleRepository.findAsientosOcupadosByFuncion(funcion, ReservaEstado.ACTIVA);

        boolean hayConflicto = asientos.stream().anyMatch(ocupados::contains);

        if (hayConflicto) throw new RuntimeException("Uno o más asientos ya están ocupados");

        //Calculo precio reserva
        BigDecimal total = funcion.getPrecioPorAsiento()
                .multiply(BigDecimal.valueOf(asientos.size()));

        //Crear reserva
        Reserva reserva = new Reserva();
        reserva.setFuncion(funcion);
        reserva.setFechaReserva(LocalDateTime.now());
        reserva.setPrecioTotal(total);
        reserva.setReservaEstado(ReservaEstado.ACTIVA);

        if (request.getClienteId() != null) {
            Usuario cliente = usuarioRepository.findById(request.getClienteId()).orElseThrow();
            reserva.setCliente(cliente);
        }

        List<DetalleReserva> detalles = asientos.stream()
                .map(a -> new DetalleReserva(reserva, a))
                .toList();
        reserva.setDetalles(detalles);

        Reserva guardada = reservaRepository.save(reserva);

        return reservaToResponse(guardada);
    }

    @Transactional
    public void cancelarReserva(Long reservaId, Long usuarioId) {
        Reserva reserva = reservaRepository.findById(reservaId).orElseThrow();

        if (reserva.getCliente() != null && !reserva.getCliente().getId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permiso para cancelar esta reserva");
        }

        if (reserva.getReservaEstado() == ReservaEstado.CANCELADA) {
            throw new RuntimeException("La reserva ya está cancelada");
        }

        reserva.setReservaEstado(ReservaEstado.CANCELADA);
    }

    private ReservaResponse reservaToResponse(Reserva reserva) {
        List<DetalleReservaResponse> detalles = reserva.getDetalles().stream()
                .map(d -> new DetalleReservaResponse(
                        d.getId(),
                        d.getAsiento().getFila(),
                        d.getAsiento().getNumero()
                ))
                .toList();

        String nombreCliente = reserva.getCliente() != null
                ? reserva.getCliente().getNombre()
                : "Venta presencial";

        return new ReservaResponse(
                reserva.getId(),
                reserva.getFechaReserva(),
                reserva.getPrecioTotal(),
                reserva.getReservaEstado().name(),
                detalles,
                nombreCliente
        );
    }
}
