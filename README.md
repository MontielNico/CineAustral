# 🎬 CineAustral — Sistema Integrado de Gestión de Cine

CineAustral es una plataforma web full-stack para la gestión integral de un complejo de cine de dos salas físicas, desarrollada con **Spring Boot**, **React** y persistencia en **Oracle Database**. El sistema permite a los clientes explorar la cartelera, seleccionar funciones y realizar la reserva de asientos en tiempo real, mientras proporciona a los administradores herramientas completas para la gestión de películas, programación de funciones, mantenimiento de salas y control de usuarios.

> 🗄️ **Base de Datos:** Oracle Database (compatible con Oracle 19c, 21c y 23ai / Oracle Database Free) con driver oficial `ojdbc11`.

---

## ⚡ Guía de Inicio Rápido con Docker (Para Evaluadores y Docentes)

### 📌 Requisito Previo Indispensable
Tener instalada la aplicación **Docker Desktop** en la computadora y asegurarse de que se encuentre **abierta y en ejecución** (ícono de la ballena verde en la barra de tareas de Windows/Mac).

---

### 🟢 Opción 1: Ejecución en 1 Clic con Scripts (Recomendado en Windows)

Si copió la carpeta al disco local de la computadora:
1. Haga doble clic en el archivo **`iniciar.bat`**.
   * El script verificará Docker, cargará las imágenes si vino el archivo `.tar` en el pendrive y levantará los contenedores de forma desatendida.
