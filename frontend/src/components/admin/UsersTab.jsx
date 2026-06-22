import { useState } from "react";
import { Search } from "lucide-react";
import api from "../../api/axiosConfig";

const UsersTab = ({
    usuarios,
    loadingUsuarios,
    setUsuarios,
    fetchUsuarios,
    currentUserEmail,
    showNotification
}) => {
    // Local filter states
    const [userSearch, setUserSearch] = useState("");
    const [userFilterRol, setUserFilterRol] = useState("");

    const handleToggleRol = async (userId, currentRol) => {
        const nuevoRol = currentRol === "ADMIN" ? "CLIENTE" : "ADMIN";
        if (!window.confirm(`¿Estás seguro de cambiar el rol de este usuario a ${nuevoRol}?`)) return;
        try {
            await api.put(`/admin/usuarios/${userId}/rol`, { rol: nuevoRol });
            showNotification("Rol de usuario actualizado");
            fetchUsuarios();
        } catch (err) {
            console.warn("API toggle role failed, simulating locally:", err);
            setUsuarios(prev => prev.map(u => u.id === userId ? { ...u, rol: nuevoRol } : u));
            showNotification("Rol de usuario modificado (Simulado)");
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
    const filteredUsuarios = usuarios.filter(u => {
        const searchLower = userSearch.toLowerCase();
        const matchesSearch = u.nombre.toLowerCase().includes(searchLower) ||
                              u.apellido.toLowerCase().includes(searchLower) ||
                              u.email.toLowerCase().includes(searchLower);
        const matchesRol = userFilterRol ? u.rol === userFilterRol : true;
        return matchesSearch && matchesRol;
    });

    return (
        <div>
            <div className="border-b border-piedra/10 pb-4 mb-6 text-left">
                <h2 className="text-2xl font-black text-carbon">Control de Usuarios</h2>
                <p className="text-xs text-piedra font-semibold">Administra cuentas registradas, gestiona permisos de acceso y promueve roles de administrador.</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-nieve border border-piedra/10 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="w-full sm:max-w-md relative flex items-center">
                    <input 
                        type="text"
                        placeholder="Buscar usuarios por nombre, apellido o email..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-piedra/30 rounded-lg bg-white text-carbon outline-hidden focus:border-cielo font-semibold"
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                    />
                    <Search className="absolute left-2.5 text-piedra w-3.5 h-3.5" />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <label className="text-xs font-bold text-piedra uppercase">Rol:</label>
                    <select
                        className="px-2.5 py-1.5 text-xs border border-piedra/30 rounded-lg bg-white text-carbon font-semibold"
                        value={userFilterRol}
                        onChange={e => setUserFilterRol(e.target.value)}
                    >
                        <option value="">Todos</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="CLIENTE">CLIENTE</option>
                    </select>
                </div>
            </div>

            {/* Users list table layout */}
            {loadingUsuarios ? (
                <div className="flex flex-col items-center py-12">
                    <div className="w-8 h-8 border-3 border-cielo border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs text-piedra font-semibold">Cargando cuentas...</p>
                </div>
            ) : filteredUsuarios.length === 0 ? (
                <p className="text-piedra text-xs py-12 border border-dashed border-piedra/25 rounded-xl">No se encontraron cuentas bajo el filtro.</p>
            ) : (
                <div className="overflow-x-auto border border-piedra/15 rounded-xl">
                    <table className="w-full border-collapse text-left text-xs text-carbon">
                        <thead>
                            <tr className="bg-nieve font-extrabold border-b border-piedra/15 uppercase tracking-wider text-[10px] text-piedra">
                                <th className="p-3.5">ID</th>
                                <th className="p-3.5">Nombre Completo</th>
                                <th className="p-3.5">Correo Electrónico</th>
                                <th className="p-3.5">Fecha de Registro</th>
                                <th className="p-3.5">Permisos / Rol</th>
                                <th className="p-3.5 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsuarios.map(u => (
                                <tr key={u.id} className="hover:bg-nieve/30 border-b border-piedra/10 transition-colors">
                                    <td className="p-3.5 font-bold text-piedra">#{u.id}</td>
                                    <td className="p-3.5 font-extrabold text-carbon text-sm">{u.nombre} {u.apellido}</td>
                                    <td className="p-3.5 font-semibold text-carbon">{u.email}</td>
                                    <td className="p-3.5 text-piedra font-bold">{formatFechaLegible(u.fechaRegistro || "2026-06-15")}</td>
                                    <td className="p-3.5 font-extrabold">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider ${
                                            u.rol === "ADMIN" 
                                                ? "bg-terracota/10 text-terracota border-terracota/25" 
                                                : "bg-estepa/10 text-estepa border-estepa/25"
                                        }`}>
                                            {u.rol}
                                        </span>
                                    </td>
                                    <td className="p-3.5 text-center">
                                        <button
                                            onClick={() => handleToggleRol(u.id, u.rol)}
                                            className="text-xs text-cielo font-extrabold hover:underline cursor-pointer border-0 bg-transparent"
                                            disabled={currentUserEmail === u.email}
                                            title={currentUserEmail === u.email ? "No puedes cambiar tu propio rol" : ""}
                                            style={{ opacity: currentUserEmail === u.email ? 0.4 : 1, cursor: currentUserEmail === u.email ? "not-allowed" : "pointer" }}
                                        >
                                            {u.rol === "ADMIN" ? "Quitar Admin" : "Hacer Admin"}
                                        </button>
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

export default UsersTab;
