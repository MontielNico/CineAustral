package com.cineaustral.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    public void eliminar(String imagenUrl) throws IOException {
        if (imagenUrl == null) return;
        Path archivo = Paths.get(imagenUrl.substring(1));
        Files.deleteIfExists(archivo);
    }

}
