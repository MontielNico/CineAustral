package com.cineaustral.backend.repository;

import com.cineaustral.backend.entity.Asiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AsientoRepository extends JpaRepository<Asiento, Long> {
}
