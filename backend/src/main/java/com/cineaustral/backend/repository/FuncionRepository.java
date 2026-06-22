package com.cineaustral.backend.repository;

import com.cineaustral.backend.entity.Funcion;
import com.cineaustral.backend.entity.Sala;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FuncionRepository extends JpaRepository<Funcion, Long> {

    List<Funcion> findBySala(Sala sala);

    List<Funcion> findBySalaAndFechaHoraInicioBetween(
            Sala sala,
            LocalDateTime desde,
            LocalDateTime hasta);

    List<Funcion> findByPeliculaIdAndFechaHoraInicioAfter(Long peliculaId, LocalDateTime desde);
}
