package com.cineaustral.backend.service;

import com.cineaustral.backend.dto.funcion.FuncionRequest;
import com.cineaustral.backend.dto.funcion.FuncionResponse;
import com.cineaustral.backend.entity.Funcion;
import com.cineaustral.backend.entity.Pelicula;
import com.cineaustral.backend.entity.Sala;
import com.cineaustral.backend.enums.FuncionEstado;
import com.cineaustral.backend.enums.ReservaEstado;
import com.cineaustral.backend.repository.FuncionRepository;
import com.cineaustral.backend.repository.PeliculaRepository;
import com.cineaustral.backend.repository.SalaRepository;
import com.cineaustral.backend.repository.ReservaRepository;
import com.cineaustral.backend.entity.Reserva;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FuncionService {

    private final FuncionRepository funcionRepository;
    private final PeliculaRepository peliculaRepository;
    private final SalaRepository salaRepository;
    private final ReservaRepository reservaRepository;

    public List<FuncionResponse> listarFunciones(){
        return funcionRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<FuncionResponse> listarFuncionesFuturasPorPelicula(Long peliculaId) {
        return funcionRepository.findByPeliculaIdAndFechaHoraInicioAfter(peliculaId, LocalDateTime.now()).stream()
                .filter(f -> f.getEstado() == FuncionEstado.ACTIVA)
                .map(this::toResponse)
                .toList();
    }

    public FuncionResponse obtenerFuncion(Long id){
        return toResponse(funcionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Funcion no encontrada")));
    }

    public FuncionResponse registrarFuncion(FuncionRequest request){
        Pelicula pelicula = peliculaRepository.findById(request.getPeliculaId())
                .orElseThrow(() -> new RuntimeException("Pelicula no encontrada"));

        if (!pelicula.isEnCartelera()) {
            throw new RuntimeException("La película no se encuentra en cartelera");
        }

        Sala sala = salaRepository.findById(request.getSalaId())
                .orElseThrow(() -> new RuntimeException("Sala no encontrada"));

        LocalDateTime inicio = LocalDateTime.parse(request.getFechaHoraInicio());

        validarFranjaHoraria(inicio, request.getDuracionMinutos());
        validarSuperposicion(sala, inicio, request.getDuracionMinutos(), null);

        Funcion funcion = Funcion.builder()
                .pelicula(pelicula)
                .sala(sala)
                .fechaHoraInicio(inicio)
                .duracionMinutos(request.getDuracionMinutos())
                .precioPorAsiento(request.getPrecioPorAsiento())
                .estado(FuncionEstado.ACTIVA)
                .build();

        return toResponse(funcionRepository.save(funcion));
    }

    @Transactional
    public void eliminarFuncion(Long id){
        Funcion funcion = funcionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Función no encontrada"));

        // Cambiar el estado de la funcion a CANCELADA
        funcion.setEstado(FuncionEstado.CANCELADA);
        funcionRepository.save(funcion);

        // Buscar todas las reservas asociadas y cambiarlas a CANCELADA
        List<Reserva> reservasAsociadas = reservaRepository.findByFuncion(funcion);
        for (Reserva reserva : reservasAsociadas) {
            reserva.setReservaEstado(ReservaEstado.CANCELADA);
            reservaRepository.save(reserva);
        }
    }

    //----------------Validaciones---------------------------------

    private void validarFranjaHoraria(LocalDateTime inicio, int duracionMinutos){
        int minutosInicio = inicio.getHour() * 60 + inicio.getMinute();
        int minutosFin = minutosInicio + duracionMinutos;

        if(minutosInicio < 18 * 60){
            throw new RuntimeException("Las funciones no pueden comenzar antes de las 18:00hs");
        }
        if(minutosFin > 24 * 60){
            throw new RuntimeException("Las funciones no pueden después de las 00:00hs");
        }
    }

    private void validarSuperposicion(Sala sala, LocalDateTime inicio, int duracionMinutos, Long idExcluir){
        LocalDateTime fin = inicio.plusMinutes(duracionMinutos);

        List<Funcion> funcionesDia = funcionRepository.findBySalaAndFechaHoraInicioBetween(
                sala,
                inicio.toLocalDate().atStartOfDay(),
                inicio.toLocalDate().atTime(23, 59, 59)
        );

        for(Funcion f : funcionesDia){
            if(idExcluir != null && f.getId().equals(idExcluir)) continue;
            if(f.getEstado() == FuncionEstado.CANCELADA) continue; // Si la funcion está cancelada, no se solapa

            LocalDateTime fInicio = f.getFechaHoraInicio();
            LocalDateTime fFin = f.getFechaHoraFin();

            boolean seSolapan = inicio.isBefore(fFin) && fin.isAfter(fInicio);
            if(seSolapan){
                throw new RuntimeException("Error: Ya existe una función en este horario");
            }
        }
    }

    //-----------------Mapper--------------------------------------
    private FuncionResponse toResponse(Funcion funcion){
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy'T'HH:mm:ss");
        return  new FuncionResponse(
                funcion.getId(),
                funcion.getPelicula().getTitulo(),
                funcion.getSala().getNombre(),
                funcion.getFechaHoraInicio().format(formatter),
                funcion.getFechaHoraFin().format(formatter),
                funcion.getDuracionMinutos(),
                funcion.getPrecioPorAsiento(),
                funcion.getEstado().name()
        );
    }
}
