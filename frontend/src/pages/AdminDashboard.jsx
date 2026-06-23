import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axiosConfig";
import { Check, AlertTriangle } from "lucide-react";

// Import modularized tab components
import Sidebar from "../components/admin/Sidebar";
import OverviewTab from "../components/admin/OverviewTab";
import MoviesTab from "../components/admin/MoviesTab";
import ShowtimesTab from "../components/admin/ShowtimesTab";
import RoomsTab from "../components/admin/RoomsTab";
import BookingsTab from "../components/admin/BookingsTab";
import UsersTab from "../components/admin/UsersTab";

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("dashboard");

    // Shared list states
    const [peliculas, setPeliculas] = useState([]);
    const [loadingPeliculas, setLoadingPeliculas] = useState(false);

    const [funciones, setFunciones] = useState([]);
    const [loadingFunciones, setLoadingFunciones] = useState(false);

    const [salas, setSalas] = useState([]);
    const [loadingSalas, setLoadingSalas] = useState(false);
    const [selectedSala, setSelectedSala] = useState(null);

    const [reservas, setReservas] = useState([]);
    const [loadingReservas, setLoadingReservas] = useState(false);

    const [usuarios, setUsuarios] = useState([]);
    const [loadingUsuarios, setLoadingUsuarios] = useState(false);

    // General Notification State
    const [notification, setNotification] = useState(null);

    const showNotification = (text, type = "success") => {
        setNotification({ text, type });
        setTimeout(() => setNotification(null), 4000);
    };

    // Load Initial Data based on active tab or on startup to compute metrics
    useEffect(() => {
        const fetchAllData = async () => {
            await fetchPeliculas();
            await fetchSalas();
            await fetchFunciones();
            await fetchReservas();
            await fetchUsuarios();
        };

        if (activeTab === "dashboard") {
            fetchAllData();
        } else if (activeTab === "peliculas") {
            fetchPeliculas();
        } else if (activeTab === "funciones") {
            fetchFunciones();
            fetchPeliculas();
            fetchSalas();
        } else if (activeTab === "salas") {
            fetchSalas();
        } else if (activeTab === "reservas") {
            fetchReservas();
            fetchPeliculas();
        } else if (activeTab === "usuarios") {
            fetchUsuarios();
        }
    }, [activeTab]);

    // --- PELICULAS API ---
    const fetchPeliculas = async () => {
        setLoadingPeliculas(true);
        try {
            const res = await api.get("/admin/peliculas");
            const mapped = res.data.map(p => ({
                id: p.id,
                titulo: p.titulo,
                genero: p.genero,
                descripcion: p.sinopsis,
                duracion: p.duracionMinutos,
                puntuacion: p.puntuacion,
                enCartelera: p.enCartelera,
                imagenUrl: p.imagenUrl,
                clasificacion: p.clasificacion || "ATP"
            }));
            setPeliculas(mapped);
        } catch (err) {
            console.warn("Error fetching movies, falling back to mock:", err);
            setPeliculas([
                { id: 1, titulo: "El Origen", descripcion: "Un prófugo de la justicia roba secretos a través del subconsciente de las personas.", duracion: 148, clasificacion: "+13", genero: "Ciencia Ficción", puntuacion: 8.8, enCartelera: true, imagenUrl: "" },
                { id: 2, titulo: "Interestelar", descripcion: "Un grupo de científicos y exploradores viaja a través de un agujero de gusano para salvar la humanidad.", duracion: 169, clasificacion: "ATP", genero: "Drama / Aventura", puntuacion: 8.6, enCartelera: true, imagenUrl: "" },
                { id: 3, titulo: "El Caballero de la Noche", descripcion: "Batman enfrenta al Guasón en una guerra psicológica y criminal por el alma de Ciudad Gótica.", duracion: 152, clasificacion: "+13", genero: "Acción", puntuacion: 9.0, enCartelera: true, imagenUrl: "" },
                { id: 4, titulo: "Avatar: El Camino del Agua", descripcion: "Jake Sully vive con su nueva familia en el planeta de Pandora antes de que resurja una amenaza conocida.", duracion: 192, clasificacion: "ATP", genero: "Fantasía / Acción", puntuacion: 7.6, enCartelera: false, imagenUrl: "" },
                { id: 5, titulo: "El Resplandor", descripcion: "Una familia se hospeda en un hotel solitario para pasar el invierno mientras fuerzas misteriosas acechan.", duracion: 146, clasificacion: "+18", genero: "Terror", puntuacion: 8.4, enCartelera: false, imagenUrl: "" }
            ]);
        } finally {
            setLoadingPeliculas(false);
        }
    };

    // --- FUNCIONES API ---
    const fetchFunciones = async () => {
        setLoadingFunciones(true);
        try {
            const res = await api.get("/admin/funciones");
            const mapped = res.data.map(f => {
                const parts = f.fechaHoraInicio.split(/[T ]/);
                let fecha = "";
                let hora = "";
                if (parts.length === 2) {
                    const dateParts = parts[0].split('-');
                    if (dateParts.length === 3) {
                        fecha = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                    } else {
                        fecha = parts[0];
                    }
                    hora = parts[1];
                }
                return {
                    id: f.id,
                    peliculaTitulo: f.pelicula,
                    salaNombre: f.sala,
                    fecha: fecha,
                    hora: hora,
                    precio: f.precioPorAsiento || 0,
                    duracionMinutos: f.duracionMinutos,
                    estado: f.estado
                };
            });
            setFunciones(mapped);
        } catch (err) {
            console.warn("Error fetching shows, falling back to mock:", err);
            setFunciones([
                { id: 1, peliculaId: 1, peliculaTitulo: "El Origen", salaId: 1, salaNombre: "Sala Patagonia", fecha: "2026-06-19", hora: "19:00:00", precio: 2500.00 },
                { id: 2, peliculaId: 2, peliculaTitulo: "Interestelar", salaId: 2, salaNombre: "Sala Tronador", fecha: "2026-06-20", hora: "21:30:00", precio: 3000.00 },
                { id: 3, peliculaId: 3, peliculaTitulo: "El Caballero de la Noche", salaId: 1, salaNombre: "Sala Patagonia", fecha: "2026-06-21", hora: "16:00:00", precio: 2500.00 },
                { id: 4, peliculaId: 1, peliculaTitulo: "El Origen", salaId: 3, salaNombre: "Sala Nahuel Huapi", fecha: "2026-06-19", hora: "22:00:00", precio: 2800.00 }
            ]);
        } finally {
            setLoadingFunciones(false);
        }
    };

    // --- SALAS & ASIENTOS API ---
    const fetchSalas = async () => {
        setLoadingSalas(true);
        try {
            const res = await api.get("/admin/salas");
            setSalas(res.data);
            if (selectedSala) {
                const updatedSala = res.data.find(s => s.id === selectedSala.id);
                if (updatedSala) setSelectedSala(updatedSala);
            }
        } catch (err) {
            console.warn("Error fetching rooms, falling back to mock:", err);
            
            const generateMockSeats = (salaId) => {
                const rows = ["A", "B", "C", "D", "E", "F"];
                const seats = [];
                let idCounter = salaId * 100;
                rows.forEach(r => {
                    for (let n = 1; n <= 18; n++) {
                        if (r === "A" && (n < 3 || n > 16)) continue;
                        seats.push({
                            id: idCounter++,
                            fila: r,
                            numero: n,
                            asientoEstado: (r === "F" && n === 10) || (r === "C" && n === 4) ? "MANTENIMIENTO" : "DISPONIBLE"
                        });
                    }
                });
                return seats;
            };

            const mockSalas = [
                { id: 1, nombre: "Sala Patagonia (3D)", estado: "DISPONIBLE", asientos: generateMockSeats(1) },
                { id: 2, nombre: "Sala Tronador (VIP)", estado: "DISPONIBLE", asientos: generateMockSeats(2) },
                { id: 3, nombre: "Sala Nahuel Huapi (2D)", estado: "NO_DISPONIBLE", asientos: generateMockSeats(3) }
            ];
            
            setSalas(mockSalas);
            if (selectedSala) {
                const updatedSala = mockSalas.find(s => s.id === selectedSala.id);
                if (updatedSala) setSelectedSala(updatedSala);
            }
        } finally {
            setLoadingSalas(false);
        }
    };

    // --- RESERVAS & VENTAS API ---
    const fetchReservas = async () => {
        setLoadingReservas(true);
        try {
            const res = await api.get("/admin/reservas");
            const mapped = res.data.map(r => {
                const parts = r.fechaHoraInicio ? r.fechaHoraInicio.split(/[T ]/) : ["", ""];
                const fecha = parts[0];
                const hora = parts[1] ? parts[1].substring(0, 5) : "";
                return {
                    id: r.id,
                    clienteNombre: r.clienteNombre,
                    clienteApellido: r.clienteApellido,
                    clienteEmail: r.clienteEmail,
                    peliculaTitulo: r.peliculaTitulo,
                    salaNombre: r.salaNombre,
                    fecha: fecha,
                    hora: hora,
                    asientos: r.asientos || [],
                    precioTotal: r.precioTotal,
                    estado: r.reservaEstado === "ACTIVA" ? "CONFIRMADA" : (r.reservaEstado === "MODIFICADA" ? "MODIFICADA" : r.reservaEstado),
                    fechaCreacion: r.fechaReserva ? r.fechaReserva.replace('T', ' ').substring(0, 16) : ""
                };
            });
            setReservas(mapped);
        } catch (err) {
            console.warn("Could not fetch reservations, falling back to mock:", err);
            setReservas([
                { id: "RES-10024", clienteNombre: "Ignacio Nicolás", clienteApellido: "Montiel Ruiz", clienteEmail: "admin@cineaustral.com", peliculaTitulo: "El Origen", salaNombre: "Sala Patagonia (3D)", fecha: "2026-06-19", hora: "19:00", asientos: [{ fila: "B", numero: 7 }, { fila: "B", numero: 8 }], precioTotal: 5000.00, estado: "CONFIRMADA", fechaCreacion: "2026-06-18 10:15" },
                { id: "RES-10025", clienteNombre: "Juan", clienteApellido: "Pérez", clienteEmail: "juan.perez@gmail.com", peliculaTitulo: "El Origen", salaNombre: "Sala Patagonia (3D)", fecha: "2026-06-19", hora: "19:00", asientos: [{ fila: "C", numero: 10 }], precioTotal: 2500.00, estado: "CONFIRMADA", fechaCreacion: "2026-06-18 11:30" },
                { id: "RES-10026", clienteNombre: "María", clienteApellido: "López", clienteEmail: "maria.lopez@gmail.com", peliculaTitulo: "Interestelar", salaNombre: "Sala Tronador (VIP)", fecha: "2026-06-20", hora: "21:30", asientos: [{ fila: "D", numero: 5 }, { fila: "D", numero: 6 }], precioTotal: 6000.00, estado: "CANCELADA", fechaCreacion: "2026-06-17 14:20" },
                { id: "RES-10027", clienteNombre: "Ana", clienteApellido: "Gómez", clienteEmail: "ana.gomez@hotmail.com", peliculaTitulo: "El Origen", salaNombre: "Sala Patagonia (3D)", fecha: "2026-06-19", hora: "19:00", asientos: [{ fila: "A", numero: 3 }, { fila: "A", numero: 4 }], precioTotal: 5000.00, estado: "CONFIRMADA", fechaCreacion: "2026-06-18 13:45" },
                { id: "RES-10028", clienteNombre: "Carlos", clienteApellido: "Sánchez", clienteEmail: "carlos.sanchez@gmail.com", peliculaTitulo: "El Caballero de la Noche", salaNombre: "Sala Patagonia (3D)", fecha: "2026-06-21", hora: "16:00", asientos: [{ fila: "D", numero: 11 }, { fila: "D", numero: 12 }], precioTotal: 5000.00, estado: "CONFIRMADA", fechaCreacion: "2026-06-18 08:30" }
            ]);
        } finally {
            setLoadingReservas(false);
        }
    };

    // --- USUARIOS API ---
    const fetchUsuarios = async () => {
        setLoadingUsuarios(true);
        try {
            const res = await api.get("/admin/usuarios");
            setUsuarios(res.data);
        } catch (err) {
            console.warn("Error fetching users, falling back to mock:", err);
            setUsuarios([
                { id: 1, nombre: "Ignacio Nicolás", apellido: "Montiel Ruiz", email: "admin@cineaustral.com", rol: "ADMIN", fechaRegistro: "2026-01-10" },
                { id: 2, nombre: "Juan", apellido: "Pérez", email: "juan.perez@gmail.com", rol: "CLIENTE", fechaRegistro: "2026-03-15" },
                { id: 3, nombre: "María", apellido: "López", email: "maria.lopez@gmail.com", rol: "CLIENTE", fechaRegistro: "2026-04-20" },
                { id: 4, nombre: "Carlos", apellido: "Sánchez", email: "carlos.sanchez@gmail.com", rol: "CLIENTE", fechaRegistro: "2026-05-02" },
                { id: 5, nombre: "Ana", apellido: "Gómez", email: "ana.gomez@hotmail.com", rol: "CLIENTE", fechaRegistro: "2026-06-01" },
            ]);
        } finally {
            setLoadingUsuarios(false);
        }
    };

    return (
        <div className="min-h-screen bg-nieve text-carbon font-sans flex flex-col">
            {/* Header / Topbar Navbar */}
            <nav className="flex flex-col md:flex-row justify-between items-center px-6 py-4 md:px-12 bg-carbon border-b border-piedra/15 sticky top-0 z-50 shadow-md">
                <div className="flex items-center gap-4 mb-3 md:mb-0">
                    <div className="text-xl font-black text-white tracking-tight flex items-center gap-1">
                        <span>CINE</span><span className="text-cielo">AUSTRAL</span> 
                        <span className="text-[10px] text-cielo border border-cielo/30 px-2 py-0.5 rounded-md ml-2 font-bold tracking-widest bg-cielo/10">
                            PANEL DE ADMINISTRACIÓN
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                        <div className="w-2.5 h-2.5 rounded-full bg-estepa animate-pulse"></div>
                        <span className="text-white font-semibold text-xs tracking-wide uppercase">
                            {user.nombre} {user.apellido}
                        </span>
                    </div>
                    <button 
                        className="bg-transparent border border-white/30 text-nieve px-3.5 py-1.5 rounded-lg font-bold text-xs cursor-pointer hover:bg-terracota/15 hover:border-terracota hover:text-white transition-all duration-200"
                        onClick={logout}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            {/* Notification Toast Alert */}
            {notification && (
                <div className={`fixed top-24 right-6 z-50 px-5 py-3.5 rounded-xl shadow-xl border flex items-center gap-3 animate-bounce transition-all duration-300 ${
                    notification.type === "success" 
                        ? "bg-estepa/10 border-estepa/30 text-estepa" 
                        : "bg-terracota/10 border-terracota/30 text-terracota"
                }`}>
                    {notification.type === "success" ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span className="text-xs font-extrabold tracking-wide uppercase">{notification.text}</span>
                </div>
            )}

            {/* Application Main Layout Wrapper */}
            <div className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 py-8 flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <Sidebar 
                    activeTab={activeTab} 
                    setActiveTab={setActiveTab} 
                    setSelectedSala={setSelectedSala} 
                />

                {/* Dashboard Tab Content Body */}
                <main className="flex-1 bg-white border border-piedra/15 rounded-2xl p-6 sm:p-8 shadow-sm overflow-hidden">
                    
                    {/* TAB 1: SUMMARY / GENERAL METRICS */}
                    {activeTab === "dashboard" && (
                        <OverviewTab 
                            peliculas={peliculas} 
                            salas={salas} 
                            reservas={reservas} 
                        />
                    )}

                    {/* TAB 2: MOVIES MANAGEMENT */}
                    {activeTab === "peliculas" && (
                        <MoviesTab 
                            peliculas={peliculas} 
                            loadingPeliculas={loadingPeliculas} 
                            setPeliculas={setPeliculas} 
                            fetchPeliculas={fetchPeliculas} 
                            showNotification={showNotification} 
                        />
                    )}

                    {/* TAB 3: SHOWTIMES PROGRAMMING */}
                    {activeTab === "funciones" && (
                        <ShowtimesTab 
                            funciones={funciones} 
                            loadingFunciones={loadingFunciones} 
                            setFunciones={setFunciones}
                            fetchFunciones={fetchFunciones} 
                            peliculas={peliculas} 
                            salas={salas} 
                            reservas={reservas} 
                            showNotification={showNotification} 
                        />
                    )}

                    {/* TAB 4: ROOMS & SEATS DISTRIBUTION */}
                    {activeTab === "salas" && (
                        <RoomsTab 
                            salas={salas} 
                            loadingSalas={loadingSalas} 
                            selectedSala={selectedSala} 
                            setSelectedSala={setSelectedSala} 
                            setSalas={setSalas} 
                            fetchSalas={fetchSalas} 
                            showNotification={showNotification} 
                        />
                    )}

                    {/* TAB 5: BOOKINGS & TRANSACTIONS */}
                    {activeTab === "reservas" && (
                        <BookingsTab 
                            reservas={reservas} 
                            loadingReservas={loadingReservas} 
                            setReservas={setReservas} 
                            fetchReservas={fetchReservas} 
                            showNotification={showNotification} 
                        />
                    )}

                    {/* TAB 6: USERS MANAGEMENT */}
                    {activeTab === "usuarios" && (
                        <UsersTab 
                            usuarios={usuarios} 
                            loadingUsuarios={loadingUsuarios} 
                            setUsuarios={setUsuarios} 
                            fetchUsuarios={fetchUsuarios} 
                            currentUserEmail={user.email} 
                            showNotification={showNotification} 
                        />
                    )}

                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
