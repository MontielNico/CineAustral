package com.cineaustral.backend.repository;

import com.cineaustral.backend.entity.Reserva;
import com.cineaustral.backend.entity.Funcion;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    @EntityGraph(attributePaths = {"funcion", "funcion.pelicula", "funcion.sala", "cliente", "detalles", "detalles.asiento"})
    List<Reserva> findAll();

    @EntityGraph(attributePaths = {"funcion", "funcion.pelicula", "funcion.sala", "cliente", "detalles", "detalles.asiento"})
    Optional<Reserva> findById(Long id);

    List<Reserva> findByFuncion(Funcion funcion);
    List<Reserva> findByFuncionIn(List<Funcion> funciones);

    @EntityGraph(attributePaths = {"funcion", "funcion.pelicula", "funcion.sala", "cliente", "detalles", "detalles.asiento"})
    List<Reserva> findByClienteIdOrderByFechaReservaDesc(Long clienteId);

    @Query("""
    SELECT DISTINCT r FROM Reserva r JOIN r.detalles d
    WHERE d.asiento.id = :asientoId
    AND r.reservaEstado = 'ACTIVA'
    AND r.funcion.fechaHoraInicio > :ahora
    """)
    List<Reserva> findActivasPorAsientoYFechaPosterior(
        @Param("asientoId") Long asientoId,
        @Param("ahora") LocalDateTime ahora
    );
}
