package com.cineaustral.backend.controller;

import com.cineaustral.backend.dto.reserva.ReservaResponse;
import com.cineaustral.backend.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/reservas")
@RequiredArgsConstructor
public class AdminReservaController {

    private final ReservaService reservaService;

    @GetMapping
    public ResponseEntity<List<ReservaResponse>> listarTodasLasReservas() {
        return ResponseEntity.ok(reservaService.listarTodasLasReservas());
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelarReservaPorAdmin(@PathVariable Long id) {
        reservaService.cancelarReservaPorAdmin(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/confirmar")
    public ResponseEntity<Void> confirmarReservaPorAdmin(@PathVariable Long id) {
        reservaService.confirmarReservaPorAdmin(id);
        return ResponseEntity.ok().build();
    }
}