2. Una vez finalizado, abra su navegador en:  
   👉 **[http://localhost:3000](http://localhost:3000)**
3. Al terminar la evaluación, haga doble clic en **`detener.bat`** para apagar el sistema.

---

### 🔵 Opción 2: Ejecución Manual desde Terminal (PowerShell / CMD / Linux)

#### Caso A: Si dispone del archivo `cineaustral-imagenes.tar` (Modo Offline / Pendrive)
1. Abra una terminal en la carpeta donde copió el archivo `.tar` y cargue las imágenes:
   ```powershell
   docker load -i cineaustral-imagenes.tar
   ```
2. Ingrese a la carpeta del proyecto `CineAustral`:
   ```powershell
   cd CineAustral
   ```
3. Levante los contenedores:
   ```powershell
   docker compose up -d
   ```
4. Abra su navegador en **[http://localhost:3000](http://localhost:3000)**.

#### Caso B: Si prefiere compilar desde el código fuente (Modo Online)
1. Abra una terminal dentro de la carpeta `CineAustral`.
2. Ejecute:
   ```powershell
   docker compose up -d --build
   ```

---

### ⏳ Tiempo de Espera en el Primer Arranque (Muy Importante)
La base de datos **Oracle Database** requiere aproximadamente **30 a 45 segundos** en su primera inicialización para montar el PDB (`FREEPDB1`) y alcanzar el estado saludable (*healthy*).
* El contenedor del backend Spring Boot **espera automáticamente** a que Oracle esté 100% listo antes de iniciar gracias al *healthcheck* configurado en `docker-compose.yml`.
* Puede consultar el estado de los servicios en cualquier momento con:
  ```powershell
  docker compose ps
  ```
  *Los 3 contenedores deben figurar en estado `Up` / `healthy` (`cineaustral-oracle`, `cineaustral-backend`, `cineaustral-frontend`).*

---

## 🔑 Credenciales y Cuentas de Demostración

El sistema incluye un **`DataSeeder` automático** que inicializa la base de datos con las salas físicas (`Sala Lobo Marino` y `Sala Pingüino Magallanes`), 100 asientos por sala, películas con pósters y dos usuarios listos para evaluar:

| Rol | Email | Contraseña | Permisos y Alcance |
|---|---|---|---|
| **Administrador** | `admin@cineaustral.com` | `admin123` | Acceso completo al Panel de Control (`/admin`): catálogo de películas, integración TMDB, programación de funciones, inhabilitación de salas, mantenimiento de butacas individuales y control de roles de usuarios. |
| **Cliente** | `cliente@cineaustral.com` | `cliente123` | Consulta pública de cartelera, selección interactiva de butacas por sala y emisión/cancelación de reservas. |

* **Frontend Web:** [http://localhost:3000](http://localhost:3000)
* **Backend API REST:** [http://localhost:8080](http://localhost:8080)
* **Endpoint de prueba de salud:** [http://localhost:8080/ping](http://localhost:8080/ping)
* **Oracle Database Listener:** `localhost:1521` (PDB: `FREEPDB1`, Usuario: `cineaustral`, Contraseña: `1234`)

---

## 🧭 Módulos del Sistema

### 1. Experiencia del Cliente
* **Cartelera Dinámica:** Exploración de películas con pósters, sinopsis, duración, puntuación y clasificación.
* **Selección de Funciones:** Visualización de horarios y salas disponibles para cada película.
* **Mapa de Asientos Interactivo:** Representación visual de la sala con estados en tiempo real (Disponible, Ocupado, Mantenimiento) y selección dinámica de butacas.
* **Confirmación de Reserva:** Generación del comprobante de reserva con código único y cálculo automático de tarifas.

### 2. Panel de Administración
* **Resumen Operativo:** Métricas de recaudación total, entradas vendidas, ocupación promedio por sala, gráfico de tendencia de ventas (últimos 7 días) y registro de actividad reciente.
* **Gestión de Películas:** Altas, bajas y modificaciones con buscador integrado a la API oficial de **The Movie Database (TMDB)** para autocompletar sinopsis, duración, género y póster.
* **Cronograma de Funciones:** Planificación de proyecciones con validación de franjas horarias y detección de solapamientos. Gestión de estados (`Activa`, `Finalizada`, `Cancelada` con cancelación y reembolso en cascada).
* **Salas y Asientos:** Mantenimiento de salas físicas y gestión individual de butacas fuera de servicio.
* **Reservas y Ventas:** Auditoría general de reservas con buscador y filtros por estado.
* **Control de Usuarios:** Administración de cuentas y promoción o degradación de privilegios.

---

## 🔧 Resolución de Problemas Comunes (Troubleshooting)

1. **¿La página dice "No se puede conectar" o tarda en responder al login?**
   * Aguarde 30 segundos; la base de datos Oracle o Spring Boot pueden estar terminando de arrancar.
   * Verifique los logs en vivo del backend:
     ```powershell
     docker compose logs -f backend
     ```
2. **Error de puertos en conflicto (`Port already allocated`):**
   * Verifique que los puertos `3000`, `8080` y `1521` no estén ocupados por otros servidores o servicios locales (por ejemplo, otro Tomcat, servidor de desarrollo de React u Oracle local).
3. **¿Cómo reiniciar la base de datos limpia desde cero?**
   * Si realizó reservas de prueba y desea resetear todo al estado inicial del seeder:
     ```powershell
     docker compose down -v
     docker compose up -d
     ```
4. **¿Cómo apagar todos los contenedores al terminar la evaluación?**
     ```powershell
     docker compose down
     ```

---

## 🛠️ Stack Tecnológico y Arquitectura

* **Backend:** Java 21, Spring Boot 4, Spring Data JPA, Spring Security (HTTP Basic & Roles), Hibernate 7, Oracle JDBC Driver (`ojdbc11`), Lombok, Maven.
* **Frontend:** React 19, Vite, Tailwind CSS, Axios, Lucide React Icons.
* **Infraestructura:** Docker & Docker Compose, Nginx (Reverse Proxy & producción SPA), Contenedor oficial `gvenzl/oracle-free:latest`.
* **Arquitectura:** Arquitectura en capas desacopladas (Controller -> Service -> Repository), DTOs para aislamiento de dominio, manejo centralizado de excepciones y mapeo relacional estricto con `@EntityGraph` para evitar problemas de N+1 y Lazy Loading.
