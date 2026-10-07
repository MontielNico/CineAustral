# 🎬 CineAustral — Sistema Integral de Gestión Cinematográfica y Reservas en Tiempo Real

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21" />
  <img src="https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot 4" />
  <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Oracle_Database-23c_Free-F80000?style=for-the-badge&logo=oracle&logoColor=white" alt="Oracle Database" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

---

## 📖 Descripción General

**CineAustral** es una plataforma web full-stack de alto rendimiento diseñada para la administración integral y venta de entradas de un complejo de cine comercial de múltiples salas. Combina una experiencia de usuario interactiva y fluida con una arquitectura de backend empresarial robusta, desacoplada y orientada al cumplimiento estricto de reglas de negocio en tiempo real.

El proyecto modela el ecosistema completo de un complejo cinematográfico patagónico de dos salas físicas (**Sala Lobo Marino** y **Sala Pingüino Magallanes**), permitiendo a los clientes explorar la cartelera, consultar funciones y reservar butacas en un plano interactivo. A su vez, provee un **Panel de Control Administrativo** con analíticas en tiempo real, integración automática con la API oficial de **The Movie Database (TMDB)**, programación de funciones sin solapamiento y mantenimiento de butacas.

> 🎓 **Contexto Académico:** Proyecto desarrollado para la cátedra de *Ingeniería de Software* — Licenciatura en Informática (UNPSJB).  
> 👤 **Autor:** Ignacio Nicolás Montiel Ruiz.

---

## 📑 Tabla de Contenidos

