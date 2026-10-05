// frontend/context/AuthContext.tsx
'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { api } from '../lib/api'; //[cite: 7]
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: number;
  email: string;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Browser automatically attaches HTTP-only cookies
        const { data } = await api.get('/auth/me'); //[cite: 7]
        setUser(data);

        // If the user visits /login or /register while already authenticated, redirect to dashboard
        if (pathname === '/login' || pathname === '/register') {
          router.replace('/dashboard');
        }
      } catch (error) {
        // If cookies are missing, invalid, or expired, user remains unauthenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const params = new URLSearchParams();
    params.append('username', email.trim());
    params.append('password', password);

    await api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { data } = await api.get('/auth/me'); //[cite: 7]
    setUser(data);
    router.push('/dashboard'); //[cite: 7]
  };

  const register = async (email: string, password: string) => {
    try {
      const res = await api.post(`/auth/register`, { email, password });
      const { id } = res.data;
      if (id) {
        await login(email, password);
      } else {
        console.error("User could not be registered!");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Continue client cleanup even if network fails
    } finally {
      setUser(null);
      router.push('/login'); //[cite: 7]
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider"); //[cite: 7]
  return context;
};