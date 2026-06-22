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

    public List<AsientoDisponibleResponse> getAsientosDisponibles(Long funcionId, Long excluirReservaId) {
        Funcion funcion = funcionRepository.findById(funcionId).orElseThrow();

        List<Asiento> todos = asientoRepository.findBySalaAndAsientoEstado(funcion.getSala(), AsientoEstado.DISPONIBLE);

        List<Asiento> ocupados = detalleRepository.
                findAsientosOcupadosByFuncion(funcion, ReservaEstado.ACTIVA);

        if (excluirReservaId != null) {
            reservaRepository.findById(excluirReservaId).ifPresent(excluir -> {
                if (excluir.getFuncion().getId().equals(funcionId)) {
                    List<Asiento> asientosPropios = excluir.getDetalles().stream()
                            .map(DetalleReserva::getAsiento)
                            .toList();
                    List<Asiento> ocupadosEditables = new ArrayList<>(ocupados);
                    ocupadosEditables.removeAll(asientosPropios);
                    todos.removeAll(ocupadosEditables);
                } else {
                    todos.removeAll(ocupados);
                }
            });
        } else {
            todos.removeAll(ocupados);
        }

        return todos.stream()
                .map(a -> new AsientoDisponibleResponse(a.getId(), a.getFila(), a.getNumero()))
                .toList();
    }

    @Transactional
    public void cancelarReservasPorFuerzaMayor(List<Reserva> reservas) {
        for (Reserva r : reservas) {
            if (r.getReservaEstado() != ReservaEstado.CANCELADA) {
                r.setReservaEstado(ReservaEstado.CANCELADA);
                reservaRepository.save(r);
            }
        }
    }

    @Transactional
    public ReservaResponse crearReserva(ReservaRequest request) {
        Funcion funcion = funcionRepository.findById(request.getFuncionId()).orElseThrow();

        LocalDateTime ahora = LocalDateTime.now();
        if (funcion.getFechaHoraInicio().isBefore(ahora)) {
            throw new RuntimeException("La función ya ha comenzado o finalizado");
        }
        if (funcion.getFechaHoraInicio().isAfter(ahora.plusDays(7))) {
            throw new RuntimeException("Solo se pueden realizar reservas con hasta 7 días de anticipación");
        }

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

        if (reserva.getFuncion() != null && reserva.getFuncion().getFechaHoraInicio() != null) {
            if (LocalDateTime.now().isAfter(reserva.getFuncion().getFechaHoraInicio().minusMinutes(10))) {
                throw new RuntimeException("No se puede cancelar una reserva a menos de 10 minutos del inicio de la función");
            }
        }

        reserva.setReservaEstado(ReservaEstado.CANCELADA);
    }

    public List<ReservaResponse> getReservasByCliente(Long clienteId) {
        return reservaRepository.findByClienteIdOrderByFechaReservaDesc(clienteId).stream()
                .map(this::reservaToResponse)
                .toList();
    }

    @Transactional
    public ReservaResponse modificarReserva(Long reservaId, ReservaRequest request) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));

        if (reserva.getReservaEstado() == ReservaEstado.CANCELADA) {
            throw new RuntimeException("No se puede modificar una reserva cancelada");
        }

        if (reserva.getCliente() != null && !reserva.getCliente().getId().equals(request.getClienteId())) {
            throw new RuntimeException("No tienes permission para modificar esta reserva");
        }

        if (reserva.getFuncion() != null && reserva.getFuncion().getFechaHoraInicio() != null) {
            if (LocalDateTime.now().isAfter(reserva.getFuncion().getFechaHoraInicio().minusMinutes(10))) {
                throw new RuntimeException("No se puede modificar una reserva a menos de 10 minutos del inicio de la función");
            }
        }

        Funcion nuevaFuncion = funcionRepository.findById(request.getFuncionId())
                .orElseThrow(() -> new RuntimeException("Función no encontrada"));

        if (!nuevaFuncion.getPelicula().getId().equals(reserva.getFuncion().getPelicula().getId())) {
            throw new RuntimeException("La nueva función debe ser de la misma película");
        }

        LocalDateTime ahora = LocalDateTime.now();
        if (nuevaFuncion.getFechaHoraInicio().isBefore(ahora)) {
            throw new RuntimeException("La función ya ha comenzado o finalizado");
        }
        if (nuevaFuncion.getFechaHoraInicio().isAfter(ahora.plusDays(7))) {
            throw new RuntimeException("Solo se pueden realizar reservas con hasta 7 días de anticipación");
        }

        int cantidadAsientosOriginal = reserva.getDetalles().size();
        if (request.getAsientoIds().size() != cantidadAsientosOriginal) {
            throw new RuntimeException("Debe seleccionar exactamente la misma cantidad de asientos: " + cantidadAsientosOriginal);
        }

        List<Asiento> nuevosAsientos = asientoRepository.findAllById(request.getAsientoIds());
        List<Asiento> ocupados = detalleRepository.findAsientosOcupadosByFuncion(nuevaFuncion, ReservaEstado.ACTIVA);

        if (nuevaFuncion.getId().equals(reserva.getFuncion().getId())) {
            List<Asiento> asientosPropios = reserva.getDetalles().stream().map(DetalleReserva::getAsiento).toList();
            ocupados = new ArrayList<>(ocupados);
            ocupados.removeAll(asientosPropios);
        }

        boolean hayConflicto = nuevosAsientos.stream().anyMatch(ocupados::contains);
        if (hayConflicto) {
            throw new RuntimeException("Uno o más asientos ya están ocupados");
        }

        // Reemplazar los detalles de la reserva
        reserva.getDetalles().clear();
        reserva.setFuncion(nuevaFuncion);
        BigDecimal total = nuevaFuncion.getPrecioPorAsiento()
                .multiply(BigDecimal.valueOf(nuevosAsientos.size()));
        reserva.setPrecioTotal(total);

        List<DetalleReserva> nuevosDetalles = nuevosAsientos.stream()
                .map(a -> new DetalleReserva(reserva, a))
                .toList();
        reserva.getDetalles().addAll(nuevosDetalles);

        Reserva guardada = reservaRepository.save(reserva);
        return reservaToResponse(guardada);
    }

    public List<ReservaResponse> listarTodasLasReservas() {
        return reservaRepository.findAll().stream()
                .map(this::reservaToResponse)
                .toList();
    }

    @Transactional
    public void cancelarReservaPorAdmin(Long reservaId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        reserva.setReservaEstado(ReservaEstado.CANCELADA);
        reservaRepository.save(reserva);
    }

    @Transactional
    public void confirmarReservaPorAdmin(Long reservaId) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new RuntimeException("Reserva no encontrada"));
        reserva.setReservaEstado(ReservaEstado.ACTIVA);
        reservaRepository.save(reserva);
    }

    private ReservaResponse reservaToResponse(Reserva reserva) {
        List<DetalleReservaResponse> detalles = reserva.getDetalles().stream()
                .map(d -> new DetalleReservaResponse(
                        d.getId(),
                        d.getAsiento().getFila(),
                        d.getAsiento().getNumero()
                ))
                .toList();

        String clienteNombre = reserva.getCliente() != null ? reserva.getCliente().getNombre() : "Venta";
        String clienteApellido = reserva.getCliente() != null ? reserva.getCliente().getApellido() : "Presencial";
        String clienteEmail = reserva.getCliente() != null ? reserva.getCliente().getEmail() : "N/A";

        return new ReservaResponse(
                reserva.getId(),
                reserva.getFechaReserva(),
                reserva.getPrecioTotal(),
                reserva.getReservaEstado().name(),
                detalles,
                clienteNombre,
                clienteApellido,
                clienteEmail,
                reserva.getFuncion().getId(),
                reserva.getFuncion().getPelicula().getId(),
                reserva.getFuncion().getPelicula().getTitulo(),
                reserva.getFuncion().getFechaHoraInicio(),
                reserva.getFuncion().getFechaHoraFin(),
                reserva.getFuncion().getSala().getNombre()
        );
    }
}

