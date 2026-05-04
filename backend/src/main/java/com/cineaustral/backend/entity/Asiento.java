package com.cineaustral.backend.entity;

import com.cineaustral.backend.enums.AsientoEstado;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "asientos")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class Asiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fila; //A,B,C,D,E,F

    @Column(nullable = false)
    private int numero; //1-15

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AsientoEstado asientoEstado; // DISPONIBLE, MANTENIMIENTO

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sala_id", nullable = false)
    private Sala sala;
}
