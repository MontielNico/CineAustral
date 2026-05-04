package com.cineaustral.backend.repository;

import com.cineaustral.backend.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservaRepository extends JpaRepository<Reserva, Long> {
}
