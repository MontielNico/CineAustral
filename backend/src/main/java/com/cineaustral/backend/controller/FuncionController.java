package com.cineaustral.backend.controller;

import com.cineaustral.backend.dto.funcion.FuncionRequest;
import com.cineaustral.backend.dto.funcion.FuncionResponse;
import com.cineaustral.backend.service.FuncionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/funciones")
@RequiredArgsConstructor
public class FuncionController {

    private final FuncionService funcionService;

    @GetMapping
    public ResponseEntity<List<FuncionResponse>> obtenerFunciones() {
        return ResponseEntity.ok(funcionService.listarFunciones());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FuncionResponse> obtenerFuncion(@PathVariable Long id) {
        return ResponseEntity.ok(funcionService.obtenerFuncion(id));
    }

    @PostMapping
    public ResponseEntity<FuncionResponse> registrrarFuncion(@RequestBody FuncionRequest request) {
        return ResponseEntity.ok(funcionService.registrarFuncion(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarFuncion(@PathVariable Long id) {
        funcionService.eliminarFuncion(id);
        return ResponseEntity.noContent().build();
    }
}

