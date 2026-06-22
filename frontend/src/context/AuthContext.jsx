import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosConfig";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const authHeader = localStorage.getItem("authHeader");
            if (authHeader) {
                try {
                    const res = await api.get("/auth/me");
                    setUser(res.data);
                } catch (error) {
                    console.error("Auth check failed:", error);
                    localStorage.removeItem("authHeader");
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const hash = btoa(`${email}:${password}`);
        const authHeaderValue = `Basic ${hash}`;
        
        // We pass the authorization header directly for the login request
        const res = await api.get("/auth/me", {
            headers: {
                Authorization: authHeaderValue
            }
        });
        
        // If request is successful, save credentials and set user
        localStorage.setItem("authHeader", authHeaderValue);
        setUser(res.data);
        return res.data;
    };

    const register = async (nombre, apellido, email, password) => {
        const res = await api.post("/auth/register", {
            nombre,
            apellido,
            email,
            password
        });
        
        // Automatically log in after registration
        if (res.data) {
            await login(email, password);
        }
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem("authHeader");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
