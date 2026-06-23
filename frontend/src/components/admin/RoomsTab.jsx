import { useState } from "react";
import api from "../../api/axiosConfig";

const RoomsTab = ({
    salas,
    loadingSalas,
    selectedSala,
    setSelectedSala,
    setSalas,
    fetchSalas,
    showNotification
}) => {
    const [showMaintModal, setShowMaintModal] = useState(false);
    const [maintSalaId, setMaintSalaId] = useState(null);
    const [maintFechaFin, setMaintFechaFin] = useState("");
    const handleToggleSalaEstado = async (salaId, currentEstado, fechaFin = null) => {
        const nuevoEstado = currentEstado === "DISPONIBLE" ? "NO_DISPONIBLE" : "DISPONIBLE";
        try {
            const body = { estado: nuevoEstado };
            if (fechaFin) {
                body.fechaFinMantenimiento = fechaFin.includes(':') && fechaFin.split(':').length === 2 ? fechaFin + ':00' : fechaFin;
            }
            const res = await api.put(`/admin/salas/${salaId}/estado`, body);
            if (nuevoEstado === "NO_DISPONIBLE") {
                const count = res.data.reservasCanceladasCount || 0;
                showNotification(`Sala inhabilitada. Se cancelaron y reembolsaron ${count} reservas.`);
            } else {
                showNotification("Sala habilitada con éxito.");
            }
            fetchSalas();
        } catch (err) {
            console.error("Error al cambiar estado de sala:", err);
            const msg = err.response?.data?.message || "No se pudo actualizar el estado de la sala.";
            showNotification(msg, "error");
        }
    };

    const handleToggleAsientoEstado = async (asiento) => {
        const nuevoEstado = asiento.asientoEstado === "DISPONIBLE" ? "MANTENIMIENTO" : "DISPONIBLE";
        try {
            const res = await api.put(`/admin/asientos/${asiento.id}/estado`, { asientoEstado: nuevoEstado });
            if (nuevoEstado === "MANTENIMIENTO") {
                const count = res.data.reservasCanceladasCount || 0;
                showNotification(`Asiento ${asiento.fila}-${asiento.numero} cambiado a Mantenimiento. Se cancelaron y reembolsaron ${count} reservas.`);
            } else {
                showNotification(`Asiento ${asiento.fila}-${asiento.numero} habilitado.`);
            }
            fetchSalas();
        } catch (err) {
            console.error("Error al cambiar estado del asiento:", err);
            const msg = err.response?.data?.message || "No se pudo actualizar el estado del asiento.";
            showNotification(msg, "error");
        }
    };

    const getSeatsByColumn = (seats, colType) => {
        if (!seats) return [];
        return seats.filter(s => {
            const num = s.numero;
            if (colType === "left") return num >= 1 && num <= 4;
            if (colType === "center") return num >= 5 && num <= 14;
            if (colType === "right") return num >= 15 && num <= 18;
            return false;
        }).sort((a, b) => {
            if (a.fila !== b.fila) return a.fila.localeCompare(b.fila);
            return a.numero - b.numero;
        });
    };

    const uniqueRows = ["A", "B", "C", "D", "E", "F"];

    return (
        <div>
            <div className="border-b border-piedra/10 pb-4 mb-6 text-left">
                <h2 className="text-2xl font-black text-carbon">Salas y Distribución de Asientos</h2>
                <p className="text-xs text-piedra font-semibold">Configura la disponibilidad física de las salas y realiza el mantenimiento de butacas.</p>
            </div>

            {loadingSalas ? (
                <div className="flex flex-col items-center py-12">
                    <div className="w-8 h-8 border-3 border-cielo border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs text-piedra font-semibold">Cargando salas...</p>
                </div>
            ) : !selectedSala ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
                    {salas.map(s => {
                        const totalAsientosCount = s.asientos?.length || 0;
                        const mantenimientosCount = s.asientos?.filter(a => a.asientoEstado === "MANTENIMIENTO").length || 0;
                        const libresCount = totalAsientosCount - mantenimientosCount;

                        return (
                            <div key={s.id} className="border border-piedra/15 hover:border-cielo/40 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition duration-200">
                                <div>
                                    <div className="flex justify-between items-center gap-2 mb-3">
                                        <span className={`text-[10px] font-black border uppercase tracking-wider px-2 py-0.5 rounded ${
                                            s.estado === "DISPONIBLE" ? "bg-estepa/10 border-estepa/25 text-estepa" : "bg-terracota/10 border-terracota/25 text-terracota"
                                        }`}>
                                            {s.estado === "DISPONIBLE" ? "Habilitada" : "Inhabilitada"}
                                        </span>
                                    </div>
                                    <h3 className="font-extrabold text-carbon text-lg">{s.nombre}</h3>
                                    <div className="flex flex-col gap-1.5 mt-4 text-xs font-semibold text-piedra border-t border-piedra/5 pt-3">
                                        <div className="flex justify-between">
                                            <span>Capacidad Física:</span>
                                            <span className="text-carbon font-extrabold">{totalAsientosCount} asientos</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Butacas Disponibles:</span>
                                            <span className="text-estepa font-extrabold">{libresCount}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>En Mantenimiento:</span>
                                            <span className="text-terracota font-extrabold">{mantenimientosCount}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-2 justify-end border-t border-piedra/10 pt-3 mt-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (s.estado === "DISPONIBLE") {
                                                setMaintSalaId(s.id);
                                                const tomorrow = new Date();
                                                tomorrow.setDate(tomorrow.getDate() + 1);
                                                tomorrow.setHours(12, 0, 0, 0);
                                                const localIso = tomorrow.getFullYear() + '-' +
                                                    String(tomorrow.getMonth() + 1).padStart(2, '0') + '-' +
                                                    String(tomorrow.getDate()).padStart(2, '0') + 'T' +
                                                    String(tomorrow.getHours()).padStart(2, '0') + ':' +
                                                    String(tomorrow.getMinutes()).padStart(2, '0');
                                                setMaintFechaFin(localIso);
                                                setShowMaintModal(true);
                                            } else {
                                                handleToggleSalaEstado(s.id, s.estado);
                                            }
                                        }}
                                        className="bg-transparent border border-carbon/25 text-carbon hover:bg-carbon/5 font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-lg tracking-wider cursor-pointer"
                                    >
                                        {s.estado === "DISPONIBLE" ? "Inhabilitar" : "Habilitar"}
                                    </button>
                                    <button 
                                        className="bg-cielo hover:bg-lago text-white font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-lg tracking-wider cursor-pointer"
                                        onClick={() => setSelectedSala(s)}
                                    >
                                        Ver Asientos
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="border border-piedra/15 rounded-2xl p-6 bg-nieve/25 text-left transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-piedra/10 pb-3 mb-6 gap-3">
                        <div>
                            <h3 className="font-black text-carbon text-lg">Mapa de Asientos: {selectedSala.nombre}</h3>
                            <p className="text-xs text-piedra font-semibold">Haz click en un asiento para habilitarlo o marcarlo en mantenimiento.</p>
                        </div>
                        <button 
                            onClick={() => setSelectedSala(null)}
                            className="text-xs bg-white border border-piedra/30 text-piedra hover:text-carbon px-3 py-1.5 rounded-lg font-bold transition hover:bg-carbon/5 cursor-pointer"
                        >
                            Ocultar mapa
                        </button>
                    </div>

                    {/* Color legends */}
                    <div className="flex flex-wrap gap-4 justify-center items-center mb-8 text-xs font-bold text-carbon">
                        <div className="flex items-center gap-1.5 bg-white border border-piedra/10 px-2.5 py-1 rounded-lg">
                            <div className="w-3.5 h-3.5 bg-estepa rounded-sm"></div>
                            <span className="text-[10px] tracking-wide uppercase">Disponible</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-white border border-piedra/10 px-2.5 py-1 rounded-lg">
                            <div className="w-3.5 h-3.5 bg-terracota rounded-sm"></div>
                            <span className="text-[10px] tracking-wide uppercase">Mantenimiento</span>
                        </div>
                    </div>

                    {/* Physical Screen Component */}
                    <div className="w-full max-w-[420px] mx-auto bg-gradient-to-b from-cielo/20 to-transparent text-cielo font-extrabold text-[10px] text-center py-2.5 rounded-b-3xl border-t-2 border-cielo/40 mb-10 tracking-widest select-none">
                        PANTALLA
                    </div>

                    {/* Grid of Seats (3 columns layout alignment) */}
                    <div className="flex flex-col gap-3 max-w-[800px] mx-auto overflow-x-auto pb-4">
                        {uniqueRows.map(fila => {
                            const leftCol = getSeatsByColumn(selectedSala.asientos, "left").filter(s => s.fila === fila);
                            const centerCol = getSeatsByColumn(selectedSala.asientos, "center").filter(s => s.fila === fila);
                            const rightCol = getSeatsByColumn(selectedSala.asientos, "right").filter(s => s.fila === fila);
                            
                            return (
                                <div key={fila} className="flex justify-between items-center gap-5 min-w-[580px]">
                                    <span className="w-5 text-center font-black text-piedra text-xs select-none">{fila}</span>
                                    
                                    {/* Left Area (Seats 1-4) */}
                                    <div className="flex gap-1.5 w-28 justify-end">
                                        {leftCol.map(asiento => (
                                            <button
                                                key={asiento.id}
                                                onClick={() => handleToggleAsientoEstado(asiento)}
                                                className={`w-6 h-6 rounded-md text-[9px] font-black text-white transition hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer border-b-2 ${
                                                    asiento.asientoEstado === "DISPONIBLE" 
                                                        ? "bg-estepa border-estepa/70 hover:bg-estepa/90" 
                                                        : "bg-terracota border-terracota/70 hover:bg-terracota/90"
                                                }`}
                                                title={`Asiento ${asiento.fila}-${asiento.numero} (${asiento.asientoEstado})`}
                                            >
                                                {asiento.numero}
                                            </button>
                                        ))}
                                        {leftCol.length === 0 && <div className="w-28"></div>}
                                    </div>

                                    {/* Corridor */}
                                    <div className="w-4 border-r border-dashed border-piedra/25 h-6"></div>

                                    {/* Center Area (Seats 5-14) */}
                                    <div className="flex-1 flex gap-1.5 justify-center">
                                        {centerCol.map(asiento => (
                                            <button
                                                key={asiento.id}
                                                onClick={() => handleToggleAsientoEstado(asiento)}
                                                className={`w-6 h-6 rounded-md text-[9px] font-black text-white transition hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer border-b-2 ${
                                                    asiento.asientoEstado === "DISPONIBLE" 
                                                        ? "bg-estepa border-estepa/70 hover:bg-estepa/90" 
                                                        : "bg-terracota border-terracota/70 hover:bg-terracota/90"
                                                }`}
                                                title={`Asiento ${asiento.fila}-${asiento.numero} (${asiento.asientoEstado})`}
                                            >
                                                {asiento.numero}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Corridor */}
                                    <div className="w-4 border-l border-dashed border-piedra/25 h-6"></div>

                                    {/* Right Area (Seats 15-18) */}
                                    <div className="flex gap-1.5 w-28 justify-start">
                                        {rightCol.map(asiento => (
                                            <button
                                                key={asiento.id}
                                                onClick={() => handleToggleAsientoEstado(asiento)}
                                                className={`w-6 h-6 rounded-md text-[9px] font-black text-white transition hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer border-b-2 ${
                                                    asiento.asientoEstado === "DISPONIBLE" 
                                                        ? "bg-estepa border-estepa/70 hover:bg-estepa/90" 
                                                        : "bg-terracota border-terracota/70 hover:bg-terracota/90"
                                                }`}
                                                title={`Asiento ${asiento.fila}-${asiento.numero} (${asiento.asientoEstado})`}
                                            >
                                                {asiento.numero}
                                            </button>
                                        ))}
                                        {rightCol.length === 0 && <div className="w-28"></div>}
                                    </div>

                                    <span className="w-5 text-center font-black text-piedra text-xs select-none">{fila}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showMaintModal && (
                <div className="fixed inset-0 bg-carbon/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white border border-piedra/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in text-left">
                        <h3 className="font-black text-carbon text-lg mb-2">Programar Mantenimiento de Sala</h3>
                        <p className="text-xs text-piedra font-semibold mb-4">
                            Indica la fecha y hora estimada de finalización del mantenimiento. Todas las funciones de esta sala programadas dentro de este plazo serán canceladas, y sus reservas asociadas serán canceladas y reembolsadas de forma automática.
                        </p>
                        
                        <div className="flex flex-col gap-1.5 mb-6">
                            <label className="text-xs font-bold uppercase text-piedra tracking-wider">Fecha y Hora de Fin</label>
                            <input
                                type="datetime-local"
                                required
                                className="px-3 py-2 text-sm border border-piedra/30 rounded-lg outline-hidden focus:border-cielo bg-white text-carbon font-semibold"
                                value={maintFechaFin}
                                onChange={e => setMaintFechaFin(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex justify-end gap-3 border-t border-piedra/10 pt-4">
                            <button
                                onClick={() => {
                                    setShowMaintModal(false);
                                    setMaintSalaId(null);
                                }}
                                className="bg-transparent border border-piedra/30 text-piedra hover:text-carbon hover:bg-carbon/5 font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => {
                                    if (!maintFechaFin) {
                                        alert("Por favor, selecciona una fecha y hora.");
                                        return;
                                    }
                                    handleToggleSalaEstado(maintSalaId, "DISPONIBLE", maintFechaFin);
                                    setShowMaintModal(false);
                                    setMaintSalaId(null);
                                }}
                                className="bg-terracota hover:bg-[#a04935] text-white font-extrabold text-xs px-5 py-2.5 rounded-lg transition uppercase tracking-wider cursor-pointer shadow-md"
                            >
                                Inhabilitar Sala
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomsTab;
