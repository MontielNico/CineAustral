package com.cineaustral.backend.controller;

import com.cineaustral.backend.dto.asiento.AsientoEstadoRequest;
import com.cineaustral.backend.dto.asiento.AsientoResponse;
import com.cineaustral.backend.service.AsientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/asientos")
public class AsientoController {
    
    private final AsientoService asientoService;

    @PutMapping("/{id}/estado")
    public ResponseEntity<AsientoResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestBody AsientoEstadoRequest request){
        return ResponseEntity.ok(asientoService.cambiarEstado(id, request));
    }
}
