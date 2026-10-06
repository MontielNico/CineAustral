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
            console.error("Error fetching movies from API:", err);
            setPeliculas([]);
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
                        if (dateParts[0].length === 4) {
                            fecha = parts[0];
                        } else {
                            fecha = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                        }
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
            console.error("Error fetching shows from API:", err);
            setFunciones([]);
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
            console.error("Error fetching rooms from API:", err);
            setSalas([]);
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
            console.error("Could not fetch reservations from API:", err);
            setReservas([]);
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
            console.error("Error fetching users from API:", err);
            setUsuarios([]);
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
