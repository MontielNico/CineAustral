// config/DataSeeder.java
package com.cineaustral.backend.config;

import com.cineaustral.backend.entity.*;
import com.cineaustral.backend.enums.AsientoEstado;
import com.cineaustral.backend.enums.FuncionEstado;
import com.cineaustral.backend.enums.SalaEstado;
import com.cineaustral.backend.enums.UsuarioRol;
import com.cineaustral.backend.repository.FuncionRepository;
import com.cineaustral.backend.repository.PeliculaRepository;
import com.cineaustral.backend.repository.SalaRepository;
import com.cineaustral.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final SalaRepository salaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PeliculaRepository peliculaRepository;
    private final FuncionRepository funcionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Sembrar Salas y Asientos
        Sala salaLobo;
        Sala salaPinguino;
        if (salaRepository.count() == 0) {
            salaLobo = salaRepository.save(crearSala("Sala Lobo Marino"));
            salaPinguino = salaRepository.save(crearSala("Sala Pingüino Magallanes"));
            System.out.println("✅ Salas y asientos creados correctamente");
        } else {
            List<Sala> salas = salaRepository.findAll();
            salaLobo = salas.get(0);
            salaPinguino = salas.size() > 1 ? salas.get(1) : salas.get(0);
        }

        // 2. Sembrar Usuarios por defecto (Admin y Cliente para recruiters)
        if (usuarioRepository.count() == 0) {
            Usuario admin = Usuario.builder()
                    .nombre("Admin")
                    .apellido("CineAustral")
                    .email("admin@cineaustral.com")
                    .password(passwordEncoder.encode("admin123"))
                    .rol(UsuarioRol.ADMIN)
                    .build();
            usuarioRepository.save(admin);

            Usuario cliente = Usuario.builder()
                    .nombre("Juan")
                    .apellido("Pérez")
                    .email("cliente@cineaustral.com")
                    .password(passwordEncoder.encode("cliente123"))
                    .rol(UsuarioRol.CLIENTE)
                    .build();
            usuarioRepository.save(cliente);

            System.out.println("✅ Usuarios de demostración creados: admin@cineaustral.com / cliente@cineaustral.com");
        }

        // 3. Sembrar Películas y Funciones iniciales
        if (peliculaRepository.count() == 0) {
            Pelicula peli1 = Pelicula.builder()
                    .titulo("El Gran Truco")
                    .genero("Misterio / Drama")
                    .sinopsis("En el Londres de finales del siglo XIX, dos magos rivales se obsesionan por crear el truco definitivo.")
                    .duracionMinutos(130)
                    .puntuacion(8.5)
                    .clasificacion("+13")
                    .imagenUrl("/uploads/imagenes/b2288627-6f65-4199-b288-db1ec6bdd3ed_Prestige_poster.jpg")
                    .enCartelera(true)
                    .build();
            peli1 = peliculaRepository.save(peli1);

            Pelicula peli2 = Pelicula.builder()
                    .titulo("Pulp Fiction")
                    .genero("Suspense / Crimen / Comedia")
                    .sinopsis("Jules y Vincent, dos asesinos a sueldo con muy pocas luces, trabajan para Marsellus Wallace. Vincent le confiesa a Jules que Marsellus le ha pedido que cuide de Mia, su mujer. Jules le recomienda prudencia porque es muy peligroso sobrepasarse con la novia del jefe. Cuando llega la hora de trabajar, ambos deben ponerse manos a la obra. Su misión: recuperar un misterioso maletín.")
                    .duracionMinutos(148)
                    .puntuacion(8.8)
                    .clasificacion("+13")
                    .imagenUrl("/uploads/imagenes/1e2aa60a-a636-4e53-b388-281bdcc6c651_p15684_p_v8_ai.jpg")
                    .enCartelera(true)
                    .build();
            peli2 = peliculaRepository.save(peli2);

            // Funciones para mañana
            LocalDate manana = LocalDate.now().plusDays(1);
            Funcion func1 = Funcion.builder()
                    .pelicula(peli1)
                    .sala(salaLobo)
                    .fechaHoraInicio(LocalDateTime.of(manana, LocalTime.of(18, 30)))
                    .duracionMinutos(peli1.getDuracionMinutos())
                    .precioPorAsiento(BigDecimal.valueOf(4500))
                    .estado(FuncionEstado.ACTIVA)
                    .build();
            funcionRepository.save(func1);

            Funcion func2 = Funcion.builder()
                    .pelicula(peli2)
                    .sala(salaPinguino)
                    .fechaHoraInicio(LocalDateTime.of(manana, LocalTime.of(21, 15)))
                    .duracionMinutos(peli2.getDuracionMinutos())
                    .precioPorAsiento(BigDecimal.valueOf(5000))
                    .estado(FuncionEstado.ACTIVA)
                    .build();
            funcionRepository.save(func2);

            System.out.println("✅ Películas y funciones de demostración creadas correctamente");
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