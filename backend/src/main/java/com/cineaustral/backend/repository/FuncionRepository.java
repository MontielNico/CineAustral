package com.cineaustral.backend.repository;

import com.cineaustral.backend.entity.Funcion;
import com.cineaustral.backend.entity.Sala;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FuncionRepository extends JpaRepository<Funcion, Long> {

    @EntityGraph(attributePaths = {"pelicula", "sala"})
    List<Funcion> findAll();

    @EntityGraph(attributePaths = {"pelicula", "sala"})
    Optional<Funcion> findById(Long id);

    List<Funcion> findBySala(Sala sala);

    List<Funcion> findBySalaAndFechaHoraInicioBetween(
            Sala sala,
            LocalDateTime desde,
            LocalDateTime hasta);

    @EntityGraph(attributePaths = {"pelicula", "sala"})
    List<Funcion> findByPeliculaIdAndFechaHoraInicioAfter(Long peliculaId, LocalDateTime desde);
}
