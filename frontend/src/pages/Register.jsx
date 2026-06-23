import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await register(nombre, apellido, email, password);
            navigate("/");
        } catch (err) {
            console.error("Registration error:", err);
            setError(
                err.response?.data?.message || 
                "El correo ya está registrado o los datos no son válidos."
            );
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
            
            <div className="relative z-10 w-full max-w-[480px] p-8 sm:p-10 bg-white/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl shadow-carbon/40 hover:-translate-y-0.5 transition-all duration-300">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-carbon">
                        CINE<span className="text-cielo">AUSTRAL</span>
                    </h1>
                    <p className="text-carbon/75 text-sm font-semibold leading-relaxed">
                        Crea una cuenta para comenzar a reservar tus entradas
                    </p>
                </div>

                {error && (
                    <div className="bg-terracota/8 border border-terracota/30 text-terracota text-sm px-4 py-3 rounded-lg mb-5 text-left font-medium leading-relaxed">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5 text-left">
                            <label htmlFor="nombre" className="text-xs font-bold text-carbon tracking-wide uppercase">
                                Nombre
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                placeholder="Juan"
                                className="w-full px-4 py-2.5 text-sm text-carbon bg-white border border-piedra/30 rounded-lg outline-hidden focus:border-cielo focus:ring-3 focus:ring-cielo/15 placeholder-piedra/50 transition-all duration-200"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                disabled={submitting}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 text-left">
                            <label htmlFor="apellido" className="text-xs font-bold text-carbon tracking-wide uppercase">
                                Apellido
                            </label>
                            <input
                                type="text"
                                id="apellido"
                                placeholder="Pérez"
                                className="w-full px-4 py-2.5 text-sm text-carbon bg-white border border-piedra/30 rounded-lg outline-hidden focus:border-cielo focus:ring-3 focus:ring-cielo/15 placeholder-piedra/50 transition-all duration-200"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                required
                                disabled={submitting}
                            />
                        </div>
                    </div>

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
                            placeholder="Mínimo 6 caracteres"
                            className="w-full px-4 py-2.5 text-sm text-carbon bg-white border border-piedra/30 rounded-lg outline-hidden focus:border-cielo focus:ring-3 focus:ring-cielo/15 placeholder-piedra/50 transition-all duration-200"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                            disabled={submitting}
                        />
                    </div>

                    <button
                        type="submit"
                        className="inline-flex justify-center items-center w-full py-3 mt-2 text-sm font-bold text-white bg-cielo hover:bg-lago active:translate-y-0.5 rounded-lg shadow-md shadow-cielo/10 hover:shadow-lg hover:shadow-lago/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={submitting}
                    >
                        {submitting ? "Creando Cuenta..." : "Registrarse"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-piedra">
                    ¿Ya tienes una cuenta?{" "}
                    <Link to="/login" className="text-lago font-bold hover:text-cielo hover:underline transition-colors duration-200">
                        Inicia sesión aquí
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
