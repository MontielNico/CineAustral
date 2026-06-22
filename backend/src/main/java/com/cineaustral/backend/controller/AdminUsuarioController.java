package com.cineaustral.backend.controller;

import com.cineaustral.backend.dto.auth.RolRequest;
import com.cineaustral.backend.dto.auth.UsuarioResponse;
import com.cineaustral.backend.enums.UsuarioRol;
import com.cineaustral.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/usuarios")
@RequiredArgsConstructor
public class AdminUsuarioController {

    private final AuthService authService;

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios() {
        return ResponseEntity.ok(authService.listarUsuarios());
    }

    @PutMapping("/{id}/rol")
    public ResponseEntity<UsuarioResponse> cambiarRol(@PathVariable Long id, @RequestBody RolRequest request) {
        UsuarioRol rol = UsuarioRol.valueOf(request.getRol());
        return ResponseEntity.ok(authService.cambiarRol(id, rol));
    }
}
