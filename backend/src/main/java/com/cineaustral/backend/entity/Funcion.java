package com.cineaustral.backend.entity;

import com.cineaustral.backend.enums.FuncionEstado;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "funciones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Funcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FuncionEstado estado = FuncionEstado.ACTIVA;

    @Column(nullable = false)
    private LocalDateTime fechaHoraInicio;

    @Column(nullable = false)
    private int duracionMinutos;

    @Column(nullable = false)
    private BigDecimal precioPorAsiento;

    @Transient
    public LocalDateTime getFechaHoraFin() {
        return fechaHoraInicio.plusMinutes(duracionMinutos);
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pelicula_id", nullable = false)
    private Pelicula pelicula;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sala_id", nullable = false)
    private Sala sala;

}
