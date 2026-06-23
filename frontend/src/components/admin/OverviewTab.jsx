import { DollarSign, Ticket, Film, Wrench, Calendar, Check, Pencil, LockKeyhole, X, AlertTriangle } from "lucide-react";

const OverviewTab = ({ peliculas, salas, reservas }) => {
    // --- ANALYTICS COMPUTATIONS ---
    const getDashboardStats = () => {
        const totalIngresos = reservas
            .filter(r => r.estado === "CONFIRMADA" || r.estado === "MODIFICADA")
            .reduce((sum, r) => sum + r.precioTotal, 0);

        const totalVentasCount = reservas
            .filter(r => r.estado === "CONFIRMADA" || r.estado === "MODIFICADA")
            .reduce((sum, r) => sum + r.asientos.length, 0);

        const pelisCarteleraCount = peliculas.filter(p => p.enCartelera).length;

        // Count seats under maintenance across all rooms
        let totalMantenimientoCount = 0;
        salas.forEach(s => {
            s.asientos?.forEach(a => {
                if (a.asientoEstado === "MANTENIMIENTO") totalMantenimientoCount++;
            });
        });

        return {
            totalIngresos,
            totalVentasCount,
            pelisCarteleraCount,
            totalMantenimientoCount
        };
    };

    const stats = getDashboardStats();

    // Chart Helper: get sales trends for the last 7 days based on real bookings
    const getDailySalesTrend = () => {
        const days = [];
        const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const dateStr = `${yyyy}-${mm}-${dd}`;
            
            days.push({
                dateString: dateStr,
                label: dayNames[d.getDay()],
                value: 0
            });
        }
        
        reservas.forEach(r => {
            if ((r.estado === "CONFIRMADA" || r.estado === "MODIFICADA") && r.fechaCreacion) {
                const rDate = r.fechaCreacion.split(" ")[0]; // "yyyy-MM-dd"
                const match = days.find(day => day.dateString === rDate);
                if (match) {
                    match.value += r.precioTotal || 0;
                }
            }
        });
        
        return days;
    };

    const salesTrend = getDailySalesTrend();
    const maxSalesVal = Math.max(...salesTrend.map(s => s.value), 5000);

    // Dynamic popularity calculated from active bookings (No mock fallbacks)
    const getPopularMovies = () => {
        const pop = peliculas.map(p => {
            const count = reservas
                .filter(r => r.peliculaTitulo === p.titulo && (r.estado === "CONFIRMADA" || r.estado === "MODIFICADA"))
                .reduce((sum, r) => sum + r.asientos.length, 0);
            return {
                titulo: p.titulo,
                tickets: count
            };
        });
        return pop.sort((a, b) => b.tickets - a.tickets).slice(0, 4);
    };

    const popularMoviesList = getPopularMovies();
    const maxPopularTickets = Math.max(...popularMoviesList.map(m => m.tickets), 1);

    // Generate recent activities from real data
    const getRecentActivity = () => {
        const logs = [];
        
        // 1. Confirmations and Cancellations
        reservas.forEach(r => {
            const timeStr = r.fechaCreacion ? `El ${r.fechaCreacion}` : "Recientemente";
            const timestamp = r.fechaCreacion ? new Date(r.fechaCreacion.replace(' ', 'T')).getTime() : 0;
            
            if (r.estado === "CONFIRMADA") {
                logs.push({
                    text: `Reserva #${r.id} confirmada por $${r.precioTotal.toLocaleString()} (${r.clienteNombre} ${r.clienteApellido})`,
                    time: timeStr,
                    badge: <Check className="w-4 h-4 text-estepa" />,
                    timestamp: timestamp
                });
            } else if (r.estado === "MODIFICADA") {
                logs.push({
                    text: `Reserva #${r.id} modificada por el cliente (${r.clienteNombre} ${r.clienteApellido})`,
                    time: timeStr,
                    badge: <Pencil className="w-4 h-4 text-cielo" />,
                    timestamp: timestamp
                });
            } else if (r.estado === "CANCELADA") {
                logs.push({
                    text: `Reserva #${r.id} cancelada por el cliente (${r.clienteNombre} ${r.clienteApellido})`,
                    time: timeStr,
                    badge: <X className="w-4 h-4 text-terracota" />,
                    timestamp: timestamp
                });
            }
        });
        
        // 2. Seats in maintenance
        salas.forEach(s => {
            s.asientos?.forEach(a => {
                if (a.asientoEstado === "MANTENIMIENTO") {
                    logs.push({
                        text: `Asiento ${a.fila}-${a.numero} de '${s.nombre}' en MANTENIMIENTO`,
                        time: "Estado actual",
                        badge: <Wrench className="w-4 h-4 text-terracota" />,
                        timestamp: 1 // Lower priority sorting
                    });
                }
            });
        });
        
        // 3. Closed/disabled rooms
        salas.forEach(s => {
            if (s.estado !== "DISPONIBLE") {
                logs.push({
                    text: `Sala '${s.nombre}' marcada como NO DISPONIBLE`,
                    time: "Estado actual",
                    badge: <AlertTriangle className="w-4 h-4 text-terracota" />,
                    timestamp: 2
                });
            }
        });
        
        const sorted = logs.sort((a, b) => b.timestamp - a.timestamp);
        
        if (sorted.length === 0) {
            sorted.push({
                text: "No se registra actividad reciente en el sistema",
                time: "Ahora",
                badge: <Calendar className="w-4 h-4 text-cielo" />,
                timestamp: 0
            });
        }
        
        return sorted.slice(0, 5);
    };

    const recentActivitiesList = getRecentActivity();

    // Interactive circular gauge parameters
    const svgRadius = 24;
    const svgCircumference = 2 * Math.PI * svgRadius;

    return (
        <div className="flex flex-col gap-8">
            <div className="border-b border-piedra/10 pb-4 text-left">
                <h2 className="text-2xl font-black text-carbon">Resumen Operativo</h2>
                <p className="text-xs text-piedra font-semibold mt-1">Métricas actuales e ingresos del Cine Austral.</p>
            </div>

            {/* Summary metrics widgets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-estepa/5 border border-estepa/15 p-5 rounded-2xl flex items-center justify-between text-left group hover:scale-[1.02] transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-estepa uppercase tracking-widest">Ingresos Totales</p>
                        <h3 className="text-2xl font-black text-carbon mt-1">${stats.totalIngresos.toLocaleString()}</h3>
                        <p className="text-[10px] text-piedra font-semibold mt-1">Recaudación confirmada</p>
                    </div>
                    <span className="text-3xl p-3 bg-estepa/10 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-7 h-7 text-estepa" />
                    </span>
                </div>
                <div className="bg-cielo/5 border border-cielo/15 p-5 rounded-2xl flex items-center justify-between text-left group hover:scale-[1.02] transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-cielo uppercase tracking-widest">Entradas Vendidas</p>
                        <h3 className="text-2xl font-black text-carbon mt-1">{stats.totalVentasCount} boletos</h3>
                        <p className="text-[10px] text-piedra font-semibold mt-1">Asientos ocupados</p>
                    </div>
                    <span className="text-3xl p-3 bg-cielo/10 rounded-xl flex items-center justify-center">
                        <Ticket className="w-7 h-7 text-cielo" />
                    </span>
                </div>
                <div className="bg-carbon/5 border border-carbon/10 p-5 rounded-2xl flex items-center justify-between text-left group hover:scale-[1.02] transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-piedra uppercase tracking-widest">En Cartelera</p>
                        <h3 className="text-2xl font-black text-carbon mt-1">{stats.pelisCarteleraCount} películas</h3>
                        <p className="text-[10px] text-piedra font-semibold mt-1">Activas para reserva</p>
                    </div>
                    <span className="text-3xl p-3 bg-carbon/10 rounded-xl flex items-center justify-center">
                        <Film className="w-7 h-7 text-carbon" />
                    </span>
                </div>
                <div className="bg-terracota/5 border border-terracota/15 p-5 rounded-2xl flex items-center justify-between text-left group hover:scale-[1.02] transition-all">
                    <div>
                        <p className="text-[10px] font-bold text-terracota uppercase tracking-widest">Mantenimiento</p>
                        <h3 className="text-2xl font-black text-carbon mt-1">{stats.totalMantenimientoCount} asientos</h3>
                        <p className="text-[10px] text-piedra font-semibold mt-1">Fuera de servicio</p>
                    </div>
                    <span className="text-3xl p-3 bg-terracota/10 rounded-xl flex items-center justify-center">
                        <Wrench className="w-7 h-7 text-terracota" />
                    </span>
                </div>
            </div>

            {/* Charts & Details section */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left column - sales lines & occupancy status */}
                <div className="lg:col-span-3 flex flex-col gap-8">
                    {/* Line Chart */}
                    <div className="bg-white border border-piedra/15 rounded-2xl p-5 text-left">
                        <h4 className="font-extrabold text-sm text-carbon uppercase tracking-wider mb-4">Tendencia de Ventas (Últimos 7 Días)</h4>
                        <div className="h-48 w-full relative">
                            {/* Render responsive SVG Chart */}
                            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
                                {/* Grid lines */}
                                <line x1="40" y1="20" x2="480" y2="20" stroke="#7B8A96" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
                                <line x1="40" y1="70" x2="480" y2="70" stroke="#7B8A96" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
                                <line x1="40" y1="120" x2="480" y2="120" stroke="#7B8A96" strokeWidth="0.5" strokeDasharray="3,3" opacity="0.3" />
                                <line x1="40" y1="150" x2="480" y2="150" stroke="#7B8A96" strokeWidth="1" opacity="0.5" />

                                {/* Y Axis ticks labels */}
                                <text x="32" y="24" className="text-[9px] fill-piedra font-black text-right" textAnchor="end">${Math.round(maxSalesVal).toLocaleString()}</text>
                                <text x="32" y="74" className="text-[9px] fill-piedra font-black text-right" textAnchor="end">${Math.round(maxSalesVal * 0.66).toLocaleString()}</text>
                                <text x="32" y="124" className="text-[9px] fill-piedra font-black text-right" textAnchor="end">${Math.round(maxSalesVal * 0.33).toLocaleString()}</text>
                                <text x="32" y="154" className="text-[9px] fill-piedra font-black text-right" textAnchor="end">$0</text>

                                {/* Path line & dots rendering */}
                                {(() => {
                                    const paddingLeft = 50;
                                    const chartWidth = 430;
                                    const chartHeight = 130;
                                    const points = salesTrend.map((s, idx) => {
                                        const x = paddingLeft + (idx / (salesTrend.length - 1)) * (chartWidth - 20);
                                        const y = 150 - (s.value / maxSalesVal) * chartHeight;
                                        return { x, y, ...s };
                                    });

                                    const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
                                    const areaD = `${pathD} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`;

                                    return (
                                        <>
                                            <defs>
                                                <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#4A90BF" stopOpacity="0.4" />
                                                    <stop offset="100%" stopColor="#4A90BF" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>
                                            <path d={areaD} fill="url(#chartAreaGrad)" />
                                            <path d={pathD} fill="none" stroke="#4A90BF" strokeWidth="2.5" />
                                            {points.map((p, i) => (
                                                <g key={i} className="group">
                                                    <circle cx={p.x} cy={p.y} r="4" fill="#1B5E8C" stroke="#fff" strokeWidth="1.5" />
                                                    <text x={p.x} y={p.y - 8} className="text-[8px] font-bold fill-carbon opacity-0 group-hover:opacity-100 text-center transition-opacity" textAnchor="middle">
                                                        ${p.value}
                                                    </text>
                                                    <text x={p.x} y="165" className="text-[9px] fill-piedra font-extrabold" textAnchor="middle">
                                                        {p.label}
                                                    </text>
                                                </g>
                                            ))}
                                        </>
                                    );
                                })()}
                            </svg>
                        </div>
                    </div>

                    {/* Occupancy metrics per Room */}
                    <div className="bg-white border border-piedra/15 rounded-2xl p-5 text-left">
                        <h4 className="font-extrabold text-sm text-carbon uppercase tracking-wider mb-4">Ocupación Promedio por Sala</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {salas.map(s => {
                                const totalAsientosSala = s.asientos?.length || 48;
                                const asientosReservados = reservas
                                    .filter(r => r.salaNombre && r.salaNombre.toLowerCase().includes(s.nombre.toLowerCase()) && (r.estado === "CONFIRMADA" || r.estado === "MODIFICADA"))
                                    .reduce((acc, curr) => acc + curr.asientos.length, 0);
                                const occupancyPercent = s.estado === "DISPONIBLE"
                                    ? Math.min(Math.round((asientosReservados / totalAsientosSala) * 100) || 0, 100)
                                    : 0;

                                return (
                                    <div key={s.id} className="border border-piedra/10 rounded-xl p-4 flex flex-col items-center gap-3 bg-nieve/30">
                                        <span className="text-xs font-bold text-carbon line-clamp-1">{s.nombre}</span>
                                        <div className="relative flex items-center justify-center">
                                            <svg viewBox="0 0 60 60" className="w-16 h-16">
                                                <circle cx="30" cy="30" r={svgRadius} fill="transparent" stroke="#E4E8F0" strokeWidth="5" />
                                                <circle
                                                    cx="30"
                                                    cy="30"
                                                    r={svgRadius}
                                                    fill="transparent"
                                                    stroke={s.estado === "DISPONIBLE" ? "#4A90BF" : "#C0614A"}
                                                    strokeWidth="5"
                                                    strokeDasharray={svgCircumference}
                                                    strokeDashoffset={svgCircumference - (occupancyPercent / 100) * svgCircumference}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-1000 ease-out origin-center -rotate-90"
                                                />
                                            </svg>
                                            <span className="absolute text-[11px] font-black text-carbon">{occupancyPercent}%</span>
                                        </div>
                                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                            s.estado === "DISPONIBLE" ? "bg-estepa/10 text-estepa border-estepa/25" : "bg-terracota/10 text-terracota border-terracota/25"
                                        }`}>
                                            {s.estado === "DISPONIBLE" ? "Habilitada" : "Cerrada"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right column - popular movies & logs */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Leaderboard Chart list */}
                    <div className="bg-white border border-piedra/15 rounded-2xl p-5 text-left">
                        <h4 className="font-extrabold text-sm text-carbon uppercase tracking-wider mb-4">Películas Populares</h4>
                        <div className="flex flex-col gap-4">
                            {popularMoviesList.map((m, idx) => {
                                const percentage = Math.round((m.tickets / maxPopularTickets) * 100);
                                return (
                                    <div key={idx} className="flex flex-col gap-1.5">
                                        <div className="flex justify-between items-center text-xs font-bold text-carbon">
                                            <span className="truncate max-w-[150px]">{m.titulo}</span>
                                            <span className="text-cielo font-extrabold">{m.tickets} tickets</span>
                                        </div>
                                        <div className="w-full bg-nieve h-2.5 rounded-full overflow-hidden border border-piedra/10">
                                            <div
                                                className="bg-cielo h-full rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Logs */}
                    <div className="bg-white border border-piedra/15 rounded-2xl p-5 text-left flex-1 flex flex-col">
                        <h4 className="font-extrabold text-sm text-carbon uppercase tracking-wider mb-4">Actividad Reciente</h4>
                        <div className="flex flex-col gap-3.5 flex-1">
                            {recentActivitiesList.map((log, i) => (
                                <div key={i} className="flex gap-3 text-xs leading-normal items-start">
                                    <span className="shrink-0 flex items-center justify-center p-1.5 bg-nieve rounded-lg border border-piedra/10">{log.badge}</span>
                                    <div className="flex-1">
                                        <p className="font-semibold text-carbon">{log.text}</p>
                                        <span className="text-[10px] text-piedra mt-0.5 block font-bold">{log.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;
