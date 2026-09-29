package com.cineaustral.backend.service;

import com.cineaustral.backend.dto.tmdb.TmdbBusquedaResult;
import com.cineaustral.backend.dto.tmdb.TmdbDetalleResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor
public class TmdbService {

    private static final String BASE_URL        = "https://api.themoviedb.org/3";
    private static final String IMAGE_BASE_URL  = "https://image.tmdb.org/t/p/w500";
    private static final String LANGUAGE        = "es-AR";

    @Value("${tmdb.api.key}")
    private String apiKey;

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Busca películas por título en TMDB y devuelve resultados básicos.
     */
    public List<TmdbBusquedaResult> buscar(String query) {
        try {
            String json = restClient.get()
                    .uri(BASE_URL + "/search/movie?query={q}&language={lang}&api_key={key}",
                            query, LANGUAGE, apiKey)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(json);
            JsonNode results = root.path("results");

            List<TmdbBusquedaResult> lista = new ArrayList<>();
            for (JsonNode node : results) {
                String posterPath = node.path("poster_path").asText(null);
                lista.add(new TmdbBusquedaResult(
                        node.path("id").asInt(),
                        node.path("title").asText(""),
                        node.path("overview").asText(""),
                        posterPath != null ? IMAGE_BASE_URL + posterPath : null,
                        node.path("vote_average").asDouble(0.0),
                        node.path("release_date").asText("")
                ));
            }
            return lista;

        } catch (Exception e) {
            throw new RuntimeException("Error al consultar TMDB: " + e.getMessage(), e);
        }
    }

    /**
     * Obtiene el detalle completo de una película por su ID de TMDB,
     * incluyendo duración y géneros.
     */
    public TmdbDetalleResponse obtenerDetalle(int tmdbId) {
        try {
            String json = restClient.get()
                    .uri(BASE_URL + "/movie/{id}?language={lang}&api_key={key}",
                            tmdbId, LANGUAGE, apiKey)
                    .retrieve()
                    .body(String.class);

            JsonNode node = objectMapper.readTree(json);

            // Unir géneros con " / "
            String generos = StreamSupport.stream(node.path("genres").spliterator(), false)
                    .map(g -> g.path("name").asText())
                    .collect(Collectors.joining(" / "));

            String posterPath = node.path("poster_path").asText(null);

            return new TmdbDetalleResponse(
                    node.path("id").asInt(),
                    node.path("title").asText(""),
                    node.path("overview").asText(""),
                    posterPath != null ? IMAGE_BASE_URL + posterPath : null,
                    node.path("vote_average").asDouble(0.0),
                    node.path("runtime").asInt(0),
                    generos
            );

        } catch (Exception e) {
            throw new RuntimeException("Error al obtener detalle de TMDB: " + e.getMessage(), e);
        }
    }
}
