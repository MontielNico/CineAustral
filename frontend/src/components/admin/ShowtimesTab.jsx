import { useState } from "react";
import { Calendar } from "lucide-react";
import api from "../../api/axiosConfig";

const ShowtimesTab = ({
    funciones,
    loadingFunciones,
    setFunciones,
    fetchFunciones,
    peliculas,
    salas,
    reservas,
    showNotification
}) => {
    // Local form states
    const [funcPeliId, setFuncPeliId] = useState("");
    const [funcSalaId, setFuncSalaId] = useState("");
    const [funcFecha, setFuncFecha] = useState("");
    const [funcHora, setFuncHora] = useState("");
    const [funcPrecio, setFuncPrecio] = useState("");

    // Filters
    const [funcFilterMovie, setFuncFilterMovie] = useState("");
    const [funcFilterSala, setFuncFilterSala] = useState("");

    const handleFuncSubmit = async (e) => {
        e.preventDefault();
        const selectedPeli = peliculas.find(p => p.id === parseInt(funcPeliId));
        const selectedSalaObj = salas.find(s => s.id === parseInt(funcSalaId));

        const requestData = {
            peliculaId: parseInt(funcPeliId),
            salaId: parseInt(funcSalaId),
            fechaHoraInicio: `${funcFecha}T${funcHora}:00`,
            duracionMinutos: selectedPeli ? (selectedPeli.duracion || selectedPeli.duracionMinutos || 120) : 120,
            precioPorAsiento: parseFloat(funcPrecio)
        };

        try {
            await api.post("/admin/funciones", requestData);
            showNotification("Función registrada correctamente");
            resetForm();
            fetchFunciones();
        } catch (err) {
            console.warn("API schedule showtime failed, simulating locally:", err);
            const newId = Math.max(...funciones.map(f => f.id), 0) + 1;
            setFunciones(prev => [...prev, {
                id: newId,
                peliculaId: requestData.peliculaId,
                peliculaTitulo: selectedPeli ? selectedPeli.titulo : `Película #${requestData.peliculaId}`,
                salaId: requestData.salaId,
                salaNombre: selectedSalaObj ? selectedSalaObj.nombre : `Sala #${requestData.salaId}`,
                fecha: funcFecha,
                hora: funcHora + ":00",
                precio: requestData.precioPorAsiento
            }]);
            showNotification("Función programada (Simulado)");
            resetForm();
        }
    };

    const resetForm = () => {
        setFuncPeliId("");
        setFuncSalaId("");
        setFuncFecha("");
        setFuncHora("");
        setFuncPrecio("");
    };

    const handleDeleteFuncion = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar esta función?")) return;
        try {
            await api.delete(`/admin/funciones/${id}`);
            showNotification("Función eliminada correctamente");
            fetchFunciones();
        } catch (err) {
            console.warn("API delete showtime failed, simulating locally:", err);
            setFunciones(prev => prev.filter(f => f.id !== id));
            showNotification("Función eliminada (Simulado)");
        }
    };

    const formatFechaLegible = (fechaStr) => {
        if (!fechaStr) return "";
        const parts = fechaStr.split("-");
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return fechaStr;
    };

    // Filter calculations
    const filteredFunciones = funciones.filter(f => {
        const peliId = f.peliculaId || peliculas.find(p => p.titulo === f.peliculaTitulo)?.id;
        const salaId = f.salaId || salas.find(s => s.nombre === f.salaNombre)?.id;
        const matchesMovie = funcFilterMovie ? peliId === parseInt(funcFilterMovie) : true;
        const matchesSala = funcFilterSala ? salaId === parseInt(funcFilterSala) : true;
        return matchesMovie && matchesSala;
    });

    const today = new Date();
    const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    return (
        <div>
            <div className="border-b border-piedra/10 pb-4 mb-6 text-left">
                <h2 className="text-2xl font-black text-carbon">Cronograma de Funciones</h2>
                <p className="text-xs text-piedra font-semibold">Planifica horarios, salas y tarifas para la exhibición de películas.</p>
            </div>

            {/* Create Showtime Form layout */}
            <form onSubmit={handleFuncSubmit} className="bg-nieve/50 border border-piedra/10 rounded-xl p-5 mb-8 text-left">
                <h3 className="font-black text-carbon text-sm tracking-wide uppercase mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cielo" /> Programar Nueva Función
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase text-piedra tracking-wider">Película</label>
                        <select
                            required
                            className="px-3 py-2 text-sm border border-piedra/30 rounded-lg outline-hidden focus:border-cielo bg-white text-carbon font-semibold"
                            value={funcPeliId}
                            onChange={e => setFuncPeliId(e.target.value)}
                        >
                            <option value="">Seleccionar Película</option>
                            {peliculas
                                .filter(p => p.enCartelera === true)
                                .map(p => (
                                    <option key={p.id} value={p.id}>{p.titulo}</option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase text-piedra tracking-wider">Sala de Exhibición</label>
                        <select
                            required
                            className="px-3 py-2 text-sm border border-piedra/30 rounded-lg outline-hidden focus:border-cielo bg-white text-carbon font-semibold"
                            value={funcSalaId}
                            onChange={e => setFuncSalaId(e.target.value)}
                        >
                            <option value="">Seleccionar Sala</option>
                            {salas.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre} ({s.estado === "DISPONIBLE" ? "Activa" : "Cerrada"})</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase text-piedra tracking-wider">Precio de Entrada ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            placeholder="2500"
                            className="px-3 py-2 text-sm border border-piedra/30 rounded-lg outline-hidden focus:border-cielo bg-white text-carbon"
                            value={funcPrecio}
                            onChange={e => setFuncPrecio(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase text-piedra tracking-wider">Fecha</label>
                        <input
                            type="date"
                            required
                            min={todayDate}
                            className="px-3 py-2 text-sm border border-piedra/30 rounded-lg outline-hidden focus:border-cielo bg-white text-carbon font-semibold"
                            value={funcFecha}
                            onChange={e => setFuncFecha(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase text-piedra tracking-wider">Hora de Inicio</label>
                        <input
                            type="time"
                            required
                            min="18:00"
                            step="900"
                            className="px-3 py-2 text-sm border border-piedra/30 rounded-lg outline-hidden focus:border-cielo bg-white text-carbon font-semibold"
                            value={funcHora}
                            onChange={e => setFuncHora(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end border-t border-piedra/10 pt-4">
                    <button
                        type="submit"
                        className="bg-cielo hover:bg-lago text-white font-extrabold text-xs px-6 py-2.5 rounded-lg transition uppercase tracking-wider cursor-pointer"
                    >
                        Programar Función
                    </button>
                </div>
            </form>

            {/* Filters layout */}
            <div className="bg-nieve border border-piedra/10 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-3 w-full sm:w-auto text-left">
                    <span className="text-xs font-bold text-piedra uppercase">Filtrar por:</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto justify-end">
                    <select
                        className="px-2.5 py-1.5 text-xs border border-piedra/30 rounded-lg bg-white text-carbon font-semibold"
                        value={funcFilterMovie}
                        onChange={e => setFuncFilterMovie(e.target.value)}
                    >
                        <option value="">Todas las Películas</option>
                        {peliculas.map(p => (
                            <option key={p.id} value={p.id}>{p.titulo}</option>
                        ))}
                    </select>

                    <select
                        className="px-2.5 py-1.5 text-xs border border-piedra/30 rounded-lg bg-white text-carbon font-semibold"
                        value={funcFilterSala}
                        onChange={e => setFuncFilterSala(e.target.value)}
                    >
                        <option value="">Todas las Salas</option>
                        {salas.map(s => (
                            <option key={s.id} value={s.id}>{s.nombre}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Showtimes Table List */}
            {loadingFunciones ? (
                <div className="flex flex-col items-center py-12">
                    <div className="w-8 h-8 border-3 border-cielo border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs text-piedra font-semibold">Cargando cronograma...</p>
                </div>
            ) : filteredFunciones.length === 0 ? (
                <div className="text-piedra text-sm py-12 border border-dashed border-piedra/20 rounded-xl">
                    No se programaron funciones bajo los filtros establecidos.
                </div>
            ) : (
                <div className="overflow-x-auto border border-piedra/15 rounded-xl">
                    <table className="w-full border-collapse text-left text-xs text-carbon">
                        <thead>
                            <tr className="bg-nieve font-extrabold border-b border-piedra/15 uppercase tracking-wider text-[10px] text-piedra">
                                <th className="p-3.5">Película</th>
                                <th className="p-3.5">Sala</th>
                                <th className="p-3.5">Fecha y Hora</th>
                                <th className="p-3.5 text-right">Precio Entrada</th>
                                <th className="p-3.5 text-center">Ocupación</th>
                                <th className="p-3.5 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFunciones.map(f => {
                                // Calculate seats occupancy ratio dynamically
                                const sId = f.salaId || salas.find(s => s.nombre === f.salaNombre)?.id;
                                const totalCap = salas.find(s => s.id === sId)?.asientos?.length || 48;
                                const occupancyCount = reservas
                                    .filter(r => r.peliculaTitulo === f.peliculaTitulo && r.salaNombre.includes(f.salaNombre) && r.estado === "CONFIRMADA")
                                    .reduce((sum, r) => sum + r.asientos.length, 0);

                                return (
                                    <tr key={f.id} className="hover:bg-nieve/30 border-b border-piedra/10 transition-colors">
                                        <td className="p-3.5 font-bold text-carbon text-sm">{f.peliculaTitulo}</td>
                                        <td className="p-3.5 font-semibold text-piedra">{f.salaNombre}</td>
                                        <td className="p-3.5 font-semibold text-carbon">{formatFechaLegible(f.fecha)} - {f.hora.substring(0, 5)} hs</td>
                                        <td className="p-3.5 text-right font-bold text-estepa">${f.precio.toFixed(2)}</td>
                                        <td className="p-3.5 text-center">
                                            <span className="font-bold text-carbon bg-nieve border border-piedra/15 px-2 py-0.5 rounded text-[10px]">
                                                {occupancyCount} / {totalCap} seats
                                            </span>
                                        </td>
                                        <td className="p-3.5 text-center">
                                            <button
                                                onClick={() => handleDeleteFuncion(f.id)}
                                                className="text-xs text-terracota font-bold hover:underline cursor-pointer bg-transparent border-0"
                                            >
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ShowtimesTab;
