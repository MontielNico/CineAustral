import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [pendingInfo, setPendingInfo] = useState(() => {
        if (location.state?.fromBooking && (sessionStorage.getItem("pendingBooking") || localStorage.getItem("pendingBooking"))) {
            return {
                movieTitle: location.state.movieTitle,
                funcionInfo: location.state.funcionInfo
            };
        }
        // If user accessed login directly or without an active booking flow, wipe any stale storage
        sessionStorage.removeItem("pendingBooking");
        localStorage.removeItem("pendingBooking");
        return null;
    });

    const handleDescartarReserva = () => {
        sessionStorage.removeItem("pendingBooking");
        localStorage.removeItem("pendingBooking");
        setPendingInfo(null);
        navigate(location.pathname, { replace: true, state: {} });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        if (!pendingInfo) {
            sessionStorage.removeItem("pendingBooking");
            localStorage.removeItem("pendingBooking");
        }
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            console.error("Login error:", err);
            setError("Correo o contraseña incorrectos. Por favor, intenta de nuevo.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div 
            className="relative flex justify-center items-center min-h-screen w-full overflow-hidden font-sans px-4 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/fondoLogin.png')" }}
        >
            {/* Dark blur overlay to give it a premium cinema feel and increase readability */}
            <div className="absolute inset-0 bg-carbon/60 backdrop-blur-[3px] pointer-events-none z-1"></div>
            
            <div className="relative z-10 w-full max-w-[450px] p-8 sm:p-10 bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl shadow-carbon/40 hover:-translate-y-0.5 transition-all duration-300">
                <div className="text-center mb-6">
                    <Link 
                        to="/" 
                        onClick={() => {
                            sessionStorage.removeItem("pendingBooking");
                            localStorage.removeItem("pendingBooking");
                        }}
                        className="inline-block cursor-pointer hover:opacity-90 transition-opacity"
                    >
                        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-carbon">
                            CINE<span className="text-cielo">AUSTRAL</span>
                        </h1>
                    </Link>
                    <p className="text-carbon/75 text-sm font-semibold leading-relaxed">
                        Ingresa a tu cuenta para reservar tus entradas
                    </p>
                </div>

                {pendingInfo?.movieTitle && (
                    <div className="bg-cielo/10 border border-cielo/30 rounded-xl p-3.5 mb-5 text-left flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">🎟️</span>
                            <div className="text-xs">
                                <span className="font-extrabold text-carbon block text-sm">
                                    ¡Estás a un paso de tu función!
                                </span>
                                <span className="text-carbon/80 mt-0.5 block leading-relaxed">
                                    Iniciá sesión para reservar tus asientos de <strong className="text-carbon">{pendingInfo.movieTitle}</strong>
                                    {pendingInfo.funcionInfo ? ` (${pendingInfo.funcionInfo})` : ""}.
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleDescartarReserva}
                            className="text-piedra hover:text-terracota text-xs font-bold shrink-0 underline cursor-pointer ml-2"
                            title="Descartar esta reserva e iniciar sesión normalmente"
                        >
                            Descartar
                        </button>
                    </div>
                )}

                {error && (
                    <div className="bg-terracota/8 border border-terracota/30 text-terracota text-sm px-4 py-3 rounded-lg mb-5 text-left font-medium leading-relaxed">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5 text-left">
                        <label htmlFor="email" className="text-xs font-bold text-carbon tracking-wide uppercase">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="nombre@ejemplo.com"
                            className="w-full px-4 py-2.5 text-sm text-carbon bg-white border border-piedra/30 rounded-lg outline-hidden focus:border-cielo focus:ring-3 focus:ring-cielo/15 placeholder-piedra/50 transition-all duration-200"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={submitting}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5 text-left">
                        <label htmlFor="password" className="text-xs font-bold text-carbon tracking-wide uppercase">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            className="w-full px-4 py-2.5 text-sm text-carbon bg-white border border-piedra/30 rounded-lg outline-hidden focus:border-cielo focus:ring-3 focus:ring-cielo/15 placeholder-piedra/50 transition-all duration-200"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={submitting}
                        />
                    </div>

                    <button
                        type="submit"
                        className="inline-flex justify-center items-center w-full py-3 mt-2 text-sm font-bold text-white bg-cielo hover:bg-lago active:translate-y-0.5 rounded-lg shadow-md shadow-cielo/10 hover:shadow-lg hover:shadow-lago/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={submitting}
                    >
                        {submitting ? "Iniciando Sesión..." : "Iniciar Sesión"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-piedra">
                    ¿No tienes una cuenta?{" "}
                    <Link 
                        to="/register" 
                        state={pendingInfo ? location.state : {}} 
                        className="text-lago font-bold hover:text-cielo hover:underline transition-colors duration-200"
                    >
                        Regístrate aquí
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
