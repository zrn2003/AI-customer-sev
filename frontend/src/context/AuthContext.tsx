import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAPI } from '../services/api';
import { toast } from 'react-toastify';

export type UserRole = 'customer' | 'admin';

interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check local storage for persisted session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const userData = await loginAPI(email, password);
            const user: User = {
                id: userData.id,
                name: userData.full_name,
                email: userData.email,
                role: userData.role as UserRole
            };
            setUser(user);
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'admin') navigate('/admin/dashboard');
            else navigate('/customer/dashboard');
            toast.success(`Welcome back ${userData.full_name}!`);
        } catch (error) {
            console.error("Login failed", error);
            toast.error("Login failed! Invalid credentials.");
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
