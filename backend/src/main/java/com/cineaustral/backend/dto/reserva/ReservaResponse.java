package com.cineaustral.backend.dto.reserva;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservaResponse {
    private Long id;
    private LocalDateTime fechaReserva;
    private BigDecimal precioTotal;
    private String reservaEstado;
    private List<DetalleReservaResponse> asientos;
    private String clienteNombre;
    private String clienteApellido;
    private String clienteEmail;
    private Long funcionId;
    private Long peliculaId;
    private String peliculaTitulo;
    private LocalDateTime fechaHoraInicio;
    private LocalDateTime fechaHoraFin;
    private String salaNombre;
}
