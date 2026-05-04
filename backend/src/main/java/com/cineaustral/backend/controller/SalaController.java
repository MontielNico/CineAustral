package com.cineaustral.backend.controller;

import com.cineaustral.backend.dto.sala.SalaEstadoRequest;
import com.cineaustral.backend.dto.sala.SalaResponse;
import com.cineaustral.backend.service.SalaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/salas")
@RequiredArgsConstructor
public class SalaController {

    private final SalaService salaService;

    @GetMapping
    public ResponseEntity<List<SalaResponse>> listarSalas() {
        return ResponseEntity.ok(salaService.listarSalas());
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<SalaResponse> cambiarEstado(@PathVariable Long id, @RequestBody SalaEstadoRequest estado) {
        return ResponseEntity.ok(salaService.cambiarEstado(id, estado));
    }

}
