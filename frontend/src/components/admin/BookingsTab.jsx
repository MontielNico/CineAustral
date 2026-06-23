import { useState } from "react";
import { Search, Check, AlertTriangle } from "lucide-react";
import api from "../../api/axiosConfig";

const BookingsTab = ({
    reservas,
    loadingReservas,
    setReservas,
    fetchReservas,
    showNotification
}) => {
    // Local filter states
    const [reservaSearch, setReservaSearch] = useState("");
    const [reservaFilterEstado, setReservaFilterEstado] = useState("");


    const formatFechaLegible = (fechaStr) => {
        if (!fechaStr) return "";
        const parts = fechaStr.split("-");
        if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return fechaStr;
    };

    // Calculate revenue stats locally
    const getIngresosConfirmados = () => {
        return reservas
            .filter(r => r.estado === "CONFIRMADA" || r.estado === "MODIFICADA")
            .reduce((sum, r) => sum + r.precioTotal, 0);
    };

    const totalIngresos = getIngresosConfirmados();

    // Filter calculations
    const filteredReservas = reservas.filter(r => {
        const searchLower = reservaSearch.toLowerCase();
        const matchesSearch = r.id.toString().toLowerCase().includes(searchLower) ||
            r.clienteEmail.toLowerCase().includes(searchLower) ||
            r.clienteNombre.toLowerCase().includes(searchLower) ||
            r.peliculaTitulo.toLowerCase().includes(searchLower);
        const matchesEstado = reservaFilterEstado ? r.estado === reservaFilterEstado : true;
        return matchesSearch && matchesEstado;
    });

    return (
        <div>
            <div className="border-b border-piedra/10 pb-4 mb-6 text-left">
                <h2 className="text-2xl font-black text-carbon">Registro de Reservas y Ventas</h2>
                <p className="text-xs text-piedra font-semibold">Busca boletos reservados por los clientes, valida admisiones e ingresa estados.</p>
            </div>

            {/* Revenue metrics row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <div className="bg-nieve border border-piedra/15 p-4 rounded-xl text-left">
                    <span className="text-[10px] font-bold text-piedra uppercase tracking-wider block">Reservas Confirmadas</span>
                    <span className="text-xl font-extrabold text-carbon mt-1 block">
                        {reservas.filter(r => r.estado === "CONFIRMADA").length} Reservas
                    </span>
                </div>
                <div className="bg-nieve border border-piedra/15 p-4 rounded-xl text-left">
                    <span className="text-[10px] font-bold text-piedra uppercase tracking-wider block">Reservas Canceladas</span>
                    <span className="text-xl font-extrabold text-carbon mt-1 block">
                        {reservas.filter(r => r.estado === "CANCELADA").length} Reservas
                    </span>
                </div>
                <div className="bg-estepa/5 border border-estepa/25 p-4 rounded-xl text-left">
                    <span className="text-[10px] font-bold text-estepa uppercase tracking-wider block">Venta Bruta</span>
                    <span className="text-xl font-black text-estepa mt-1 block">${totalIngresos.toFixed(2)}</span>
                </div>
            </div>

            {/* Search filter banner */}
            <div className="bg-nieve border border-piedra/10 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="w-full sm:max-w-md relative flex items-center">
                    <input
                        type="text"
                        placeholder="Buscar por código, email, cliente o película..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-piedra/30 rounded-lg bg-white text-carbon outline-hidden focus:border-cielo font-semibold"
                        value={reservaSearch}
                        onChange={e => setReservaSearch(e.target.value)}
                    />
                    <Search className="absolute left-2.5 text-piedra w-3.5 h-3.5" />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <label className="text-xs font-bold text-piedra uppercase">Estado:</label>
                    <select
                        className="px-2.5 py-1.5 text-xs border border-piedra/30 rounded-lg bg-white text-carbon font-semibold"
                        value={reservaFilterEstado}
                        onChange={e => setReservaFilterEstado(e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="CONFIRMADA">Confirmada</option>
                        <option value="MODIFICADA">Modificada</option>
                        <option value="CANCELADA">Cancelada</option>
                    </select>
                </div>
            </div>

            {/* Bookings table */}
            {loadingReservas ? (
                <div className="flex flex-col items-center py-12">
                    <div className="w-8 h-8 border-3 border-cielo border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs text-piedra font-semibold">Cargando transacciones...</p>
                </div>
            ) : filteredReservas.length === 0 ? (
                <div className="text-piedra text-xs py-12 border border-dashed border-piedra/25 rounded-xl">
                    No se encontraron transacciones en base a los criterios.
                </div>
            ) : (
                <div className="overflow-x-auto border border-piedra/15 rounded-xl">
                    <table className="w-full border-collapse text-left text-xs text-carbon">
                        <thead>
                            <tr className="bg-nieve font-extrabold border-b border-piedra/15 uppercase tracking-wider text-[10px] text-piedra">
                                <th className="p-3.5">Código</th>
                                <th className="p-3.5">Cliente</th>
                                <th className="p-3.5">Película</th>
                                <th className="p-3.5">Fecha y Hora</th>
                                <th className="p-3.5">Sala</th>
                                <th className="p-3.5">Asientos</th>
                                <th className="p-3.5 text-right">Monto</th>
                                <th className="p-3.5 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReservas.map(r => (
                                <tr key={r.id} className="hover:bg-nieve/30 border-b border-piedra/10 transition-colors">
                                    <td className="p-3.5 font-bold text-carbon">RES-{r.id}</td>
                                    <td className="p-3.5">
                                        <div className="flex flex-col">
                                            <span className="font-extrabold text-carbon">{r.clienteNombre} {r.clienteApellido}</span>
                                            <span className="text-[10px] text-piedra font-semibold">{r.clienteEmail}</span>
                                        </div>
                                    </td>
                                    <td className="p-3.5 font-semibold text-carbon">{r.peliculaTitulo}</td>
                                    <td className="p-3.5 text-piedra font-semibold">
                                        {formatFechaLegible(r.fecha)} {r.hora} hs
                                    </td>
                                    <td className="p-3.5 font-bold">
                                        {r.salaNombre}
                                    </td>
                                    <td className="p-3.5 font-bold">
                                        {r.asientos.map(as => `${as.fila}-${as.numero}`).join(", ")}
                                    </td>
                                    <td className="p-3.5 text-right font-black text-carbon">${r.precioTotal.toFixed(2)}</td>
                                    <td className="p-3.5 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${r.estado === "CONFIRMADA"
                                                ? "bg-estepa/10 text-estepa border-estepa/25"
                                                : r.estado === "MODIFICADA"
                                                    ? "bg-cielo/10 text-cielo border-cielo/25"
                                                    : "bg-terracota/10 text-terracota border-terracota/25"
                                            }`}>
                                            {r.estado === "CONFIRMADA" ? "Confirmada" : r.estado === "MODIFICADA" ? "Modificada" : "Cancelada"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BookingsTab;
