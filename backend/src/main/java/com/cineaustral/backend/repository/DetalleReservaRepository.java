package com.cineaustral.backend.repository;

import com.cineaustral.backend.entity.Asiento;
import com.cineaustral.backend.entity.DetalleReserva;
import com.cineaustral.backend.entity.Funcion;
import com.cineaustral.backend.enums.ReservaEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleReservaRepository extends JpaRepository<DetalleReserva, Long> {
    @Query("""
    SELECT d.asiento FROM DetalleReserva d
    WHERE d.reserva.funcion = :funcion
    AND d.reserva.reservaEstado = :estado
    """)
    List<Asiento> findAsientosOcupadosByFuncion(
            @Param("funcion") Funcion funcion,
            @Param("estado") ReservaEstado estado
    );
}
