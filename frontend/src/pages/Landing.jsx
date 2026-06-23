import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { Film, Star, Clock, LogIn, ChevronLeft, ChevronRight } from "lucide-react";

const Landing = () => {
  const [peliculas, setPeliculas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Slider state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);

  useEffect(() => {
    const fetchCartelera = async () => {
      try {
        const res = await api.get("/api/peliculas");
        const enCartelera = res.data.filter((p) => p.enCartelera);
        setPeliculas(enCartelera);
      } catch (err) {
        console.error("Error fetching cartelera:", err);
        setError("No se pudo cargar la cartelera en este momento.");
      } finally {
        setLoading(false);
      }
    };

    fetchCartelera();
  }, []);

  // Update visible items count based on window width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else if (window.innerWidth < 1280) {
        setVisibleCount(3);
      } else {
        // If there are exactly 4 movies, showing 4 on xl screens fits them all in a single row
        setVisibleCount(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset index if visibleCount or peliculas length changes
  useEffect(() => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, peliculas.length - visibleCount);
      return prev > maxIndex ? maxIndex : prev;
    });
  }, [visibleCount, peliculas]);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => {
      const maxIndex = Math.max(0, peliculas.length - visibleCount);
      return Math.min(maxIndex, prev + 1);
    });
  };

  const maxIndex = Math.max(0, peliculas.length - visibleCount);
  const showArrows = peliculas.length > visibleCount;

  return (
    <div className="min-h-screen bg-nieve text-carbon font-sans flex flex-col overflow-x-hidden">
      {/* Header / Navbar */}
      <header className="bg-carbon border-b border-piedra/15 sticky top-0 z-50 shadow-md px-6 py-4 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="CineAustral Logo" 
            className="h-10 w-auto object-contain" 
          />
          <span className="text-2xl font-black tracking-tight text-white select-none">
            Cine<span className="text-cielo">Austral</span>
          </span>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="inline-flex items-center gap-2 bg-cielo hover:bg-lago text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          Iniciar Sesión
        </button>
      </header>

      {/* Hero Welcome Section */}
      <section 
        className="relative text-white py-20 px-6 md:px-12 text-center overflow-hidden border-b border-piedra/10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/fondoBienvenida.png')" }}
      >
        {/* Dark overlay with backdrop-blur for premium glassmorphism and readability */}
        <div className="absolute inset-0 bg-carbon/75 backdrop-blur-[5px] pointer-events-none z-1"></div>

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-6 items-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Bienvenidos a <span className="text-cielo">CineAustral</span>
          </h1>
          <p className="text-nieve/85 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
            Tu complejo de cine en el corazón de la Patagonia. Disfrutá de los mejores estrenos y de una experiencia única en cualquiera de nuestras salas.
          </p>
          <div className="w-20 h-1 bg-cielo rounded-full mt-2"></div>
        </div>
      </section>

      {/* Main Content: Cartelera Slider */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-6 py-12 flex flex-col gap-8">
        <div className="flex flex-col gap-2 items-start">
          <h2 className="text-2xl md:text-3xl font-extrabold text-carbon tracking-tight">
            Películas en Cartelera
          </h2>
          <p className="text-piedra text-sm font-semibold">
            Seleccioná una película para consultar sus horarios y reservar tus asientos
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-12 h-12 border-4 border-cielo border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-piedra font-bold text-sm">Cargando cartelera...</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-piedra/20 rounded-xl p-8 text-center shadow-sm">
            <p className="text-terracota font-bold">{error}</p>
          </div>
        ) : peliculas.length === 0 ? (
          <div className="bg-white border border-piedra/15 rounded-xl p-12 text-center shadow-sm">
            <Film className="w-12 h-12 text-piedra/40 mx-auto mb-4" />
            <p className="text-piedra font-semibold text-lg">No hay películas en cartelera en este momento.</p>
            <p className="text-piedra/70 text-sm mt-1">Volvé a consultar más tarde.</p>
          </div>
        ) : (
          <div className="relative w-full px-2 sm:px-10">
            {/* Slider Viewport Container */}
            <div className="overflow-hidden w-full py-4">
              <div 
                className="flex transition-transform duration-500 ease-out gap-6"
                style={{ 
                  // If all movies fit, we center the slider flexbox, otherwise slide it
                  justifyContent: showArrows ? "flex-start" : "center",
                  transform: showArrows ? `translateX(calc(-${currentIndex * (100 / visibleCount)}% - ${currentIndex * 1.5}rem))` : "none"
                }}
              >
                {peliculas.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate("/login")}
                    className="group bg-white border border-piedra/15 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer hover:border-cielo/30 shrink-0"
                    style={{ 
                      // Calculate the exact width depending on how many visible cards we have, accounting for gaps
                      width: `calc((100% - ${(visibleCount - 1) * 1.5}rem) / ${visibleCount})`,
                      minWidth: visibleCount === 1 ? "100%" : visibleCount === 2 ? "calc((100% - 1.5rem) / 2)" : "250px"
                    }}
                  >
                    {/* Image Container */}
                    <div className="h-72 bg-gradient-to-br from-cielo/30 to-lago/50 relative flex items-center justify-center text-white overflow-hidden">
                      {p.imagenUrl ? (
                        <img
                          src={`http://localhost:8080${p.imagenUrl}`}
                          alt={p.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 p-4 text-center">
                          <Film className="w-12 h-12 text-white/80" />
                          <span className="font-black text-lg uppercase tracking-wider">{p.titulo}</span>
                        </div>
                      )}

                      {/* Rating Badge */}
                      <span className="absolute top-4 right-4 bg-carbon/85 text-white px-3 py-1 rounded-full text-xs font-black border border-white/10 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {p.puntuacion?.toFixed(1) || "N/A"}
                      </span>
                    </div>

                    {/* Info Container */}
                    <div className="p-6 flex-1 flex flex-col justify-between gap-5 text-left">
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-black text-cielo uppercase tracking-wider">
                          {p.genero}
                        </span>
                        <h3 className="text-xl font-extrabold text-carbon group-hover:text-cielo transition-colors duration-200 tracking-tight leading-tight line-clamp-1">
                          {p.titulo}
                        </h3>
                        <p className="text-sm text-piedra line-clamp-3 leading-relaxed mt-1">
                          {p.sinopsis || "Sin sinopsis disponible para esta película."}
                        </p>
                      </div>

                      {/* Card Action footer */}
                      <div className="pt-4 border-t border-piedra/10 flex justify-between items-center">
                        <span className="text-xs text-piedra font-bold flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-piedra/70" />
                          {p.duracionMinutos} min
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs font-black text-cielo group-hover:text-lago group-hover:translate-x-0.5 transition-all">
                          Ver Funciones
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Navigation Arrows */}
            {showArrows && (
              <>
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-piedra/25 flex items-center justify-center shadow-lg transition-all z-10 cursor-pointer ${
                    currentIndex === 0 
                      ? "bg-white/40 text-piedra/30 border-piedra/10 cursor-not-allowed" 
                      : "bg-white text-carbon hover:bg-cielo hover:text-white hover:border-cielo"
                  }`}
                  title="Anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === maxIndex}
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-piedra/25 flex items-center justify-center shadow-lg transition-all z-10 cursor-pointer ${
                    currentIndex === maxIndex 
                      ? "bg-white/40 text-piedra/30 border-piedra/10 cursor-not-allowed" 
                      : "bg-white text-carbon hover:bg-cielo hover:text-white hover:border-cielo"
                  }`}
                  title="Siguiente"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Slider Indicator Dots */}
            {showArrows && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      currentIndex === idx 
                        ? "bg-cielo w-6" 
                        : "bg-piedra/30 hover:bg-piedra/60"
                    }`}
                    title={`Ir al slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Premium Footer */}
      <footer className="bg-carbon text-piedra/80 py-8 px-6 mt-12 border-t border-piedra/15 text-center text-xs font-semibold">
        <div className="max-w-[1200px] w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo Footer" className="h-6 w-auto opacity-70" />
            <span className="text-white font-bold">CineAustral</span> &copy; 2026. Todos los derechos reservados.
          </div>
          <div>
            Facultad de Ingeniería — Universidad Nacional de la Patagonia San Juan Bosco
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
