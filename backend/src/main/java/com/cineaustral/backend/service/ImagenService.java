package com.cineaustral.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ImagenService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String guardar(MultipartFile archivo) throws IOException {
        Path carpeta = Paths.get(uploadDir);
        if (!Files.exists(carpeta)) {
            Files.createDirectories(carpeta);
        }

        String nombreArchivo = UUID.randomUUID() + "_" + archivo.getOriginalFilename();
        Path destino = carpeta.resolve(nombreArchivo);
        archivo.transferTo(destino);

        return "/" + uploadDir + "/" + nombreArchivo;
    }

    /**
     * Descarga una imagen desde una URL externa (ej: poster de TMDB)
     * y la guarda localmente con el mismo esquema que un upload normal.
     */
    public String guardarDesdeUrl(String url) throws IOException {
        Path carpeta = Paths.get(uploadDir);
        if (!Files.exists(carpeta)) {
            Files.createDirectories(carpeta);
        }

        // Extraer extensión de la URL (ej: .jpg)
        String extension = url.contains(".") ? url.substring(url.lastIndexOf('.')) : ".jpg";
        String nombreArchivo = UUID.randomUUID() + "_tmdb" + extension;
        Path destino = carpeta.resolve(nombreArchivo);

        try (InputStream in = URI.create(url).toURL().openStream()) {
            Files.copy(in, destino, StandardCopyOption.REPLACE_EXISTING);
        }

        return "/" + uploadDir + "/" + nombreArchivo;
    }

    public void eliminar(String imagenUrl) throws IOException {
        if (imagenUrl == null) return;
        Path archivo = Paths.get(imagenUrl.substring(1));
        Files.deleteIfExists(archivo);
    }

}
