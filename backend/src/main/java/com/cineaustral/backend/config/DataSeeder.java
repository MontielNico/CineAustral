// config/DataSeeder.java
package com.cineaustral.backend.config;

import com.cineaustral.backend.entity.Sala;
import com.cineaustral.backend.enums.SalaEstado;
import com.cineaustral.backend.repository.SalaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SalaRepository salaRepository;

    @Override
    public void run(String... args) {
        if (salaRepository.count() == 0) {
            salaRepository.saveAll(List.of(
                   Sala.builder()
                           .nombre("Sala Lobo Marino")
                           .estado(SalaEstado.DISPONIBLE)
                           .asientos(new java.util.ArrayList<>())
                           .build(),
                    Sala.builder()
                            .nombre("Sala Pingüino Magallanes")
                            .estado(SalaEstado.DISPONIBLE)
                            .asientos(new java.util.ArrayList<>())
                            .build()
            ));
            System.out.println("✅ Salas creadas correctamente");
        }
    }
}