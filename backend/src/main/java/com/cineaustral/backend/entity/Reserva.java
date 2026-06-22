package com.cineaustral.backend.entity;

import com.cineaustral.backend.enums.ReservaEstado;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "reservas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime fechaReserva;

    @Column(nullable = false)
    private BigDecimal precioTotal;

    @Enumerated(EnumType.STRING)
    private ReservaEstado reservaEstado; //ACTIVA, CANCELADA

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "reserva", orphanRemoval = true)
    private List<DetalleReserva> detalles;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "funcion_id",  nullable = false)
    private Funcion funcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Usuario cliente;


}
