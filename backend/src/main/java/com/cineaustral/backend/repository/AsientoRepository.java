package com.cineaustral.backend.repository;

import com.cineaustral.backend.entity.Asiento;
import com.cineaustral.backend.entity.Sala;
import com.cineaustral.backend.enums.AsientoEstado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AsientoRepository extends JpaRepository<Asiento, Long> {
    List<Asiento> findBySalaAndAsientoEstado(Sala sala, AsientoEstado asientoEstado);
}
