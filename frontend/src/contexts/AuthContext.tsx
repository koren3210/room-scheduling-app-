import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
	id: string;
	name: string;
	email: string;
	avatarUrl?: string;
	role?: string;
	preferences?: Record<string, unknown>;
}

interface AuthContextType {
	isAuthenticated: boolean;
	user: User | null;
	login: (token: string, userData: User) => void;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	// Check localStorage IMMEDIATELY during initialization
	// This prevents the brief flash of the login screen on refresh
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
		return !!localStorage.getItem('token');
	});

	const [user, setUser] = useState<User | null>(() => {
		const storedUser = localStorage.getItem('user');
		if (!storedUser) return null;
		try {
			return JSON.parse(storedUser) as User;
		} catch {
			localStorage.removeItem('user');
			return null;
		}
	});

	const login = (token: string, userData: User) => {
		localStorage.setItem('token', token);
		localStorage.setItem('user', JSON.stringify(userData));
		setIsAuthenticated(true);
		setUser(userData);
	};

	const logout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('user');
		setIsAuthenticated(false);
		setUser(null);
	};

	return <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}
