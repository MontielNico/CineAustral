package com.cineaustral.backend;

import com.cineaustral.backend.dto.reserva.ReservaRequest;
import com.cineaustral.backend.dto.reserva.ReservaResponse;
import com.cineaustral.backend.entity.*;
import com.cineaustral.backend.enums.ReservaEstado;
import com.cineaustral.backend.repository.*;

import com.cineaustral.backend.service.ReservaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservaServiceTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private FuncionRepository funcionRepository;

    @Mock
    private AsientoRepository asientoRepository;

    @Mock
    private DetalleReservaRepository detalleRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private ReservaService reservaService;

    @Test
    void tc01_reservaExitosa() {
        // Dado
        ReservaRequest request = new ReservaRequest();
        request.setFuncionId(1L);
        request.setAsientoIds(List.of(10L));
        request.setClienteId(5L);

        Funcion funcion = new Funcion();
        funcion.setId(1L);
        funcion.setFechaHoraInicio(LocalDateTime.now().plusDays(2));
        funcion.setPrecioPorAsiento(BigDecimal.valueOf(5000));
        
        Pelicula pelicula = new Pelicula();
        pelicula.setId(2L);
        pelicula.setTitulo("Inception");
        funcion.setPelicula(pelicula);
        
        Sala sala = new Sala();
        sala.setNombre("Sala 1");
        funcion.setSala(sala);

        Asiento asiento = new Asiento();
        asiento.setId(10L);
        asiento.setFila("A");
        asiento.setNumero(1);

        Usuario cliente = new Usuario();
        cliente.setId(5L);
        cliente.setNombre("Juan");

        Reserva reservaEsperada = new Reserva();
        reservaEsperada.setId(100L);
        reservaEsperada.setFuncion(funcion);
        reservaEsperada.setCliente(cliente);
        reservaEsperada.setReservaEstado(ReservaEstado.ACTIVA);
        reservaEsperada.setFechaReserva(LocalDateTime.now());
        reservaEsperada.setPrecioTotal(BigDecimal.valueOf(5000));
        
        List<DetalleReserva> detalles = new ArrayList<>();
        detalles.add(new DetalleReserva(reservaEsperada, asiento));
        reservaEsperada.setDetalles(detalles);

        when(funcionRepository.findById(1L)).thenReturn(Optional.of(funcion));
        when(asientoRepository.findAllById(List.of(10L))).thenReturn(List.of(asiento));
        when(detalleRepository.findAsientosOcupadosByFuncion(funcion, ReservaEstado.ACTIVA)).thenReturn(Collections.emptyList());
        when(usuarioRepository.findById(5L)).thenReturn(Optional.of(cliente));
        when(reservaRepository.save(any(Reserva.class))).thenReturn(reservaEsperada);

        // Cuando
        ReservaResponse resultado = reservaService.crearReserva(request);

        // Entonces
        assertNotNull(resultado);
        assertEquals(100L, resultado.getId());
        assertEquals("ACTIVA", resultado.getReservaEstado());
        assertEquals(BigDecimal.valueOf(5000), resultado.getPrecioTotal());
        verify(reservaRepository, times(1)).save(any(Reserva.class));
    }

    @Test
    void tc02_errorAsientoOcupado() {
        // Given
        ReservaRequest request = new ReservaRequest();
        request.setFuncionId(1L);
        request.setAsientoIds(List.of(10L));

        Funcion funcion = new Funcion();
        funcion.setId(1L);
        funcion.setFechaHoraInicio(LocalDateTime.now().plusDays(2));

        Asiento asiento = new Asiento();
        asiento.setId(10L);

        when(funcionRepository.findById(1L)).thenReturn(Optional.of(funcion));
        when(asientoRepository.findAllById(List.of(10L))).thenReturn(List.of(asiento));
        when(detalleRepository.findAsientosOcupadosByFuncion(funcion, ReservaEstado.ACTIVA))
                .thenReturn(List.of(asiento));

        // When & Then
        Exception exception = assertThrows(RuntimeException.class, () -> {
            reservaService.crearReserva(request);
        });

        assertEquals("Uno o más asientos ya están ocupados", exception.getMessage());
        verify(reservaRepository, never()).save(any(Reserva.class));
    }

    @Test
    @DisplayName("TC-03: Modificación exitosa de reserva a otra función disponible")
    void tc03_modificacionExitosa() {
        // Given
        Long reservaId = 100L;
        ReservaRequest request = new ReservaRequest();
        request.setFuncionId(2L);
        request.setAsientoIds(List.of(10L));
        request.setClienteId(5L);

        Pelicula pelicula = new Pelicula();
        pelicula.setId(30L);
        pelicula.setTitulo("Inception");

        Funcion funcionOriginal = new Funcion();
        funcionOriginal.setId(1L);
        funcionOriginal.setPelicula(pelicula);

        Usuario cliente = new Usuario();
        cliente.setId(5L);

        Reserva reservaOriginal = new Reserva();
        reservaOriginal.setId(reservaId);
        reservaOriginal.setReservaEstado(ReservaEstado.ACTIVA);
        reservaOriginal.setCliente(cliente);
        reservaOriginal.setFuncion(funcionOriginal);
        
        Asiento asientoOriginal = new Asiento();
        asientoOriginal.setId(15L);
        
        DetalleReserva detalleOriginal = new DetalleReserva(reservaOriginal, asientoOriginal);
        List<DetalleReserva> detallesModificables = new ArrayList<>();
        detallesModificables.add(detalleOriginal);
        reservaOriginal.setDetalles(detallesModificables);

        Funcion nuevaFuncion = new Funcion();
        nuevaFuncion.setId(2L);
        nuevaFuncion.setPelicula(pelicula);
        nuevaFuncion.setFechaHoraInicio(LocalDateTime.now().plusDays(2));
        nuevaFuncion.setPrecioPorAsiento(BigDecimal.valueOf(6000));
        
        Sala sala = new Sala();
        sala.setNombre("Sala 2");
        nuevaFuncion.setSala(sala);

        Asiento nuevoAsiento = new Asiento();
        nuevoAsiento.setId(10L);
        nuevoAsiento.setFila("B");
        nuevoAsiento.setNumero(5);

        when(reservaRepository.findById(reservaId)).thenReturn(Optional.of(reservaOriginal));
        when(funcionRepository.findById(2L)).thenReturn(Optional.of(nuevaFuncion));
        when(asientoRepository.findAllById(List.of(10L))).thenReturn(List.of(nuevoAsiento));
        when(detalleRepository.findAsientosOcupadosByFuncion(nuevaFuncion, ReservaEstado.ACTIVA)).thenReturn(Collections.emptyList());
        when(reservaRepository.save(any(Reserva.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        ReservaResponse resultado = reservaService.modificarReserva(reservaId, request);

        // Then
        assertNotNull(resultado);
        assertEquals(2L, resultado.getFuncionId());
        assertEquals(BigDecimal.valueOf(6000), resultado.getPrecioTotal());
        verify(reservaRepository, times(1)).save(reservaOriginal);
    }

    @Test
    void tc04_cancelacion() {
        // Dado
        Long reservaId = 100L;
        Long usuarioId = 5L;

        Usuario cliente = new Usuario();
        cliente.setId(usuarioId);

        Reserva reservaActiva = new Reserva();
        reservaActiva.setId(reservaId);
        reservaActiva.setReservaEstado(ReservaEstado.ACTIVA);
        reservaActiva.setCliente(cliente);

        when(reservaRepository.findById(reservaId)).thenReturn(Optional.of(reservaActiva));

        // Cuando
        reservaService.cancelarReserva(reservaId, usuarioId);

        // Entonces
        assertEquals(ReservaEstado.CANCELADA, reservaActiva.getReservaEstado());
    }
}