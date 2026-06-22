# Contexto del Proyecto: Cine Austral

## Resumen del Proyecto

**Cine Austral** es un sistema web de gestión para un complejo cinematográfico de dos salas físicas. Surge como evolución de un proyecto académico previo desarrollado en Ada (para la materia Algorítmica y Programación 2), que funcionaba únicamente como sistema interno sin persistencia de datos ni acceso público.

El objetivo de esta nueva etapa (Ingeniería de Software, Licenciatura en Informática — UNPSJB, 2026) es migrar ese sistema a una plataforma web moderna, desacoplada y con persistencia profesional. El sistema automatiza la reserva de asientos y la administración completa de los recursos del cine.

**Autor:** Montiel Ruiz, Ignacio Nicolás

**Stack tecnológico:**
- **Frontend:** React (interfaz dinámica para clientes y administradores)
- **Backend:** Spring Boot (lógica de negocio, seguridad, API REST)
- **ORM:** Hibernate
- **Base de datos:** PostgreSQL

**Fuera del alcance:** gestión de facturación fiscal y registro de historiales de pago.

---

## Funcionalidades por Rol

### Rol: Cliente

El cliente es el usuario público que accede al sistema para informarse y reservar entradas.

- **Consulta de funciones:** puede ver las funciones disponibles (películas, horarios, salas).
- **Reserva de asientos:** puede seleccionar y reservar asientos para una película y horario específico.
- **Modificación de reserva:** puede modificar una reserva existente.
- **Cancelación de reserva:** puede cancelar una entrada reservada.
- **Registro y autenticación:** puede registrarse como usuario y hacer login para acceder a sus funcionalidades.

### Rol: Administrador

El administrador es el personal interno del cine con acceso total a la gestión del sistema.

- **Gestión de películas:** registrar, modificar y eliminar películas del catálogo.
- **Gestión de funciones:** crear, modificar, eliminar y consultar funciones (incluyendo película asignada, sala, fecha, hora y duración).
- **Gestión de salas:** administrar el estado de las salas (Disponible / No disponible).
- **Gestión de asientos:** administrar la disponibilidad de cada asiento (Libre / Ocupado / Mantenimiento).
- **Gestión de usuarios:** administrar perfiles de usuario, distinguiendo entre roles Cliente y Administrador.

---

## Estilo de las Vistas

### Identidad visual

El diseño debe evocar la identidad patagónica austral: amplitud, naturaleza, viento y cielo abierto. La experiencia debe sentirse **cálida, accesible y moderna**, sin perder el carácter regional.

### Paleta de colores patagónicos

| Nombre | Uso sugerido | Valor hex aproximado |
|---|---|---|
| Azul cielo patagónico | Color primario, headers, botones principales | `#4A90BF` |
| Azul profundo (lago) | Acentos, hover states, íconos activos | `#1B5E8C` |
| Blanco nieve | Fondos principales, tarjetas | `#F5F7FA` |
| Gris piedra | Texto secundario, bordes suaves | `#7B8A96` |
| Terracota/arcilla | Llamadas a la acción secundarias, alertas cálidas | `#C0614A` |
| Verde estepa | Estados positivos (disponible, confirmado) | `#5A8A5E` |
| Gris oscuro carbón | Texto principal, navbar | `#2C3340` |

### Tipografía

- Fuente principal: sans-serif humanista (Inter, Nunito o similar) — legible y amigable.
- Jerarquía clara: títulos con peso bold, subtítulos medium, cuerpo regular.
- Tamaño base: 16px mínimo para buena legibilidad.

### Tono general de la UI

- **Amigable y accesible:** lenguaje claro, botones descriptivos, mensajes de error comprensibles.
- **Minimalista con calidez:** no recargado, espacios generosos, sin elementos decorativos innecesarios.
- **Responsive:** diseñado mobile-first, funcional en celular, tablet y escritorio.
- **Feedback visual claro:** estados de asientos diferenciados visualmente (colores distintos para Libre, Ocupado, Mantenimiento), confirmaciones de acciones con mensajes y/o toasts.

### Componentes clave de UI

- **Mapa de asientos interactivo:** grilla visual de la sala con colores por estado; el cliente puede hacer click para seleccionar.
- **Cartelera de funciones:** cards con imagen de película, título, horario y sala.
- **Panel de administración:** tabla/dashboard limpio para gestión de entidades (películas, funciones, salas).
- **Formularios simples:** inputs con labels flotantes o claros, validación en tiempo real.

---

## Requerimientos Futuros (a tener en cuenta)

- Sistema de **notificaciones automáticas** al cliente en caso de cancelación de función o cambio en el estado de su reserva (por mantenimiento de asiento o cambio de sala).
