import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
	name: string;
	email: string;
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

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
	const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (token) {
			// Assuming token is valid, set authenticated
			setIsAuthenticated(true);
			// You can decode token to get user info if needed
			setUser({ name: 'Alex M.', email: 'alex@example.com' }); // Placeholder
		}
	}, []);

	const login = (token: string, userData: User) => {
		localStorage.setItem('token', token);
		setIsAuthenticated(true);
		setUser(userData);
	};

	const logout = () => {
		localStorage.removeItem('token');
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
