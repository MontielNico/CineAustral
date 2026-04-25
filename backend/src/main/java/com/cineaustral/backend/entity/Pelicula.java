package com.cineaustral.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "peliculas")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Pelicula {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    private String genero;
    private String sinopsis;

    @Column(nullable = false)
    private int duracionMinutos;
    private Double puntuacion;
}
