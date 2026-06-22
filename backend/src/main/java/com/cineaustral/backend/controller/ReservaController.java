package com.cineaustral.backend.controller;

import com.cineaustral.backend.dto.asiento.AsientoDisponibleResponse;
import com.cineaustral.backend.dto.reserva.ReservaRequest;
import com.cineaustral.backend.dto.reserva.ReservaResponse;
import com.cineaustral.backend.service.ReservaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
@RequiredArgsConstructor
public class ReservaController {

    private final ReservaService reservaService;

    @GetMapping("/disponibles/{funcionId}")
    public ResponseEntity<List<AsientoDisponibleResponse>> getAsientosDisponibles(
            @PathVariable Long funcionId,
            @RequestParam(required = false) Long excluirReservaId) {
        return ResponseEntity.ok(reservaService.getAsientosDisponibles(funcionId, excluirReservaId));
    }

    @PostMapping("/online")
    public ResponseEntity<ReservaResponse> crearReservaOnline(
            @RequestBody ReservaRequest request) {
        return ResponseEntity.ok(reservaService.crearReserva(request));
    }

    @PostMapping("/presencial")
    public ResponseEntity<ReservaResponse> crearReservaPresencial(
            @RequestBody ReservaRequest request) {
        request.setClienteId(null); // ignoramos el clienteId aunque venga
        return ResponseEntity.ok(reservaService.crearReserva(request));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<ReservaResponse>> getReservasByCliente(
            @PathVariable Long clienteId) {
        return ResponseEntity.ok(reservaService.getReservasByCliente(clienteId));
    }

    @PutMapping("/{reservaId}")
    public ResponseEntity<ReservaResponse> modificarReserva(
            @PathVariable Long reservaId,
            @RequestBody ReservaRequest request) {
        return ResponseEntity.ok(reservaService.modificarReserva(reservaId, request));
    }

    @PutMapping("/{reservaId}/cancelar")
    public ResponseEntity<Void> cancelarReserva(
            @PathVariable Long reservaId,
            @RequestParam Long clienteId) {
        reservaService.cancelarReserva(reservaId, clienteId);
        return ResponseEntity.ok().build();
    }
}