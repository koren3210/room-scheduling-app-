import api from './client';

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	avatarUrl?: string;
	role?: string;
	preferences?: Record<string, unknown>;
}

export interface AuthResponse {
	token: string;
	user: AuthUser;
}

export interface SignUpPayload {
	name: string;
	email: string;
	password: string;
	avatarUrl?: string;
}

export async function loginUser(credentials: { email: string; password: string }) {
	try {
		const response = await api.post<AuthResponse>('/api/auth/login', credentials);
		return response.data;
	} catch (error: any) {
		// Axios puts the server error inside error.response.data
		throw new Error(error.response?.data?.error || 'Login failed');
	}
}

export async function signUp(payload: SignUpPayload) {
	try {
		const response = await api.post<AuthResponse>('/api/auth/register', payload);
		return response.data;
	} catch (error: any) {
		throw new Error(error.response?.data?.error || 'Registration failed');
	}
}
