package com.cineaustral.backend.repository;

import com.cineaustral.backend.entity.Sala;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaRepository extends JpaRepository<Sala, Long> {

    @EntityGraph(attributePaths = {"asientos"})
    List<Sala> findAll();

    @EntityGraph(attributePaths = {"asientos"})
    Optional<Sala> findById(Long id);
}
