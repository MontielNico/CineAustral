# 🎬 CineAustral — Sistema Integrado de Gestión de Cine

CineAustral es una plataforma web full-stack para la gestión integral de un complejo de cine. El sistema permite a los clientes explorar la cartelera, seleccionar funciones y realizar la reserva de entradas en tiempo real, mientras proporciona a los administradores herramientas completas para la gestión de películas, salas, asientos y funciones.

---

## 🚀 Características Principales

### 👤 Módulo de Clientes
* **Cartelera interactiva:** Consulta de películas en emisión y próximas funciones.
* **Reserva de entradas:** Selección visual de asientos disponibles por función.
* **Historial/Confirmación:** Gestión de reservas realizadas.

### 🛡️ Módulo de Administración
* **Gestión de Películas:** Alta, baja y modificación de catálogo (CRUD).
* **Gestión de Salas y Asientos:** Configuración de capacidad, tipos de sala y disposición de asientos.
* **Programación de Funciones:** Asignación de horarios, salas y tarifas por película.
* **Control de Usuarios:** Control de acceso mediante roles y permisos.

---

## 🛠️ Stack Tecnológico

### Backend
* **Lenguaje:** Java 21
* **Framework:** Spring Boot 4.1.0
* **Seguridad:** Spring Security
* **Persistencia:** Spring Data JPA / Hibernate
* **Base de Datos:** PostgreSQL
* **Gestor de Dependencias:** Maven
* **Librerías auxiliares:** Lombok

### Frontend
* **Biblioteca UI:** React
* **Estilos:** Tailwind CSS

---

## 🏛️ Arquitectura y Diseño

El backend sigue un patrón de **Arquitectura en Capas** que garantiza la separación de responsabilidades, la mantenibilidad y la escalabilidad del código:

1. **Controller Layer:** Exposición de endpoints RESTful y gestión de peticiones/respuestas HTTP.
2. **Service Layer:** Lógica de negocio pura, validaciones y reglas de dominio.
3. **Repository Layer:** Abstracción del acceso a datos mediante JPA/Hibernate.

### Patrones y Prácticas Utilizadas:
* **DTO (Data Transfer Objects):** Para aislar la capa de presentación de las entidades del dominio y proteger datos sensibles.
* **Manejo Centralizado de Excepciones:** Respuestas de error estandarizadas para la API.
* **Validación de Datos:** Validaciones en capa de DTOs antes de procesar solicitudes.