1. [⚡ Despliegue con Docker (Linux y Windows)](#-despliegue-con-docker)
   - [Requisitos Previos](#requisitos-previos)
   - [Paso 1: Obtención del Código (Git o Descarga .ZIP)](#paso-1-obtención-del-código-git-o-descarga-zip)
   - [Paso 2 (Linux / macOS): Despliegue con Docker](#-paso-2-linux--macos-despliegue-con-docker)
   - [Paso 2 (Windows): Despliegue con Docker](#-paso-2-windows-despliegue-con-docker)
   - [Comandos Útiles de Control](#-comandos-útiles-de-control)
   - [Tiempo de Espera en el Primer Arranque (Oracle 23c)](#-tiempo-de-espera-en-el-primer-arranque)
2. [🔑 Accesos y Cuentas de Demostración](#-accesos-y-cuentas-de-demostración)

3. [🔧 Resolución de Problemas (Troubleshooting)](#-resolución-de-problemas-troubleshooting)

---

## ⚡ Despliegue con Docker

El sistema está completamente contenedorizado con **Docker Compose**, lo que permite levantar todo el entorno (Base de datos **Oracle 23c**, API **Spring Boot** y Frontend **React + Nginx**) mediante la línea de comandos en cualquier sistema operativo sin necesidad de instalar Java, Maven o Node localmente.

### Requisitos Previos

- **Docker y Docker Compose v2** instalados:
  - En **Linux:** Docker Engine + Docker Compose Plugin (`docker compose version`).
  - En **Windows / macOS:** Descargar [Docker Desktop](https://www.docker.com/products/docker-desktop/) y asegurarse de que se encuentre en ejecución (ícono de la ballena verde activo).
- Puertos disponibles en la máquina anfitriona: `3000` (Frontend), `8080` (Backend API) y `1521` (Oracle DB).

---

### Paso 1: Obtención del Código (Git o Descarga .ZIP)

Puede obtener el proyecto mediante cualquiera de las siguientes dos opciones:

#### 🔹 Opción A: Clonar con Git (Recomendado)
Abra su terminal y clone el repositorio:
```bash
git clone https://github.com/MontielNico/CineAustral.git
cd CineAustral
```

#### 🔹 Opción B: Descargar como Archivo .ZIP (Sin Git)
1. En la parte superior de esta página de GitHub, haga clic en el botón verde **`< > Code`**.
2. Seleccione la opción **`Download ZIP`** y guarde el archivo comprimido en su computadora.
3. Descomprima el archivo `.zip`.
4. Abra una terminal situada dentro de la carpeta descomprimida (`CineAustral` o `CineAustral-Main`):
   - **En Windows:** Presione `Shift + Clic derecho` en un espacio en blanco dentro de la carpeta y elija *"Abrir en Terminal"* (o *"Abrir ventana de PowerShell aquí"*).
   - **En Linux / macOS:** Haga clic derecho dentro de la carpeta y seleccione *"Abrir en una terminal"* (o use el comando `cd /ruta/a/CineAustral`).

---

### 🐧 Paso 2 (Linux / macOS): Despliegue con Docker

Una vez ubicado en la carpeta del proyecto desde su terminal (Bash / Zsh), ejecute:

```bash
# 1. Compilar imágenes y levantar contenedores en segundo plano
docker compose up -d --build

# 2. Verificar que los servicios estén activos
docker compose ps
```

Abra su navegador web en:  
👉 **[http://localhost:3000](http://localhost:3000)**

Para detener la aplicación al finalizar:
```bash
docker compose down
```

> [!TIP]
> En distribuciones Linux, si no tiene configurado Docker para ejecutarse sin privilegios de superusuario, anteponga `sudo` a los comandos de `docker compose` o agregue su usuario al grupo: `sudo usermod -aG docker $USER`.

---

### 🪟 Paso 2 (Windows): Despliegue con Docker

Una vez ubicado en la carpeta del proyecto desde su terminal (**PowerShell** o **Símbolo del sistema / CMD**), ejecute:

```powershell
# 1. Compilar imágenes y levantar contenedores en segundo plano
docker compose up -d --build

# 2. Comprobar el estado de los contenedores
docker compose ps
```

Abra su navegador web en:  
👉 **[http://localhost:3000](http://localhost:3000)**

Para detener los servicios al terminar la evaluación:
```powershell
docker compose down
```

---

### 📋 Comandos Útiles de Control

Tanto en Linux como en Windows, puede gestionar el ciclo de vida del sistema con los siguientes comandos estándar:

| Acción | Comando |
|---|---|
| **Ver logs en vivo del backend** | `docker compose logs -f backend` |
| **Ver logs de la base de datos** | `docker compose logs -f oracle-db` |
| **Consultar estado y salud de los contenedores** | `docker compose ps` |
| **Detener todos los servicios preservando datos** | `docker compose down` |
| **Reiniciar la base de datos limpia desde cero** | `docker compose down -v && docker compose up -d --build` |

---

### ⏳ Tiempo de Espera en el Primer Arranque

La primera vez que se inicia el contenedor de **Oracle Database Free 23c**, el motor requiere aproximadamente **30 a 45 segundos** para inicializar el Pluggable Database (`FREEPDB1`) y preparar el esquema de datos.

* **Sincronización Inteligente:** El contenedor del backend Spring Boot (`cineaustral-backend`) implementa una política `depends_on` con comprobación de salud (`condition: service_healthy`), por lo que **esperará de forma autónoma** a que Oracle alcance el estado saludable antes de arrancar.
* Al ejecutar `docker compose ps`, observará el estado de los tres servicios:
  ```text
  NAME                  IMAGE                       STATUS                   PORTS
  cineaustral-oracle    gvenzl/oracle-free:latest   Up (healthy)             0.0.0.0:1521->1521/tcp
  cineaustral-backend   cineaustral-backend         Up                       0.0.0.0:8080->8080/tcp
  cineaustral-frontend  cineaustral-frontend        Up                       0.0.0.0:3000->80/tcp
  ```

---

## 🔑 Accesos y Cuentas de Demostración

El sistema incluye un componente **`DataSeeder`** automático que puebla la base de datos en su primer encendido con las salas físicas, 100 butacas organizadas por columnas por sala, películas con pósters de cartelera, funciones activas programadas y usuarios de demostración listos para evaluar:

| Rol | Correo Electrónico | Contraseña | Alcance y Flujos a Evaluar |
|---|---|---|---|
|  **Administrador** | `admin@cineaustral.com` | `admin123` | Acceso completo al Panel de Administración (`/admin`): métricas operativas y gráficos, gestión de películas con buscador TMDB, programación de funciones sin solapamiento, inhabilitación de salas/asientos y auditoría de reservas. |
|  **Cliente** | `cliente@cineaustral.com` | `cliente123` | Exploración de cartelera, selección interactiva de butacas en tiempo real, confirmación de compra y visualización/cancelación de reservas en "Mis Reservas". |

### Enlaces de Servicio
- **🌐 Aplicación Web (Frontend SPA):** [http://localhost:3000](http://localhost:3000)
- **⚙️ API REST (Backend Spring Boot):** [http://localhost:8080](http://localhost:8080)
- **🩺 Endpoint de Salud (Healthcheck):** [http://localhost:8080/ping](http://localhost:8080/ping)
- **🗄️ Listener de Base de Datos Oracle:** `localhost:1521`  
  *(Servicio / PDB: `FREEPDB1`, Usuario: `cineaustral`, Contraseña: `1234`)*

---

## 🔧 Resolución de Problemas (Troubleshooting)

### 1. "¿La web dice 'No se puede conectar' o el login demora en responder inicialmente?"
- **Causa:** La base de datos Oracle Database requiere entre 30 y 45 segundos para inicializar su catálogo en el primer encendido.
- **Solución:** Aguarde unos instantes. Puede inspeccionar los logs en tiempo real para verificar el estado de conexión del backend:
  ```bash
  docker compose logs -f backend
  ```

### 2. "Error de conflicto de puertos (`Port already allocated`)"
- **Causa:** Uno de los puertos requeridos (`3000`, `8080` o `1521`) está siendo utilizado por otro software local (por ejemplo, otro Tomcat, un Nginx local o un servicio de Oracle instalado previamente).
- **Diagnóstico y solución:**
  - **En Windows (PowerShell / CMD):**
    ```powershell
    netstat -ano | findstr :3000
    netstat -ano | findstr :8080
    netstat -ano | findstr :1521
    ```
    Identifique el PID del proceso en conflicto y finalícelo desde el Administrador de Tareas.
  - **En Linux / macOS:**
    ```bash
    sudo lsof -i :3000
    sudo lsof -i :8080
    sudo lsof -i :1521
    ```

### 3. "Error de permisos con Docker en Linux (`permission denied while trying to connect to the Docker daemon`)"
- **Solución:** Agregue su usuario al grupo `docker` y aplique los cambios:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```
  O ejecute los comandos anteponiendo `sudo`: `sudo docker compose up -d --build`.

### 4. "¿Cómo reiniciar la base de datos limpia desde cero (estado inicial del Seeder)?"
- Si realizó reservas o modificaciones de prueba y desea devolver el complejo al estado limpio de demostración:
  ```bash
  docker compose down -v
  docker compose up -d --build
  ```
  *(La bandera `-v` elimina los volúmenes de datos antiguos, provocando que el `DataSeeder` vuelva a poblar las salas y usuarios).*

### 5. "¿Cómo detener todos los servicios de forma limpia?"
- Ejecute en su terminal:
  ```bash
  docker compose down
  ```
