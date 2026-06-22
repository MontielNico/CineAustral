import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { Check, X, Film, Ticket, Settings, Calendar, ClipboardList } from "lucide-react";

const Home = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Views: "dashboard", "cartelera", "reservas", "modificar"
    const [currentView, setCurrentView] = useState("dashboard");

    // Notification/toast state
    const [notification, setNotification] = useState(null);
    const showNotification = (text, type = "success") => {
        setNotification({ text, type });
        setTimeout(() => setNotification(null), 5000);
    };

    // Cartelera states
    const [peliculas, setPeliculas] = useState([]);
    const [loadingPeliculas, setLoadingPeliculas] = useState(false);
    const [selectedPelicula, setSelectedPelicula] = useState(null);

    // Funciones states
    const [funciones, setFunciones] = useState([]);
    const [loadingFunciones, setLoadingFunciones] = useState(false);
    const [selectedFuncion, setSelectedFuncion] = useState(null);

    // Reservas states
    const [reservas, setReservas] = useState([]);
    const [loadingReservas, setLoadingReservas] = useState(false);

    // Modification states
    const [reservaParaModificar, setReservaParaModificar] = useState(null);
    const [modStep, setModStep] = useState(1); // 1: choose function, 2: choose seats

    // Seats layout states
    const [disponibles, setDisponibles] = useState([]);
    const [loadingAsientos, setLoadingAsientos] = useState(false);
    const [selectedSeats, setSelectedSeats] = useState([]);

    // Fetch listings when views change
    useEffect(() => {
        if (currentView === "cartelera") {
            fetchPeliculas();
            setSelectedPelicula(null);
            setSelectedFuncion(null);
            setSelectedSeats([]);
            setReservaParaModificar(null);
        } else if (currentView === "reservas") {
            fetchReservas();
            setReservaParaModificar(null);
        }
    }, [currentView]);

    const fetchPeliculas = async () => {
        setLoadingPeliculas(true);
        try {
            const res = await api.get("/api/peliculas");
            // Show only movies marked as enCartelera
            setPeliculas(res.data.filter(p => p.enCartelera));
        } catch (err) {
            console.error(err);
            showNotification("Error al cargar la cartelera de películas", "error");
        } finally {
            setLoadingPeliculas(false);
        }
    };

    const fetchReservas = async () => {
        if (!user) return;
        setLoadingReservas(true);
        try {
            const res = await api.get(`/api/reservas/cliente/${user.id}`);
            setReservas(res.data);
        } catch (err) {
            console.error(err);
            showNotification("Error al cargar tus reservas", "error");
        } finally {
            setLoadingReservas(false);
        }
    };

    const handleSelectPelicula = async (pelicula) => {
        setSelectedPelicula(pelicula);
        setLoadingFunciones(true);
        try {
            const res = await api.get(`/api/funciones/pelicula/${pelicula.id}`);
            setFunciones(res.data);
        } catch (err) {
            console.error(err);
            showNotification("Error al obtener funciones de esta película", "error");
        } finally {
            setLoadingFunciones(false);
        }
    };

    const handleSelectFuncion = async (funcion) => {
        setSelectedFuncion(funcion);
        setLoadingAsientos(true);
        setSelectedSeats([]);
        try {
            const excluirId = reservaParaModificar ? reservaParaModificar.id : null;
            const url = excluirId
                ? `/api/reservas/disponibles/${funcion.id}?excluirReservaId=${excluirId}`
                : `/api/reservas/disponibles/${funcion.id}`;
            const res = await api.get(url);
            setDisponibles(res.data);
        } catch (err) {
            console.error(err);
            showNotification("Error al cargar asientos disponibles", "error");
        } finally {
            setLoadingAsientos(false);
        }
    };

    const handleCancelarReserva = async (reservaId) => {
        const reserva = reservas.find(r => r.id === reservaId);
        if (reserva && reserva.fechaHoraInicio) {
            const limite = new Date(reserva.fechaHoraInicio).getTime() - 10 * 60 * 1000;
            if (new Date().getTime() >= limite) {
                showNotification("No se puede cancelar una reserva a menos de 10 minutos del inicio de la función", "error");
                return;
            }
        }
        if (window.confirm("¿Estás seguro de que deseas cancelar esta reserva? Esta acción no se puede deshacer.")) {
            try {
                await api.put(`/api/reservas/${reservaId}/cancelar?clienteId=${user.id}`);
                showNotification("Reserva cancelada correctamente");
                fetchReservas();
            } catch (err) {
                console.error(err);
                const msg = err.response?.data?.message || "Error al cancelar la reserva";
                showNotification(msg, "error");
            }
        }
    };

    const iniciarModificacion = async (reserva) => {
        if (reserva && reserva.fechaHoraInicio) {
            const limite = new Date(reserva.fechaHoraInicio).getTime() - 10 * 60 * 1000;
            if (new Date().getTime() >= limite) {
                showNotification("No se puede modificar una reserva a menos de 10 minutos del inicio de la función", "error");
                return;
            }
        }
        setReservaParaModificar(reserva);
        setModStep(1);
        setSelectedFuncion(null);
        setSelectedSeats([]);
        setLoadingFunciones(true);
        setCurrentView("modificar");
        try {
            const res = await api.get(`/api/funciones/pelicula/${reserva.peliculaId}`);
            setFunciones(res.data);
        } catch (err) {
            console.error(err);
            showNotification("Error al cargar funciones para la película", "error");
        } finally {
            setLoadingFunciones(false);
        }
    };

    const handleCrearReserva = async () => {
        if (!selectedFuncion || selectedSeats.length === 0) return;
        try {
            const requestBody = {
                funcionId: selectedFuncion.id,
                asientoIds: selectedSeats.map(s => s.id),
                clienteId: user.id
            };
            await api.post("/api/reservas/online", requestBody);
            showNotification("¡Reserva realizada con éxito!");
            setCurrentView("reservas");
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Error al realizar la reserva";
            showNotification(msg, "error");
        }
    };

    const handleConfirmarModificacion = async () => {
        if (!reservaParaModificar || !selectedFuncion || selectedSeats.length !== reservaParaModificar.asientos.length) return;
        try {
            const requestBody = {
                funcionId: selectedFuncion.id,
                asientoIds: selectedSeats.map(s => s.id),
                clienteId: user.id
            };
            await api.put(`/api/reservas/${reservaParaModificar.id}`, requestBody);
            showNotification("¡Reserva modificada con éxito!");
            setCurrentView("reservas");
            setReservaParaModificar(null);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Error al modificar la reserva";
            showNotification(msg, "error");
        }
    };

    // Helper: format date for display (Argentine Spanish)
    const formatFecha = (fechaStr) => {
        try {
            const parts = fechaStr.split('T');
            const dateParts = parts[0].split('-');
            let day, month, year;
            if (dateParts[0].length === 4) { // yyyy-MM-dd
                year = dateParts[0];
                month = dateParts[1];
                day = dateParts[2];
            } else { // dd-MM-yyyy
                day = dateParts[0];
                month = dateParts[1];
                year = dateParts[2];
            }
            const timeParts = parts[1].split(':');
            const hours = timeParts[0];
            const minutes = timeParts[1];

            const date = new Date(year, month - 1, day);
            const opciones = { weekday: 'long', day: 'numeric', month: 'long' };
            let formattedDate = date.toLocaleDateString('es-AR', opciones);
            formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
            return `${formattedDate} a las ${hours}:${minutes} hs`;
        } catch (e) {
            return fechaStr;
        }
    };

    const seatExists = (row, col) => {
        if (row === "A") {
            return col >= 5 && col <= 14;
        }
        return col >= 1 && col <= 18;
    };

    const handleSeatClick = (row, col, seatInfo) => {
        if (!seatInfo) return;

        const isAlreadySelected = selectedSeats.some(s => s.id === seatInfo.id);
        if (isAlreadySelected) {
            setSelectedSeats(selectedSeats.filter(s => s.id !== seatInfo.id));
        } else {
            if (reservaParaModificar) {
                const targetCount = reservaParaModificar.asientos.length;
                if (selectedSeats.length >= targetCount) {
                    showNotification(`Tu reserva original es de ${targetCount} asientos. Deselecciona un asiento para cambiarlo.`, "warning");
                    return;
                }
            }
            setSelectedSeats([...selectedSeats, seatInfo]);
        }
    };

    return (
        <div className="min-h-screen bg-nieve text-carbon font-sans flex flex-col relative pb-12">
            {/* Header / Navbar */}
            <nav className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 sm:px-12 bg-carbon border-b border-piedra/15 sticky top-0 z-50 shadow-md">
                <div
                    className="flex items-center gap-4 mb-3 sm:mb-0 cursor-pointer"
                    onClick={() => setCurrentView("dashboard")}
                >
                    <div className="text-3xl font-black tracking-tight text-white select-none">
                        CINE<span className="text-cielo">AUSTRAL</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="bg-cielo/15 border border-cielo/30 text-cielo px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                        {user.rol}
                    </span>
                    <span className="font-semibold text-white">
                        {user.nombre} {user.apellido}
                    </span>
                    <button
                        className="bg-transparent border border-white/30 text-nieve px-3.5 py-1.5 rounded-lg font-semibold text-sm cursor-pointer hover:bg-terracota/15 hover:border-terracota hover:text-white transition-all duration-200"
                        onClick={logout}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            {/* Notification Toast */}
            {notification && (
                <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 border flex items-center gap-3 transition-all duration-300 animate-bounce ${notification.type === "success"
                        ? "bg-estepa text-white border-estepa"
                        : "bg-terracota text-white border-terracota"
                    }`}>
                    {notification.type === "success" ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    <span className="text-sm font-bold">{notification.text}</span>
                </div>
            )}

            {/* Main Application Container */}
            <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 py-8 flex flex-col gap-8">

                {/* 1. VIEW: DASHBOARD */}
                {currentView === "dashboard" && (
                    <>
                        <section className="bg-white border border-piedra/20 rounded-xl p-6 sm:p-8 text-left shadow-sm">
                            <div className="mb-6">
                                <h1 className="text-3xl sm:text-4xl font-extrabold text-carbon mb-2 tracking-tight">
                                    ¡Bienvenido, {user.nombre}!
                                </h1>
                                <p className="text-piedra text-base sm:text-lg">
                                    Gestiona tus reservas de cine de forma rápida, segura y en tiempo real.
                                </p>
                            </div>

                            <div className="border-t border-piedra/15 pt-6">
                                <h2 className="text-lg font-bold text-carbon mb-4">Detalles de tu Perfil</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-piedra font-bold tracking-wider uppercase">Nombre Completo:</span>
                                        <span className="text-base text-carbon font-semibold">{user.nombre} {user.apellido}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-piedra font-bold tracking-wider uppercase">Correo Electrónico:</span>
                                        <span className="text-base text-carbon font-semibold break-all">{user.email}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-piedra font-bold tracking-wider uppercase">ID de Cliente:</span>
                                        <span className="text-base text-carbon font-semibold">#{user.id}</span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs text-piedra font-bold tracking-wider uppercase">Rol:</span>
                                        <span className="inline-flex self-start px-2.5 py-0.5 rounded text-xs font-bold uppercase border mt-1 bg-estepa/10 text-estepa border-estepa/20">
                                            {user.rol}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Card: Reservar */}
                            <div className="bg-white border border-piedra/15 rounded-xl p-6 sm:p-8 text-left flex flex-col items-start gap-4 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-cielo/50">
                                <div className="p-3 bg-cielo/10 rounded-xl text-cielo">
                                    <Film className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-carbon">Reservar Entradas</h3>
                                <p className="text-sm text-piedra leading-relaxed flex-1">
                                    Explora nuestra cartelera, selecciona una función y reserva tus asientos preferidos en tiempo real.
                                </p>
                                <button
                                    onClick={() => setCurrentView("cartelera")}
                                    className="w-full bg-cielo hover:bg-lago text-white font-bold text-sm py-2.5 rounded-lg transition-all duration-200 text-center shadow-md cursor-pointer"
                                >
                                    Ir a Cartelera
                                </button>
                            </div>

                            {/* Card: Mis Reservas */}
                            <div className="bg-white border border-piedra/15 rounded-xl p-6 sm:p-8 text-left flex flex-col items-start gap-4 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-cielo/50">
                                <div className="p-3 bg-cielo/10 rounded-xl text-cielo">
                                    <Ticket className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-carbon">Mis Reservas</h3>
                                <p className="text-sm text-piedra leading-relaxed flex-1">
                                    Consulta tu historial de reservas y tickets activos. Puedes modificar o cancelar tus compras aquí.
                                </p>
                                <button
                                    onClick={() => setCurrentView("reservas")}
                                    className="w-full bg-cielo hover:bg-lago text-white font-bold text-sm py-2.5 rounded-lg transition-all duration-200 text-center shadow-md cursor-pointer"
                                >
                                    Ver Mis Reservas
                                </button>
                            </div>

                            {/* Card: Admin Panel (Conditional) */}
                            {user.rol === "ADMIN" && (
                                <div className="relative overflow-hidden before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-gradient-to-r before:from-terracota before:to-[#a04935] hover:border-terracota/40 bg-white border border-piedra/15 rounded-xl p-6 sm:p-8 text-left flex flex-col items-start gap-4 transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                                    <div className="p-3 bg-terracota/10 rounded-xl text-terracota">
                                        <Settings className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-carbon">Administración</h3>
                                    <p className="text-sm text-piedra leading-relaxed flex-1">
                                        Herramientas de administración para gestionar películas, salas, funciones, asientos y usuarios.
                                    </p>
                                    <button
                                        onClick={() => navigate("/admin")}
                                        className="w-full bg-terracota hover:bg-[#a04935] text-white font-bold text-sm py-2.5 rounded-lg transition-all duration-200 text-center shadow-md cursor-pointer"
                                    >
                                        Panel de Control
                                    </button>
                                </div>
                            )}
                        </section>
                    </>
                )}

                {/* 2. VIEW: CARTELERA (RESERVAR ENTRADAS) */}
                {currentView === "cartelera" && (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-carbon">Cartelera de Cine</h2>
                            <button
                                onClick={() => setCurrentView("dashboard")}
                                className="bg-transparent border border-piedra/35 text-piedra hover:text-carbon hover:bg-carbon/5 px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-all"
                            >
                                ← Volver al Panel
                            </button>
                        </div>

                        {/* STEP 2.1: MOVIE SELECTION LIST */}
                        {!selectedPelicula && (
                            <>
                                {loadingPeliculas ? (
                                    <div className="flex flex-col items-center py-12">
                                        <div className="w-12 h-12 border-4 border-cielo border-t-transparent rounded-full animate-spin"></div>
                                        <p className="mt-4 text-piedra font-semibold">Cargando cartelera...</p>
                                    </div>
                                ) : peliculas.length === 0 ? (
                                    <div className="bg-white border border-piedra/25 rounded-xl p-12 text-center">
                                        <p className="text-piedra text-lg font-semibold mb-4">No hay películas en cartelera en este momento.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {peliculas.map(p => (
                                            <div key={p.id} className="bg-white border border-piedra/15 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col">
                                                <div className="h-64 bg-gradient-to-br from-cielo/40 to-lago/60 relative flex items-center justify-center text-white overflow-hidden">
                                                    {p.imagenUrl ? (
                                                        <img
                                                            src={`http://localhost:8080${p.imagenUrl}`}
                                                            alt={p.titulo}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 p-4 text-center">
                                                            <span className="text-5xl">🎬</span>
                                                            <span className="font-extrabold text-lg uppercase tracking-wider">{p.titulo}</span>
                                                        </div>
                                                    )}
                                                    <span className="absolute top-3 right-3 bg-carbon/85 text-white px-2.5 py-1 rounded-full text-xs font-bold border border-white/20">
                                                        ★ {p.puntuacion?.toFixed(1) || "N/A"}
                                                    </span>
                                                </div>
                                                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                                                    <div className="flex flex-col gap-2">
                                                        <h3 className="text-xl font-bold text-carbon tracking-tight line-clamp-1">{p.titulo}</h3>
                                                        <span className="text-xs font-bold text-cielo uppercase tracking-wide">{p.genero}</span>
                                                        <p className="text-sm text-piedra line-clamp-3 leading-relaxed mt-1">{p.sinopsis || "Sin sinopsis disponible."}</p>
                                                    </div>
                                                    <div className="pt-3 border-t border-piedra/10 flex justify-between items-center">
                                                        <span className="text-xs text-piedra font-bold">Duración: {p.duracionMinutos} min</span>
                                                        <button
                                                            onClick={() => handleSelectPelicula(p)}
                                                            className="bg-cielo hover:bg-lago text-white font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all"
                                                        >
                                                            Ver Funciones
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* STEP 2.2: SHOWTIME SELECTION FOR MOVIE */}
                        {selectedPelicula && !selectedFuncion && (
                            <div className="bg-white border border-piedra/15 rounded-xl p-6 sm:p-8 flex flex-col gap-6">
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="w-full sm:w-1/4 aspect-[3/4] bg-lago/20 rounded-lg overflow-hidden flex items-center justify-center">
                                        {selectedPelicula.imagenUrl ? (
                                            <img
                                                src={`http://localhost:8080${selectedPelicula.imagenUrl}`}
                                                alt={selectedPelicula.titulo}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-6xl">🎬</span>
                                        )}
                                    </div>
                                    <div className="flex-1 flex flex-col gap-3">
                                        <h3 className="text-3xl font-extrabold text-carbon">{selectedPelicula.titulo}</h3>
                                        <div className="flex gap-2">
                                            <span className="bg-cielo/15 text-cielo text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{selectedPelicula.genero}</span>
                                            <span className="bg-carbon/5 text-piedra text-xs font-bold px-3 py-1 rounded-full">★ {selectedPelicula.puntuacion || "N/A"}</span>
                                            <span className="bg-carbon/5 text-piedra text-xs font-bold px-3 py-1 rounded-full">{selectedPelicula.duracionMinutos} min</span>
                                        </div>
                                        <p className="text-piedra text-sm leading-relaxed mt-2">{selectedPelicula.sinopsis || "Sin sinopsis disponible."}</p>
                                    </div>
                                </div>

                                <div className="border-t border-piedra/15 pt-6 flex flex-col gap-4">
                                    <h4 className="text-lg font-bold text-carbon">Funciones en los próximos 7 días</h4>
                                    {loadingFunciones ? (
                                        <div className="flex flex-col items-center py-6">
                                            <div className="w-8 h-8 border-3 border-cielo border-t-transparent rounded-full animate-spin"></div>
                                            <p className="mt-2 text-xs text-piedra font-semibold">Cargando funciones...</p>
                                        </div>
                                    ) : funciones.length === 0 ? (
                                        <p className="text-piedra text-sm">No hay funciones disponibles en cartelera en este momento.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {funciones.map(f => (
                                                <div key={f.id} className="border border-piedra/20 hover:border-cielo rounded-xl p-4 flex justify-between items-center gap-4 hover:bg-cielo/5 transition-all">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="font-extrabold text-carbon text-base">{formatFecha(f.fechaHoraInicio)}</span>
                                                        <div className="flex items-center gap-2 text-xs text-piedra font-semibold">
                                                            <span>Sala: <strong className="text-carbon">{f.sala}</strong></span>
                                                            <span>•</span>
                                                            <span>Precio: <strong className="text-estepa">${f.precioPorAsiento}</strong></span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleSelectFuncion(f)}
                                                        className="bg-lago hover:bg-carbon text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-all"
                                                    >
                                                        Elegir Asientos
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 flex">
                                    <button
                                        onClick={() => setSelectedPelicula(null)}
                                        className="bg-transparent border border-piedra/30 text-piedra hover:text-carbon hover:bg-carbon/5 px-4 py-2 rounded-lg font-semibold text-xs cursor-pointer transition-all"
                                    >
                                        Volver a la Cartelera
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2.3: SEATS MAP AND RESERVATION DETAILS */}
                        {selectedPelicula && selectedFuncion && (
                            <div className="bg-white border border-piedra/15 rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row gap-8">
                                <div className="flex-1 flex flex-col gap-6">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-carbon">Selecciona tus Asientos</h3>
                                        <p className="text-sm text-piedra font-semibold">{selectedPelicula.titulo} — {formatFecha(selectedFuncion.fechaHoraInicio)} ({selectedFuncion.salaNombre})</p>
                                    </div>

                                    {/* Curved Screen element */}
                                    <div className="w-full max-w-md mx-auto mt-4 mb-8 text-center">
                                        <div className="w-full h-2 bg-piedra/30 rounded-full mb-1"></div>
                                        <span className="text-[10px] text-piedra font-bold tracking-widest uppercase">PANTALLA</span>
                                    </div>

                                    {loadingAsientos ? (
                                        <div className="flex flex-col items-center py-12">
                                            <div className="w-10 h-10 border-4 border-cielo border-t-transparent rounded-full animate-spin"></div>
                                            <p className="mt-4 text-xs text-piedra font-semibold">Cargando mapa de asientos...</p>
                                        </div>
                                    ) : (
                                        <div className="w-full overflow-x-auto py-4">
                                            {/* Seat grid style repeat 22 columns */}
                                            <div
                                                className="grid gap-2 max-w-2xl mx-auto p-4 bg-carbon/5 rounded-xl border border-piedra/10"
                                                style={{ gridTemplateColumns: 'repeat(22, minmax(0, 1fr))', minWidth: '600px' }}
                                            >
                                                {['A', 'B', 'C', 'D', 'E', 'F'].map(row => (
                                                    <div key={row} className="contents">
                                                        {Array.from({ length: 22 }, (_, colIdx) => {
                                                            if (colIdx === 0 || colIdx === 21) {
                                                                return (
                                                                    <div key={colIdx} className="flex items-center justify-center font-extrabold text-piedra text-xs select-none">
                                                                        {row}
                                                                    </div>
                                                                );
                                                            }
                                                            if (colIdx === 5 || colIdx === 16) {
                                                                return (
                                                                    <div key={colIdx} className="w-2"></div>
                                                                );
                                                            }

                                                            let numero;
                                                            if (colIdx >= 1 && colIdx <= 4) numero = colIdx;
                                                            else if (colIdx >= 6 && colIdx <= 15) numero = colIdx - 1;
                                                            else if (colIdx >= 17 && colIdx <= 20) numero = colIdx - 2;

                                                            const exists = seatExists(row, numero);
                                                            if (!exists) {
                                                                return <div key={colIdx} className="aspect-square"></div>;
                                                            }

                                                            const seatInfo = disponibles.find(s => s.fila === row && s.numero === numero);
                                                            const isSelected = selectedSeats.some(s => s.fila === row && s.numero === numero);

                                                            let seatClass = "";
                                                            let titleText = `Fila ${row} - Asiento ${numero}`;

                                                            if (isSelected) {
                                                                seatClass = "bg-cielo border-lago text-white hover:bg-lago";
                                                                titleText += " (Seleccionado)";
                                                            } else if (seatInfo) {
                                                                seatClass = "bg-estepa/10 border-estepa text-estepa hover:bg-estepa hover:text-white cursor-pointer";
                                                                titleText += " (Disponible)";
                                                            } else {
                                                                seatClass = "bg-piedra/10 border-piedra/20 text-piedra/30 cursor-not-allowed";
                                                                titleText += " (Ocupado / Mantenimiento)";
                                                            }

                                                            return (
                                                                <button
                                                                    key={colIdx}
                                                                    title={titleText}
                                                                    disabled={!seatInfo}
                                                                    onClick={() => handleSeatClick(row, numero, seatInfo)}
                                                                    className={`aspect-square rounded flex items-center justify-center text-[10px] sm:text-xs font-bold border transition-all duration-150 ${seatClass}`}
                                                                >
                                                                    {numero}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Legend */}
                                    <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-piedra">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded border border-estepa bg-estepa/10"></div>
                                            <span>Disponible</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded border border-lago bg-cielo"></div>
                                            <span>Seleccionado</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded border border-piedra/20 bg-piedra/10"></div>
                                            <span>Ocupado / Mantenimiento</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Sidebar */}
                                <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-piedra/15 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between gap-6">
                                    <div className="flex flex-col gap-4">
                                        <h4 className="text-lg font-bold text-carbon">Resumen de la Compra</h4>
                                        <div className="flex flex-col gap-2 text-sm text-piedra">
                                            <div className="flex justify-between">
                                                <span>Película:</span>
                                                <strong className="text-carbon text-right">{selectedPelicula.titulo}</strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Sala:</span>
                                                <strong className="text-carbon">{selectedFuncion.salaNombre}</strong>
                                            </div>
                                            <div className="flex justify-between flex-wrap gap-2">
                                                <span>Asiento(s) seleccionado(s):</span>
                                                {selectedSeats.length === 0 ? (
                                                    <span className="text-terracota italic">Ninguno</span>
                                                ) : (
                                                    <strong className="text-carbon">{selectedSeats.map(s => `${s.fila}-${s.numero}`).join(", ")}</strong>
                                                )}
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Precio por entrada:</span>
                                                <strong className="text-estepa">${selectedFuncion.precioPorAsiento}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-piedra/15 flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-extrabold text-carbon text-lg">Total:</span>
                                            <span className="font-black text-estepa text-2xl">${(selectedSeats.length * selectedFuncion.precioPorAsiento).toFixed(2)}</span>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <button
                                                disabled={selectedSeats.length === 0}
                                                onClick={handleCrearReserva}
                                                className={`w-full font-bold text-sm py-3 rounded-lg transition-all duration-200 text-center shadow cursor-pointer ${selectedSeats.length > 0
                                                        ? "bg-estepa hover:bg-estepa/90 text-white shadow-estepa/10"
                                                        : "bg-piedra/20 text-piedra/50 cursor-not-allowed shadow-none"
                                                    }`}
                                            >
                                                Confirmar Reserva
                                            </button>
                                            <button
                                                onClick={() => setSelectedFuncion(null)}
                                                className="w-full bg-transparent border border-piedra/30 text-piedra hover:text-carbon hover:bg-carbon/5 font-semibold text-xs py-2 rounded-lg cursor-pointer transition-all"
                                            >
                                                Volver a Horarios
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. VIEW: MIS RESERVAS (HISTORIAL & CANCEL/MODIFY) */}
                {currentView === "reservas" && (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-carbon">Mis Reservas</h2>
                            <button
                                onClick={() => setCurrentView("dashboard")}
                                className="bg-transparent border border-piedra/35 text-piedra hover:text-carbon hover:bg-carbon/5 px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-all"
                            >
                                ← Volver al Panel
                            </button>
                        </div>

                        {loadingReservas ? (
                            <div className="flex flex-col items-center py-12">
                                <div className="w-12 h-12 border-4 border-cielo border-t-transparent rounded-full animate-spin"></div>
                                <p className="mt-4 text-piedra font-semibold">Cargando historial de reservas...</p>
                            </div>
                        ) : reservas.length === 0 ? (
                            <div className="bg-white border border-piedra/25 rounded-xl p-12 text-center flex flex-col items-center gap-4">
                                <p className="text-piedra text-lg font-semibold">No tienes ninguna reserva registrada.</p>
                                <button
                                    onClick={() => setCurrentView("cartelera")}
                                    className="bg-cielo hover:bg-lago text-white font-bold text-sm px-6 py-2.5 rounded-lg cursor-pointer transition-all"
                                >
                                    Reservar Entradas Ahora
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reservas.map(r => {
                                    const esActiva = r.reservaEstado === "ACTIVA";
                                    const limiteModificacionCancelacion = r.fechaHoraInicio ? new Date(r.fechaHoraInicio).getTime() - 10 * 60 * 1000 : 0;
                                    const limiteSuperado = new Date().getTime() >= limiteModificacionCancelacion;
                                    return (
                                        <div key={r.id} className="bg-white border border-piedra/15 rounded-xl overflow-hidden shadow-sm flex flex-col">
                                            <div className="bg-carbon text-white p-4 flex justify-between items-center">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-xs text-piedra font-bold tracking-wider uppercase">Película:</span>
                                                    <span className="font-extrabold text-base line-clamp-1">{r.peliculaTitulo}</span>
                                                </div>
                                                <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase border ${esActiva
                                                        ? "bg-estepa/10 text-estepa border-estepa/20"
                                                        : "bg-terracota/10 text-terracota border-terracota/20"
                                                    }`}>
                                                    {r.reservaEstado}
                                                </span>
                                            </div>

                                            <div className="p-6 flex-1 flex flex-col justify-between gap-6">
                                                <div className="grid grid-cols-2 gap-4 text-sm text-piedra">
                                                    <div className="flex flex-col gap-0.5 col-span-2">
                                                        <span>Función:</span>
                                                        <strong className="text-carbon">{formatFecha(r.fechaHoraInicio)}</strong>
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span>Sala:</span>
                                                        <strong className="text-carbon">{r.salaNombre}</strong>
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span>Monto Total:</span>
                                                        <strong className="text-estepa text-base">${r.precioTotal}</strong>
                                                    </div>
                                                    <div className="flex flex-col gap-0.5 col-span-2">
                                                        <span>Asientos:</span>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {r.asientos.map(asiento => (
                                                                <span key={asiento.id} className="bg-carbon/5 border border-piedra/25 text-carbon px-2.5 py-0.5 rounded text-xs font-bold">
                                                                    Fila {asiento.fila} - Asiento {asiento.numero}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {esActiva && !limiteSuperado && (
                                                    <div className="pt-4 border-t border-piedra/10 flex gap-3">
                                                        <button
                                                            onClick={() => iniciarModificacion(r)}
                                                            className="flex-1 bg-lago hover:bg-carbon text-white font-bold text-xs py-2.5 rounded-lg text-center cursor-pointer transition-all shadow-sm shadow-lago/10"
                                                        >
                                                            ✏️ Modificar
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancelarReserva(r.id)}
                                                            className="flex-1 bg-transparent border border-terracota text-terracota hover:bg-terracota/10 font-bold text-xs py-2.5 rounded-lg text-center cursor-pointer transition-all"
                                                        >
                                                            ❌ Cancelar
                                                        </button>
                                                    </div>
                                                )}
                                                {esActiva && limiteSuperado && (
                                                    <div className="pt-4 border-t border-piedra/10 text-center text-xs text-piedra font-semibold">
                                                        No disponible (menos de 10 minutos para el inicio de la función).
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* 4. VIEW: MODIFICAR RESERVA (FLOW WIZARD) */}
                {currentView === "modificar" && reservaParaModificar && (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-carbon">Modificar Reserva #{reservaParaModificar.id}</h2>
                                <p className="text-sm text-piedra font-semibold">Película: <strong className="text-carbon">{reservaParaModificar.peliculaTitulo}</strong></p>
                            </div>
                            <button
                                onClick={() => setCurrentView("reservas")}
                                className="bg-transparent border border-piedra/35 text-piedra hover:text-carbon hover:bg-carbon/5 px-4 py-2 rounded-lg font-semibold text-sm cursor-pointer transition-all"
                            >
                                ← Cancelar Modificación
                            </button>
                        </div>

                        {/* Step wizard indicator */}
                        <div className="bg-white border border-piedra/15 rounded-xl p-4 flex justify-around items-center text-sm font-bold shadow-sm">
                            <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${modStep >= 1 ? "bg-cielo text-white" : "bg-piedra/10 text-piedra"
                                    }`}>1</span>
                                <span className={modStep === 1 ? "text-carbon" : "text-piedra"}>Seleccionar Nueva Función</span>
                            </div>
                            <div className="w-16 h-0.5 bg-piedra/20"></div>
                            <div className="flex items-center gap-2">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${modStep >= 2 ? "bg-cielo text-white" : "bg-piedra/10 text-piedra"
                                    }`}>2</span>
                                <span className={modStep === 2 ? "text-carbon" : "text-piedra"}>Seleccionar Nuevos Asientos</span>
                            </div>
                        </div>

                        {/* WIZARD - STEP 1: CHOOSE A SHOWTIME */}
                        {modStep === 1 && (
                            <div className="bg-white border border-piedra/15 rounded-xl p-6 sm:p-8 flex flex-col gap-6">
                                <h3 className="text-lg font-bold text-carbon">Funciones Disponibles</h3>
                                <p className="text-xs text-piedra -mt-3">Para la misma película: <strong>{reservaParaModificar.peliculaTitulo}</strong>. Solo puedes modificar tu reserva por otra función disponible.</p>

                                {loadingFunciones ? (
                                    <div className="flex flex-col items-center py-6">
                                        <div className="w-8 h-8 border-3 border-cielo border-t-transparent rounded-full animate-spin"></div>
                                        <p className="mt-2 text-xs text-piedra font-semibold">Cargando funciones...</p>
                                    </div>
                                ) : funciones.length === 0 ? (
                                    <p className="text-piedra text-sm">No hay otras funciones programadas para esta película.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {funciones.map(f => {
                                            const esActual = f.id === reservaParaModificar.funcionId;
                                            return (
                                                <div
                                                    key={f.id}
                                                    className={`border rounded-xl p-4 flex justify-between items-center gap-4 hover:bg-cielo/5 transition-all ${esActual
                                                            ? "border-cielo/70 bg-cielo/5 ring-1 ring-cielo/30"
                                                            : "border-piedra/20 hover:border-cielo"
                                                        }`}
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-extrabold text-carbon text-base">{formatFecha(f.fechaHoraInicio)}</span>
                                                            {esActual && (
                                                                <span className="bg-cielo/20 text-lago text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                                    Actual
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-piedra font-semibold">
                                                            <span>Room: <strong className="text-carbon">{f.salaNombre}</strong></span>
                                                            <span>•</span>
                                                            <span>Precio: <strong className="text-estepa">${f.precioPorAsiento}</strong></span>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            handleSelectFuncion(f);
                                                            setModStep(2);
                                                        }}
                                                        className="bg-lago hover:bg-carbon text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer transition-all"
                                                    >
                                                        Elegir Asientos
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* WIZARD - STEP 2: CHOOSE SEATS AND CONFIRM */}
                        {modStep === 2 && selectedFuncion && (
                            <div className="bg-white border border-piedra/15 rounded-xl p-6 sm:p-8 flex flex-col lg:flex-row gap-8">
                                <div className="flex-1 flex flex-col gap-6">
                                    <div className="bg-carbon/5 p-4 rounded-xl border border-piedra/10 text-sm">
                                        <p className="text-carbon font-semibold mb-1">📋 Requisito de Modificación:</p>
                                        <p className="text-piedra">
                                            Tu reserva original consta de <strong className="text-lago font-bold">{reservaParaModificar.asientos.length}</strong> asientos.
                                            Debes seleccionar exactamente esa cantidad de asientos en la nueva función.
                                        </p>
                                        <div className="mt-3 flex items-center gap-3">
                                            <span className="text-xs text-piedra font-bold">Progreso:</span>
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${selectedSeats.length === reservaParaModificar.asientos.length
                                                    ? "bg-estepa text-white"
                                                    : "bg-terracota/10 text-terracota"
                                                }`}>
                                                {selectedSeats.length} / {reservaParaModificar.asientos.length} seleccionados
                                            </span>
                                        </div>
                                    </div>

                                    {/* curved screen */}
                                    <div className="w-full max-w-md mx-auto mt-4 mb-8 text-center">
                                        <div className="w-full h-2 bg-piedra/30 rounded-full mb-1"></div>
                                        <span className="text-[10px] text-piedra font-bold tracking-widest uppercase">PANTALLA</span>
                                    </div>

                                    {loadingAsientos ? (
                                        <div className="flex flex-col items-center py-12">
                                            <div className="w-10 h-10 border-4 border-cielo border-t-transparent rounded-full animate-spin"></div>
                                            <p className="mt-4 text-xs text-piedra font-semibold">Cargando asientos...</p>
                                        </div>
                                    ) : (
                                        <div className="w-full overflow-x-auto py-4">
                                            <div
                                                className="grid gap-2 max-w-2xl mx-auto p-4 bg-carbon/5 rounded-xl border border-piedra/10"
                                                style={{ gridTemplateColumns: 'repeat(22, minmax(0, 1fr))', minWidth: '600px' }}
                                            >
                                                {['A', 'B', 'C', 'D', 'E', 'F'].map(row => (
                                                    <div key={row} className="contents">
                                                        {Array.from({ length: 22 }, (_, colIdx) => {
                                                            if (colIdx === 0 || colIdx === 21) {
                                                                return (
                                                                    <div key={colIdx} className="flex items-center justify-center font-extrabold text-piedra text-xs select-none">
                                                                        {row}
                                                                    </div>
                                                                );
                                                            }
                                                            if (colIdx === 5 || colIdx === 16) {
                                                                return (
                                                                    <div key={colIdx} className="w-2"></div>
                                                                );
                                                            }

                                                            let numero;
                                                            if (colIdx >= 1 && colIdx <= 4) numero = colIdx;
                                                            else if (colIdx >= 6 && colIdx <= 15) numero = colIdx - 1;
                                                            else if (colIdx >= 17 && colIdx <= 20) numero = colIdx - 2;

                                                            const exists = seatExists(row, numero);
                                                            if (!exists) {
                                                                return <div key={colIdx} className="aspect-square"></div>;
                                                            }

                                                            const seatInfo = disponibles.find(s => s.fila === row && s.numero === numero);
                                                            const isSelected = selectedSeats.some(s => s.fila === row && s.numero === numero);

                                                            let seatClass = "";
                                                            let titleText = `Fila ${row} - Asiento ${numero}`;

                                                            if (isSelected) {
                                                                seatClass = "bg-cielo border-lago text-white hover:bg-lago";
                                                                titleText += " (Seleccionado)";
                                                            } else if (seatInfo) {
                                                                seatClass = "bg-estepa/10 border-estepa text-estepa hover:bg-estepa hover:text-white cursor-pointer";
                                                                titleText += " (Disponible)";
                                                            } else {
                                                                seatClass = "bg-piedra/10 border-piedra/20 text-piedra/30 cursor-not-allowed";
                                                                titleText += " (Ocupado / Mantenimiento)";
                                                            }

                                                            return (
                                                                <button
                                                                    key={colIdx}
                                                                    title={titleText}
                                                                    disabled={!seatInfo}
                                                                    onClick={() => handleSeatClick(row, numero, seatInfo)}
                                                                    className={`aspect-square rounded flex items-center justify-center text-[10px] sm:text-xs font-bold border transition-all duration-150 ${seatClass}`}
                                                                >
                                                                    {numero}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Legend */}
                                    <div className="flex flex-wrap justify-center gap-6 text-xs font-semibold text-piedra">
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded border border-estepa bg-estepa/10"></div>
                                            <span>Disponible</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded border border-lago bg-cielo"></div>
                                            <span>Seleccionado</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 rounded border border-piedra/20 bg-piedra/10"></div>
                                            <span>Ocupado / Mantenimiento</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary Sidebar */}
                                <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-piedra/15 pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between gap-6">
                                    <div className="flex flex-col gap-5">
                                        <h4 className="text-lg font-bold text-carbon">Confirmar Cambios</h4>

                                        <div className="flex flex-col gap-3 text-sm text-piedra">
                                            <div className="flex flex-col gap-0.5">
                                                <span>Asientos Anteriores:</span>
                                                <strong className="text-piedra text-xs">
                                                    {reservaParaModificar.asientos.map(as => `${as.fila}-${as.numero}`).join(", ")}
                                                </strong>
                                            </div>
                                            <div className="w-full h-px bg-piedra/10 my-1"></div>
                                            <div className="flex justify-between">
                                                <span>Nueva Función:</span>
                                                <strong className="text-carbon text-right text-xs max-w-[150px]">
                                                    {formatFecha(selectedFuncion.fechaHoraInicio)}
                                                </strong>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Sala Nueva:</span>
                                                <strong className="text-carbon">{selectedFuncion.salaNombre}</strong>
                                            </div>
                                            <div className="flex justify-between flex-wrap gap-2">
                                                <span>Nuevos Asientos:</span>
                                                {selectedSeats.length === 0 ? (
                                                    <span className="text-terracota italic">Ninguno</span>
                                                ) : (
                                                    <strong className="text-carbon">
                                                        {selectedSeats.map(s => `${s.fila}-${s.numero}`).join(", ")}
                                                    </strong>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-piedra/15 flex flex-col gap-4">
                                        <div className="flex justify-between items-center">
                                            <span className="font-extrabold text-carbon text-sm">Nuevo Total:</span>
                                            <span className="font-black text-estepa text-2xl">
                                                ${(selectedSeats.length * selectedFuncion.precioPorAsiento).toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-3">
                                            <button
                                                disabled={selectedSeats.length !== reservaParaModificar.asientos.length}
                                                onClick={handleConfirmarModificacion}
                                                className={`w-full font-bold text-sm py-3 rounded-lg transition-all duration-200 text-center shadow cursor-pointer ${selectedSeats.length === reservaParaModificar.asientos.length
                                                        ? "bg-estepa hover:bg-estepa/90 text-white shadow-estepa/10"
                                                        : "bg-piedra/20 text-piedra/50 cursor-not-allowed shadow-none"
                                                    }`}
                                            >
                                                Confirmar Modificación
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setModStep(1);
                                                    setSelectedSeats([]);
                                                }}
                                                className="w-full bg-transparent border border-piedra/30 text-piedra hover:text-carbon hover:bg-carbon/5 font-semibold text-xs py-2 rounded-lg cursor-pointer transition-all"
                                            >
                                                Volver a Funciones
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Home;
