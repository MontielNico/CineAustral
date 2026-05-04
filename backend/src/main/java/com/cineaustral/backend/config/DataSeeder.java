// config/DataSeeder.java
package com.cineaustral.backend.config;

import com.cineaustral.backend.entity.Asiento;
import com.cineaustral.backend.entity.Sala;
import com.cineaustral.backend.enums.AsientoEstado;
import com.cineaustral.backend.enums.SalaEstado;
import com.cineaustral.backend.repository.SalaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SalaRepository salaRepository;

    @Override
    public void run(String... args) {
        if (salaRepository.count() == 0) {
            salaRepository.save(crearSala("Sala Lobo Marino"));
            salaRepository.save(crearSala("Sala Pingüino Magallanes"));
            System.out.println("✅ Salas y asientos creados correctamente");
        }
    }

    private Sala crearSala(String nombre) {
        Sala sala = Sala.builder()
                .nombre(nombre)
                .estado(SalaEstado.DISPONIBLE)
                .asientos(new ArrayList<>())
                .build();

        List<Asiento> asientos = new ArrayList<>();

        // Columna izquierda: filas B-F, asientos 1-4
        for (String fila : new String[]{"B", "C", "D", "E", "F"}) {
            for (int numero = 1; numero <= 4; numero++) {
                asientos.add(crearAsiento(fila, numero, sala));
            }
        }

        // Columna central: filas A-F, asientos 5-14
        for (String fila : new String[]{"A", "B", "C", "D", "E", "F"}) {
            for (int numero = 5; numero <= 14; numero++) {
                asientos.add(crearAsiento(fila, numero, sala));
            }
        }

        // Columna derecha: filas B-F, asientos 15-18
        for (String fila : new String[]{"B", "C", "D", "E", "F"}) {
            for (int numero = 15; numero <= 18; numero++) {
                asientos.add(crearAsiento(fila, numero, sala));
            }
        }

        sala.setAsientos(asientos);
        return sala;
    }

    private Asiento crearAsiento(String fila, int numero, Sala sala) {
        return Asiento.builder()
                .fila(fila)
                .numero(numero)
                .asientoEstado(AsientoEstado.DISPONIBLE)
                .sala(sala)
                .build();
    }
}