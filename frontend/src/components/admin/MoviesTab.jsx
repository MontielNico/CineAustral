import { useState } from "react";
import { Search } from "lucide-react";
import api from "../../api/axiosConfig";

const MoviesTab = ({ 
    peliculas, 
    loadingPeliculas, 
    setPeliculas, 
    fetchPeliculas, 
    showNotification 
}) => {
    // Local form states
    const [peliNombre, setPeliNombre] = useState("");
    const [peliDescripcion, setPeliDescripcion] = useState("");
    const [peliDuracion, setPeliDuracion] = useState("");
    const [peliClasificacion, setPeliClasificacion] = useState("");
    const [peliGenero, setPeliGenero] = useState("");
    const [peliPuntuacion, setPeliPuntuacion] = useState("5.0");
    const [peliEnCartelera, setPeliEnCartelera] = useState(true);
    const [peliImagen, setPeliImagen] = useState(null);
    const [peliImagenPreview, setPeliImagenPreview] = useState(null);
    const [editingPeliId, setEditingPeliId] = useState(null);

    // Search and filter states
    const [movieSearch, setMovieSearch] = useState("");
    const [movieFilterClasificacion, setMovieFilterClasificacion] = useState("");

    const handlePeliSubmit = async (e) => {
        e.preventDefault();
        const requestData = {
            titulo: peliNombre,
            sinopsis: peliDescripcion,
            duracionMinutos: parseInt(peliDuracion),
            genero: peliGenero || "General",
            puntuacion: parseFloat(peliPuntuacion || 5.0),
            enCartelera: peliEnCartelera,
            clasificacion: peliClasificacion || "ATP"
        };

        const formData = new FormData();
        formData.append(
            "pelicula",
            new Blob([JSON.stringify(requestData)], { type: "application/json" })
        );
        if (peliImagen) {
            formData.append("imagen", peliImagen);
        }

        try {
            if (editingPeliId) {
                await api.put(`/admin/peliculas/${editingPeliId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                showNotification("Película actualizada con éxito");
            } else {
                await api.post("/admin/peliculas", formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });
                showNotification("Película registrada con éxito");
            }
            // Clear form
            resetForm();
            // Re-fetch
            fetchPeliculas();
        } catch (err) {
            console.error("Error al guardar película:", err);
            const msg = err.response?.data?.message || "No se pudo guardar la película.";
            showNotification(msg, "error");
        }
    };

    const resetForm = () => {
        setPeliNombre("");
        setPeliDescripcion("");
        setPeliDuracion("");
        setPeliClasificacion("");
        setPeliGenero("");
        setPeliPuntuacion("5.0");
        setPeliEnCartelera(true);
        setPeliImagen(null);
        setPeliImagenPreview(null);
        setEditingPeliId(null);
    };

    const handleEditPeli = (peli) => {
        setEditingPeliId(peli.id);
        setPeliNombre(peli.titulo);
        setPeliDescripcion(peli.descripcion);
        setPeliDuracion(peli.duracion.toString());
        setPeliClasificacion(peli.clasificacion);
        setPeliGenero(peli.genero || "");
        setPeliPuntuacion(peli.puntuacion?.toString() || "5.0");
        setPeliEnCartelera(peli.enCartelera ?? true);
        setPeliImagen(null);
        setPeliImagenPreview(peli.imagenUrl ? `http://localhost:8080${peli.imagenUrl}` : null);
    };

    const handleDeletePeli = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar esta película?")) return;
        try {
            await api.delete(`/admin/peliculas/${id}`);
            showNotification("Película eliminada correctamente");
            fetchPeliculas();
        } catch (err) {
            console.error("Error al eliminar película:", err);
            const msg = err.response?.data?.message || "No se pudo eliminar la película. Verifique que no tenga funciones programadas.";
            showNotification(msg, "error");
        }
    };

    const handleToggleEnCartelera = async (peli) => {
        const updatedStatus = !peli.enCartelera;
        try {
            await api.put(`/admin/peliculas/${peli.id}/estado`, { enCartelera: updatedStatus });
            showNotification(`Estado en cartelera cambiado a ${updatedStatus ? "Activo" : "Inactivo"}`);
            fetchPeliculas();
        } catch (err) {
            try {
                const formData = new FormData();
                const updatedObj = { 
                    titulo: peli.titulo,
                    sinopsis: peli.descripcion,
                    duracionMinutos: peli.duracion,
                    genero: peli.genero,
                    puntuacion: peli.puntuacion,
                    enCartelera: updatedStatus,
                    clasificacion: peli.clasificacion || "ATP"
                };
                formData.append("pelicula", new Blob([JSON.stringify(updatedObj)], { type: "application/json" }));
                await api.put(`/admin/peliculas/${peli.id}`, formData);
                showNotification("Película actualizada");
                fetchPeliculas();
            } catch (err2) {
                console.error("Error al actualizar estado en cartelera:", err2);
                const msg = err2.response?.data?.message || "No se pudo cambiar el estado de la película.";
                showNotification(msg, "error");
            }
        }
    };

    // Filter calculations
    const filteredPeliculas = peliculas.filter(p => {
        const matchesSearch = p.titulo.toLowerCase().includes(movieSearch.toLowerCase()) || 
                              (p.genero && p.genero.toLowerCase().includes(movieSearch.toLowerCase()));
        const matchesClas = movieFilterClasificacion ? p.clasificacion === movieFilterClasificacion : true;
        return matchesSearch && matchesClas;
    });

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-piedra/10 pb-4 mb-6 gap-3">
                <div className="text-left">
                    <h2 className="text-2xl font-black text-carbon">Catálogo de Películas</h2>
                    <p className="text-xs text-piedra font-semibold">Crea, edita y administra películas de la cartelera del cine.</p>
                </div>
                {editingPeliId && (
                    <button 
                        onClick={resetForm}
                        className="text-xs bg-terracota/10 hover:bg-terracota/20 text-terracota border border-terracota/30 px-3 py-1.5 rounded-lg font-black transition cursor-pointer"
                    >
                        Cancelar Edición
                    </button>
                )}
            </div>

            {/* Form structure Grid layout */}
            <form onSubmit={handlePeliSubmit} className="bg-nieve/50 border border-piedra/10 rounded-xl p-5 mb-8 text-left grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 flex flex-col gap-4">
                    <h3 className="font-black text-carbon text-sm tracking-wide uppercase">
                        {editingPeliId ? "✏️ Editar Película Seleccionada" : "✨ Registrar Nueva Película"}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase text-piedra tracking-wider">Título de la Película</label>
                            <input
                                type="text"
                                required
                                placeholder="Ej: Interestelar"
                                className="px-3 py-2 text-sm border border-piedra/30 rounded-lg outline-hidden focus:border-cielo bg-white text-carbon"
                                value={peliNombre}
                                onChange={e => setPeliNombre(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase text-piedra tracking-wider">Duración (min)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="150"
                                    className="px-3 py-2 text-sm border border-piedra/30 rounded-lg outline-hidden focus:border-cielo bg-white text-carbon"
                                    value={peliDuracion}
                                    onChange={e => setPeliDuracion(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase text-piedra tracking-wider">Clasificación</label>
                                <select
                                    required
                                    className="px-3 py-2.5 text-sm border border-piedra/30 rounded-lg outline-hidden focus:border-cielo bg-white text-carbon font-semibold"
                                    value={peliClasificacion}
                                    onChange={e => setPeliClasificacion(e.target.value)}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="ATP">ATP (Todo Público)</option>
                                    <option value="+13">+13 (Mayores de 13)</option>
                                    <option value="+16">+16 (Mayores de 16)</option>
                                    <option value="+18">+18 (Adultos)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold uppercase text-piedra tracking-wider">Género</label>
                            <input
                                type="text"
                                placeholder="Ej: Drama / Ciencia Ficción"
                                className="px-3 py-2 text-sm border border-piedra/30 rounded-lg outline-hidden focus:border-cielo bg-white text-carbon"
                                value={peliGenero}
                                onChange={e => setPeliGenero(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold uppercase text-piedra tracking-wider">Puntuación (Star)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    placeholder="8.5"
                                    className="px-3 py-2 text-sm border border-piedra/30 rounded-lg outline-hidden focus:border-cielo bg-white text-carbon"
                                    value={peliPuntuacion}
                                    onChange={e => setPeliPuntuacion(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col justify-end pb-1.5">
                                <label className="inline-flex items-center gap-2 cursor-pointer py-1">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 text-cielo bg-white border-piedra/30 rounded"
                                        checked={peliEnCartelera}
                                        onChange={e => setPeliEnCartelera(e.target.checked)}
                                    />
                                    <span className="text-xs font-bold text-carbon select-none">¿En Cartelera?</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase text-piedra tracking-wider">Sinopsis / Descripción</label>
                        <textarea
                            required
                            rows="2"
                            placeholder="Detalla de qué trata la película..."
                            className="px-3 py-2 text-sm border border-piedra/30 rounded-lg outline-hidden focus:border-cielo bg-white text-carbon leading-relaxed"
                            value={peliDescripcion}
                            onChange={e => setPeliDescripcion(e.target.value)}
                        />
                    </div>
                </div>

                {/* Poster upload preview block */}
                <div className="border-t md:border-t-0 md:border-l border-piedra/10 pt-4 md:pt-0 md:pl-6 flex flex-col gap-4 justify-between">
                    <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-bold uppercase text-piedra tracking-wider">Portada de Película</span>
                        <div className="w-full h-40 bg-white border border-dashed border-piedra/30 rounded-xl overflow-hidden flex flex-col items-center justify-center relative bg-contain bg-center bg-no-repeat">
                            {peliImagenPreview ? (
                                <img 
                                    src={peliImagenPreview} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="flex flex-col items-center gap-1.5 text-piedra p-4 text-center">
                                    <span className="text-3xl">🖼️</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Sin Archivo Seleccionado</span>
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="text-xs text-piedra file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-cielo/10 file:text-cielo hover:file:bg-cielo/20 cursor-pointer w-full mt-1"
                            onChange={e => {
                                const file = e.target.files[0];
                                setPeliImagen(file);
                                if (file) {
                                    setPeliImagenPreview(URL.createObjectURL(file));
                                } else {
                                    setPeliImagenPreview(null);
                                }
                            }}
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-cielo hover:bg-lago text-white font-extrabold text-xs py-3 rounded-lg transition uppercase tracking-wider cursor-pointer shadow-sm shadow-cielo/15"
                    >
                        {editingPeliId ? "Guardar Cambios" : "Registrar Película"}
                    </button>
                </div>
            </form>

            {/* Search and Filters grid */}
            <div className="bg-nieve border border-piedra/10 rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="w-full sm:max-w-xs relative flex items-center">
                    <input 
                        type="text"
                        placeholder="Buscar por título o género..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-piedra/30 rounded-lg bg-white text-carbon outline-hidden focus:border-cielo font-semibold"
                        value={movieSearch}
                        onChange={e => setMovieSearch(e.target.value)}
                    />
                    <Search className="absolute left-2.5 text-piedra w-3.5 h-3.5" />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <label className="text-xs font-bold text-piedra uppercase">Filtrar:</label>
                    <select
                        className="px-2.5 py-1.5 text-xs border border-piedra/30 rounded-lg bg-white text-carbon font-semibold"
                        value={movieFilterClasificacion}
                        onChange={e => setMovieFilterClasificacion(e.target.value)}
                    >
                        <option value="">Clasificación (Todas)</option>
                        <option value="ATP">ATP</option>
                        <option value="+13">+13</option>
                        <option value="+16">+16</option>
                        <option value="+18">+18</option>
                    </select>
                </div>
            </div>

            {/* Movies list grid */}
            <div className="flex justify-between items-center mb-4 text-left">
                <h3 className="font-black text-carbon text-sm uppercase tracking-wider">Cartelera del Cine ({filteredPeliculas.length})</h3>
            </div>

            {loadingPeliculas ? (
                <div className="flex flex-col items-center py-12">
                    <div className="w-8 h-8 border-3 border-cielo border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-2 text-xs text-piedra font-semibold">Cargando catálogo...</p>
                </div>
            ) : filteredPeliculas.length === 0 ? (
                <div className="text-piedra text-sm py-12 border border-dashed border-piedra/20 rounded-xl">
                    No se encontraron películas para los filtros seleccionados.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {filteredPeliculas.map(p => (
                        <div key={p.id} className="flex border border-piedra/15 rounded-xl p-4 bg-white hover:border-cielo/40 hover:shadow-sm transition gap-4 text-left">
                            {p.imagenUrl ? (
                                <img 
                                    src={`http://localhost:8080${p.imagenUrl}`} 
                                    alt={p.titulo} 
                                    className="w-24 h-32 object-cover rounded-lg bg-nieve shrink-0 border border-piedra/10"
                                />
                            ) : (
                                <div className="w-24 h-32 bg-nieve flex flex-col items-center justify-center text-4xl rounded-lg shrink-0 border border-piedra/10 text-piedra relative">
                                    <span className="text-3xl">🎬</span>
                                </div>
                            )}
                            
                            <div className="flex-1 flex flex-col justify-between overflow-hidden">
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <span className="bg-cielo/15 text-cielo border border-cielo/20 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                                {p.clasificacion}
                                            </span>
                                            <span className="text-piedra font-bold text-[10px] tracking-wide uppercase">{p.genero || "General"}</span>
                                        </div>
                                        <span className="text-xs font-bold text-amber-500 shrink-0">★ {p.puntuacion || "5.0"}</span>
                                    </div>
                                    <h4 className="font-extrabold text-carbon text-base line-clamp-1 truncate">{p.titulo}</h4>
                                    <p className="text-piedra text-xs line-clamp-2 mt-1 leading-relaxed">{p.descripcion}</p>
                                    <span className="text-[10px] text-piedra/80 font-bold block mt-1.5">⏱ Duración: {p.duracion} min</span>
                                </div>

                                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-piedra/5">
                                    <button
                                        onClick={() => handleToggleEnCartelera(p)}
                                        className={`text-[10px] font-black px-2.5 py-1 rounded-md border uppercase tracking-wider transition cursor-pointer ${
                                            p.enCartelera 
                                                ? "bg-estepa/10 border-estepa/20 text-estepa hover:bg-estepa/20" 
                                                : "bg-terracota/10 border-terracota/20 text-terracota hover:bg-terracota/20"
                                        }`}
                                    >
                                        {p.enCartelera ? "En Cartelera" : "Archivada"}
                                    </button>

                                    <div className="flex gap-3.5">
                                        <button 
                                            onClick={() => handleEditPeli(p)}
                                            className="text-xs text-cielo font-extrabold hover:underline cursor-pointer"
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDeletePeli(p.id)}
                                            className="text-xs text-terracota font-extrabold hover:underline cursor-pointer"
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MoviesTab;
