import { BarChart3, Film, Calendar, DoorOpen, Ticket, Users } from "lucide-react";

const Sidebar = ({ activeTab, setActiveTab, setSelectedSala }) => {
    const tabs = [
        { id: "dashboard", label: "Resumen General", icon: BarChart3 },
        { id: "peliculas", label: "Películas", icon: Film },
        { id: "funciones", label: "Funciones", icon: Calendar },
        { id: "salas", label: "Salas y Asientos", icon: DoorOpen },
        { id: "reservas", label: "Reservas y Ventas", icon: Ticket },
        { id: "usuarios", label: "Usuarios", icon: Users },
    ];

    return (
        <aside className="w-full lg:w-64 flex flex-col gap-2.5 shrink-0">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            if (tab.id !== "salas") {
                                setSelectedSala(null);
                            }
                        }}
                        className={`w-full text-left px-4 py-3.5 rounded-xl font-extrabold text-sm transition-all duration-150 border flex items-center gap-3 cursor-pointer ${
                            isActive
                                ? "bg-cielo text-white border-cielo shadow-md shadow-cielo/20"
                                : "bg-white hover:bg-piedra/5 text-carbon border-piedra/10"
                        }`}
                    >
                        <Icon className="w-4 h-4" /> {tab.label}
                    </button>
                );
            })}
        </aside>
    );
};

export default Sidebar;
