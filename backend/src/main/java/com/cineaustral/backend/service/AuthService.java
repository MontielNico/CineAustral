package com.cineaustral.backend.service;

import com.cineaustral.backend.dto.auth.RegisterRequest;
import com.cineaustral.backend.dto.auth.UsuarioResponse;
import com.cineaustral.backend.entity.Usuario;
import com.cineaustral.backend.enums.UsuarioRol;
import com.cineaustral.backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder encoder;

    public UsuarioResponse register (RegisterRequest registerRequest) {
        if (usuarioRepository.findByEmail(registerRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email ya registrado");
        }
        Usuario usuario = Usuario.builder()
                .nombre(registerRequest.getNombre())
                .apellido(registerRequest.getApellido())
                .email(registerRequest.getEmail())
                .password(encoder.encode(registerRequest.getPassword()))
                .rol(UsuarioRol.CLIENTE)
                .build();
        usuarioRepository.save(usuario);
        return new UsuarioResponse(usuario.getId(), usuario.getNombre(), usuario.getApellido(), usuario.getEmail(), usuario.getRol().name());
    }

    public UsuarioResponse me(Usuario usuario) {
        return  new UsuarioResponse(usuario.getId(), usuario.getNombre(), usuario.getApellido(), usuario.getEmail(), usuario.getRol().name());
    }
}
