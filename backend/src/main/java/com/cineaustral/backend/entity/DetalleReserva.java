package com.cineaustral.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table()
@Getter @Setter
@NoArgsConstructor
public class DetalleReserva {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Reserva reserva;

    @ManyToOne
    private Asiento asiento;

    public DetalleReserva(Reserva reserva, Asiento asiento) {
        this.reserva = reserva;
        this.asiento = asiento;
    }
}
