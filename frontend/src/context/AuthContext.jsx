import {createContext, useContext, useEffect, useState} from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            api.get("/auth/me")
                .then((res) => setUser(res.data))
                .catch(() => localStorage.removeItem("token"))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (credentials, rememberMe = false) => {
        const {data} = await api.post("/auth/login", credentials);
        console.log("Login response:", data); // має бути { token: "...", user: {...} }

        const token = data.token ?? data.access_token ?? data.accessToken;
        if (!token) throw new Error("No token received");

        localStorage.setItem("token", token);
        if (rememberMe) localStorage.setItem("rememberMe", "true");
        setUser(data.user);
        return data.user;
    };

    const register = async (userData) => {
        const {data} = await api.post("/auth/register", userData);
        return data;
    };

    const logout = async () => {
        await api.post("/auth/logout").catch(() => {
        });
        localStorage.removeItem("token");
        localStorage.removeItem("rememberMe");
        setUser(null);
    };

    const updateUser = (updated) => setUser((prev) => ({...prev, ...updated}));

    return (
        <AuthContext.Provider value={{user, loading, login, register, logout, updateUser}}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
